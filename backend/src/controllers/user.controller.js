const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const getStripe = require('../config/stripe');
const User = require('../models/User');
const Project = require('../models/Project');
const Service = require('../models/Service');
const Order = require('../models/Order');
const Review = require('../models/Review');
const PromoCode = require('../models/PromoCode');
const Country = require('../models/Country');
const City = require('../models/City');
const { generateOrderNumber } = require('../utils/helpers');
const { uploadFile, deleteFile } = require('../services/cloudinary.service');
const { validatePromoCode, applyPromoCode } = require('../services/promo.service');
const { sendOrderConfirmation } = require('../services/email.service');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('country', 'country_name country_code')
      .populate('city', 'city_name');

    return res.status(200).json({
      success: true,
      message: 'Profile fetched.',
      data: user
    });
  } catch (error) {
    console.error('GetProfile Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'mobileNumber', 'country', 'city', 'address'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    if (req.body.mobile !== undefined) {
      updates.mobileNumber = req.body.mobile;
    }
    if (updates.country === '') updates.country = null;
    if (updates.city === '') updates.city = null;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
      .select('-password')
      .populate('country', 'country_name country_code')
      .populate('city', 'city_name');

    return res.status(200).json({
      success: true,
      message: 'Profile updated.',
      data: user
    });
  } catch (error) {
    console.error('UpdateProfile Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided.' });
    }

    const currentUser = await User.findById(req.user._id);
    const oldPublicId = currentUser.profilePicturePublicId;

    const result = await uploadFile(req.file, 'avatars');
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture: result.url, profilePicturePublicId: result.publicId },
      { new: true }
    ).select('-password');

    if (oldPublicId) {
      await deleteFile(oldPublicId);
    }

    return res.status(200).json({
      success: true,
      message: 'Avatar updated.',
      data: user
    });
  } catch (error) {
    console.error('UpdateAvatar Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user || !user.password) {
      return res.status(400).json({ success: false, message: 'Password not set.' });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('ChangePassword Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    return res.status(200).json({
      success: true,
      message: 'Wishlist fetched.',
      data: user.wishlist
    });
  } catch (error) {
    console.error('GetWishlist Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.addToWishlist = async (req, res) => {
  try {
    const { itemId } = req.body;

    const project = await Project.findById(itemId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const user = await User.findById(req.user._id);
    if (user.wishlist.includes(itemId)) {
      return res.status(400).json({ success: false, message: 'Item already in wishlist.' });
    }

    user.wishlist.push(itemId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Added to wishlist.',
      data: user.wishlist
    });
  } catch (error) {
    console.error('AddToWishlist Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { wishlist: id } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Removed from wishlist.',
      data: user.wishlist
    });
  } catch (error) {
    console.error('RemoveFromWishlist Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user._id);
    return res.status(200).json({
      success: true,
      message: 'Cart fetched.',
      data: cart
    });
  } catch (error) {
    console.error('GetCart Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

const getPopulatedCart = async (userId) => {
  const user = await User.findById(userId);
  if (!user || user.cart.length === 0) return [];

  const populatedCart = await Promise.all(
    user.cart.map(async (ci) => {
      const Model = ci.itemType === 'projects' ? Project : Service;
      const item = await Model.findById(ci.item).select('title slug price pictures');
      if (!item) return null;
      return {
        _id: ci._id,
        item: item,
        itemType: ci.itemType,
        quantity: ci.quantity,
        addedAt: ci.addedAt
      };
    })
  );

  return populatedCart.filter(Boolean);
};

exports.addToCart = async (req, res) => {
  try {
    const { itemId, itemType } = req.body;

    if (!['projects', 'services'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Invalid item type.' });
    }

    const Model = itemType === 'projects' ? Project : Service;
    const item = await Model.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const user = await User.findById(req.user._id);
    const existing = user.cart.find(c => c.item.toString() === itemId && c.itemType === itemType);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Item already in cart.' });
    }

    user.cart.push({ item: itemId, itemType, quantity: 1 });
    await user.save();

    const cart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Added to cart.',
      data: cart
    });
  } catch (error) {
    console.error('AddToCart Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.updateCartQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1.' });
    }

    const user = await User.findOneAndUpdate(
      { _id: req.user._id, 'cart.item': id },
      { $set: { 'cart.$.quantity': quantity } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Item not found in cart.' });
    }

    const cart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Cart updated.',
      data: cart
    });
  } catch (error) {
    console.error('UpdateCartQuantity Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid item ID.' });
    }

    const user = await User.findById(req.user._id);
    const beforeCount = user.cart.length;
    user.cart = user.cart.filter(c => {
      const itemId = c.item?._id ? c.item._id.toString() : c.item.toString();
      return itemId !== id;
    });
    
    if (user.cart.length === beforeCount) {
      return res.status(404).json({ success: false, message: 'Item not found in cart.' });
    }
    
    await user.save();

    const cart = await getPopulatedCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Removed from cart.',
      data: cart
    });
  } catch (error) {
    console.error('RemoveFromCart Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.checkout = async (req, res) => {
  try {
    const { promoCode } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.cart.length) {
      return res.status(400).json({ success: false, message: 'Cart is empty.' });
    }

    const items = [];
    let subtotal = 0;

    for (const cartItem of user.cart) {
      const Model = cartItem.itemType === 'projects' ? Project : Service;
      const item = await Model.findById(cartItem.item);
      if (!item) continue;

      const price = item.price || 0;
      items.push({
        item: item._id,
        itemType: cartItem.itemType,
        quantity: cartItem.quantity,
        price
      });
      subtotal += price * cartItem.quantity;
    }

    if (!items.length) {
      return res.status(400).json({ success: false, message: 'No valid items in cart.' });
    }

    let discountAmount = 0;
    let appliedPromo = null;

    if (promoCode) {
      const validation = await validatePromoCode(promoCode, user._id);
      if (validation.valid) {
        const result = await applyPromoCode(validation.promo._id, user._id, subtotal);
        discountAmount = result.discount;
        appliedPromo = validation.promo._id;
      } else {
        return res.status(400).json({ success: false, message: validation.message });
      }
    }

    const totalAmount = subtotal - discountAmount;
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      user: user._id,
      items,
      subtotal,
      discountAmount,
      promoCode: appliedPromo,
      totalAmount
    });

    user.cart = [];
    user.totalPurchasedAmount += totalAmount;
    await user.save();

    const emailItems = items.map(i => ({ name: i.item?.title || 'Item', quantity: i.quantity, price: i.price }));
    await sendOrderConfirmation(user, orderNumber, emailItems, totalAmount, discountAmount);

    return res.status(201).json({
      success: true,
      message: 'Order placed.',
      data: { order, stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY }
    });
  } catch (error) {
    console.error('Checkout Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.payOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(200).json({ success: true, message: 'Order already paid.', data: order });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Payment service is not configured.' });
    }

    if (!order.stripePaymentIntentId) {
      return res.status(400).json({ success: false, message: 'No payment initiated for this order.' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      order.paymentStatus = 'paid';
      order.stripePaymentId = paymentIntent.id;
      order.orderStatus = 'sent';
      await order.save();
      return res.status(200).json({ success: true, message: 'Payment successful.', data: order });
    }

    if (paymentIntent.status === 'processing') {
      return res.status(200).json({ success: true, message: 'Payment is processing.', data: order });
    }

    return res.status(400).json({ success: false, message: `Payment not completed. Status: ${paymentIntent.status}` });
  } catch (error) {
    console.error('PayOrder Error:', error);
    return res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
};

exports.createPaymentIntent = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const stripe = getStripe();
    if (!stripe) {
      return res.status(503).json({ success: false, message: 'Payment service is not configured.' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order already paid.' });
    }

    let paymentIntent;
    if (order.stripePaymentIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
      if (paymentIntent.status === 'requires_payment_method' || paymentIntent.status === 'requires_confirmation') {
        return res.status(200).json({
          success: true,
          data: { clientSecret: paymentIntent.client_secret }
        });
      }
    }

    paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true }
    });

    order.stripePaymentIntentId = paymentIntent.id;
    await order.save();

    return res.status(200).json({
      success: true,
      data: { clientSecret: paymentIntent.client_secret }
    });
  } catch (error) {
    console.error('CreatePaymentIntent Error:', error);
    return res.status(500).json({ success: false, message: 'Failed to initialize payment.' });
  }
};

const populateOrderItems = async (orders) => {
  const orderList = Array.isArray(orders) ? orders : [orders];
  for (const order of orderList) {
    if (!order.items || order.items.length === 0) continue;
    const populatedItems = await Promise.all(
      order.items.map(async (ci) => {
        const Model = ci.itemType === 'projects' ? Project : Service;
        const item = await Model.findById(ci.item).select('title slug price pictures');
        return {
          _id: ci._id,
          item: item || ci.item,
          itemType: ci.itemType,
          quantity: ci.quantity,
          price: ci.price
        };
      })
    );
    order.items = populatedItems;
  }
  return Array.isArray(orders) ? orders : orders[0];
};

exports.getOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    await populateOrderItems(orders);

    const total = await Order.countDocuments({ user: req.user._id, isDeleted: false });

    return res.status(200).json({
      success: true,
      message: 'Orders fetched.',
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('GetOrders Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    await populateOrderItems(order);

    return res.status(200).json({
      success: true,
      message: 'Order detail fetched.',
      data: order
    });
  } catch (error) {
    console.error('GetOrderDetail Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.validatePromo = async (req, res) => {
  try {
    const { code } = req.body;
    const result = await validatePromoCode(code, req.user._id);

    return res.status(200).json({
      success: true,
      message: result.valid ? 'Promo code valid.' : result.message,
      data: result.valid ? { discountPercentage: result.promo.discountPercentage } : null
    });
  } catch (error) {
    console.error('ValidatePromo Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { itemId, itemType, rating, reviewText } = req.body;

    if (!['projects', 'services'].includes(itemType)) {
      return res.status(400).json({ success: false, message: 'Invalid item type.' });
    }

    const Model = itemType === 'projects' ? Project : Service;
    const item = await Model.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    const existing = await Review.findOne({ user: req.user._id, item: itemId, itemType, isDeleted: false });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this item.' });
    }

    const review = await Review.create({
      user: req.user._id,
      item: itemId,
      itemType,
      rating,
      reviewText
    });

    const stats = await Review.aggregate([
      { $match: { item: item._id, itemType, isDeleted: false } },
      { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ]);

    if (stats.length) {
      item.averageRating = Math.round(stats[0].averageRating * 10) / 10;
      item.totalReviews = stats[0].totalReviews;
      await item.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Review added.',
      data: review
    });
  } catch (error) {
    console.error('AddReview Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { rating, reviewText } = req.body;

    const review = await Review.findOne({ _id: req.params.id, user: req.user._id, isDeleted: false });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    if (rating !== undefined) review.rating = rating;
    if (reviewText !== undefined) review.reviewText = reviewText;
    await review.save();

    const Model = review.itemType === 'projects' ? Project : Service;
    const item = await Model.findById(review.item);
    if (item) {
      const stats = await Review.aggregate([
        { $match: { item: item._id, itemType: review.itemType, isDeleted: false } },
        { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
      ]);

      if (stats.length) {
        item.averageRating = Math.round(stats[0].averageRating * 10) / 10;
        item.totalReviews = stats[0].totalReviews;
        await item.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Review updated.',
      data: review
    });
  } catch (error) {
    console.error('UpdateReview Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, user: req.user._id, isDeleted: false });
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    review.isDeleted = true;
    await review.save();

    const Model = review.itemType === 'projects' ? Project : Service;
    const item = await Model.findById(review.item);
    if (item) {
      const stats = await Review.aggregate([
        { $match: { item: item._id, itemType: review.itemType, isDeleted: false } },
        { $group: { _id: null, averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
      ]);

      item.averageRating = stats.length ? Math.round(stats[0].averageRating * 10) / 10 : 0;
      item.totalReviews = stats.length ? stats[0].totalReviews : 0;
      await item.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Review deleted.'
    });
  } catch (error) {
    console.error('DeleteReview Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getCountries = async (req, res) => {
  try {
    const countries = await Country.find({ isDeleted: false }).sort({ country_name: 1 });
    return res.status(200).json({
      success: true,
      message: 'Countries fetched.',
      data: countries
    });
  } catch (error) {
    console.error('GetCountries Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

exports.getCitiesByCountry = async (req, res) => {
  try {
    const { countryId } = req.params;
    const cities = await City.find({ country: countryId, isDeleted: false }).sort({ city_name: 1 });
    return res.status(200).json({
      success: true,
      message: 'Cities fetched.',
      data: cities
    });
  } catch (error) {
    console.error('GetCitiesByCountry Error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
