const express = require('express');
const { register, login, logout, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    validate,
  ],
  register
);

router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
    validate,
  ],
  login
);

router.post('/logout', logout);
router.get('/me', protect, getMe);
router.patch('/profile', protect, updateProfile);

module.exports = router;
