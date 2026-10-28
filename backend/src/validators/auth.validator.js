const { body } = require('express-validator');

const emailField = (chain) =>
  chain.trim().isEmail().withMessage('Valid email required').toLowerCase();

const signupValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  emailField(body('email')),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const loginValidator = [
  emailField(body('email')),
  body('password').notEmpty().withMessage('Password is required')
];

const forgotPasswordValidator = [
  emailField(body('email').notEmpty().withMessage('Email is required'))
];

const resetPasswordValidator = [
  body('resetToken').notEmpty().withMessage('Reset token required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];

const resendOTPValidator = [
  emailField(body('email').notEmpty().withMessage('Email required')),
  body('type').notEmpty().withMessage('Type required').isIn(['2fa', 'passwordReset']).withMessage('Type must be 2fa or passwordReset')
];

const verifyOTPValidator = [
  emailField(body('email').notEmpty().withMessage('Email required')),
  body('otp').notEmpty().withMessage('OTP required').isLength({ min: 6, max: 6 })
];

const verify2FAValidator = [
  body('tempToken').notEmpty().withMessage('Temp token required'),
  body('otp').notEmpty().withMessage('OTP required').isLength({ min: 6, max: 6 })
];

const confirm2FAValidator = [
  body('otp').notEmpty().withMessage('OTP required').isLength({ min: 6, max: 6 })
];

module.exports = { signupValidator, loginValidator, forgotPasswordValidator, resetPasswordValidator, verifyOTPValidator, verify2FAValidator, confirm2FAValidator, resendOTPValidator };
