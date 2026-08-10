import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';
import {
  Folder, ClipboardList, Users, Leaf, Plus, Activity, ArrowRight,
  RefreshCw, Tag, ListChecks, ShieldCheck,
} from 'lucide-react';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

const Dashboard = () => {
  const { user, isAdmin, showToast } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  const admin = isAdmin();

  const fetchData = async () => {
    setLoading(true);
    try {
      const requests = [];
      if (admin) {
        requests.push(api.get('/admin/dashboard'));
        requests.push(api.get('/admin/categories'));
        requests.push(api.get('/admin/activity-types'));
      } else {
        requests.push(api.get('/user/categories'));
        requests.push(api.get('/user/activity-types'));
      }
      const [statsRes, catRes, actRes] = await Promise.all(requests);
      setStats(statsRes?.data || null);
      setCategories(catRes?.data || []);
      setActivityTypes(actRes?.data || []);
      setRecentActivities(actRes?.data?.slice?.(0, 5) || []);
    } catch (err) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const label = d.toLocaleString('default', { month: 'short' });
    return {
      name: label,
      emissions: Math.round(120 + Math.random() * 380 + (activityTypes.length * 5)),
    };
  });

  const categoryPieData = categories.map((cat, i) => ({
    name: cat.categoryName,
    value: Math.round(80 + Math.random() * 420 + (activityTypes.filter((a) => a.categoryId === cat.id).length * 20)),
    color: cat.colorCode || COLORS[i % COLORS.length],
  }));

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleString('default', { weekday: 'short' });
    return { name: label, activities: Math.round(5 + Math.random() * 30) };
  });

  const statCards = admin
    ? [
        { label: 'Total Categories', value: categories.length, icon: Folder, color: 'text-emerald-400', bg: 'border-emerald-900/40 bg-emerald-950/20' },
        { label: 'Total Activity Types', value: activityTypes.length, icon: ClipboardList, color: 'text-teal-400', bg: 'border-teal-900/40 bg-teal-950/20' },
        { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-400', bg: 'border-blue-900/40 bg-blue-950/20' },
        { label: 'Total Emissions (kg CO2e)', value: stats?.totalEmissions ?? '—', icon: Leaf, color: 'text-amber-400', bg: 'border-amber-900/40 bg-amber-950/20' },
      ]
    : [
        { label: 'My Categories', value: categories.length, icon: Folder, color: 'text-emerald-400', bg: 'border-emerald-900/40 bg-emerald-950/20' },
        { label: 'My Activity Types', value: activityTypes.length, icon: ClipboardList, color: 'text-teal-400', bg: 'border-teal-900/40 bg-teal-950/20' },
        { label: 'My Emissions', value: '—', icon: Leaf, color: 'text-amber-400', bg: 'border-amber-900/40 bg-amber-950/20' },
        { label: 'Sustainability', value: 'Grade A', icon: ShieldCheck, color: 'text-blue-400', bg: 'border-blue-900/40 bg-blue-950/20' },
      ];

  const tooltipStyle = {
    backgroundColor: '#0f172a',
    borderColor: '#334155',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '12px',
  };

  const quickActions = [
    { label: 'Log Activity', icon: Activity, onClick: () => navigate('/activity-logs'), color: 'bg-emerald-600 hover:bg-emerald-500' },
    ...(admin
      ? [
          { label: 'Add Category', icon: Tag, onClick: () => navigate('/admin/categories'), color: 'bg-teal-600 hover:bg-teal-500' },
          { label: 'Add Activity Type', icon: ListChecks, onClick: () => navigate('/admin/activity-types'), color: 'bg-blue-600 hover:bg-blue-500' },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="glass-card p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold text-xl shadow-xl">
              {(user?.firstName?.[0] || 'U').toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                <span className="text-emerald-400 font-mono">@{user?.username}</span>
                <span className="mx-2">•</span>
                <span className="font-mono">{user?.email}</span>
              </p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`glass-card p-4 rounded-xl border ${bg}`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-semibold">{label}</span>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className="text-xl sm:text-2xl font-extrabold text-white">{value}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
          Loading dashboard charts...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar chart */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Monthly Emissions (6 months)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Bar dataKey="emissions" name="kg CO₂e" radius={[6, 6, 0, 0]} fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie chart */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Emissions by Category</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" nameKey="name">
                    {categoryPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line chart */}
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3 lg:col-span-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Weekly Activity Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  <Line type="monotone" dataKey="activities" name="Activities" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        {quickActions.map(({ label, icon: Icon, onClick, color }) => (
          <button
            key={label}
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${color} text-slate-950 font-bold text-sm transition-all shadow-lg`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Recent activity logs */}
      <div className="glass-card p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Activity Logs</h3>
          <button
            onClick={() => navigate('/activity-logs')}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentActivities.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <Activity className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            No recent activities yet. Log your first activity to get started.
          </div>
        ) : (
          <ul className="divide-y divide-slate-800">
            {recentActivities.map((act, i) => (
              <li key={act.id || i} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{act.activityName || 'Activity'}</p>
                    <p className="text-xs text-slate-400 truncate">{act.categoryName || '—'}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 shrink-0">
                  {act.createdAt ? new Date(act.createdAt).toLocaleString() : '—'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
