const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  reps: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const workoutExerciseSchema = new mongoose.Schema({
  exercise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  sets: [setSchema],
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please add a workout name'],
    trim: true,
    default: 'Workout',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number, // in seconds
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  completed: {
    type: Boolean,
    default: false,
  },
  exercises: [workoutExerciseSchema],
  totalVolume: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Middleware to calculate total volume before save
workoutSchema.pre('save', function (next) {
  let volume = 0;
  if (this.exercises && this.exercises.length > 0) {
    this.exercises.forEach(we => {
      if (we.sets && we.sets.length > 0) {
        we.sets.forEach(set => {
          if (set.completed) {
            volume += (set.weight || 0) * (set.reps || 0);
          }
        });
      }
    });
  }
  this.totalVolume = volume;
  next();
});

module.exports = mongoose.model('Workout', workoutSchema);
