import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3, FileText, Download, PieChart, TrendingUp, Target, Leaf,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart as RePie, Pie, Cell, CartesianGrid,
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];


const Reports = () => {
  const { isAdmin, showToast } = useAuth();
  const admin = isAdmin();

  const [period] = useState('Last 6 Months');

  const monthlyData = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'].map((m, i) => ({
    name: m,
    emissions: [320, 280, 410, 365, 450, 390][i],
    offset: [40, 30, 55, 45, 60, 50][i],
  }));

  const categoryData = [
    { name: 'Transport', value: 1420, color: '#3b82f6' },
    { name: 'Electricity', value: 980, color: '#f59e0b' },
    { name: 'Food', value: 640, color: '#10b981' },
    { name: 'Shopping', value: 420, color: '#ec4899' },
  ];

  const summaryCards = [
    { label: 'Total Emissions', value: '3,460 kg CO₂e', change: '+8.2%', icon: Leaf, up: true },
    { label: 'Avg Monthly', value: '576 kg CO₂e', change: '-3.1%', icon: TrendingUp, up: false },
    { label: 'Largest Category', value: 'Transport', change: '41% share', icon: PieChart, up: true },
    { label: 'Offset Achieved', value: '18%', change: '+2.4%', icon: Target, up: true },
  ];

  const tooltipStyle = { backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' };

  const handleDownload = () => {
    showToast('Report export will be available with backend integration', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-emerald-400" /> Reports &amp; Analytics
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            {admin ? 'Organization-wide carbon analytics.' : 'Your personal carbon insights.'} · {period}
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm transition-all shadow-lg"
        >
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, change, icon: Icon, up }) => (
          <div key={label} className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">{label}</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xl font-extrabold text-white">{value}</span>
            <span className={`text-xs font-semibold ${up ? 'text-rose-400' : 'text-emerald-400'}`}>{change}</span>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Emissions vs Offset</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="emissions" name="Emissions" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="offset" name="Offset" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Emissions by Category</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePie>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" nameKey="name">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </RePie>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Export forms placeholder */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
        <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
        Detailed reports.
      </div>
    </div>
  );
};

export default Reports;
