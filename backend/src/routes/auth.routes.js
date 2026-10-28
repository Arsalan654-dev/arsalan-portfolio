const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../middlewares/auth.middleware');
const { authLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate.middleware');
const { signupValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator, verifyOTPValidator, verify2FAValidator, confirm2FAValidator, resendOTPValidator } = require('../validators/auth.validator');
const authController = require('../controllers/auth.controller');

router.post('/signup', authLimiter, signupValidator, validate, authController.signup);
router.post('/verify-email/:token', authLimiter, authController.verifyEmail);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/verify-2fa', authLimiter, verify2FAValidator, validate, authController.verify2FA);
router.post('/enable-2fa', authLimiter, verifyAccessToken, authController.enable2FA);
router.post('/confirm-2fa', authLimiter, verifyAccessToken, confirm2FAValidator, validate, authController.confirm2FA);
router.post('/disable-2fa', authLimiter, verifyAccessToken, authController.disable2FA);
router.post('/confirm-disable-2fa', authLimiter, verifyAccessToken, verifyOTPValidator, validate, authController.confirmDisable2FA);
router.post('/refresh-token', authLimiter, authController.refreshToken);
router.post('/logout', authLimiter, verifyAccessToken, authController.logout);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/verify-otp', authLimiter, verifyOTPValidator, validate, authController.verifyOTP);
router.post('/reset-password', authLimiter, resetPasswordValidator, validate, authController.resetPassword);
router.post('/resend-otp', authLimiter, resendOTPValidator, validate, authController.resendOTP);

module.exports = router;
