export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validateMobile = (mobile) => {
  const re = /^\d{10,15}$/;
  return re.test(mobile);
};
