import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Target, X, ArrowRight } from 'lucide-react';
import api from '../api/axios';

const AuthContext = createContext(null);

function WarningToast({ warning, onDismiss }) {
  const navigate = useNavigate();
  const isGoal = warning.alertType === 'GOAL_EXCEEDED';
  return (
    <div className={`w-80 rounded-2xl border shadow-2xl p-4 ${isGoal ? 'border-amber-500/50 bg-amber-950/95' : 'border-rose-500/50 bg-rose-950/95'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isGoal ? <Target className="h-5 w-5 text-amber-300" /> : <AlertTriangle className="h-5 w-5 text-amber-300" />}
          <p className="font-bold text-white text-sm">{warning.title}</p>
        </div>
        <button onClick={onDismiss} aria-label="Dismiss warning" className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
      </div>
      <p className="mt-2 text-xs text-slate-300">{warning.message}</p>
      <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
        <div className="rounded bg-slate-900/60 px-2 py-1">
          <span className="text-slate-400">Current</span>
          <p className="font-bold text-white">{warning.currentEmission?.toFixed(2)} kg CO2e</p>
        </div>
        <div className="rounded bg-slate-900/60 px-2 py-1">
          <span className="text-slate-400">Limit</span>
          <p className="font-bold text-white">{warning.monthlyLimit?.toFixed(2)} kg CO2e</p>
        </div>
      </div>
      {warning.recommendation && (
        <p className="mt-2 text-xs text-emerald-300">{warning.recommendation}</p>
      )}
      <button
        onClick={() => { onDismiss(); navigate('/user/alerts'); }}
        className="mt-3 w-full rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200"
      >
        View Alert History <ArrowRight className="inline h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4000);
  };

  const showWarning = useCallback((alertDto) => {
    setWarnings(prev => {
      if (prev.some(w => w.id === alertDto.id)) return prev;
      return [...prev, alertDto];
    });
  }, []);

  const dismissWarning = useCallback((id) => {
    setWarnings(prev => prev.filter(w => w.id !== id));
    api.put(`/user/alerts/${id}/resolve`).catch(() => {});
  }, []);

  const clearWarnings = useCallback(() => {
    setWarnings([]);
  }, []);

  const login = (jwtResponse) => {
    const userData = {
      id: jwtResponse.id,
      username: jwtResponse.username,
      email: jwtResponse.email,
      firstName: jwtResponse.firstName,
      lastName: jwtResponse.lastName,
      roles: jwtResponse.roles,
      firstLogin: jwtResponse.firstLogin,
    };
    setUser(userData);
    setToken(jwtResponse.token);
    localStorage.setItem('token', jwtResponse.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setWarnings([]);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    showToast('Logged out successfully', 'info');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const newObj = { ...prev, ...updatedFields };
      localStorage.setItem('user', JSON.stringify(newObj));
      return newObj;
    });
  };

  const isAdmin = () => user?.roles?.includes('ROLE_ADMIN');
  const isUser = () => user?.roles?.includes('ROLE_USER');

  return (
    <AuthContext.Provider value={{ user, token, loading, setLoading, login, logout, updateUser, isAdmin, isUser, toast, showToast, showWarning, clearWarnings }}>
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border ${
            toast.type === 'error' ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            : toast.type === 'info' ? 'bg-blue-950/90 border-blue-500/50 text-blue-200'
            : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}>
            <span className="font-semibold text-sm">{toast.message}</span>
          </div>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 space-y-3" style={{ maxWidth: '320px' }}>
          {warnings.map(w => (
            <WarningToast key={w.id} warning={w} onDismiss={() => dismissWarning(w.id)} />
          ))}
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
