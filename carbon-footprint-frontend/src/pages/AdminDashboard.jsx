import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import UserDetailModal from '../components/UserDetailModal';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  Users, Clock, CheckCircle2, XCircle, RefreshCw, Eye, Check, X,
  LayoutDashboard, LogOut, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Leaf, AlertTriangle, Shield, Layers, Activity, Fuel
} from 'lucide-react';
import { formatCreatedAt } from '../utils/dateTime';


const AdminDashboard = () => {
  const { showToast, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [activePage, setActivePage] = useState(location.pathname.endsWith('/users') ? 'users' : 'dashboard');
  const [loading, setLoading] = useState(true);
  const [detailModalUser, setDetailModalUser] = useState(null);
  const [rejectRemark, setRejectRemark] = useState('');
  const [rejectingUserId, setRejectingUserId] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Sorting
  const [sortKey, setSortKey] = useState('firstName');
  const [sortDir, setSortDir] = useState('asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes?.data || null);
      setUsers(Array.isArray(usersRes?.data) ? usersRes.data : []);
    } catch (err) {
      setStats(null);
      setUsers([]);
      showToast(err?.message || 'Failed to load admin dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  useEffect(() => { setCurrentPage(1); }, [activeTab]);
  useEffect(() => { setActivePage(location.pathname.endsWith('/users') ? 'users' : 'dashboard'); }, [location.pathname]);

  const handleApprove = async (id) => {
    if (!window.confirm('Approve this user and issue their login credentials?')) return;
    try {
      const res = await api.post(`/admin/users/${id}/approve`);
      showToast(res.message || 'User approved!', 'success');
      if (detailModalUser?.id === id) setDetailModalUser(null);
      fetchDashboardData();
    } catch (err) {
      showToast('Approval failed: ' + err.toString(), 'error');
    }
  };

  const handleRejectSubmit = async (id) => {
    try {
      const res = await api.post(`/admin/users/${id}/reject`, { remark: rejectRemark });
      showToast(res.message || 'User rejected!', 'info');
      setRejectingUserId(null);
      setRejectRemark('');
      if (detailModalUser?.id === id) setDetailModalUser(null);
      fetchDashboardData();
    } catch (err) {
      showToast('Rejection failed: ' + err.toString(), 'error');
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setCurrentPage(1);
  };

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 text-slate-600" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-emerald-400" />
      : <ChevronDown className="w-3 h-3 text-emerald-400" />;
  };

  const filtered = users.filter(u => activeTab === 'ALL' || u.status === activeTab).sort((a, b) => {
    const av = (a[sortKey] || '').toString().toLowerCase();
    const bv = (b[sortKey] || '').toString().toLowerCase();
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const displayTotal = filtered.length;

  const pieData = stats ? [
    { name: 'Pending', value: stats.pendingUsers, color: '#f59e0b' },
    { name: 'Approved', value: stats.approvedUsers, color: '#10b981' },
    { name: 'Rejected', value: stats.rejectedUsers, color: '#f43f5e' },
  ] : [];

  const barData = stats ? [
    { name: 'Male', count: stats.maleCount, fill: '#3b82f6' },
    { name: 'Female', count: stats.femaleCount, fill: '#ec4899' },
    { name: 'Other', count: stats.otherGenderCount, fill: '#8b5cf6' },
  ] : [];

  const sidebarItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'users', label: 'User Management', icon: Users },
    { key: 'categories', label: 'Categories', icon: Layers },
    { key: 'activityTypes', label: 'Activity Types', icon: Activity },
    { key: 'emissionFactors', label: 'Emission Factors', icon: Fuel },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">

      {/* Sidebar */}
      <aside className="hidden w-56 shrink-0 bg-slate-950 border-r border-slate-800 flex-col min-h-screen sticky top-0">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-slate-950" />
          </div>
          <span className="font-extrabold text-sm bg-gradient-to-r from-white to-emerald-400 bg-clip-text text-transparent">
            EcoTrack Admin
          </span>
        </div>

        {/* Admin badge */}
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900">
            <Shield className="w-4 h-4 text-teal-400" />
            <span className="text-xs text-slate-300 font-semibold">Admin Portal</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sidebarItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActivePage(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activePage === key
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-slate-800">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">

        {/* Top Bar */}
        <header className="hidden h-14 bg-slate-900/80 border-b border-slate-800 items-center justify-between px-6 sticky top-0 z-30 backdrop-blur-md">
          <h2 className="text-sm font-bold text-white">
            {activePage === 'dashboard' ? 'Admin Management Dashboard' : activePage === 'users' ? 'User Management' : activePage === 'categories' ? 'Category Management' : activePage === 'activityTypes' ? 'Activity Type Management' : 'Emission Factor Management'}
          </h2>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </header>

        <main className="flex-1 px-6 py-6 space-y-6">

          {/* ── DASHBOARD PAGE ── */}
          {activePage === 'dashboard' && (
            <>
              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="glass-card p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-xs font-semibold">Total</span>
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-2xl font-extrabold text-white">{stats.totalUsers}</span>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-amber-900/40 bg-amber-950/20">
                    <div className="flex items-center justify-between text-amber-400 mb-2">
                      <span className="text-xs font-semibold">Pending</span>
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-2xl font-extrabold text-amber-400">{stats.pendingUsers}</span>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/20">
                    <div className="flex items-center justify-between text-emerald-400 mb-2">
                      <span className="text-xs font-semibold">Approved</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-2xl font-extrabold text-emerald-400">{stats.approvedUsers}</span>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-rose-900/40 bg-rose-950/20">
                    <div className="flex items-center justify-between text-rose-400 mb-2">
                      <span className="text-xs font-semibold">Rejected</span>
                      <XCircle className="w-4 h-4" />
                    </div>
                    <span className="text-2xl font-extrabold text-rose-400">{stats.rejectedUsers}</span>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-blue-900/40 bg-blue-950/20">
                    <div className="flex items-center justify-between text-blue-400 mb-2">
                      <span className="text-xs font-semibold">Male</span>
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-2xl font-extrabold text-blue-400">{stats.maleCount}</span>
                  </div>
                  <div className="glass-card p-4 rounded-xl border border-pink-900/40 bg-pink-950/20">
                    <div className="flex items-center justify-between text-pink-400 mb-2">
                      <span className="text-xs font-semibold">Female</span>
                      <Users className="w-4 h-4" />
                    </div>
                    <span className="text-2xl font-extrabold text-pink-400">{stats.femaleCount}</span>
                  </div>
                </div>
              )}

              {/* Charts */}
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">User Status Breakdown</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                            {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Gender Demographics</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis allowDecimals={false} stroke="#64748b" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }} />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick pending approvals */}
              {stats?.pendingUsers > 0 && (
                <div className="glass-card p-4 rounded-xl border border-amber-900/40 bg-amber-950/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span className="text-sm text-amber-300 font-semibold">
                      {stats.pendingUsers} user{stats.pendingUsers > 1 ? 's' : ''} awaiting approval
                    </span>
                  </div>
                  <button
                    onClick={() => { setActiveTab('PENDING'); setActivePage('users'); }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all"
                  >
                    Review Now
                  </button>
                </div>
              )}
            </>
          )}

          {/* ── CATEGORY MANAGEMENT PAGE ── */}
          {activePage === 'categories' && (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Category Management</h3>
                <Link
                  to="/admin/categories"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all"
                >
                  <Layers className="w-4 h-4" /> Manage Categories
                </Link>
              </div>
              <p className="text-xs text-slate-400">
                Create and manage top-level emission activity categories (Transport, Electricity, Food, Shopping).
              </p>
            </div>
          )}

          {/* ── ACTIVITY TYPE MANAGEMENT PAGE ── */}
          {activePage === 'activityTypes' && (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Activity Type Management</h3>
                <Link
                  to="/admin/activity-types"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all"
                >
                  <Activity className="w-4 h-4" /> Manage Activity Types
                </Link>
              </div>
              <p className="text-xs text-slate-400">
                Define sub-activities under each category with units and quantity ranges.
              </p>
            </div>
          )}

          {/* ── EMISSION FACTOR MANAGEMENT PAGE ── */}
          {activePage === 'emissionFactors' && (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Emission Factor Management</h3>
                <Link
                  to="/admin/emission-factors"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition-all"
                >
                  <Fuel className="w-4 h-4" /> Manage Emission Factors
                </Link>
              </div>
              <p className="text-xs text-slate-400">
                Configure emission factors for each activity type to enable carbon calculations.
              </p>
            </div>
          )}

          {/* ── USER MANAGEMENT PAGE ── */}
          {activePage === 'users' && (
            <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-base font-bold text-white">Registered Users & Applications</h3>
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                        activeTab === tab ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                    <tr>
                      {[
                        { key: 'firstName', label: 'Name' },
                        { key: 'email', label: 'Email' },
                        { key: 'mobileNumber', label: 'Mobile' },
                        { key: 'gender', label: 'Gender' },
                        { key: 'status', label: 'Status' },
                      ].map(({ key, label }) => (
                        <th
                          key={key}
                          className="py-3.5 px-4 cursor-pointer select-none hover:text-white transition-colors"
                          onClick={() => handleSort(key)}
                        >
                          <span className="flex items-center gap-1">{label} <SortIcon col={key} /></span>
                        </th>
                      ))}
                      <th className="py-3.5 px-4">Created At</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-slate-500">
                          No users in <span className="font-semibold text-slate-400">{activeTab}</span>.
                        </td>
                      </tr>
                    ) : (
                      paginated.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {u.firstName} {u.lastName}
                            {u.username && <span className="block text-[10px] text-emerald-400 font-mono font-normal">@{u.username}</span>}
                          </td>
                          <td className="py-3.5 px-4 font-mono">{u.email}</td>
                          <td className="py-3.5 px-4 font-mono">{u.mobileNumber}</td>
                          <td className="py-3.5 px-4 capitalize">{u.gender?.toLowerCase()}</td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              u.status === 'APPROVED' ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-800/80'
                              : u.status === 'REJECTED' ? 'bg-rose-950/90 text-rose-400 border border-rose-800/80'
                              : 'bg-amber-950/90 text-amber-400 border border-amber-800/80'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">{formatCreatedAt(u.createdAt)}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={async () => {
                                  try {
                                    const fullRes = await api.get(`/admin/users/${u.id}`);
                                    setDetailModalUser(fullRes.data);
                                  } catch { showToast('Failed to load details', 'error'); }
                                }}
                                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                                title="View Full Profile"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {u.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(u.id)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold shadow transition-all"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Approve
                                  </button>
                                  <button
                                    onClick={() => setRejectingUserId(u.id)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-semibold transition-all"
                                  >
                                    <X className="w-3.5 h-3.5" /> Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Server-side pagination */}
              <div className="flex flex-col gap-3 pt-3 border-t border-slate-800 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span>Showing {displayTotal === 0 ? 0 : (currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, displayTotal)} of {displayTotal}</span>
                <div className="flex flex-wrap items-center gap-2">
                  <label>Rows:</label>
                  <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="rounded bg-slate-800 px-2 py-1.5 text-slate-200">
                    {[5,10,15,20,50].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded bg-slate-800 px-3 py-1.5 disabled:opacity-40">Previous</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)} className={`w-7 h-7 rounded font-semibold ${p === currentPage ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>{p}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded bg-slate-800 px-3 py-1.5 disabled:opacity-40">Next</button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Rejection Modal */}
      {rejectingUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Reject User Application</h3>
            <p className="text-xs text-slate-400">Optional rejection remark to send via email:</p>
            <textarea
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              placeholder="e.g. Invalid government ID document..."
              className="w-full h-24 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setRejectingUserId(null)} className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">Cancel</button>
              <button onClick={() => handleRejectSubmit(rejectingUserId)} className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold">Confirm Rejection</button>
            </div>
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      {detailModalUser && (
        <UserDetailModal
          user={detailModalUser}
          onClose={() => setDetailModalUser(null)}
          onApprove={handleApprove}
          onReject={(id) => setRejectingUserId(id)}
        />
      )}

      {/* Logout Confirmation */}
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
              <button onClick={() => setShowLogoutConfirm(false)} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700">Cancel</button>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
