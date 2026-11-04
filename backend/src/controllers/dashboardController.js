const Workout = require('../models/Workout');
const Meal = require('../models/Meal');
const Bodyweight = require('../models/Bodyweight');
const User = require('../models/User');

// Helper for streak
const calculateStreak = (workouts) => {
  if (!workouts || workouts.length === 0) return 0;
  const workoutDays = [...new Set(workouts.map(w => new Date(w.date).toISOString().split('T')[0]))].sort().reverse();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (!workoutDays.includes(today) && !workoutDays.includes(yesterday)) return 0;

  let currentStreak = 0;
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
  return currentStreak;
};

// @desc    Get dashboard summary in one optimized response
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    const workouts = await Workout.find({ user: userId }).sort({ date: -1 }).populate('exercises.exercise');
    const completedWorkouts = workouts.filter(w => w.completed);

    // Current streak
    const currentStreak = calculateStreak(completedWorkouts);

    // Total workouts
    const totalWorkouts = completedWorkouts.length;

    // Weekly workouts (last 7 days)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyWorkouts = completedWorkouts.filter(w => new Date(w.date) >= oneWeekAgo).length;

    // Current bodyweight & weight change
    const bodyweights = await Bodyweight.find({ user: userId }).sort({ date: 1 });
    const currentWeight = user.currentWeight || (bodyweights.length > 0 ? bodyweights[bodyweights.length - 1].weight : 75);
    let weightChange = 0;
    if (bodyweights.length >= 2) {
      weightChange = parseFloat((bodyweights[bodyweights.length - 1].weight - bodyweights[0].weight).toFixed(1));
    }

    // Today's workout (active or scheduled for today)
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysWorkout = workouts.find(w => new Date(w.date).toISOString().split('T')[0] === todayStr && !w.completed) || workouts.find(w => !w.completed);

    // Recent workouts (last 5)
    const recentWorkouts = workouts.slice(0, 5);

    // Personal Records
    const prMap = {};
    completedWorkouts.forEach(w => {
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
    const personalRecords = Object.values(prMap).slice(0, 5);

    // Today's nutrition
    const startToday = new Date();
    startToday.setHours(0, 0, 0, 0);
    const endToday = new Date();
    endToday.setHours(23, 59, 59, 999);

    const todaysMeals = await Meal.find({
      user: userId,
      date: { $gte: startToday, $lte: endToday }
    });

    const nutritionConsumed = todaysMeals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories || 0;
        acc.protein += meal.protein || 0;
        acc.carbs += meal.carbs || 0;
        acc.fat += meal.fat || 0;
        acc.fiber += meal.fiber || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          currentWeight,
          height: user.height,
          calorieTarget: user.calorieTarget,
          proteinTarget: user.proteinTarget,
          carbsTarget: user.carbsTarget,
          fatTarget: user.fatTarget,
        },
        stats: {
          currentStreak,
          totalWorkouts,
          weeklyWorkouts,
          currentWeight,
          weightChange,
          totalVolume: completedWorkouts.reduce((acc, w) => acc + (w.totalVolume || 0), 0),
        },
        todaysWorkout: todaysWorkout || null,
        recentWorkouts,
        personalRecords,
        nutrition: {
          consumed: nutritionConsumed,
          targets: {
            calories: user.calorieTarget,
            protein: user.proteinTarget,
            carbs: user.carbsTarget,
            fat: user.fatTarget,
          },
          meals: todaysMeals,
        },
      },
      message: 'Dashboard data fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
};
