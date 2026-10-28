const express = require('express');
const router = express.Router();
const { verifyAccessToken } = require('../middlewares/auth.middleware');
const adminMiddleware = require('../middlewares/admin.middleware');
const upload = require('../middlewares/upload.middleware');
const { adminLimiter } = require('../middlewares/rateLimiter');

router.use(verifyAccessToken, adminMiddleware, adminLimiter);

const categoryController = require('../controllers/admin/category.controller');
const technologyController = require('../controllers/admin/technology.controller');
const slugController = require('../controllers/admin/slug.controller');
const skillController = require('../controllers/admin/skill.controller');
const projectController = require('../controllers/admin/project.controller');
const serviceController = require('../controllers/admin/service.controller');
const userController = require('../controllers/admin/user.controller');
const countryController = require('../controllers/admin/country.controller');
const cityController = require('../controllers/admin/city.controller');
const galleryController = require('../controllers/admin/gallery.controller');
const bannerController = require('../controllers/admin/banner.controller');
const orderController = require('../controllers/admin/order.controller');
const dashboardController = require('../controllers/admin/dashboard.controller');
const promoCodeController = require('../controllers/admin/promoCode.controller');
const chatbotController = require('../controllers/admin/chatbot.controller');
const aboutController = require('../controllers/admin/about.controller');
const blogController = require('../controllers/admin/blog.controller');
const contactQueryController = require('../controllers/admin/contactQuery.controller');
const resumeController = require('../controllers/admin/resume.controller');
const adminProfileController = require('../controllers/admin/adminProfile.controller');

// Categories
router.get('/categories', categoryController.getAll);
router.post('/categories', categoryController.create);
router.get('/categories/:id', categoryController.getById);
router.put('/categories/:id', categoryController.update);
router.delete('/categories/:id', categoryController.delete);
router.post('/categories/delete-all', categoryController.deleteAll);

// Technologies
router.get('/technologies', technologyController.getAll);
router.post('/technologies', upload.single('icon'), technologyController.create);
router.get('/technologies/:id', technologyController.getById);
router.put('/technologies/:id', upload.single('icon'), technologyController.update);
router.delete('/technologies/:id', technologyController.delete);
router.post('/technologies/delete-all', technologyController.deleteAll);

// Slugs
router.get('/slugs', slugController.getAll);
router.post('/slugs', slugController.create);
router.get('/slugs/:id', slugController.getById);
router.put('/slugs/:id', slugController.update);
router.delete('/slugs/:id', slugController.delete);
router.post('/slugs/delete-all', slugController.deleteAll);

// Skills
router.get('/skills', skillController.getAll);
router.post('/skills', skillController.create);
router.get('/skills/:id', skillController.getById);
router.put('/skills/:id', skillController.update);
router.delete('/skills/:id', skillController.delete);
router.post('/skills/delete-all', skillController.deleteAll);

// Projects
router.get('/projects', projectController.getAll);
router.post('/projects', upload.array('media', 10), projectController.create);
router.get('/projects/:id', projectController.getById);
router.put('/projects/:id', upload.array('media', 10), projectController.update);
router.delete('/projects/:id', projectController.delete);
router.post('/projects/delete-all', projectController.deleteAll);

// Services
router.get('/services', serviceController.getAll);
router.post('/services', upload.array('media', 10), serviceController.create);
router.get('/services/:id', serviceController.getById);
router.put('/services/:id', upload.array('media', 10), serviceController.update);
router.delete('/services/:id', serviceController.delete);
router.post('/services/delete-all', serviceController.deleteAll);

// Users
router.get('/users', userController.getAll);
router.post('/users', userController.create);
router.get('/users/:id', userController.getById);
router.put('/users/:id', userController.update);
router.post('/users/:id/enable', userController.enable);
router.post('/users/:id/disable', userController.disable);
router.delete('/users/:id', userController.delete);
router.post('/users/delete-all', userController.deleteAll);

// Countries
router.get('/countries', countryController.getAll);
router.post('/countries', countryController.create);
router.get('/countries/:id', countryController.getById);
router.put('/countries/:id', countryController.update);
router.delete('/countries/:id', countryController.delete);
router.post('/countries/delete-all', countryController.deleteAll);

// Cities
router.get('/cities', cityController.getAll);
router.get('/cities/by-country/:countryId', cityController.getByCountry);
router.post('/cities', cityController.create);
router.get('/cities/:id', cityController.getById);
router.put('/cities/:id', cityController.update);
router.delete('/cities/:id', cityController.delete);
router.post('/cities/delete-all', cityController.deleteAll);

// Gallery
router.get('/gallery', galleryController.getAll);
router.post('/gallery', upload.array('images', 20), galleryController.uploadImages);
router.delete('/gallery/:id', galleryController.delete);
router.post('/gallery/delete-all', galleryController.deleteAll);

// Banners
router.get('/banners', bannerController.getAll);
router.post('/banners', upload.array('images', 10), bannerController.uploadImages);
router.delete('/banners/:id', bannerController.delete);
router.post('/banners/delete-all', bannerController.deleteAll);

// Orders
router.get('/orders', orderController.getAll);
router.get('/orders/:id', orderController.getById);
router.post('/orders/:id/send-email', upload.array('attachment', 5), orderController.sendEmail);
router.delete('/orders/:id', orderController.delete);
router.post('/orders/delete-all', orderController.deleteAll);

// Dashboard
router.get('/dashboard/metrics', dashboardController.getMetrics);
router.get('/dashboard/analytics', dashboardController.getAnalytics);
router.get('/dashboard/recent-activities', dashboardController.getRecentActivities);

// Promo Codes
router.get('/promo-codes', promoCodeController.getAll);
router.post('/promo-codes', promoCodeController.create);
router.get('/promo-codes/:id', promoCodeController.getById);
router.put('/promo-codes/:id', promoCodeController.update);
router.delete('/promo-codes/:id', promoCodeController.delete);
router.post('/promo-codes/delete-all', promoCodeController.deleteAll);

// Chatbot
router.get('/chatbot', chatbotController.getInstructions);
router.put('/chatbot', chatbotController.updateInstructions);
router.post('/chatbot/message', chatbotController.sendMessage);

// About
router.get('/about', aboutController.getAll);
router.post('/about', upload.array('pictures', 10), aboutController.create);
router.get('/about/:id', aboutController.getById);
router.put('/about/:id', upload.array('pictures', 10), aboutController.update);
router.delete('/about/:id', aboutController.delete);
router.post('/about/delete-all', aboutController.deleteAll);

// Blogs
router.get('/blogs', blogController.getAll);
router.post('/blogs', upload.array('pictures', 10), blogController.create);
router.get('/blogs/:id', blogController.getById);
router.put('/blogs/:id', upload.array('pictures', 10), blogController.update);
router.delete('/blogs/:id', blogController.delete);
router.post('/blogs/delete-all', blogController.deleteAll);

// Contact Queries
router.get('/contact-queries', contactQueryController.getAll);
router.get('/contact-queries/:id', contactQueryController.getById);
router.post('/contact-queries/:id/reply', contactQueryController.replyEmail);
router.delete('/contact-queries/:id', contactQueryController.delete);

// Resume
router.get('/resume', resumeController.get);
router.post('/resume', upload.single('resume'), resumeController.upload);
router.delete('/resume', resumeController.delete);

// Admin Profile
router.get('/profile', adminProfileController.getProfile);
router.put('/profile', adminProfileController.updateProfile);
router.put('/profile/avatar', upload.single('avatar'), adminProfileController.updateAvatar);
router.put('/profile/change-password', adminProfileController.changePassword);

module.exports = router;
