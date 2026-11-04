import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import SidebarLayout from './layouts/SidebarLayout';
import Dashboard from './components/dashboard/Dashboard';
import WorkoutTracker from './components/workout/WorkoutTracker';
import WorkoutHistory from './components/workout/WorkoutHistory';
import ExerciseLibrary from './components/exercise/ExerciseLibrary';
import Nutrition from './components/nutrition/Nutrition';
import Progress from './components/progress/Progress';
import Settings from './components/settings/Settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <SidebarLayout>{children}</SidebarLayout>;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          {/* Protected App Routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/workout" element={<ProtectedRoute><WorkoutTracker /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><WorkoutHistory /></ProtectedRoute>} />
          <Route path="/exercises" element={<ProtectedRoute><ExerciseLibrary /></ProtectedRoute>} />
          <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
          <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
