import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  History as HistoryIcon,
  Search,
  Calendar,
  Clock,
  Dumbbell,
  ChevronRight,
  Trash2,
  X,
  CheckCircle2
} from 'lucide-react';

export default function WorkoutHistory() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [searchParams] = setSearchParams();
  const detailId = searchParams.get('id');
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkouts();
  }, []);

  useEffect(() => {
    if (detailId && workouts.length > 0) {
      const found = workouts.find(w => w._id === detailId);
      if (found) setSelectedWorkout(found);
    }
  }, [detailId, workouts]);

  const fetchWorkouts = async () => {
    try {
      const res = await API.get('/workouts');
      setWorkouts(res.data.data);
      if (detailId) {
        const found = res.data.data.find(w => w._id === detailId);
        if (found) setSelectedWorkout(found);
      }
    } catch (err) {
      console.error('Failed to fetch workouts history', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this workout?')) return;
    try {
      await API.delete(`/workouts/${id}`);
      setWorkouts(workouts.filter(w => w._id !== id));
      if (selectedWorkout?._id === id) setSelectedWorkout(null);
    } catch (err) {
      console.error('Failed to delete workout', err);
    }
  };

  const filteredWorkouts = workouts.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Workout History</h1>
          <p className="text-sm text-zinc-400">Review your past workouts, volume and sets</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search workouts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#121212] border border-zinc-800 rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00] text-sm"
          />
        </div>
      </div>

      {filteredWorkouts.length === 0 ? (
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-12 text-center">
          <HistoryIcon className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No workouts found</h3>
          <p className="text-sm text-zinc-400">Complete your first workout to see history here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredWorkouts.map((workout) => (
            <div
              key={workout._id}
              onClick={() => setSelectedWorkout(workout)}
              className="bg-[#121212] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all group shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ccff00]/10 rounded-xl flex items-center justify-center text-[#ccff00] flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white group-hover:text-[#ccff00] transition-colors">{workout.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      {new Date(workout.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span>{workout.exercises?.length || 0} exercises</span>
                    <span>•</span>
                    <span className="text-[#ccff00] font-semibold">{(workout.totalVolume || 0).toLocaleString()} kg volume</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <button
                  onClick={(e) => handleDeleteWorkout(workout._id, e)}
                  className="p-2.5 bg-zinc-900 hover:bg-red-950/40 text-zinc-400 hover:text-red-400 rounded-xl border border-zinc-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="p-2.5 bg-zinc-900 group-hover:bg-[#ccff00] group-hover:text-black rounded-xl text-zinc-400 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedWorkout.name}</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {new Date(selectedWorkout.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4">
                  <span className="text-xs text-zinc-500 uppercase font-semibold">Total Volume</span>
                  <div className="text-xl font-bold text-[#ccff00] mt-1">{(selectedWorkout.totalVolume || 0).toLocaleString()} kg</div>
                </div>
                <div className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4">
                  <span className="text-xs text-zinc-500 uppercase font-semibold">Exercises Performed</span>
                  <div className="text-xl font-bold text-white mt-1">{selectedWorkout.exercises?.length || 0}</div>
                </div>
              </div>

              <div className="space-y-4">
                {selectedWorkout.exercises?.map((item, idx) => (
                  <div key={item._id || idx} className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4">
                    <h4 className="font-bold text-white mb-2">{item.exercise?.name || 'Exercise'} <span className="text-xs font-normal text-zinc-500">({item.exercise?.muscleGroup})</span></h4>
                    <div className="space-y-1">
                      {item.sets.map((set, setIdx) => (
                        <div key={set._id || setIdx} className="flex justify-between text-xs text-zinc-300 py-1 border-b border-zinc-800/40 last:border-0">
                          <span className="text-zinc-500 font-medium">Set {setIdx + 1}</span>
                          <span className="font-mono font-bold text-white">{set.weight} kg × {set.reps} reps</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
