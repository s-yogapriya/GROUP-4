import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { Bell, CheckCheck, Trash2, RefreshCw, Filter } from 'lucide-react';
import { formatCreatedAt } from '../utils/dateTime';

import Pagination from '../components/Pagination';
import { paginate } from '../utils/clientPagination';
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function severityStyle(severity) {
  if (severity === 'HIGH') return 'border-rose-500/40 bg-rose-950/20';
  if (severity === 'WARNING' || severity === 'GOAL_EXCEEDED') return 'border-amber-500/40 bg-amber-950/20';
  return 'border-slate-700 bg-slate-800/40';
}

function severityBadge(severity) {
  if (severity === 'HIGH') return 'bg-rose-900/60 text-rose-300 border border-rose-700/50';
  if (severity === 'WARNING' || severity === 'GOAL_EXCEEDED') return 'bg-amber-900/60 text-amber-300 border border-amber-700/50';
  return 'bg-slate-800 text-slate-300 border border-slate-700';
}

export default function AlertHistoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [alerts, setAlerts] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterRead, setFilterRead] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const load = useCallback(() => {
    setLoading(true);
    api.get('/user/alerts')
      .then(r => setAlerts(Array.isArray(r?.data) ? r.data : []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => { setPage(1); }, [filterRead, filterCategory]);

  const markRead = async (id) => {
    await api.put(`/user/alerts/${id}/read`);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllRead = async () => {
    await api.put('/user/alerts/read-all');
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const deleteAlert = async (id) => {
    await api.delete(`/user/alerts/${id}`);
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const categories = [...new Set(alerts.map(a => a.categoryName).filter(Boolean))];
  const unread = alerts.filter(a => !a.read).length;

  const visible = alerts.filter(a => {
    if (filterRead === 'UNREAD' && a.read) return false;
    if (filterRead === 'READ' && !a.read) return false;
    if (filterCategory !== 'ALL' && a.categoryName !== filterCategory) return false;
    return true;
  });

  const safePage=Math.max(1,page);
  const paginatedVisible=paginate(visible, safePage, pageSize);
  return (
    <main className="mx-auto max-w-5xl space-y-6 px-5 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Alert History</h1>
          <p className="text-sm text-slate-400">
            High-emission warnings and monthly target alerts generated from your activity data.
            {unread > 0 && <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-xs font-black text-slate-950">{unread} unread</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 rounded-lg border border-emerald-700/50 bg-emerald-950/40 px-3 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40">
              <CheckCheck className="h-4 w-4" />Mark All Read
            </button>
          )}
          <button onClick={load} className="rounded-lg border border-slate-700 bg-slate-800 p-2 hover:bg-slate-700">
            <RefreshCw className="h-4 w-4 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 p-1">
          {['ALL', 'UNREAD', 'READ'].map(f => (
            <button key={f} onClick={() => setFilterRead(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${filterRead === f ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
        {categories.length > 0 && (
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500">
            <option value="ALL">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {loading ? (
        <p className="text-slate-400">Loading alerts…</p>
      ) : visible.length ? (
        <div className="space-y-3">
          {paginatedVisible.map(x => (
            <article key={x.id} className={`rounded-2xl border p-5 transition-all ${x.read ? 'border-slate-700 bg-slate-800/40' : severityStyle(x.severity)}`}>
              <div className="flex gap-3">
                <Bell className={`mt-1 h-5 w-5 shrink-0 ${x.severity === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold text-white">{x.title}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${severityBadge(x.severity)}`}>{x.severity}</span>
                    {x.categoryName && <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">{x.categoryName}</span>}
                    {x.alertType === 'GOAL_EXCEEDED' && <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${x.resolved ? 'border-slate-600 bg-slate-800 text-slate-400' : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'}`}>{x.resolved ? 'RESOLVED' : 'ACTIVE'}</span>}
                    {!x.read && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-slate-950">NEW</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-300">{x.message}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                    {x.currentEmission != null && <span>Current: <b className="text-white">{x.currentEmission.toFixed(2)} kg CO2e</b></span>}
                    {x.monthlyLimit != null && <span>Limit: <b className="text-white">{x.monthlyLimit.toFixed(2)} kg CO2e</b></span>}
                    {x.exceededAmount != null && <span>Exceeded by: <b className="text-rose-300">{x.exceededAmount.toFixed(2)} kg CO2e</b></span>}
                  </div>
                  {x.recommendation && <p className="mt-2 text-sm text-emerald-300">{x.recommendation}</p>}
                  <p className="mt-2 text-xs text-slate-500">
                    {x.month && x.year ? `${MONTH_NAMES[x.month - 1]} ${x.year} · ` : ''}
                    {formatCreatedAt(x.createdAt)}
                  </p>
                  <div className="mt-3 flex gap-3">
                    {!x.read && (
                      <button onClick={() => markRead(x.id)} className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300">
                        <CheckCheck className="h-4 w-4" />Mark as Read
                      </button>
                    )}
                    <button onClick={() => deleteAlert(x.id)} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300">
                      <Trash2 className="h-3.5 w-3.5" />Delete
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/40 p-12 text-center text-slate-400">
          {filterRead !== 'ALL' || filterCategory !== 'ALL'
            ? 'No alerts match the selected filters.'
            : "You're all caught up. No high-emission warnings yet."}
        </div>
      )}
      <Pagination page={safePage} pageSize={pageSize} total={visible.length} onPageChange={setPage} onPageSizeChange={n=>{setPageSize(n);setPage(1);}} />
    </main>
  );
}
