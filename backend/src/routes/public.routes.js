const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middlewares/auth.middleware');
const { publicLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate.middleware');
const publicController = require('../controllers/public.controller');
const {
  contactValidator,
  reviewValidator,
  chatbotValidator,
  subscribeValidator,
  paginationValidator
} = require('../validators/common.validator');

router.get('/projects', paginationValidator, validate, publicController.getProjects);
router.get('/projects/:id/related', publicController.getRelatedProjects);
router.get('/projects/:slug', publicController.getProjectBySlug);
router.get('/services', paginationValidator, validate, publicController.getServices);
router.get('/services/:id/related', publicController.getRelatedServices);
router.get('/services/:slug', publicController.getServiceBySlug);
router.get('/categories', publicController.getCategories);
router.get('/technologies', publicController.getTechnologies);
router.get('/gallery', paginationValidator, validate, publicController.getGallery);
router.get('/banners', publicController.getBanners);
router.get('/about', publicController.getAbout);
router.get('/blogs', paginationValidator, validate, publicController.getBlogs);
router.get('/blogs/:slug', publicController.getBlogBySlug);
router.post('/contact', publicLimiter, contactValidator, validate, publicController.submitContact);
router.get('/resume', publicController.getResume);
router.get('/reviews/:itemType/:itemId', publicController.getItemReviews);
router.post('/chatbot', publicLimiter, chatbotValidator, validate, publicController.chatbotMessage);
router.post('/subscribe', publicLimiter, subscribeValidator, validate, publicController.subscribe);

module.exports = router;
