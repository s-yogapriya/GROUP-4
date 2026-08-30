import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OAuth2CallbackPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();
  const [message, setMessage] = useState('Completing secure sign-in…');

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('oauthError');
    if (error) {
      setMessage(error);
      setTimeout(() => navigate('/login', { replace: true }), 1800);
      return;
    }
    if (!token) {
      setMessage('OAuth sign-in could not be completed.');
      setTimeout(() => navigate('/login', { replace: true }), 1800);
      return;
    }
    // The OAuth callback returns a signed JWT. Decode only the non-sensitive claims
    // needed by the existing AuthContext; the server remains the source of truth.
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      login({
        token,
        type: 'Bearer',
        id: payload.id,
        username: payload.sub,
        email: payload.email,
        firstLogin: Boolean(payload.firstLogin),
        roles: ['ROLE_USER'],
      });
      navigate('/user/dashboard', { replace: true });
    } catch {
      setMessage('Invalid OAuth response. Please try again.');
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    }
  }, [params, login, navigate]);

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-emerald-400" />
        <p className="text-sm text-slate-300">{message}</p>
      </div>
    </main>
  );
}
