import React, { useEffect, useMemo, useState } from 'react';
import { Search, ClipboardList, RefreshCw, BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Pagination from '../components/Pagination';
import { paginate } from '../utils/clientPagination';

export default function AdminActivityLogsPage() {
  const { showToast } = useAuth();
  const [logs, setLogs] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = async () => {
    setLoading(true);
    try {
      const all = await api.get('/admin/activity-logs');
      const data = Array.isArray(all?.data) ? all.data : [];
      setAllLogs(data);
      setLogs(data);
    } catch (err) {
      setAllLogs([]);
      setLogs([]);
      showToast(err?.message || 'Unable to load activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => { setPage(1); }, [query]);

  const filtered = allLogs.filter((l) =>
    JSON.stringify(l).toLowerCase().includes(query.toLowerCase())
  );
  const safePage = Math.max(1, page);
  const paginatedLogs = paginate(filtered, safePage, pageSize);

  const byCategory = useMemo(() => {
    const map = new Map();
    filtered.forEach((l) => {
      const key = l.categoryName || 'Unknown';
      map.set(key, (map.get(key) || 0) + Number(l.totalEmission || 0));
    });
    return [...map.entries()].map(([name, total]) => ({ name, total: Number(total.toFixed(2)) }));
  }, [filtered]);

  const byDate = useMemo(() => {
    const map = new Map();
    filtered.forEach((l) => {
      const key = l.activityDate || 'Unknown';
      map.set(key, (map.get(key) || 0) + Number(l.totalEmission || 0));
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, total]) => ({ date, total: Number(total.toFixed(2)) }));
  }, [filtered]);

  return (
    <main className="space-y-6 p-4 sm:p-5 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Activity Logs</h2>
          <p className="mt-1 text-sm text-slate-400">Review recorded activities and their calculated carbon impact.</p>
        </div>
        <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search user, category, activity…" className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-emerald-500" />
        </div>
        <p className="mt-3 text-xs text-slate-500">Showing {filtered.length} records</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-emerald-400" /><h3 className="font-bold text-white">Carbon Emission by Category</h3></div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" strokeOpacity={0.55} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#cbd5e1" }} axisLine={{ stroke: "#475569" }} tickLine={{ stroke: "#475569" }} interval={0} angle={-15} textAnchor="end" height={55} />
                <YAxis tick={{ fontSize: 11, fill: "#cbd5e1" }} axisLine={{ stroke: "#475569" }} tickLine={{ stroke: "#475569" }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12, color: "#fff" }} formatter={(v) => [`${v} kg CO₂e`, "Emission"]} />
                <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-teal-400" /><h3 className="font-bold text-white">Emission Trend by Activity Date</h3></div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byDate} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" strokeOpacity={0.55} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#cbd5e1" }} axisLine={{ stroke: "#475569" }} tickLine={{ stroke: "#475569" }} />
                <YAxis tick={{ fontSize: 11, fill: "#cbd5e1" }} axisLine={{ stroke: "#475569" }} tickLine={{ stroke: "#475569" }} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 12, color: "#fff" }} formatter={(v) => [`${v} kg CO₂e`, "Emission"]} />
                <Line type="monotone" dataKey="total" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: "#38bdf8" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
        {loading ? <div className="p-12 text-center text-slate-400">Loading activity logs…</div> : !filtered.length ? <div className="p-12 text-center"><ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-600" /><p className="font-semibold text-slate-300">No activities found</p></div> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-950 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  {['Category', 'Activity', 'Activity Date', 'Quantity', 'Total Emission'].map((x) => <th className="px-5 py-4" key={x}>{x}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {paginatedLogs.map((log, i) => (
                  <tr key={log.activityLogId || i} className="hover:bg-slate-800/40">
                    <td className="px-5 py-4"><span className="rounded-full bg-teal-500/10 px-2 py-1 text-xs font-bold text-teal-300">{log.categoryName || '-'}</span></td>
                    <td className="px-5 py-4 font-medium text-white">{log.activityTypeName || '-'}</td>
                    <td className="px-5 py-4 text-slate-400 whitespace-nowrap">{log.activityDate || '-'}</td>
                    <td className="px-5 py-4 text-emerald-300">{log.quantity ?? '-'} {log.unit || ''}</td>
                    <td className="px-5 py-4 font-bold text-emerald-400">{Number(log.totalEmission || 0).toFixed(2)} kg CO₂e</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={safePage} pageSize={pageSize} total={filtered.length} onPageChange={setPage} onPageSizeChange={(n) => { setPageSize(n); setPage(1); }} />
      </section>
    </main>
  );
}
