const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a meal name'],
    trim: true,
  },
  mealType: {
    type: String,
    required: [true, 'Please specify meal type'],
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  calories: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  protein: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  carbs: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  fat: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  fiber: {
    type: Number,
    min: 0,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Meal', mealSchema);
