const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwtUtils');
const { generateOTP, storeOTP, getOTP, deleteOTP } = require('../utils/otpUtils');
const { sendOTP } = require('../services/otp.service');
const { sendEmail } = require('../services/email.service');
const { emailVerificationTemplate } = require('../utils/emailTemplates');
const { storeSet, storeGet, storeDel } = require('../utils/store');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax'
};

const setTokenCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 });
};

const clearTokenCookies = (res) => {
  res.clearCookie('accessToken', COOKIE_OPTIONS);
  res.clearCookie('refreshToken', COOKIE_OPTIONS);
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const verifyToken = crypto.randomBytes(32).toString('hex');
    await storeSet(`verifyEmail:${verifyToken}`, 24 * 60 * 60, user._id.toString());

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verifyToken}`;
    const template = emailVerificationTemplate(user.name, verifyUrl);
    await sendEmail({ to: user.email, ...template });

    return res.status(201).json({
      success: true,
      message: 'Account created. Verification email sent.'
    });
  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const userId = await storeGet(`verifyEmail:${token}`);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.isEmailVerified = true;
    await user.save();

    await storeDel(`verifyEmail:${token}`);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await storeSet(`refreshToken:${user._id}`, 7 * 24 * 60 * 60, refreshToken);
    setTokenCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('VerifyEmail Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.is2FAEnabled) {
      await sendOTP(user, '2fa');
      const tempToken = jwt.sign(
        { id: user._id, step: '2fa' },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '5m' }
      );
      return res.status(200).json({
        success: true,
        message: '2FA required. OTP sent.',
        data: { tempToken, email: user.email, requires2FA: true }
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await storeSet(`refreshToken:${user._id}`, 7 * 24 * 60 * 60, refreshToken);
    setTokenCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, profilePicture: user.profilePicture },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { tempToken, otp } = req.body;

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_ACCESS_SECRET);
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid or expired temp token.' });
    }

    if (decoded.step !== '2fa') {
      return res.status(401).json({ success: false, message: 'Invalid token step.' });
    }

    const storedOTP = await getOTP(`2fa:${decoded.id}`);
    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    await deleteOTP(`2fa:${decoded.id}`);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(403).json({ success: false, message: 'Account not found or inactive.' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await storeSet(`refreshToken:${user._id}`, 7 * 24 * 60 * 60, refreshToken);
    setTokenCookies(res, accessToken, refreshToken);

    return res.status(200).json({
      success: true,
      message: '2FA verified. Login successful.',
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role, profilePicture: user.profilePicture },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Verify2FA Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.enable2FA = async (req, res) => {
  try {
    const user = req.user;
    if (user.is2FAEnabled) {
      return res.status(400).json({ success: false, message: '2FA is already enabled.' });
    }

    await sendOTP(user, '2fa');

    return res.status(200).json({
      success: true,
      message: 'OTP sent for 2FA verification.'
    });
  } catch (error) {
    console.error('Enable2FA Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.confirm2FA = async (req, res) => {
  try {
    const user = req.user;
    const { otp } = req.body;

    const storedOTP = await getOTP(`2fa:${user._id}`);
    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    await deleteOTP(`2fa:${user._id}`);

    user.is2FAEnabled = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: '2FA enabled successfully.'
    });
  } catch (error) {
    console.error('Confirm2FA Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.disable2FA = async (req, res) => {
  try {
    const user = req.user;
    if (!user.is2FAEnabled) {
      return res.status(400).json({ success: false, message: '2FA is not enabled.' });
    }

    await sendOTP(user, 'disable2fa');

    return res.status(200).json({
      success: true,
      message: 'OTP sent for 2FA verification.'
    });
  } catch (error) {
    console.error('Disable2FA Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.confirmDisable2FA = async (req, res) => {
  try {
    const user = req.user;
    const { otp } = req.body;

    const storedOTP = await getOTP(`disable2fa:${user._id}`);
    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    await deleteOTP(`disable2fa:${user._id}`);

    user.is2FAEnabled = false;
    await user.save();

    return res.status(200).json({
      success: true,
      message: '2FA disabled successfully.'
    });
  } catch (error) {
    console.error('ConfirmDisable2FA Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token required.' });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    const storedToken = await storeGet(`refreshToken:${decoded.id}`);
    if (!storedToken || storedToken !== token) {
      return res.status(401).json({ success: false, message: 'Refresh token not found or revoked.' });
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(403).json({ success: false, message: 'User not found or inactive.' });
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);
    await storeSet(`refreshToken:${user._id}`, 7 * 24 * 60 * 60, newRefreshToken);
    setTokenCookies(res, accessToken, newRefreshToken);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed.',
      data: { accessToken, refreshToken: newRefreshToken }
    });
  } catch (error) {
    console.error('RefreshToken Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = verifyRefreshToken(token);
        await storeDel(`refreshToken:${decoded.id}`);
      } catch (e) {}
    }

    clearTokenCookies(res);

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.'
      });
    }

    await sendOTP(user, 'passwordReset');

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email.'
    });
  } catch (error) {
    console.error('ForgotPassword Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const storedOTP = await getOTP(`passwordReset:${user._id}`);
    if (!storedOTP || storedOTP !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    await deleteOTP(`passwordReset:${user._id}`);

    const resetToken = crypto.randomBytes(32).toString('hex');
    await storeSet(`resetPassword:${resetToken}`, 300, user._id.toString());

    return res.status(200).json({
      success: true,
      message: 'OTP verified.',
      data: { resetToken }
    });
  } catch (error) {
    console.error('VerifyOTP Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    const userId = await storeGet(`resetPassword:${resetToken}`);
    if (!userId) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    await storeDel(`resetPassword:${resetToken}`);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully.'
    });
  } catch (error) {
    console.error('ResetPassword Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;
    const otpType = type || '2fa';

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await deleteOTP(`${otpType}:${user._id}`);
    await sendOTP(user, otpType);

    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully.'
    });
  } catch (error) {
    console.error('ResendOTP Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
