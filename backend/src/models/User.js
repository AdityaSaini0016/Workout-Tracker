const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
  avatar: {
    type: String,
    default: '',
  },
  currentWeight: {
    type: Number,
    default: 75,
  },
  height: {
    type: Number,
    default: 175,
  },
  calorieTarget: {
    type: Number,
    default: 2500,
  },
  proteinTarget: {
    type: Number,
    default: 160,
  },
  carbsTarget: {
    type: Number,
    default: 280,
  },
  fatTarget: {
    type: Number,
    default: 70,
  },
}, {
  timestamps: true,
});

// Encrypt password using bcrypt
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
