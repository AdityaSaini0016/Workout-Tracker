import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Dumbbell, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ccff00]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#121212] border border-zinc-800 rounded-2xl p-8 shadow-2xl relative z-10">
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-[#ccff00] rounded-xl flex items-center justify-center text-black shadow-lg shadow-[#ccff00]/20">
            <Dumbbell className="w-7 h-7 stroke-[2.5]" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Create ApexFit Account</h1>
          <p className="text-sm text-zinc-400">Start tracking your fitness journey today</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/50 border border-red-800 text-red-200 text-sm rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aditya Sharma"
              className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aditya@example.com"
              className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00] transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00] transition-colors text-sm pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Confirm Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#ccff00] transition-colors text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ccff00] hover:bg-[#b3e600] text-black font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-[#ccff00]/15 flex items-center justify-center gap-2 text-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-zinc-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#ccff00] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
