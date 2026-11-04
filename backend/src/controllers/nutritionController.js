const Meal = require('../models/Meal');

// @desc    Get meals (with optional date filtering)
// @route   GET /api/meals
// @access  Private
const getMeals = async (req, res, next) => {
  try {
    const { date, startDate, endDate } = req.query;
    const query = { user: req.user.id };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const meals = await Meal.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: meals.length,
      data: meals,
      message: 'Meals fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single meal
// @route   GET /api/meals/:id
// @access  Private
const getMealById = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found',
      });
    }

    if (meal.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this meal',
      });
    }

    res.status(200).json({
      success: true,
      data: meal,
      message: 'Meal fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create meal
// @route   POST /api/meals
// @access  Private
const createMeal = async (req, res, next) => {
  try {
    const { name, mealType, date, calories, protein, carbs, fat, fiber } = req.body;

    const meal = await Meal.create({
      user: req.user.id,
      name,
      mealType,
      date: date || Date.now(),
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fat: fat || 0,
      fiber: fiber || 0,
    });

    res.status(201).json({
      success: true,
      data: meal,
      message: 'Meal created successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update meal
// @route   PATCH /api/meals/:id
// @access  Private
const updateMeal = async (req, res, next) => {
  try {
    let meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found',
      });
    }

    if (meal.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this meal',
      });
    }

    meal = await Meal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: meal,
      message: 'Meal updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete meal
// @route   DELETE /api/meals/:id
// @access  Private
const deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found',
      });
    }

    if (meal.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this meal',
      });
    }

    await meal.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Meal deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
};
