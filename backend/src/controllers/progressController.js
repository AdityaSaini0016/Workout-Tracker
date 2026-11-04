const Workout = require('../models/Workout');
const Bodyweight = require('../models/Bodyweight');
const Exercise = require('../models/Exercise');

// Helper to calculate streak
const calculateStreak = (workouts) => {
  if (!workouts || workouts.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Extract unique dates (YYYY-MM-DD)
  const workoutDays = [...new Set(workouts.map(w => new Date(w.date).toISOString().split('T')[0]))].sort().reverse();

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let checkDate = new Date();
  let checkStr = checkDate.toISOString().split('T')[0];

  // If user worked out today or yesterday, start streak counting
  let hasWorkedOutRecently = workoutDays.includes(today) || workoutDays.includes(yesterday);
  if (!hasWorkedOutRecently) {
    return { currentStreak: 0, longestStreak: calculateLongest(workoutDays) };
  }

  // Calculate current streak backwards from today/yesterday
  let currentDateObj = new Date();
  if (!workoutDays.includes(today) && workoutDays.includes(yesterday)) {
    currentDateObj.setDate(currentDateObj.getDate() - 1);
  }

  while (true) {
    const dateStr = currentDateObj.toISOString().split('T')[0];
    if (workoutDays.includes(dateStr)) {
      currentStreak++;
      currentDateObj.setDate(currentDateObj.getDate() - 1);
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak: calculateLongest(workoutDays) };
};

const calculateLongest = (workoutDays) => {
  if (workoutDays.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 0; i < workoutDays.length - 1; i++) {
    const d1 = new Date(workoutDays[i]);
    const d2 = new Date(workoutDays[i + 1]);
    const diffTime = Math.abs(d1 - d2);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
};

// @desc    Get progress overview and stats
// @route   GET /api/progress/overview
// @access  Private
const getProgressOverview = async (req, res, next) => {
  try {
    const workouts = await Workout.find({ user: req.user.id, completed: true }).sort({ date: 1 });
    const bodyweights = await Bodyweight.find({ user: req.user.id }).sort({ date: 1 });

    const totalWorkouts = workouts.length;

    // Weekly workouts (last 7 days)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyWorkouts = workouts.filter(w => new Date(w.date) >= oneWeekAgo).length;

    // Total volume
    const totalVolume = workouts.reduce((acc, w) => acc + (w.totalVolume || 0), 0);
    const averageVolume = totalWorkouts > 0 ? Math.round(totalVolume / totalWorkouts) : 0;

    // Streaks
    const { currentStreak, longestStreak } = calculateStreak(workouts);

    // Weight change
    let weightChange = 0;
    if (bodyweights.length >= 2) {
      weightChange = parseFloat((bodyweights[bodyweights.length - 1].weight - bodyweights[0].weight).toFixed(1));
    }

    // Personal Records (Max weight per exercise)
    const prMap = {};
    workouts.forEach(w => {
      w.exercises.forEach(we => {
        if (we.exercise) {
          const exId = we.exercise._id ? we.exercise._id.toString() : we.exercise.toString();
          const exName = we.exercise.name || 'Exercise';
          we.sets.forEach(s => {
            if (s.completed && s.weight > 0) {
              if (!prMap[exId] || s.weight > prMap[exId].weight) {
                prMap[exId] = {
                  exerciseId: exId,
                  exerciseName: exName,
                  weight: s.weight,
                  reps: s.reps,
                  date: w.date
                };
              }
            }
          });
        }
      });
    });
    const personalRecords = Object.values(prMap);

    res.status(200).json({
      success: true,
      data: {
        totalWorkouts,
        weeklyWorkouts,
        currentStreak,
        longestStreak,
        totalVolume,
        averageVolume,
        weightChange,
        personalRecords,
      },
      message: 'Progress overview fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bodyweight progress data
// @route   GET /api/progress/bodyweight
// @access  Private
const getBodyweightProgress = async (req, res, next) => {
  try {
    const bodyweights = await Bodyweight.find({ user: req.user.id }).sort({ date: 1 });
    res.status(200).json({
      success: true,
      data: bodyweights,
      message: 'Bodyweight progress fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get volume progress data
// @route   GET /api/progress/volume
// @access  Private
const getVolumeProgress = async (req, res, next) => {
  try {
    const workouts = await Workout.find({ user: req.user.id, completed: true }).sort({ date: 1 });
    const volumeData = workouts.map(w => ({
      date: w.date,
      name: w.name,
      totalVolume: w.totalVolume,
    }));

    res.status(200).json({
      success: true,
      data: volumeData,
      message: 'Volume progress fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get strength progression for specific exercise
// @route   GET /api/progress/strength
// @access  Private
const getStrengthProgress = async (req, res, next) => {
  try {
    const { exerciseId } = req.query;
    const query = { user: req.user.id, completed: true };
    if (exerciseId) {
      query['exercises.exercise'] = exerciseId;
    }

    const workouts = await Workout.find(query).populate('exercises.exercise').sort({ date: 1 });

    const progression = [];
    workouts.forEach(w => {
      w.exercises.forEach(we => {
        if (we.exercise && (!exerciseId || we.exercise._id.toString() === exerciseId)) {
          const maxWeight = we.sets.reduce((max, s) => (s.completed && s.weight > max ? s.weight : max), 0);
          if (maxWeight > 0) {
            progression.push({
              date: w.date,
              workoutName: w.name,
              exerciseName: we.exercise.name,
              exerciseId: we.exercise._id,
              maxWeight,
            });
          }
        }
      });
    });

    res.status(200).json({
      success: true,
      data: progression,
      message: 'Strength progression fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProgressOverview,
  getBodyweightProgress,
  getVolumeProgress,
  getStrengthProgress,
};
