import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Activity, BookOpen, ClipboardList, Fuel, Gauge, Layers, LayoutDashboard, Leaf, LogOut, Menu, Shield, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PageErrorBoundary from './PageErrorBoundary';

const items = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/categories', label: 'Activity Categories', icon: Layers },
  { to: '/admin/activity-types', label: 'Activity Types', icon: Activity },
  { to: '/admin/emission-factors', label: 'Emission Factors', icon: Fuel },
  { to: '/admin/activity-logs', label: 'Activity Logs', icon: ClipboardList },
  { to: '/admin/emission-limits', label: 'Emission Limits', icon: Gauge },
  { to: '/admin/articles', label: 'Articles', icon: BookOpen },
];

export default function AdminShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const current = items.find((item) => location.pathname === item.to)?.label || 'Admin Portal';

  const links = (mobile = false) => items.map(({ to, label, icon: Icon }) => (
    <NavLink key={to} to={to} onClick={() => mobile && setMobileOpen(false)} className={({ isActive }) =>
      `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`
    }>
      <Icon className="h-4 w-4" />{label}
    </NavLink>
  ));

  return <div className="min-h-screen bg-slate-900 text-slate-100 lg:flex">
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col border-r border-slate-800 bg-slate-950">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-5"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-300"><Leaf className="h-5 w-5 text-slate-950" /></div><div><p className="font-extrabold text-white">EcoTrack</p><p className="text-[10px] uppercase tracking-widest text-emerald-400">Admin portal</p></div></div>
      <div className="mx-3 mt-4 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-300"><Shield className="h-4 w-4 text-teal-400" /> Management workspace</div>
      <nav className="flex-1 space-y-1 px-3 py-5">{links()}</nav>
      <button onClick={() => setLogoutConfirmOpen(true)} className="m-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-400 transition hover:bg-rose-950/40"><LogOut className="h-4 w-4" /> Logout</button>
    </aside>
    <div className="min-w-0 flex-1">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/95 px-4 backdrop-blur lg:px-7">
        <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden"><Menu className="h-5 w-5" /></button>
        <div><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">EcoTrack / Admin</p><h1 className="text-sm font-bold text-white">{current}</h1></div>
        <div className="flex items-center gap-2"><button type="button" onClick={() => navigate('/admin/profile')} className="hidden sm:flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-slate-800" title="Open profile"><div className="hidden text-right md:block"><p className="text-xs font-semibold text-white">{user?.firstName || 'Administrator'}</p><p className="text-[10px] text-slate-500">Profile</p></div><div className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/15 font-bold text-emerald-300">{user?.firstName?.[0] || 'A'}</div></button><button type="button" onClick={() => navigate('/admin/profile')} className="flex sm:hidden h-9 w-9 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/15 font-bold text-emerald-300" title="Profile">{user?.firstName?.[0] || 'A'}</button><button type="button" onClick={() => setLogoutConfirmOpen(true)} className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/20" title="Logout"><LogOut className="h-4 w-4" /></button></div>
      </header>
      <div className="min-h-[calc(100vh-4rem)]"><PageErrorBoundary><Outlet /></PageErrorBoundary></div>
    </div>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-slate-950/70" /><aside className="relative flex h-full w-72 flex-col bg-slate-950 p-4 shadow-2xl"><div className="mb-5 flex items-center justify-between"><span className="font-bold">Navigation</span><button onClick={() => setMobileOpen(false)}><X /></button></div><nav className="space-y-1">{links(true)}<button onClick={() => { setMobileOpen(false); setLogoutConfirmOpen(true); }} className="mt-3 flex w-full items-center gap-3 rounded-xl border-t border-slate-800 px-3 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-950/40"><LogOut className="h-4 w-4" />Logout</button></nav></aside></div>}
    {logoutConfirmOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"><div className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"><div><h3 className="font-bold text-white">Confirm Logout</h3><p className="mt-1 text-xs text-slate-400">Are you sure you want to log out of the admin portal?</p></div><div className="flex justify-end gap-3"><button onClick={() => setLogoutConfirmOpen(false)} className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700">Cancel</button><button onClick={() => { logout(); navigate('/'); }} className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500">Yes, Logout</button></div></div></div>}
  </div>;
}
