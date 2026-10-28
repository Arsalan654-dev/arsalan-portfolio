const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/user', require('./user.routes'));
router.use('/public', require('./public.routes'));

module.exports = router;
