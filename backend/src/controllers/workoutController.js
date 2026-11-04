const Workout = require('../models/Workout');

// @desc    Get all user workouts
// @route   GET /api/workouts
// @access  Private
const getWorkouts = async (req, res, next) => {
  try {
    const { search, startDate, endDate, limit = 50, page = 1 } = req.query;

    const query = { user: req.user.id };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Workout.countDocuments(query);
    const workouts = await Workout.find(query)
      .populate('exercises.exercise')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: workouts.length,
      total,
      data: workouts,
      message: 'Workouts fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workout
// @route   GET /api/workouts/:id
// @access  Private
const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id).populate('exercises.exercise');

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    if (workout.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this workout',
      });
    }

    res.status(200).json({
      success: true,
      data: workout,
      message: 'Workout fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new workout
// @route   POST /api/workouts
// @access  Private
const createWorkout = async (req, res, next) => {
  try {
    const { name, date, startTime, notes, exercises } = req.body;

    const workout = await Workout.create({
      user: req.user.id,
      name: name || 'Workout',
      date: date || Date.now(),
      startTime: startTime || Date.now(),
      notes: notes || '',
      exercises: exercises || [],
    });

    const populated = await Workout.findById(workout._id).populate('exercises.exercise');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Workout created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workout (name, notes, duration, completed, etc.)
// @route   PATCH /api/workouts/:id
// @access  Private
const updateWorkout = async (req, res, next) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    if (workout.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this workout',
      });
    }

    const { name, notes, completed, duration, endTime, date } = req.body;

    if (name !== undefined) workout.name = name;
    if (notes !== undefined) workout.notes = notes;
    if (completed !== undefined) {
      workout.completed = completed;
      if (completed && !workout.endTime) {
        workout.endTime = Date.now();
        if (workout.startTime) {
          workout.duration = Math.floor((new Date(workout.endTime) - new Date(workout.startTime)) / 1000);
        }
      }
    }
    if (duration !== undefined) workout.duration = duration;
    if (endTime !== undefined) workout.endTime = endTime;
    if (date !== undefined) workout.date = date;

    await workout.save();

    const populated = await Workout.findById(workout._id).populate('exercises.exercise');

    res.status(200).json({
      success: true,
      data: populated,
      message: 'Workout updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workout
// @route   DELETE /api/workouts/:id
// @access  Private
const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    if (workout.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this workout',
      });
    }

    await workout.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Workout deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add exercise to workout
// @route   POST /api/workouts/:id/exercises
// @access  Private
const addExerciseToWorkout = async (req, res, next) => {
  try {
    const { exerciseId, notes, sets } = req.body;
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    if (workout.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this workout',
      });
    }

    const newExercise = {
      exercise: exerciseId,
      order: workout.exercises.length,
      notes: notes || '',
      sets: sets && sets.length > 0 ? sets : [{ weight: 0, reps: 0, completed: false }]
    };

    workout.exercises.push(newExercise);
    await workout.save();

    const populated = await Workout.findById(workout._id).populate('exercises.exercise');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Exercise added to workout successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove exercise from workout
// @route   DELETE /api/workouts/:id/exercises/:exerciseId
// @access  Private
const removeExerciseFromWorkout = async (req, res, next) => {
  try {
    let workout = await Workout.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    if (workout.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this workout',
      });
    }

    workout.exercises = workout.exercises.filter(
      item => item._id.toString() !== req.params.exerciseId
    );

    await workout.save();
    const populated = await Workout.findById(workout._id).populate('exercises.exercise');

    res.status(200).json({
      success: true,
      data: populated,
      message: 'Exercise removed from workout successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add set to workout exercise
// @route   POST /api/workouts/:workoutId/exercises/:exerciseId/sets
// @access  Private
const addSet = async (req, res, next) => {
  try {
    const { weight, reps, completed } = req.body;
    let workout = await Workout.findById(req.params.workoutId);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
    }

    if (workout.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this workout',
      });
    }

    const workoutExercise = workout.exercises.id(req.params.exerciseId);
    if (!workoutExercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found in this workout',
      });
    }

    workoutExercise.sets.push({
      weight: weight !== undefined ? weight : 0,
      reps: reps !== undefined ? reps : 0,
      completed: completed !== undefined ? completed : false,
    });

    await workout.save();
    const populated = await Workout.findById(workout._id).populate('exercises.exercise');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Set added successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update set
// @route   PATCH /api/sets/:setId
// @access  Private
const updateSet = async (req, res, next) => {
  try {
    const { weight, reps, completed } = req.body;

    // Find workout containing this set subdocument
    const workout = await Workout.findOne({ 'exercises.sets._id': req.params.setId });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Set not found',
      });
    }

    if (workout.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this set',
      });
    }

    let foundSet = null;
    workout.exercises.forEach(we => {
      const s = we.sets.id(req.params.setId);
      if (s) {
        foundSet = s;
      }
    });

    if (!foundSet) {
      return res.status(404).json({
        success: false,
        message: 'Set not found',
      });
    }

    if (weight !== undefined) foundSet.weight = weight;
    if (reps !== undefined) foundSet.reps = reps;
    if (completed !== undefined) foundSet.completed = completed;

    await workout.save();
    const populated = await Workout.findById(workout._id).populate('exercises.exercise');

    res.status(200).json({
      success: true,
      data: populated,
      message: 'Set updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete set
// @route   DELETE /api/sets/:setId
// @access  Private
const deleteSet = async (req, res, next) => {
  try {
    const workout = await Workout.findOne({ 'exercises.sets._id': req.params.setId });

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Set not found',
      });
    }

    if (workout.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this set',
      });
    }

    workout.exercises.forEach(we => {
      const s = we.sets.id(req.params.setId);
      if (s) {
        s.deleteOne();
      }
    });

    await workout.save();
    const populated = await Workout.findById(workout._id).populate('exercises.exercise');

    res.status(200).json({
      success: true,
      data: populated,
      message: 'Set deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
