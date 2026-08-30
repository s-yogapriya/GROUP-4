import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';

const CATEGORY_RECS = {
  Transport: {
    icon: '🚗',
    color: 'border-blue-500/30 bg-blue-950/20',
    badge: 'bg-blue-900/60 text-blue-300',
    tips: [
      'Use public transport, carpooling, cycling or walking for shorter journeys.',
      'Combine multiple errands into a single trip to reduce total distance.',
      'Consider switching to an electric or hybrid vehicle.',
      'Work from home when possible to eliminate commute emissions.',
    ],
  },
  Electricity: {
    icon: '⚡',
    color: 'border-yellow-500/30 bg-yellow-950/20',
    badge: 'bg-yellow-900/60 text-yellow-300',
    tips: [
      'Switch off unused appliances and lights when leaving a room.',
      'Use energy-efficient LED bulbs and appliances.',
      'Set your thermostat a few degrees lower in winter and higher in summer.',
      'Consider installing solar panels or switching to a renewable energy tariff.',
    ],
  },
  Food: {
    icon: '🥗',
    color: 'border-emerald-500/30 bg-emerald-950/20',
    badge: 'bg-emerald-900/60 text-emerald-300',
    tips: [
      'Reduce food waste by planning meals and using leftovers.',
      'Choose more plant-based meals — they have a significantly lower footprint.',
      'Buy local and seasonal produce to reduce transport emissions.',
      'Reduce red meat consumption, especially beef.',
    ],
  },
  Shopping: {
    icon: '🛍️',
    color: 'border-pink-500/30 bg-pink-950/20',
    badge: 'bg-pink-900/60 text-pink-300',
    tips: [
      'Reuse and repair products instead of buying new ones.',
      'Plan purchases carefully to avoid impulse buying.',
      'Choose products with minimal packaging.',
      'Buy second-hand or refurbished electronics and clothing.',
    ],
  },
};

export default function RecommendationsPage() {
  const [topEmissions, setTopEmissions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/user/recommendations/top-emissions').catch(() => ({ data: [] })),
      api.get('/user/alerts').catch(() => ({ data: [] })),
    ]).then(([emRes, alRes]) => {
      setTopEmissions(emRes.data || []);
      setAlerts(alRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  // Get categories that have exceeded limits (from HIGH_EMISSION alerts this month)
  const now = new Date();
  const highCategories = [...new Set(
    alerts
      .filter(a => a.alertType === 'HIGH_EMISSION' && a.month === now.getMonth() + 1 && a.year === now.getFullYear())
      .map(a => a.categoryName)
      .filter(Boolean)
  )];

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-5 py-8">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Recommendations</h1>
        <p className="text-sm text-slate-400">Insights and actions based on your actual emission data.</p>
      </div>

      {/* Top 5 Highest Emission Activities */}
      <section className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-amber-400" />
          <h2 className="font-bold text-white">Top 5 Highest-Emission Activities</h2>
        </div>
        {loading ? (
          <p className="text-slate-400">Loading…</p>
        ) : topEmissions.length ? (
          <div className="space-y-3">
            {topEmissions.map((a, i) => (
              <div key={a.activityLogId} className="flex items-center gap-4 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-black text-sm ${i === 0 ? 'bg-amber-500 text-slate-950' : i === 1 ? 'bg-slate-400 text-slate-950' : i === 2 ? 'bg-amber-700 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{a.activityName}</p>
                  <p className="text-xs text-slate-400">{a.categoryName} · {a.activityDate}</p>
                </div>
                <span className="font-black text-amber-300 text-sm">{a.totalEmission.toFixed(2)} kg CO2e</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No activity data available yet. Continue logging activities.</p>
        )}
      </section>

      {/* Category-Specific Recommendations */}
      {highCategories.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-400" />
            <h2 className="font-bold text-white">High-Emission Category Recommendations</h2>
            <span className="text-xs text-slate-400">Based on this month's exceeded limits</span>
          </div>
          {highCategories.map(cat => {
            const rec = CATEGORY_RECS[cat];
            if (!rec) return null;
            return (
              <div key={cat} className={`rounded-2xl border p-5 ${rec.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{rec.icon}</span>
                  <h3 className="font-bold text-white">{cat}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rec.badge}`}>HIGH EMISSIONS</span>
                </div>
                <ul className="space-y-2">
                  {rec.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>
      )}

      {/* General Recommendations */}
      <section className="rounded-2xl border border-slate-700 bg-slate-800/50 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-emerald-400" />
          <h2 className="font-bold text-white">General Sustainability Tips</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(CATEGORY_RECS).map(([cat, rec]) => (
            <div key={cat} className="rounded-xl border border-slate-700 bg-slate-900/60 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>{rec.icon}</span>
                <h3 className="font-semibold text-white text-sm">{cat}</h3>
              </div>
              <p className="text-xs text-slate-400">{rec.tips[0]}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
