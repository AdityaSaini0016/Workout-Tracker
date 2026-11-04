import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
  Utensils,
  Plus,
  Trash2,
  X,
  Flame,
  CheckCircle2
} from 'lucide-react';

export default function Nutrition() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userTargets, setUserTargets] = useState({
    calories: 2500,
    protein: 160,
    carbs: 280,
    fat: 70
  });

  // New Meal Form State
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [fiber, setFiber] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNutritionData();
  }, []);

  const fetchNutritionData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [mealsRes, dashboardRes] = await Promise.all([
        API.get(`/meals?date=${today}`),
        API.get('/dashboard')
      ]);
      setMeals(mealsRes.data.data);
      if (dashboardRes.data.data?.user) {
        setUserTargets({
          calories: dashboardRes.data.data.user.calorieTarget,
          protein: dashboardRes.data.data.user.proteinTarget,
          carbs: dashboardRes.data.data.user.carbsTarget,
          fat: dashboardRes.data.data.user.fatTarget
        });
      }
    } catch (err) {
      console.error('Failed to fetch nutrition data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeal = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/meals', {
        name,
        mealType,
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
        fiber: Number(fiber) || 0
      });
      setMeals([res.data.data, ...meals]);
      setShowAddModal(false);
      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setFiber('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add meal');
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      await API.delete(`/meals/${id}`);
      setMeals(meals.filter(m => m._id !== id));
    } catch (err) {
      console.error('Failed to delete meal', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#ccff00] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate totals consumed today
  const consumed = meals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories || 0;
      acc.protein += meal.protein || 0;
      acc.carbs += meal.carbs || 0;
      acc.fat += meal.fat || 0;
      acc.fiber += meal.fiber || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  const calPercent = Math.min(Math.round((consumed.calories / userTargets.calories) * 100), 100);
  const proteinPercent = Math.min(Math.round((consumed.protein / userTargets.protein) * 100), 100);
  const carbsPercent = Math.min(Math.round((consumed.carbs / userTargets.carbs) * 100), 100);
  const fatPercent = Math.min(Math.round((consumed.fat / userTargets.fat) * 100), 100);

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Nutrition & Diet</h1>
          <p className="text-sm text-zinc-400">Track your daily calories and macronutrient targets</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#ccff00] hover:bg-[#b3e600] text-black font-bold px-5 py-3 rounded-xl transition-all shadow-lg shadow-[#ccff00]/15 flex items-center justify-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Log Meal
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Calories Card */}
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Calories</span>
            <span className="text-sm font-bold text-[#ccff00]">{calPercent}%</span>
          </div>
          <div className="text-3xl font-extrabold text-white mb-2">{consumed.calories} <span className="text-sm font-normal text-zinc-400">/ {userTargets.calories} kcal</span></div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-[#ccff00] rounded-full transition-all duration-500" style={{ width: `${calPercent}%` }}></div>
          </div>
        </div>

        {/* Protein Card */}
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Protein</span>
            <span className="text-sm font-bold text-blue-400">{proteinPercent}%</span>
          </div>
          <div className="text-3xl font-extrabold text-white mb-2">{consumed.protein} <span className="text-sm font-normal text-zinc-400">/ {userTargets.protein}g</span></div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${proteinPercent}%` }}></div>
          </div>
        </div>

        {/* Carbs Card */}
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Carbs</span>
            <span className="text-sm font-bold text-amber-400">{carbsPercent}%</span>
          </div>
          <div className="text-3xl font-extrabold text-white mb-2">{consumed.carbs} <span className="text-sm font-normal text-zinc-400">/ {userTargets.carbs}g</span></div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${carbsPercent}%` }}></div>
          </div>
        </div>

        {/* Fat Card */}
        <div className="bg-[#121212] border border-zinc-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Fat</span>
            <span className="text-sm font-bold text-purple-400">{fatPercent}%</span>
          </div>
          <div className="text-3xl font-extrabold text-white mb-2">{consumed.fat} <span className="text-sm font-normal text-zinc-400">/ {userTargets.fat}g</span></div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${fatPercent}%` }}></div>
          </div>
        </div>
      </div>

      {/* Meals Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mealTypes.map((type) => {
          const typeMeals = meals.filter(m => m.mealType === type);
          const typeCalories = typeMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

          return (
            <div key={type} className="bg-[#121212] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
                  <h3 className="font-bold text-lg text-white">{type}</h3>
                  <span className="text-xs font-semibold bg-zinc-800 text-[#ccff00] px-3 py-1 rounded-full">{typeCalories} kcal</span>
                </div>

                {typeMeals.length === 0 ? (
                  <p className="text-xs text-zinc-500 py-6 text-center">No meals logged for {type.toLowerCase()} yet.</p>
                ) : (
                  <div className="space-y-3">
                    {typeMeals.map((meal) => (
                      <div key={meal._id} className="bg-[#0a0a0a] border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-white text-sm">{meal.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                            <span className="text-[#ccff00] font-semibold">{meal.calories} kcal</span>
                            <span>•</span>
                            <span>P: {meal.protein}g</span>
                            <span>•</span>
                            <span>C: {meal.carbs}g</span>
                            <span>•</span>
                            <span>F: {meal.fat}g</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteMeal(meal._id)}
                          className="text-zinc-600 hover:text-red-400 p-2 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setMealType(type);
                  setShowAddModal(true);
                }}
                className="mt-6 w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-medium py-2.5 rounded-xl border border-zinc-800 transition-colors text-xs flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-[#ccff00]" />
                Add {type} Item
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Meal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Log Meal</h2>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-400 hover:text-white p-1">
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-800 text-red-200 text-sm rounded-xl text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateMeal} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Meal Name / Food</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Oatmeal & Whey Protein"
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Meal Category</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#ccff00] text-sm"
                >
                  {mealTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="500"
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Protein (g)</label>
                  <input
                    type="number"
                    required
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    placeholder="40"
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Carbs (g)</label>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    placeholder="60"
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Fat (g)</label>
                  <input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    placeholder="15"
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Fiber (g)</label>
                  <input
                    type="number"
                    value={fiber}
                    onChange={(e) => setFiber(e.target.value)}
                    placeholder="5"
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-3 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00] text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#ccff00] hover:bg-[#b3e600] text-black font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-[#ccff00]/15 text-sm"
              >
                Add Meal
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
