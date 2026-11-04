import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  Award,
  Flame,
  Scale,
  Dumbbell
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export default function Progress() {
  const [overview, setOverview] = useState(null);
  const [bodyweightData, setBodyweightData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [strengthData, setStrengthData] = useState([]);
  const [exercisesList, setExercisesList] = useState([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState('');
  const [loading, setLoading] = useState(true);

  // New bodyweight log state
  const [newWeight, setNewWeight] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);

  useEffect(() => {
    fetchProgressData();
  }, [selectedExerciseId]);

  const fetchProgressData = async () => {
    try {
      const [overviewRes, bwRes, volRes, strengthRes, exercisesRes] = await Promise.all([
        API.get('/progress/overview'),
        API.get('/progress/bodyweight'),
        API.get('/progress/volume'),
        API.get(`/progress/strength${selectedExerciseId ? `?exerciseId=${selectedExerciseId}` : ''}`),
        API.get('/exercises')
      ]);

      setOverview(overviewRes.data.data);
      setBodyweightData(bwRes.data.data.map(item => ({
        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        weight: item.weight
      })));
      setVolumeData(volRes.data.data.map(item => ({
        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        volume: item.totalVolume
      })));
      setStrengthData(strengthRes.data.data.map(item => ({
        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        maxWeight: item.maxWeight,
        exerciseName: item.exerciseName
      })));
      setExercisesList(exercisesRes.data.data);
    } catch (err) {
      console.error('Failed to fetch progress analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogWeight = async (e) => {
    e.preventDefault();
    try {
      await API.post('/bodyweight', { weight: parseFloat(newWeight) });
      setNewWeight('');
      setShowWeightModal(false);
      fetchProgressData();
    } catch (err) {
      console.error('Failed to log bodyweight', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Progress & Analytics</h1>
          <p className="text-sm text-zinc-400">Track your strength gains, volume progression and bodyweight changes</p>
        </div>

        <button
          onClick={() => setShowWeightModal(true)}
          className="bg-[#ccff00] hover:bg-[#b3e600] text-black font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-[#ccff00]/15 flex items-center justify-center gap-2 text-sm"
        >
          <Scale className="w-4 h-4 stroke-[2.5]" />
          Log Bodyweight
        </button>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Current Streak</span>
          <div className="text-3xl font-extrabold text-white mt-2">{overview?.currentStreak || 0} <span className="text-sm font-normal text-zinc-400">days</span></div>
          <p className="text-xs text-zinc-500 mt-1">Longest: {overview?.longestStreak || 0} days</p>
        </div>

        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Total Workouts</span>
          <div className="text-3xl font-extrabold text-white mt-2">{overview?.totalWorkouts || 0}</div>
          <p className="text-xs text-zinc-500 mt-1">{overview?.weeklyWorkouts || 0} workouts this week</p>
        </div>

        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Average Volume</span>
          <div className="text-3xl font-extrabold text-white mt-2">{(overview?.averageVolume || 0).toLocaleString()} <span className="text-sm font-normal text-zinc-400">kg</span></div>
          <p className="text-xs text-zinc-500 mt-1">Per completed session</p>
        </div>

        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Weight Change</span>
          <div className="text-3xl font-extrabold text-white mt-2">
            {overview?.weightChange > 0 ? `+${overview.weightChange}` : overview?.weightChange || 0} <span className="text-sm font-normal text-zinc-400">kg</span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">Lifetime delta</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bodyweight Over Time */}
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-lg text-white mb-6">Bodyweight Over Time</h3>
          {bodyweightData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-zinc-500 text-sm">No bodyweight data logged yet.</div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bodyweightData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121212', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#ccff00" strokeWidth={3} dot={{ fill: '#ccff00', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Weekly Workout Volume */}
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-lg text-white mb-6">Workout Volume Progression</h3>
          {volumeData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-zinc-500 text-sm">No workout volume data available.</div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                  <YAxis stroke="#71717a" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#121212', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                  />
                  <Bar dataKey="volume" fill="#ccff00" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Strength Progression Chart */}
      <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="font-bold text-lg text-white">Strength Progression</h3>
          <select
            value={selectedExerciseId}
            onChange={(e) => setSelectedExerciseId(e.target.value)}
            className="bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ccff00]"
          >
            <option value="">All Exercises (Max Weight)</option>
            {exercisesList.map(ex => (
              <option key={ex._id} value={ex._id}>{ex.name}</option>
            ))}
          </select>
        </div>

        {strengthData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-zinc-500 text-sm">No strength progression data for selected exercise.</div>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strengthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#121212', borderColor: '#27272a', borderRadius: '12px', color: '#fff' }}
                />
                <Line type="monotone" dataKey="maxWeight" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Personal Records Section */}
      <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2.5 mb-6">
          <Award className="w-5 h-5 text-[#ccff00]" />
          <h3 className="font-bold text-lg text-white">Personal Records (PRs)</h3>
        </div>

        {overview?.personalRecords?.length === 0 ? (
          <p className="text-zinc-500 text-sm">No personal records set yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overview?.personalRecords?.map((pr, idx) => (
              <div key={idx} className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{pr.exerciseName}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">{new Date(pr.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-[#ccff00]">{pr.weight} kg</div>
                  <div className="text-xs text-zinc-400">× {pr.reps} reps</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Weight Modal */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Log Bodyweight</h2>
              <button onClick={() => setShowWeightModal(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleLogWeight} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  placeholder="78.5"
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00] text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#ccff00] hover:bg-[#b3e600] text-black font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-[#ccff00]/15 text-sm"
              >
                Save Weight
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
