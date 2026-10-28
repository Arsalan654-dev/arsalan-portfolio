const { generateOTP, storeOTP } = require('../utils/otpUtils');
const transporter = require('../config/nodemailer');
const { forgotPasswordTemplate } = require('../utils/emailTemplates');

const OTP_EXPIRY_MINUTES = 5;

const sendOTP = async (user, type = '2fa') => {
  const otp = generateOTP();
  const key = `${type}:${user._id}`;
  await storeOTP(key, otp);

  await sendOTPEmail(user.email, user.name, otp, type);

  return otp;
};

const sendOTPEmail = async (email, name, otp, type) => {
  try {
    const isPasswordReset = type === 'forgot-password' || type === 'passwordReset';
    const template = isPasswordReset
      ? forgotPasswordTemplate(name, otp)
      : { subject: 'Your 2FA OTP - Arsalan Portfolio', html: `<h2>Hello ${name}</h2><p>Your OTP is: <strong>${otp}</strong></p><p>This OTP expires in ${OTP_EXPIRY_MINUTES} minutes.</p>` };

    await transporter.sendMail({
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: template.subject,
      html: template.html
    });
    return true;
  } catch (e) {
    console.log('Email sending failed:', e.message);
    return false;
  }
};

module.exports = { sendOTP, sendOTPEmail };
