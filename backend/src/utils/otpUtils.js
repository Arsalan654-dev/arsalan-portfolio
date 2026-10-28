const crypto = require('crypto');
const { storeSet, storeGet, storeDel } = require('./store');

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const storeOTP = async (key, otp, ttl = 300) => {
  await storeSet(`otp:${key}`, ttl, otp);
};

const getOTP = async (key) => {
  return storeGet(`otp:${key}`);
};

const deleteOTP = async (key) => {
  await storeDel(`otp:${key}`);
};

module.exports = { generateOTP, storeOTP, getOTP, deleteOTP };
