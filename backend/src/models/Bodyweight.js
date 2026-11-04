const mongoose = require('mongoose');

const bodyweightSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weight: {
    type: Number,
    required: [true, 'Please add a body weight'],
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Bodyweight', bodyweightSchema);
