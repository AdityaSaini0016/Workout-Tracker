const Bodyweight = require('../models/Bodyweight');
const User = require('../models/User');

// @desc    Get bodyweight entries
// @route   GET /api/bodyweight
// @access  Private
const getBodyweights = async (req, res, next) => {
  try {
    const bodyweights = await Bodyweight.find({ user: req.user.id }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: bodyweights.length,
      data: bodyweights,
      message: 'Bodyweight entries fetched successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add bodyweight entry
// @route   POST /api/bodyweight
// @access  Private
const createBodyweight = async (req, res, next) => {
  try {
    const { weight, date } = req.body;

    const entryDate = date || Date.now();

    const bodyweight = await Bodyweight.create({
      user: req.user.id,
      weight,
      date: entryDate,
    });

    // Also update user's currentWeight
    await User.findByIdAndUpdate(req.user.id, { currentWeight: weight });

    res.status(201).json({
      success: true,
      data: bodyweight,
      message: 'Bodyweight recorded successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bodyweight entry
// @route   PATCH /api/bodyweight/:id
// @access  Private
const updateBodyweight = async (req, res, next) => {
  try {
    let bodyweight = await Bodyweight.findById(req.params.id);

    if (!bodyweight) {
      return res.status(404).json({
        success: false,
        message: 'Bodyweight entry not found',
      });
    }

    if (bodyweight.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this entry',
      });
    }

    bodyweight = await Bodyweight.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Update user currentWeight with latest entry if needed
    const latest = await Bodyweight.findOne({ user: req.user.id }).sort({ date: -1 });
    if (latest) {
      await User.findByIdAndUpdate(req.user.id, { currentWeight: latest.weight });
    }

    res.status(200).json({
      success: true,
      data: bodyweight,
      message: 'Bodyweight entry updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete bodyweight entry
// @route   DELETE /api/bodyweight/:id
// @access  Private
const deleteBodyweight = async (req, res, next) => {
  try {
    const bodyweight = await Bodyweight.findById(req.params.id);

    if (!bodyweight) {
      return res.status(404).json({
        success: false,
        message: 'Bodyweight entry not found',
      });
    }

    if (bodyweight.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this entry',
      });
    }

    await bodyweight.deleteOne();

    // Update user currentWeight with latest entry
    const latest = await Bodyweight.findOne({ user: req.user.id }).sort({ date: -1 });
    if (latest) {
      await User.findByIdAndUpdate(req.user.id, { currentWeight: latest.weight });
    }

    res.status(200).json({
      success: true,
      data: {},
      message: 'Bodyweight entry deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBodyweights,
  createBodyweight,
  updateBodyweight,
  deleteBodyweight,
};
