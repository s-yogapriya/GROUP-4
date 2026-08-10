import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, MapPin, ShieldCheck, RefreshCw, Lock } from 'lucide-react';

const Profile = () => {
  const { user, showToast } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/user/profile');
        setProfile(res.data);
      } catch {
        setProfile(user);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const data = profile || user;

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-3">
          <User className="w-7 h-7 text-emerald-400" /> My Profile
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Your registered account details.
        </p>
      </div>

      {/* Profile card */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 space-y-6">
        {/* Header row */}
        <div className="flex items-center gap-4 pb-5 border-b border-slate-800">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-extrabold text-2xl shadow-xl">
            {(data?.firstName?.[0] || 'U').toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {data.firstName} {data.middleName ? data.middleName + ' ' : ''}{data.lastName}
            </h2>
            <p className="text-emerald-400 font-mono text-sm">@{data.username}</p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Approved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Personal Summary</h4>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
              {[
                ['Full Name', `${data.firstName} ${data.middleName || ''} ${data.lastName}`],
                ['Gender & Age', `${data.gender} • ${data.age} yrs`],
                ['Date of Birth', data.dateOfBirth],
                ['Mobile', data.mobileNumber],
                ['Alternate Mobile', data.alternateMobile || '—'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between py-1 border-b border-slate-900 last:border-0">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-white font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">Contact & Address</h4>
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-white font-medium">{data.email}</span>
              </div>
              {data.address && (
                <div className="flex items-start gap-2 text-slate-400">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-slate-200 font-medium leading-relaxed">
                    {data.address.houseNumber}, {data.address.street}, {data.address.area},{' '}
                    {data.address.city}, {data.address.state} -{' '}
                    <span className="text-emerald-400 font-mono">{data.address.pinCode}</span>
                  </p>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-400">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-white font-medium">{data.mobileNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder note */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
        <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
      </div>
    </div>
  );
};

export default Profile;
