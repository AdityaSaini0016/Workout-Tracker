const express = require('express');
const {
  getMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
} = require('../controllers/nutritionController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMeals)
  .post(
    [
      body('name', 'Meal name is required').not().isEmpty(),
      body('mealType', 'Meal type is required').isIn(['Breakfast', 'Lunch', 'Dinner', 'Snack']),
      body('calories', 'Calories must be a number').isNumeric(),
      body('protein', 'Protein must be a number').isNumeric(),
      body('carbs', 'Carbs must be a number').isNumeric(),
      body('fat', 'Fat must be a number').isNumeric(),
      validate,
    ],
    createMeal
  );

router.route('/:id')
  .get(getMealById)
  .patch(updateMeal)
  .delete(deleteMeal);

module.exports = router;
