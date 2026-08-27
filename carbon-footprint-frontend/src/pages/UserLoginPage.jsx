import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, Lock, Shield, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const UserLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, showToast } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const registeredMessage = location.state?.registered;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });
      }
    };

    if (window.google && window.google.accounts) {
      initializeGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google && window.google.accounts) {
          initializeGoogle();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const handleGoogleCredentialResponse = async (response) => {
    setGoogleLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post('/auth/google', {
        credential: response.credential,
      });
      const jwtData = res.data;
      login(jwtData);
      showToast('Google login successful! Welcome.', 'success');
      navigate('/user/dashboard');
    } catch (err) {
      setErrorMessage(typeof err === 'string' ? err : 'Google login failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setErrorMessage('Google login is not configured. Please contact the administrator.');
      return;
    }
    if (window.google && window.google.accounts) {
      window.google.accounts.id.prompt();
    } else {
      setErrorMessage('Google Sign-In is loading. Please try again in a moment.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password.trim()) {
      setErrorMessage('Username/Email and Password are required');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.post('/auth/user/login', {
        usernameOrEmail: usernameOrEmail.trim(),
        password: password.trim(),
      });

      const jwtData = res.data;
      login(jwtData);

      if (jwtData.firstLogin) {
        showToast('First login detected! Please set your new password.', 'info');
        navigate('/reset-password');
      } else {
        showToast('Login successful! Welcome back.', 'success');
        navigate('/user/dashboard');
      }
    } catch (err) {
      setErrorMessage(typeof err === 'string' ? err : 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <LogIn className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">User Portal Login</h1>
            <p className="text-xs text-slate-400">
              Enter your credentials or temporary password sent via email
            </p>
          </div>

          {registeredMessage && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-white">Registration Request Submitted!</p>
                <p className="mt-0.5">Your profile is currently PENDING Admin approval. You will receive an email with login credentials once approved.</p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3 rounded-xl bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm shadow-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex-1 h-px bg-slate-700" />
            <span>OR</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Username or Email</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    placeholder="Username or user@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password / Temporary Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-white outline-none"
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
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-950/40 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In to Account'}
              </button>

            </form>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <Link to="/register" className="hover:text-emerald-400 transition-colors">
              Need an account? Register here
            </Link>
            <Link to="/admin/login" className="flex items-center gap-1 hover:text-teal-400 transition-colors">
              <Shield className="w-3.5 h-3.5 text-teal-400" /> Admin Portal
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserLoginPage;
