const PromoCode = require('../../models/PromoCode');
const { qualifyUsersForPromo } = require('../../services/promo.service');

exports.create = async (req, res) => {
  try {
    const { promoCodeTitle, minPurchaseAmount, discountPercentage, validFrom, validTill, usageLimit } = req.body;

    const promo = await PromoCode.create({
      promoCodeTitle,
      minPurchaseAmount,
      discountPercentage,
      validFrom,
      validTill,
      usageLimit
    });

    const qualifiedCount = await qualifyUsersForPromo(promo);

    return res.status(201).json({
      success: true,
      message: 'Promo code created.',
      data: { ...promo.toObject(), qualifiedCount }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Promo code already exists.' });
    }
    console.error('Create PromoCode Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, isActive } = req.query;

    const filter = {};

    if (isActive === 'true') {
      filter.validFrom = { $lte: new Date() };
      filter.validTill = { $gte: new Date() };
    } else if (isActive === 'false') {
      filter.$or = [
        { validFrom: { $gt: new Date() } },
        { validTill: { $lt: new Date() } }
      ];
    }

    if (search) filter.promoCodeTitle = { $regex: search, $options: 'i' };

    const promos = await PromoCode.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PromoCode.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Promo codes fetched.',
      data: promos,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetAll PromoCodes Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getById = async (req, res) => {
  try {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Promo code not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Promo code fetched.',
      data: promo
    });
  } catch (error) {
    console.error('GetById PromoCode Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.update = async (req, res) => {
  try {
    const { promoCodeTitle, minPurchaseAmount, discountPercentage, validFrom, validTill, usageLimit } = req.body;
    const updates = {};
    if (promoCodeTitle) updates.promoCodeTitle = promoCodeTitle;
    if (minPurchaseAmount !== undefined) updates.minPurchaseAmount = minPurchaseAmount;
    if (discountPercentage !== undefined) updates.discountPercentage = discountPercentage;
    if (validFrom) updates.validFrom = validFrom;
    if (validTill) updates.validTill = validTill;
    if (usageLimit !== undefined) updates.usageLimit = usageLimit;

    const promo = await PromoCode.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    if (!promo) {
      return res.status(404).json({ success: false, message: 'Promo code not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Promo code updated.',
      data: promo
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Promo code title already exists.' });
    }
    console.error('Update PromoCode Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.delete = async (req, res) => {
  try {
    const promo = await PromoCode.findByIdAndDelete(req.params.id);

    if (!promo) {
      return res.status(404).json({ success: false, message: 'Promo code not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Promo code deleted.'
    });
  } catch (error) {
    console.error('Delete PromoCode Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const { ids } = req.body;
    await PromoCode.deleteMany({ _id: { $in: ids } });

    return res.status(200).json({
      success: true,
      message: `${ids.length} promo codes deleted.`
    });
  } catch (error) {
    console.error('DeleteAll PromoCodes Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};


