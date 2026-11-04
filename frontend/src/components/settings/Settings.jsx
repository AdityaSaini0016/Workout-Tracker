import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Settings as SettingsIcon, LogOut, User, Target, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { user, updateProfile, logout } = useAuth();

  const [name, setName] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [height, setHeight] = useState('');
  const [calorieTarget, setCalorieTarget] = useState('');
  const [proteinTarget, setProteinTarget] = useState('');
  const [carbsTarget, setCarbsTarget] = useState('');
  const [fatTarget, setFatTarget] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCurrentWeight(user.currentWeight || '');
      setHeight(user.height || '');
      setCalorieTarget(user.calorieTarget || '');
      setProteinTarget(user.proteinTarget || '');
      setCarbsTarget(user.carbsTarget || '');
      setFatTarget(user.fatTarget || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setError('');
    setLoading(true);

    try {
      await updateProfile({
        name,
        currentWeight: Number(currentWeight),
        height: Number(height),
        calorieTarget: Number(calorieTarget),
        proteinTarget: Number(proteinTarget),
        carbsTarget: Number(carbsTarget),
        fatTarget: Number(fatTarget),
      });
      setSuccessMsg('Profile and targets updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Profile & Settings</h1>
        <p className="text-sm text-zinc-400">Manage your personal details and nutrition macro targets</p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-sm rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-950/50 border border-red-800 text-red-200 text-sm rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
            <User className="w-5 h-5 text-[#ccff00]" />
            <h2 className="font-bold text-lg text-white">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-zinc-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Current Bodyweight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Nutrition Targets */}
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2.5 pb-4 border-b border-zinc-800">
            <Target className="w-5 h-5 text-[#ccff00]" />
            <h2 className="font-bold text-lg text-white">Daily Nutrition Targets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Calorie Target (kcal)</label>
              <input
                type="number"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Protein Target (g)</label>
              <input
                type="number"
                value={proteinTarget}
                onChange={(e) => setProteinTarget(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Carbs Target (g)</label>
              <input
                type="number"
                value={carbsTarget}
                onChange={(e) => setCarbsTarget(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Fat Target (g)</label>
              <input
                type="number"
                value={fatTarget}
                onChange={(e) => setFatTarget(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] text-sm"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#ccff00] hover:bg-[#b3e600] text-black font-semibold py-4 rounded-xl transition-all shadow-lg shadow-[#ccff00]/15 text-sm disabled:opacity-50"
        >
          {loading ? 'Saving Changes...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
