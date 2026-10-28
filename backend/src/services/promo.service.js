const PromoCode = require('../models/PromoCode');
const User = require('../models/User');
const { sendPromoCode } = require('./email.service');

const qualifyUsersForPromo = async (promoCode) => {
  const qualifiedUsers = await User.find({
    totalPurchasedAmount: { $gte: promoCode.minPurchaseAmount },
    isActive: true
  });

  for (const user of qualifiedUsers) {
    if (!promoCode.qualifiedUsers.includes(user._id)) {
      promoCode.qualifiedUsers.push(user._id);
      promoCode.usageTracking.push({ user: user._id, usedCount: 0 });
      await sendPromoCode(user, promoCode.promoCodeTitle, promoCode.discountPercentage);
    }
  }
  await promoCode.save();
  return qualifiedUsers.length;
};

const validatePromoCode = async (code, userId) => {
  const promo = await PromoCode.findOne({
    promoCodeTitle: code,
    isDeleted: false,
    validFrom: { $lte: new Date() },
    validTill: { $gte: new Date() }
  });

  if (!promo) return { valid: false, message: 'Invalid or expired promo code.' };

  const userTracking = promo.usageTracking.find(
    t => t.user.toString() === userId.toString()
  );

  if (userTracking && userTracking.usedCount >= promo.usageLimit) {
    return { valid: false, message: 'You have reached the usage limit for this promo code.' };
  }

  if (!promo.qualifiedUsers.some(u => u.toString() === userId.toString())) {
    return { valid: false, message: 'You are not qualified for this promo code.' };
  }

  return { valid: true, promo };
};

const applyPromoCode = async (promoCodeId, userId, amount) => {
  const promo = await PromoCode.findById(promoCodeId);
  if (!promo) return { discount: 0 };

  const discount = (amount * promo.discountPercentage) / 100;
  const userTracking = promo.usageTracking.find(
    t => t.user.toString() === userId.toString()
  );
  if (userTracking) {
    userTracking.usedCount += 1;
    await promo.save();
  }
  return { discount };
};

module.exports = { qualifyUsersForPromo, validatePromoCode, applyPromoCode };
