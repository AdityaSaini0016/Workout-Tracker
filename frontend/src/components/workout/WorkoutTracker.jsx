import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import {
  Dumbbell,
  Plus,
  Trash2,
  Check,
  Play,
  Pause,
  RotateCcw,
  Clock,
  ChevronDown,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function WorkoutTracker() {
  const [searchParams] = setSearchParams();
  const workoutId = searchParams.get('id');
  const navigate = useNavigate();

  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exercisesLibrary, setExercisesLibrary] = useState([]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Rest Timer State
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(90);
  const timerRef = useRef(null);

  useEffect(() => {
    if (workoutId) {
      fetchWorkout(workoutId);
    } else {
      createInitialWorkout();
    }
    fetchExercisesLibrary();
  }, [workoutId]);

  // Timer effect
  useEffect(() => {
    if (timerActive && timerRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRemaining === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timerRemaining]);

  const startTimer = (seconds) => {
    setTimerSeconds(seconds);
    setTimerRemaining(seconds);
    setTimerActive(true);
  };

  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerRemaining(timerSeconds);
  };

  const fetchWorkout = async (id) => {
    try {
      const res = await API.get(`/workouts/${id}`);
      setWorkout(res.data.data);
    } catch (err) {
      console.error('Failed to fetch workout', err);
      navigate('/workout');
    } finally {
      setLoading(false);
    }
  };

  const createInitialWorkout = async () => {
    try {
      const res = await API.post('/workouts', { name: 'Upper Body Workout' });
      navigate(`/workout?id=${res.data.data._id}`, { replace: true });
    } catch (err) {
      console.error('Failed to create workout', err);
      setLoading(false);
    }
  };

  const fetchExercisesLibrary = async () => {
    try {
      const res = await API.get('/exercises');
      setExercisesLibrary(res.data.data);
    } catch (err) {
      console.error('Failed to fetch exercises library', err);
    }
  };

  const handleAddExerciseToWorkout = async (exerciseId) => {
    try {
      const res = await API.post(`/workouts/${workout._id}/exercises`, {
        exerciseId,
        sets: [{ weight: 0, reps: 10, completed: false }]
      });
      setWorkout(res.data.data);
      setShowAddExerciseModal(false);
    } catch (err) {
      console.error('Failed to add exercise', err);
    }
  };

  const handleRemoveExercise = async (workoutExerciseId) => {
    try {
      const res = await API.delete(`/workouts/${workout._id}/exercises/${workoutExerciseId}`);
      setWorkout(res.data.data);
    } catch (err) {
      console.error('Failed to remove exercise', err);
    }
  };

  const handleAddSet = async (workoutExerciseId) => {
    try {
      // Get previous set values if available for convenience
      const we = workout.exercises.id(workoutExerciseId) || workout.exercises.find(e => e._id === workoutExerciseId);
      const lastSet = we?.sets && we.sets.length > 0 ? we.sets[we.sets.length - 1] : { weight: 0, reps: 10 };

      const res = await API.post(`/workouts/${workout._id}/exercises/${workoutExerciseId}/sets`, {
        weight: lastSet.weight || 0,
        reps: lastSet.reps || 10,
        completed: false
      });
      setWorkout(res.data.data);
    } catch (err) {
      console.error('Failed to add set', err);
    }
  };

  const handleUpdateSet = async (setId, field, value) => {
    try {
      // Optimistic update
      setWorkout((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        updated.exercises.forEach(we => {
          we.sets.forEach(s => {
            if (s._id === setId) {
              s[field] = value;
            }
          });
        });
        return updated;
      });

      await API.patch(`/workouts/sets/${setId}`, { [field]: value });
    } catch (err) {
      console.error('Failed to update set', err);
      fetchWorkout(workout._id);
    }
  };

  const handleDeleteSet = async (setId) => {
    try {
      const res = await API.delete(`/workouts/sets/${setId}`);
      setWorkout(res.data.data);
    } catch (err) {
      console.error('Failed to delete set', err);
    }
  };

  const handleFinishWorkout = async () => {
    try {
      await API.patch(`/workouts/${workout._id}`, { completed: true });
      navigate('/history');
    } catch (err) {
      console.error('Failed to finish workout', err);
    }
  };

  if (loading || !workout) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredExercises = exercisesLibrary.filter(ex => {
    const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      {/* Top Bar with Timer & Finish Button */}
      <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 md:top-0 z-20 backdrop-blur-xl bg-opacity-95">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ccff00] rounded-xl flex items-center justify-center text-black font-bold">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <input
              type="text"
              value={workout.name}
              onChange={(e) => setWorkout({ ...workout, name: e.target.value })}
              onBlur={(e) => API.patch(`/workouts/${workout._id}`, { name: e.target.value })}
              className="bg-transparent font-extrabold text-lg md:text-xl text-white focus:outline-none focus:border-b border-[#ccff00] max-w-xs"
            />
            <p className="text-xs text-zinc-400">Total Volume: <span className="text-[#ccff00] font-bold">{(workout.totalVolume || 0).toLocaleString()} kg</span></p>
          </div>
        </div>

        {/* Rest Timer Widget */}
        <div className="flex items-center gap-3 bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-2">
          <Clock className="w-4 h-4 text-[#ccff00]" />
          <span className="font-mono text-lg font-bold text-white">
            {Math.floor(timerRemaining / 60)}:{String(timerRemaining % 60).padStart(2, '0')}
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <button onClick={toggleTimer} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors">
              {timerActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button onClick={resetTimer} className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white transition-colors">
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-1 ml-2 border-l border-zinc-800 pl-2">
            <button onClick={() => startTimer(60)} className="text-[10px] px-1.5 py-1 bg-zinc-900 hover:bg-zinc-800 rounded text-zinc-300">60s</button>
            <button onClick={() => startTimer(90)} className="text-[10px] px-1.5 py-1 bg-zinc-900 hover:bg-zinc-800 rounded text-zinc-300">90s</button>
          </div>
        </div>

        <button
          onClick={handleFinishWorkout}
          className="bg-[#ccff00] hover:bg-[#b3e600] text-black font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-[#ccff00]/15 flex items-center justify-center gap-2 text-sm"
        >
          <CheckCircle2 className="w-4 h-4" />
          Finish Workout
        </button>
      </div>

      {/* Exercises List */}
      {workout.exercises.length === 0 ? (
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-12 text-center">
          <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No exercises added yet</h3>
          <p className="text-sm text-zinc-400 mb-6">Add your first exercise to start logging sets and reps.</p>
          <button
            onClick={() => setShowAddExerciseModal(true)}
            className="bg-[#ccff00] text-black font-semibold px-6 py-3 rounded-xl text-sm inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Exercise
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {workout.exercises.map((item, index) => {
            const exerciseInfo = item.exercise;
            return (
              <div key={item._id || index} className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-white">{exerciseInfo?.name || 'Exercise'}</h3>
                      <span className="text-[10px] font-semibold bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full">{exerciseInfo?.muscleGroup}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">{exerciseInfo?.equipment}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveExercise(item._id)}
                    className="text-zinc-500 hover:text-red-400 p-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs text-zinc-500 uppercase border-b border-zinc-800/60 pb-2">
                        <th className="pb-2 font-semibold w-16">Set</th>
                        <th className="pb-2 font-semibold">Weight (kg)</th>
                        <th className="pb-2 font-semibold">Reps</th>
                        <th className="pb-2 font-semibold text-center w-24">Completed</th>
                        <th className="pb-2 font-semibold w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {item.sets.map((set, setIndex) => (
                        <tr key={set._id || setIndex} className={set.completed ? 'bg-zinc-900/30' : ''}>
                          <td className="py-3 font-semibold text-zinc-400">#{setIndex + 1}</td>
                          <td className="py-3">
                            <input
                              type="number"
                              value={set.weight}
                              onChange={(e) => handleUpdateSet(set._id, 'weight', parseFloat(e.target.value) || 0)}
                              className="w-24 bg-[#0a0a0a] border border-zinc-800 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#ccff00]"
                            />
                          </td>
                          <td className="py-3">
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) => handleUpdateSet(set._id, 'reps', parseInt(e.target.value) || 0)}
                              className="w-20 bg-[#0a0a0a] border border-zinc-800 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-[#ccff00]"
                            />
                          </td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => {
                                handleUpdateSet(set._id, 'completed', !set.completed);
                                if (!set.completed) startTimer(90); // Auto start 90s rest timer on set completion
                              }}
                              className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors ${
                                set.completed ? 'bg-[#ccff00] text-black font-bold' : 'bg-zinc-800 text-zinc-500 hover:text-white'
                              }`}
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleDeleteSet(set._id)}
                              className="text-zinc-600 hover:text-red-400 transition-colors p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <button
                  onClick={() => handleAddSet(item._id)}
                  className="mt-4 w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium py-2.5 rounded-xl border border-zinc-800 transition-colors text-xs flex items-center justify-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5 text-[#ccff00]" />
                  Add Set
                </button>
              </div>
            );
          })}

          <button
            onClick={() => setShowAddExerciseModal(true)}
            className="w-full bg-[#121212] hover:bg-zinc-900 border-2 border-dashed border-zinc-800 hover:border-[#ccff00] text-zinc-300 font-semibold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm group"
          >
            <Plus className="w-4 h-4 text-[#ccff00] group-hover:scale-125 transition-transform" />
            Add Exercise
          </button>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-zinc-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Select Exercise</h2>
              <button
                onClick={() => setShowAddExerciseModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 border-b border-zinc-800 bg-[#0a0a0a]">
              <input
                type="text"
                placeholder="Search exercises..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121212] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00] text-sm"
              />

              {/* Muscle Group Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core'].map((muscle) => (
                  <button
                    key={muscle}
                    onClick={() => setSelectedMuscle(muscle)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedMuscle === muscle
                        ? 'bg-[#ccff00] text-black'
                        : 'bg-[#121212] border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {muscle}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-2.5 flex-1">
              {filteredExercises.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">No exercises found.</div>
              ) : (
                filteredExercises.map((ex) => (
                  <div
                    key={ex._id}
                    onClick={() => handleAddExerciseToWorkout(ex._id)}
                    className="bg-[#0a0a0a] border border-zinc-800 hover:border-[#ccff00] rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div>
                      <h4 className="font-bold text-white group-hover:text-[#ccff00] transition-colors">{ex.name}</h4>
                      <p className="text-xs text-zinc-500 mt-0.5">{ex.muscleGroup} • {ex.equipment}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:bg-[#ccff00] group-hover:text-black flex items-center justify-center transition-all">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
