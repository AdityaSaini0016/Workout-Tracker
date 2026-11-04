const express = require('express');
const {
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
} = require('../controllers/exerciseController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getExercises)
  .post(
    [
      body('name', 'Exercise name is required').not().isEmpty(),
      body('muscleGroup', 'Valid muscle group is required').isIn(['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Full Body']),
      body('equipment', 'Valid equipment is required').isIn(['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Other']),
      validate,
    ],
    createExercise
  );

router.route('/:id')
  .get(getExerciseById)
  .patch(updateExercise)
  .delete(deleteExercise);

module.exports = router;
