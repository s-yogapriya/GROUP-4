import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Target, Save, TrendingUp, CheckCircle2, AlertTriangle, Clock, Minus } from 'lucide-react';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function statusStyle(status) {
  switch (status) {
    case 'TARGET EXCEEDED': return { color: 'text-rose-400', bg: 'bg-rose-950/40 border-rose-700/50', icon: AlertTriangle, iconColor: 'text-rose-400' };
    case 'NEAR LIMIT': return { color: 'text-amber-400', bg: 'bg-amber-950/40 border-amber-700/50', icon: TrendingUp, iconColor: 'text-amber-400' };
    case 'ON TRACK': return { color: 'text-emerald-400', bg: 'bg-emerald-950/40 border-emerald-700/50', icon: CheckCircle2, iconColor: 'text-emerald-400' };
    case 'GOAL ACHIEVED': return { color: 'text-teal-400', bg: 'bg-teal-950/40 border-teal-700/50', icon: CheckCircle2, iconColor: 'text-teal-400' };
    default: return { color: 'text-slate-400', bg: 'bg-slate-800/40 border-slate-700', icon: Clock, iconColor: 'text-slate-400' };
  }
}

export default function GoalsPage() {
  const { showWarning, clearWarnings } = useAuth();
  const [goal, setGoal] = useState(null);
  const [history, setHistory] = useState([]);
  const [target, setTarget] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [cur, hist] = await Promise.all([
      api.get('/user/goals/current').catch(() => ({ data: null })),
      api.get('/user/goals/history').catch(() => ({ data: [] })),
    ]);
    setGoal(cur.data);
    setHistory(hist.data || []);
    if (cur.data?.targetAmount) setTarget(cur.data.targetAmount.toString());
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    const val = Number(target);
    if (!val || val <= 0) { setError('Monthly target must be greater than 0.'); return; }
    setSaving(true);
    try {
      await api.post('/user/goals', { targetAmount: val });
      clearWarnings();
      const now = new Date();
      const alerts = await api.get('/user/alerts');
      const newestGoalAlert = (alerts.data || []).filter(alert => alert.alertType === 'GOAL_EXCEEDED' && alert.month === now.getMonth() + 1 && alert.year === now.getFullYear() && !alert.resolved).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
      if (newestGoalAlert) showWarning(newestGoalAlert);
      setMsg('Monthly goal saved successfully.');
      load();
    } catch (err) {
      setError(err?.message || 'Failed to save goal.');
    } finally { setSaving(false); }
  };

  const pct = goal ? Math.min(100, goal.percentageUsed || 0) : 0;
  const st = goal ? statusStyle(goal.status) : null;
  const StatusIcon = st?.icon;

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-5 py-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Goals & Targets</h1>
        <p className="text-sm text-slate-400">Set a monthly carbon emission target and track your progress.</p>
      </div>

      {/* Current Goal Progress */}
      <section className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 space-y-5">
        <h2 className="font-bold text-white">Current Month Progress</h2>
        {goal ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Monthly Target</p>
                <p className="mt-1 text-xl font-black text-white">{goal.targetAmount.toFixed(2)}</p>
                <p className="text-xs text-slate-500">kg CO2e</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Current Emissions</p>
                <p className={`mt-1 text-xl font-black ${goal.currentEmission > goal.targetAmount ? 'text-rose-400' : 'text-emerald-400'}`}>{goal.currentEmission.toFixed(2)}</p>
                <p className="text-xs text-slate-500">kg CO2e</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Remaining</p>
                <p className={`mt-1 text-xl font-black ${goal.remaining === 0 ? 'text-rose-400' : 'text-teal-400'}`}>{goal.remaining.toFixed(2)}</p>
                <p className="text-xs text-slate-500">kg CO2e</p>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                <p className="text-xs text-slate-400 uppercase tracking-wider">Used</p>
                <p className={`mt-1 text-xl font-black ${pct >= 100 ? 'text-rose-400' : pct >= 90 ? 'text-amber-400' : 'text-emerald-400'}`}>{goal.percentageUsed.toFixed(1)}%</p>
                <p className="text-xs text-slate-500">of target</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>0 kg</span>
                <span>{goal.targetAmount.toFixed(2)} kg</span>
              </div>
              <div className="h-4 overflow-hidden rounded-full bg-slate-700">
                <div
                  className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-rose-500' : pct >= 90 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            </div>

            {/* Status */}
            <div className={`flex items-center gap-3 rounded-xl border p-4 ${st.bg}`}>
              <StatusIcon className={`h-5 w-5 ${st.iconColor}`} />
              <div>
                <p className={`font-bold ${st.color}`}>{goal.status}</p>
                {goal.status === 'TARGET EXCEEDED' && (
                  <p className="text-xs text-slate-400">Exceeded by {(goal.currentEmission - goal.targetAmount).toFixed(2)} kg CO2e</p>
                )}
                {goal.status === 'NEAR LIMIT' && (
                  <p className="text-xs text-slate-400">Only {goal.remaining.toFixed(2)} kg CO2e remaining this month.</p>
                )}
                {goal.status === 'ON TRACK' && (
                  <p className="text-xs text-slate-400">You have {goal.remaining.toFixed(2)} kg CO2e remaining this month.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <p className="text-slate-400">No monthly goal has been set for this month.</p>
        )}

        {/* Set / Edit Goal Form */}
        <div className="border-t border-slate-700 pt-5">
          <h3 className="text-sm font-bold text-white mb-3">{goal ? 'Update Monthly Target' : 'Set Monthly Target'}</h3>
          <form onSubmit={save} className="flex max-w-sm gap-2">
            <div className="flex-1">
              <input
                type="number" min="0.01" step="0.01" value={target}
                onChange={e => { setTarget(e.target.value); setError(''); setMsg(''); }}
                className={`w-full rounded-lg border bg-slate-900 p-2.5 text-white text-sm focus:outline-none ${error ? 'border-rose-500' : 'border-slate-700 focus:border-emerald-500'}`}
                placeholder="Monthly target kg CO2e"
              />
              {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
              {msg && <p className="mt-1 text-xs text-emerald-300">{msg}</p>}
            </div>
            <button type="submit" disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50">
              <Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save'}
            </button>
          </form>
        </div>
      </section>

      {/* Goal History */}
      <section className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 space-y-4">
        <h2 className="font-bold text-white">Goal History</h2>
        {history.length ? (
          <div className="space-y-3">
            {history.map(g => {
              const s = statusStyle(g.status);
              const SI = s.icon;
              return (
                <div key={g.id} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3">
                  <div>
                    <p className="font-semibold text-white">{MONTH_NAMES[(g.month || 1) - 1]} {g.year}</p>
                    <p className="text-xs text-slate-400">
                      Target: {g.targetAmount?.toFixed(2)} kg · Actual: {g.currentEmission?.toFixed(2)} kg
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <SI className={`h-4 w-4 ${s.iconColor}`} />
                    <span className={`text-xs font-bold ${s.color}`}>{g.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No previous goals available.</p>
        )}
      </section>
    </main>
  );
}
