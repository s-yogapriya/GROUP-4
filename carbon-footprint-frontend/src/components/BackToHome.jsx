import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackToHome = () => {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-all shadow-lg"
    >
      <ArrowLeft className="w-4 h-4 text-emerald-400" />
      Back to Home
    </Link>
  );
};

export default BackToHome;
