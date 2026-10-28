import axiosInstance from './axiosInstance';

const authService = {
  signup: (data) => axiosInstance.post('/auth/signup', data),
  verifyEmail: (token) => axiosInstance.post(`/auth/verify-email/${token}`),
  login: (data) => axiosInstance.post('/auth/login', data),
  verify2FA: (data) => axiosInstance.post('/auth/verify-2fa', data),
  enable2FA: () => axiosInstance.post('/auth/enable-2fa'),
  confirm2FA: (data) => axiosInstance.post('/auth/confirm-2fa', data),
  disable2FA: () => axiosInstance.post('/auth/disable-2fa'),
  confirmDisable2FA: (data) => axiosInstance.post('/auth/confirm-disable-2fa', data),
  refreshToken: () => axiosInstance.post('/auth/refresh-token'),
  logout: () => axiosInstance.post('/auth/logout'),
  forgotPassword: (data) => axiosInstance.post('/auth/forgot-password', data),
  verifyOTP: (data) => axiosInstance.post('/auth/verify-otp', data),
  resetPassword: (data) => axiosInstance.post('/auth/reset-password', data),
  resendOTP: (data) => axiosInstance.post('/auth/resend-otp', data)
};

export default authService;
