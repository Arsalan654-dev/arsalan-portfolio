const { body, param, query } = require('express-validator');

const idParamValidator = [
  param('id').isMongoId().withMessage('Invalid ID format.')
];

const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100.')
];

const profileUpdateValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters.'),
  body('mobileNumber').optional({ nullable: true }).isMobilePhone().withMessage('Invalid mobile number.'),
  body('address').optional({ nullable: true }).isLength({ max: 500 }).withMessage('Address max 500 characters.'),
  body('country').optional({ nullable: true }).isMongoId().withMessage('Invalid country ID.'),
  body('city').optional({ nullable: true }).isMongoId().withMessage('Invalid city ID.')
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters.')
];

const contactValidator = [
  body('name').trim().notEmpty().withMessage('Name is required.').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email required.').toLowerCase(),
  body('subject').trim().notEmpty().withMessage('Subject is required.').isLength({ max: 200 }),
  body('message').trim().notEmpty().withMessage('Message is required.').isLength({ max: 5000 })
];

const reviewValidator = [
  body('itemId').isMongoId().withMessage('Invalid item ID.'),
  body('itemType').isIn(['projects', 'services']).withMessage('Item type must be projects or services.'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
  body('reviewText').optional().trim().isLength({ max: 2000 }).withMessage('Review max 2000 characters.')
];

const cartValidator = [
  body('itemId').isMongoId().withMessage('Invalid item ID.'),
  body('itemType').isIn(['projects', 'services']).withMessage('Item type must be projects or services.')
];

const promoValidator = [
  body('code').trim().notEmpty().withMessage('Promo code is required.')
];

const categoryValidator = [
  body('category_title').trim().notEmpty().withMessage('Category title is required.').isLength({ max: 100 }),
  body('icon').optional().trim().isLength({ max: 10 }).withMessage('Icon must be a valid emoji.')
];

const technologyValidator = [
  body('technology_title').trim().notEmpty().withMessage('Technology title is required.').isLength({ max: 100 })
];

const skillValidator = [
  body('skill_title').trim().notEmpty().withMessage('Skill title is required.').isLength({ max: 100 }),
  body('skill_option').isIn(['beginner', 'intermediate', 'expert']).withMessage('Skill option must be beginner, intermediate, or expert.')
];

const slugValidator = [
  body('slug_title').trim().notEmpty().withMessage('Slug title is required.').isLength({ max: 100 })
];

const projectValidator = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be non-negative.')
];

const serviceValidator = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be non-negative.')
];

const blogValidator = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('content').optional().trim()
];

const aboutValidator = [
  body('title').trim().notEmpty().withMessage('Title is required.').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 5000 })
];

const countryValidator = [
  body('country_name').trim().notEmpty().withMessage('Country name is required.').isLength({ max: 100 }),
  body('country_code').trim().notEmpty().withMessage('Country code is required.').isLength({ min: 2, max: 5 })
];

const cityValidator = [
  body('city_name').trim().notEmpty().withMessage('City name is required.').isLength({ max: 100 }),
  body('country').isMongoId().withMessage('Invalid country ID.')
];

const promoCodeValidator = [
  body('promoCodeTitle').trim().notEmpty().withMessage('Promo code title is required.').isLength({ max: 50 }),
  body('minPurchaseAmount').isFloat({ min: 0 }).withMessage('Minimum purchase amount is required.'),
  body('discountPercentage').isInt({ min: 1, max: 100 }).withMessage('Discount must be 1-100%.'),
  body('usageLimit').isInt({ min: 1 }).withMessage('Usage limit must be at least 1.')
];

const chatbotValidator = [
  body('message').trim().notEmpty().withMessage('Message is required.').isLength({ max: 2000 })
];

const subscribeValidator = [
  body('email').trim().isEmail().withMessage('Valid email required.').toLowerCase()
];

module.exports = {
  idParamValidator,
  paginationValidator,
  profileUpdateValidator,
  changePasswordValidator,
  contactValidator,
  reviewValidator,
  cartValidator,
  promoValidator,
  categoryValidator,
  technologyValidator,
  skillValidator,
  slugValidator,
  projectValidator,
  serviceValidator,
  blogValidator,
  aboutValidator,
  countryValidator,
  cityValidator,
  promoCodeValidator,
  chatbotValidator,
  subscribeValidator
};
