import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BarChart3, Bell, BookOpen, ClipboardPlus, History, Leaf, Lightbulb, LogOut, Menu, Target, UserRound, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageErrorBoundary from './PageErrorBoundary';
import api from '../api/axios';

const navItems = [
  { to: '/user/dashboard', label: 'Dashboard', icon: BarChart3 },
  { to: '/user/activities', label: 'Log Daily Activity', icon: ClipboardPlus },
  { to: '/user/history', label: 'Activity History', icon: History },
  { to: '/user/recommendations', label: 'Recommendations', icon: Lightbulb },
  { to: '/user/goals', label: 'Goals & Targets', icon: Target },
  { to: '/user/alerts', label: 'Alert History', icon: Bell, badge: true },
  { to: '/user/articles', label: 'Articles', icon: BookOpen },
  { to: '/user/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { to: '/user/profile', label: 'My Profile', icon: UserRound },
];

export default function UserShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const load = () => api.get('/user/alerts/unread-count').then(r => setUnreadCount(r.data || 0)).catch(() => {});
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const nav = (mobile) => (
    <nav className="space-y-1">
      {navItems.map(({ to, label, icon: Icon, badge }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => mobile && setOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
          }
        >
          <Icon className="h-4 w-4" />
          <span className="flex-1">{label}</span>
          {badge && unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-slate-950">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 lg:flex">
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 lg:sticky lg:top-0 lg:flex">
        <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5">
          <div className="rounded-xl bg-emerald-500 p-2"><Leaf className="h-5 w-5 text-slate-950" /></div>
          <div><p className="font-extrabold">EcoTrack</p><p className="text-[10px] uppercase tracking-widest text-emerald-400">Personal portal</p></div>
        </div>
        <div className="mx-3 mt-4 rounded-xl bg-slate-900 p-3 text-xs">
          <p className="font-semibold">{user?.firstName || 'Member'}</p>
          <p className="mt-1 text-slate-500">Track everyday impact</p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">{nav(false)}</div>
        <button onClick={() => setLogoutConfirmOpen(true)} className="m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-950/40">
          <LogOut className="h-4 w-4" />Logout
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-slate-800"><Menu /></button>
          <span className="font-bold">EcoTrack</span>
        </header>
        <PageErrorBoundary><Outlet /></PageErrorBoundary>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-950/70" />
          <aside className="relative h-full w-72 bg-slate-950 p-4">
            <button onClick={() => setOpen(false)} className="mb-6"><X /></button>
            {nav(true)}
          </aside>
        </div>
      )}

      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div>
              <h3 className="font-bold text-white">Confirm Logout</h3>
              <p className="mt-1 text-xs text-slate-400">Are you sure you want to log out?</p>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setLogoutConfirmOpen(false)} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700">Cancel</button>
              <button onClick={() => { logout(); navigate('/'); }} className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500">Yes, Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
