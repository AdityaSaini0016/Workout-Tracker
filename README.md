# ApexFit — Pro Workout & Fitness Management Web Application

ApexFit is a production-grade, full-stack fitness tracking web application featuring a modern, premium dark fitness aesthetic with lime-green accent highlights inspired by elite design systems.

---

## Features

- **Authentication & Security**: Secure JWT authentication with HTTP-only cookies, bcrypt password hashing, helmet, rate limiting, and input validation.
- **Interactive Dashboard**: Real-time streak tracking, weekly workouts summary, current bodyweight delta, quick start workout CTA, nutrition summary, and recent workouts.
- **Workout Tracker**: Real-time set logging (weight & reps), auto-volume calculation, rest timer widget (60s/90s), exercise picker with muscle group filtering, and workout completion.
- **Workout History**: Comprehensive log of past workouts, volume breakdown, and expandable set details.
- **Exercise Library**: Default seed library with 20+ realistic exercises categorized by muscle group and equipment, plus custom exercise creation.
- **Nutrition & Diet Tracker**: Daily calorie & macronutrient targets (Protein, Carbs, Fat, Fiber), meal logging across Breakfast, Lunch, Dinner, and Snack.
- **Progress & Analytics**: Recharts-powered interactive charts for bodyweight over time, workout volume progression, strength progression per exercise, and personal records (PRs).
- **Settings**: Manage profile details, height, bodyweight, and daily macro targets.

---

## Tech Stack

### Frontend
- React 18 & Vite
- Tailwind CSS
- React Router DOM
- Recharts
- Lucide React Icons
- Axios

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT (JSON Web Tokens) & bcryptjs
- Helmet & Express Rate Limit

---

## Project Structure

```text
workout-tracker/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Route business logic
│   │   ├── middleware/      # Auth, error handling, validation
│   │   ├── models/          # Mongoose schemas (User, Exercise, Workout, Meal, Bodyweight)
│   │   ├── routes/          # Versioned REST API endpoints
│   │   └── server.js        # Express server entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # Auth, Dashboard, Workout, Exercise, Nutrition, Progress, Settings
    │   ├── context/         # AuthContext
    │   ├── layouts/         # Sidebar / Mobile responsive navigation
    │   ├── services/        # Axios API client
    │   ├── App.jsx          # React Router setup
    │   └── main.jsx
    └── package.json
```

---

## Installation & Local Setup

### Prerequisites
- Node.js (v18+) installed
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or connection URI ready.

### 1. Clone & Install Dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/workout-tracker
JWT_SECRET=supersecretjwtkey_workout_tracker_2026
CLIENT_URL=http://localhost:5173
```

### 3. Run Locally

Start the Backend Server:
```bash
cd backend
npm run dev
```

Start the Frontend Development Server:
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.
