import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await API.get('/auth/me');
      setUser(res.data.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.data);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.data);
    return res.data;
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await API.patch('/auth/profile', profileData);
    setUser(res.data.data);
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, checkUserLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
