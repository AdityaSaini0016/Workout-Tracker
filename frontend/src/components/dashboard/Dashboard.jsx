import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  Flame,
  Dumbbell,
  Scale,
  TrendingUp,
  Play,
  Plus,
  ChevronRight,
  Award,
  Utensils,
  CheckCircle2,
  Calendar,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await API.get('/dashboard');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const startNewWorkout = async () => {
    try {
      const res = await API.post('/workouts', { name: 'Full Body Workout' });
      navigate(`/workout?id=${res.data.data._id}`);
    } catch (err) {
      console.error('Failed to create workout', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const user = data?.user;
  const stats = data?.stats;
  const todaysWorkout = data?.todaysWorkout;
  const recentWorkouts = data?.recentWorkouts || [];
  const personalRecords = data?.personalRecords || [];
  const nutrition = data?.nutrition;

  const calConsumed = nutrition?.consumed?.calories || 0;
  const calTarget = nutrition?.targets?.calories || 2500;
  const calPercent = Math.min(Math.round((calConsumed / calTarget) * 100), 100);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Greeting & Start Workout CTA Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#161d0a] via-[#121212] to-[#121212] border border-[#ccff00]/20 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mb-1">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name || 'Athlete'} 👋
          </h1>
          <p className="text-sm text-zinc-400">Ready to crush your fitness goals today? Let's get to work.</p>
        </div>
        <button
          onClick={startNewWorkout}
          className="bg-[#ccff00] hover:bg-[#b3e600] text-black font-bold px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-[#ccff00]/20 flex items-center justify-center gap-2.5 text-sm group"
        >
          <Play className="w-4 h-4 fill-black group-hover:scale-110 transition-transform" />
          START WORKOUT
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Streak</span>
            <div className="w-8 h-8 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400">
              <Flame className="w-4 h-4 fill-orange-400" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{stats?.currentStreak || 0} <span className="text-sm font-normal text-zinc-400">days</span></div>
          <p className="text-xs text-zinc-500">Keep the momentum going</p>
        </div>

        {/* Workouts */}
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Workouts</span>
            <div className="w-8 h-8 bg-[#ccff00]/10 rounded-xl flex items-center justify-center text-[#ccff00]">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{stats?.weeklyWorkouts || 0} <span className="text-sm font-normal text-zinc-400">this week</span></div>
          <p className="text-xs text-zinc-500">Total: {stats?.totalWorkouts || 0} logged</p>
        </div>

        {/* Current Weight */}
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Bodyweight</span>
            <div className="w-8 h-8 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{stats?.currentWeight || 75} <span className="text-sm font-normal text-zinc-400">kg</span></div>
          <p className="text-xs text-zinc-500">
            {stats?.weightChange > 0 ? `+${stats.weightChange} kg change` : `${stats?.weightChange || 0} kg change`}
          </p>
        </div>

        {/* Total Volume */}
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Volume</span>
            <div className="w-8 h-8 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mb-1">{(stats?.totalVolume || 0).toLocaleString()} <span className="text-sm font-normal text-zinc-400">kg</span></div>
          <p className="text-xs text-zinc-500">Lifetime lifted volume</p>
        </div>
      </div>

      {/* Main Grid: Nutrition & Recent Workouts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Nutrition Card */}
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#ccff00]/10 rounded-lg flex items-center justify-center text-[#ccff00]">
                  <Utensils className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-white">Today's Nutrition</h2>
              </div>
              <Link to="/nutrition" className="text-xs text-[#ccff00] hover:underline font-medium">View details</Link>
            </div>

            {/* Calories Progress Circle / Bar */}
            <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-5 mb-6">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <span className="text-xs text-zinc-400 uppercase font-semibold">Calories</span>
                  <div className="text-2xl font-black text-white">{calConsumed} <span className="text-xs text-zinc-500 font-normal">/ {calTarget} kcal</span></div>
                </div>
                <span className="text-sm font-bold text-[#ccff00]">{calPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#ccff00] rounded-full transition-all duration-500" style={{ width: `${calPercent}%` }}></div>
              </div>
            </div>

            {/* Macros Breakdown */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-center">
                <span className="text-[11px] text-zinc-400 uppercase font-semibold">Protein</span>
                <div className="text-lg font-bold text-white mt-0.5">{nutrition?.consumed?.protein || 0}g</div>
                <div className="text-[10px] text-zinc-500">Target: {nutrition?.targets?.protein || 160}g</div>
              </div>
              <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-center">
                <span className="text-[11px] text-zinc-400 uppercase font-semibold">Carbs</span>
                <div className="text-lg font-bold text-white mt-0.5">{nutrition?.consumed?.carbs || 0}g</div>
                <div className="text-[10px] text-zinc-500">Target: {nutrition?.targets?.carbs || 280}g</div>
              </div>
              <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3 text-center">
                <span className="text-[11px] text-zinc-400 uppercase font-semibold">Fat</span>
                <div className="text-lg font-bold text-white mt-0.5">{nutrition?.consumed?.fat || 0}g</div>
                <div className="text-[10px] text-zinc-500">Target: {nutrition?.targets?.fat || 70}g</div>
              </div>
            </div>
          </div>

          <Link
            to="/nutrition"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-3 rounded-xl transition-colors text-center text-sm border border-zinc-800 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-[#ccff00]" />
            Log Meal
          </Link>
        </div>

        {/* Recent Workouts */}
        <div className="lg:col-span-2 bg-[#121212] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#ccff00]/10 rounded-lg flex items-center justify-center text-[#ccff00]">
                  <History className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-white">Recent Workouts</h2>
              </div>
              <Link to="/history" className="text-xs text-[#ccff00] hover:underline font-medium">View all history</Link>
            </div>

            {recentWorkouts.length === 0 ? (
              <div className="text-center py-12 bg-[#0a0a0a] border border-zinc-800/60 rounded-xl">
                <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm mb-4">No workouts logged yet.</p>
                <button
                  onClick={startNewWorkout}
                  className="bg-[#ccff00] text-black font-semibold px-4 py-2 rounded-lg text-xs"
                >
                  Start Your First Workout
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentWorkouts.map((workout) => (
                  <div
                    key={workout._id}
                    onClick={() => navigate(`/history?id=${workout._id}`)}
                    className="bg-[#0a0a0a] border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${workout.completed ? 'bg-[#ccff00]/10 text-[#ccff00]' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {workout.completed ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-[#ccff00] transition-colors">{workout.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                          <span>{new Date(workout.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span>•</span>
                          <span>{workout.exercises?.length || 0} exercises</span>
                          <span>•</span>
                          <span>{(workout.totalVolume || 0).toLocaleString()} kg vol</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Personal Records preview */}
          {personalRecords.length > 0 && (
            <div className="mt-6 pt-6 border-t border-zinc-800">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-4 h-4 text-[#ccff00]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Top Personal Records</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {personalRecords.slice(0, 3).map((pr, idx) => (
                  <div key={idx} className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-3">
                    <p className="text-xs text-zinc-400 truncate">{pr.exerciseName}</p>
                    <p className="text-lg font-bold text-white mt-0.5">{pr.weight} kg <span className="text-xs font-normal text-zinc-500">× {pr.reps} reps</span></p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
