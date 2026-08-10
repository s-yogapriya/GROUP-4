import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BackToHome from '../components/BackToHome';
import Footer from '../components/Footer';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, AlertCircle, Info, Eye, EyeOff } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, showToast } = useAuth();

  const [email, setEmail] = useState('admin@infosys.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Admin email and password are required');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.post('/auth/admin/login', {
        email: email.trim(),
        password: password.trim(),
      });

      login(res.data);
      showToast('Admin authentication successful!', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMessage(typeof err === 'string' ? err : 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />

<main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6">

          <div className="flex justify-start">
            <BackToHome />
          </div>

          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mx-auto">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Admin Management Portal</h1>
            <p className="text-xs text-slate-400">
              Restricted system administration access
            </p>
          </div>

          <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-800/60 text-xs text-teal-200 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-white">Default Admin Credentials (Seeded):</p>
              <p className="font-mono text-teal-300 mt-0.5">Email: admin@infosys.com</p>
              <p className="font-mono text-teal-300">Password: admin123</p>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@infosys.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-teal-500 text-sm text-white outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-teal-500 text-sm text-white outline-none"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-950/40 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating Admin...' : 'Authenticate Admin'}
              </button>

            </form>
          </div>

          <div className="text-center text-xs text-slate-400">
            <Link to="/login" className="hover:text-emerald-400 transition-colors">
              ← Return to Standard User Login
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminLoginPage;
