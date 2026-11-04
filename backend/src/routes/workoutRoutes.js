const express = require('express');
const {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  addSet,
  updateSet,
  deleteSet,
} = require('../controllers/workoutController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getWorkouts)
  .post(
    [
      body('name', 'Workout name is required').optional().not().isEmpty(),
      validate,
    ],
    createWorkout
  );

router.route('/:id')
  .get(getWorkoutById)
  .patch(updateWorkout)
  .delete(deleteWorkout);

// Workout exercises
router.post(
  '/:id/exercises',
  [
    body('exerciseId', 'Exercise ID is required').not().isEmpty(),
    validate,
  ],
  addExerciseToWorkout
);

router.delete('/:id/exercises/:exerciseId', removeExerciseFromWorkout);

// Sets
router.post(
  '/:workoutId/exercises/:exerciseId/sets',
  [
    body('weight', 'Weight must be a number').optional().isNumeric(),
    body('reps', 'Reps must be a number').optional().isNumeric(),
    validate,
  ],
  addSet
);

router.patch('/sets/:setId', updateSet);
router.delete('/sets/:setId', deleteSet);

module.exports = router;
