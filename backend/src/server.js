const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { seedExercises } = require('./controllers/exerciseController');

// Load env vars
dotenv.config();

// Connect to database
connectDB().then(async () => {
  await seedExercises();
});

const app = express();

// Security Middleware
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/exercises', require('./routes/exerciseRoutes'));
app.use('/api/workouts', require('./routes/workoutRoutes'));
app.use('/api/meals', require('./routes/nutritionRoutes'));
app.use('/api/bodyweight', require('./routes/bodyweightRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Root route
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Workout Tracker API is running...' });
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
