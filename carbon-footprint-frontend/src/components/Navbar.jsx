import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Leaf, LogOut, Shield, UserPlus, LogIn, LayoutDashboard, AlertTriangle } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isActive = (path) => location.pathname === path;
  const isLandingPage = location.pathname === '/';

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Brand Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
                <Leaf className="w-5 h-5 text-slate-950 font-bold" />
              </div>
              <span className="font-extrabold text-lg bg-gradient-to-r from-white via-slate-200 to-emerald-400 bg-clip-text text-transparent">
                EcoTrack
              </span>
            </Link>

            {/* Nav links — only on landing page */}
            {isLandingPage && (
              <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                <a href="#" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">Home</a>
                <a href="#about" className="text-slate-300 hover:text-emerald-400 transition-colors">About</a>
                <a href="#services" className="text-slate-300 hover:text-emerald-400 transition-colors">Services</a>
                <a href="#contact" className="text-slate-300 hover:text-emerald-400 transition-colors">Contact</a>
              </div>
            )}

            {/* Auth Controls */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={isAdmin() ? '/admin/dashboard' : '/user/dashboard'}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                    <span>{isAdmin() ? 'Admin Portal' : 'My Dashboard'}</span>
                  </Link>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs sm:text-sm font-medium border border-rose-800/40 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <Link
                    to="/register"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-900/20 transition-all"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700 transition-all"
                  >
                    <LogIn className="w-4 h-4 text-emerald-400" />
                    <span>User Login</span>
                  </Link>
                  <Link
                    to="/admin/login"
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs sm:text-sm font-medium border border-slate-700 transition-all"
                  >
                    <Shield className="w-3.5 h-3.5 text-teal-400" />
                    <span>Admin</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Confirm Logout</h3>
                <p className="text-xs text-slate-400">Are you sure you want to log out?</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
