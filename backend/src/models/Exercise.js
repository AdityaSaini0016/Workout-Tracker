const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an exercise name'],
    trim: true,
  },
  muscleGroup: {
    type: String,
    required: [true, 'Please specify a muscle group'],
    enum: ['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Full Body'],
  },
  equipment: {
    type: String,
    required: [true, 'Please specify equipment'],
    enum: ['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Other'],
  },
  description: {
    type: String,
    default: '',
  },
  instructions: {
    type: String,
    default: '',
  },
  isCustom: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Exercise', exerciseSchema);
