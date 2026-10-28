const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const validate = require('../middlewares/validate.middleware');
const { publicLimiter } = require('../middlewares/rateLimiter');
const userController = require('../controllers/user.controller');
const {
  profileUpdateValidator,
  changePasswordValidator,
  cartValidator,
  reviewValidator,
  promoValidator,
  idParamValidator
} = require('../validators/common.validator');

router.use(verifyAccessToken);

router.get('/profile', userController.getProfile);
router.put('/profile', profileUpdateValidator, validate, userController.updateProfile);
router.put('/profile/avatar', upload.single('avatar'), userController.updateAvatar);
router.put('/profile/change-password', changePasswordValidator, validate, userController.changePassword);

router.get('/wishlist', userController.getWishlist);
router.post('/wishlist', cartValidator, validate, userController.addToWishlist);
router.delete('/wishlist/:id', idParamValidator, validate, userController.removeFromWishlist);

router.get('/cart', userController.getCart);
router.post('/cart', cartValidator, validate, userController.addToCart);
router.put('/cart/:id', userController.updateCartQuantity);
router.delete('/cart/:id', userController.removeFromCart);

router.post('/orders/checkout', userController.checkout);
router.post('/orders/validate-promo', promoValidator, validate, userController.validatePromo);
router.get('/orders', publicLimiter, userController.getOrders);
router.get('/orders/:id', userController.getOrderDetail);
router.post('/orders/:id/create-payment-intent', userController.createPaymentIntent);
router.post('/orders/:id/pay', userController.payOrder);

router.post('/reviews', reviewValidator, validate, userController.addReview);
router.put('/reviews/:id', userController.updateReview);
router.delete('/reviews/:id', idParamValidator, validate, userController.deleteReview);

router.get('/countries', userController.getCountries);
router.get('/cities/:countryId', userController.getCitiesByCountry);

module.exports = router;
