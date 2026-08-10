import React from 'react';
import { AlertTriangle, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


const LogoutConfirmation = ({ open, onClose }) => {
  const { user, logout, showToast } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  const handleCancel = () => {
    if (onClose) onClose();
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    if (onClose) onClose();
    navigate('/login');
  };

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User'
    : 'User';
  const displayEmail = user?.email || '';
  const initial = (user?.firstName?.[0] || user?.username?.[0] || 'U').toUpperCase();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 space-y-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Logout Confirmation</h3>
              <p className="text-xs text-slate-400">Are you sure you want to logout?</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold text-sm">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
            <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold border border-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmation;
