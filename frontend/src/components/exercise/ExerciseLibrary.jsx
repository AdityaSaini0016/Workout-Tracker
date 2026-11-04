import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  BookOpen,
  Search,
  Plus,
  X,
  Dumbbell
} from 'lucide-react';

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New custom exercise form
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('Chest');
  const [equipment, setEquipment] = useState('Barbell');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const res = await API.get('/exercises');
      setExercises(res.data.data);
    } catch (err) {
      console.error('Failed to fetch exercises', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExercise = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/exercises', {
        name,
        muscleGroup,
        equipment,
        description,
        instructions
      });
      setExercises([res.data.data, ...exercises]);
      setShowAddModal(false);
      setName('');
      setDescription('');
      setInstructions('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exercise');
    }
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscle === 'All' || ex.muscleGroup === selectedMuscle;
    const matchesEquip = selectedEquipment === 'All' || ex.equipment === selectedEquipment;
    return matchesSearch && matchesMuscle && matchesEquip;
  });

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
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Exercise Library</h1>
          <p className="text-sm text-zinc-400">Explore exercises or create your own custom movements</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#ccff00] hover:bg-[#b3e600] text-black font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-[#ccff00]/15 flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Add Custom Exercise
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search exercises by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ccff00] text-sm"
          />
        </div>

        {/* Muscle Groups */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['All', 'Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Full Body'].map((muscle) => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedMuscle === muscle
                  ? 'bg-[#ccff00] text-black'
                  : 'bg-[#0a0a0a] border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>

        {/* Equipment */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-zinc-800/60 pt-3">
          {['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight'].map((equip) => (
            <button
              key={equip}
              onClick={() => setSelectedEquipment(equip)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedEquipment === equip
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'bg-[#0a0a0a] text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {equip}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((ex) => (
          <div key={ex._id} className="bg-[#121212] border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all">
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-base text-white">{ex.name}</h3>
                {ex.isCustom && (
                  <span className="text-[10px] font-semibold bg-[#ccff00]/10 text-[#ccff00] px-2 py-0.5 rounded-full border border-[#ccff00]/20">Custom</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-semibold bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full">{ex.muscleGroup}</span>
                <span className="text-[11px] font-medium text-zinc-500">• {ex.equipment}</span>
              </div>
              {ex.description && (
                <p className="text-xs text-zinc-400 line-clamp-2 mb-3">{ex.description}</p>
              )}
            </div>
            {ex.instructions && (
              <div className="mt-2 pt-3 border-t border-zinc-800 text-[11px] text-zinc-500">
                <span className="font-semibold text-zinc-400">Tips:</span> {ex.instructions}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Custom Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create Custom Exercise</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-200 text-sm rounded-xl text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Exercise Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Weighted Pull Up"
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Muscle Group</label>
                  <select
                    value={muscleGroup}
                    onChange={(e) => setMuscleGroup(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] text-sm"
                  >
                    {['Chest', 'Back', 'Shoulders', 'Legs', 'Arms', 'Core', 'Full Body'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Equipment</label>
                  <select
                    value={equipment}
                    onChange={(e) => setEquipment(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] text-sm"
                  >
                    {['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Other'].map(eq => (
                      <option key={eq} value={eq}>{eq}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief overview of the exercise"
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Instructions / Form Tips</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="How to perform correctly..."
                  rows="3"
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00] text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#ccff00] hover:bg-[#b3e600] text-black font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-[#ccff00]/15 text-sm"
              >
                Save Exercise
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
