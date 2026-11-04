const express = require('express');
const {
  getBodyweights,
  createBodyweight,
  updateBodyweight,
  deleteBodyweight,
} = require('../controllers/bodyweightController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getBodyweights)
  .post(
    [
      body('weight', 'Weight is required and must be a number').isNumeric(),
      validate,
    ],
    createBodyweight
  );

router.route('/:id')
  .patch(updateBodyweight)
  .delete(deleteBodyweight);

module.exports = router;
