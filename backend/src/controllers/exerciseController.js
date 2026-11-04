const Exercise = require('../models/Exercise');

// Default exercise seed library
const defaultExercises = [
  // Chest
  { name: 'Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', description: 'Compound chest exercise using a barbell on a flat bench.', instructions: 'Lie on flat bench, grip barbell slightly wider than shoulder-width, lower to mid-chest, and press up.' },
  { name: 'Incline Bench Press', muscleGroup: 'Chest', equipment: 'Barbell', description: 'Upper chest focused press on an incline bench.', instructions: 'Set bench to 30-45 degrees, press barbell up from upper chest.' },
  { name: 'Dumbbell Press', muscleGroup: 'Chest', equipment: 'Dumbbell', description: 'Flat bench press using dumbbells for greater range of motion.', instructions: 'Lie on flat bench holding dumbbells at chest level, press up and slightly inward.' },
  { name: 'Cable Fly', muscleGroup: 'Chest', equipment: 'Cable', description: 'Isolation movement for chest using dual cables.', instructions: 'Set pulleys at shoulder height or above, bring handles together in hugging motion.' },
  { name: 'Pec Deck', muscleGroup: 'Chest', equipment: 'Machine', description: 'Machine isolation exercise for pectoral muscles.', instructions: 'Sit against back pad, place forearms against pads, squeeze together in front.' },

  // Back
  { name: 'Lat Pulldown', muscleGroup: 'Back', equipment: 'Cable', description: 'Vertical pulling exercise for latissimus dorsi.', instructions: 'Grip bar wider than shoulder-width, pull down towards upper chest while leaning back slightly.' },
  { name: 'Pull Up', muscleGroup: 'Back', equipment: 'Bodyweight', description: 'Bodyweight vertical pull for upper body strength.', instructions: 'Grip pull-up bar with overhand grip, pull body up until chin clears the bar.' },
  { name: 'Barbell Row', muscleGroup: 'Back', equipment: 'Barbell', description: 'Compound horizontal pull for mid-back thickness.', instructions: 'Bend at hips with flat back, pull barbell to lower ribcage.' },
  { name: 'Seated Cable Row', muscleGroup: 'Back', equipment: 'Cable', description: 'Horizontal row using cable machine.', instructions: 'Sit with feet on platform, pull handle to abdomen while keeping chest up.' },

  // Shoulders
  { name: 'Shoulder Press', muscleGroup: 'Shoulders', equipment: 'Dumbbell', description: 'Overhead press for deltoids.', instructions: 'Seated or standing, press dumbbells overhead from shoulder level.' },
  { name: 'Lateral Raise', muscleGroup: 'Shoulders', equipment: 'Dumbbell', description: 'Isolation exercise for side delts.', instructions: 'Stand holding dumbbells at sides, raise arms out to sides until parallel to floor.' },
  { name: 'Rear Delt Fly', muscleGroup: 'Shoulders', equipment: 'Dumbbell', description: 'Isolation for posterior deltoids.', instructions: 'Bend over or sit on bench facing down, raise dumbbells out and back.' },
  { name: 'Face Pull', muscleGroup: 'Shoulders', equipment: 'Cable', description: 'Great for rear delts and rotator cuff health.', instructions: 'Attach rope to high pulley, pull towards face with elbows high.' },

  // Legs
  { name: 'Squat', muscleGroup: 'Legs', equipment: 'Barbell', description: 'King of lower body compound exercises.', instructions: 'Rest barbell on upper back, squat down until thighs are parallel to floor, drive up.' },
  { name: 'Leg Press', muscleGroup: 'Legs', equipment: 'Machine', description: 'Heavy leg pressing machine.', instructions: 'Sit on machine, place feet shoulder-width on sled, lower and press back up.' },
  { name: 'Romanian Deadlift', muscleGroup: 'Legs', equipment: 'Barbell', description: 'Hamstring and glute focused hinge movement.', instructions: 'Hold barbell, hinge at hips with slight knee bend, lower bar along shins.' },
  { name: 'Leg Extension', muscleGroup: 'Legs', equipment: 'Machine', description: 'Isolation exercise for quadriceps.', instructions: 'Sit on machine with pad against lower shins, extend legs outward.' },
  { name: 'Leg Curl', muscleGroup: 'Legs', equipment: 'Machine', description: 'Isolation exercise for hamstrings.', instructions: 'Lie face down on machine with pad against lower calves, curl legs up.' },
  { name: 'Lunges', muscleGroup: 'Legs', equipment: 'Dumbbell', description: 'Unilateral leg exercise for quads and glutes.', instructions: 'Step forward with one leg, lower hips until both knees are bent at 90 degrees.' },

  // Arms
  { name: 'Barbell Curl', muscleGroup: 'Arms', equipment: 'Barbell', description: 'Classic bicep mass builder.', instructions: 'Stand holding barbell with underhand grip, curl weight up towards chest.' },
  { name: 'Dumbbell Curl', muscleGroup: 'Arms', equipment: 'Dumbbell', description: 'Bicep curl with supination.', instructions: 'Curl dumbbells up while rotating palms upward.' },
  { name: 'Hammer Curl', muscleGroup: 'Arms', equipment: 'Dumbbell', description: 'Bicep and brachialis builder with neutral grip.', instructions: 'Hold dumbbells with neutral palms-in grip, curl up.' },
  { name: 'Tricep Pushdown', muscleGroup: 'Arms', equipment: 'Cable', description: 'Cable isolation for triceps.', instructions: 'Using rope or bar attachment, push down until arms are fully extended.' },
  { name: 'Skull Crusher', muscleGroup: 'Arms', equipment: 'Barbell', description: 'Lie-down tricep extension.', instructions: 'Lie on bench holding EZ bar, lower bar toward forehead by bending elbows, press up.' },
  { name: 'Dips', muscleGroup: 'Arms', equipment: 'Bodyweight', description: 'Compound push movement for triceps and chest.', instructions: 'Support body on parallel bars, lower body until elbows are at 90 degrees, push up.' }
];

// Seed default exercises if none exist
const seedExercises = async () => {
  try {
    const count = await Exercise.countDocuments({ isCustom: false });
    if (count === 0) {
      await Exercise.insertMany(defaultExercises);
      console.log('Default exercises seeded successfully.');
    }
  } catch (error) {
    console.error('Error seeding exercises:', error);
  }
};

// @desc    Get all exercises (with search, muscle group, equipment filters, pagination)
// @route   GET /api/exercises
// @access  Private
const getExercises = async (req, res, next) => {
  try {
    const { search, muscleGroup, equipment, page = 1, limit = 50 } = req.query;

    const query = {
      $or: [
        { isCustom: false },
        { isCustom: true, createdBy: req.user.id }
      ]
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (muscleGroup) {
      query.muscleGroup = muscleGroup;
    }

    if (equipment) {
      query.equipment = equipment;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Exercise.countDocuments(query);
    const exercises = await Exercise.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: exercises.length,
      total,
      data: exercises,
      message: 'Exercises fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exercise
// @route   GET /api/exercises/:id
// @access  Private
const getExerciseById = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    if (exercise.isCustom && exercise.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this exercise',
      });
    }

    res.status(200).json({
      success: true,
      data: exercise,
      message: 'Exercise fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create custom exercise
// @route   POST /api/exercises
// @access  Private
const createExercise = async (req, res, next) => {
  try {
    const { name, muscleGroup, equipment, description, instructions } = req.body;

    const exercise = await Exercise.create({
      name,
      muscleGroup,
      equipment,
      description,
      instructions,
      isCustom: true,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: exercise,
      message: 'Custom exercise created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update custom exercise
// @route   PATCH /api/exercises/:id
// @access  Private
const updateExercise = async (req, res, next) => {
  try {
    let exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    if (!exercise.isCustom || exercise.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this exercise',
      });
    }

    exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: exercise,
      message: 'Exercise updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom exercise
// @route   DELETE /api/exercises/:id
// @access  Private
const deleteExercise = async (req, res, next) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found',
      });
    }

    if (!exercise.isCustom || exercise.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this exercise',
      });
    }

    await exercise.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Exercise deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  seedExercises,
  getExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
};
