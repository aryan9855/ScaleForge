import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { clearDemoAttempts } from '../services/demoStorage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsDemo(sessionStorage.getItem('scaleforge-demo') === 'true');
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    setIsDemo(false);
    clearDemoAttempts();
    sessionStorage.removeItem('scaleforge-demo');
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('token', data.token);
  };

  const signup = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser(data);
    setIsDemo(false);
    clearDemoAttempts();
    sessionStorage.removeItem('scaleforge-demo');
    localStorage.setItem('user', JSON.stringify(data));
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setUser(null);
    setIsDemo(false);
    clearDemoAttempts();
    sessionStorage.removeItem('scaleforge-demo');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const enterDemo = () => {
    setIsDemo(true);
    clearDemoAttempts();
    sessionStorage.setItem('scaleforge-demo', 'true');
  };

  return (
    <AuthContext.Provider value={{ user, isDemo, loading, login, signup, logout, enterDemo }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
