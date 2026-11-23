import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Wrench,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  User,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, switchDemoUser } = useAuth();

  const [email, setEmail] = useState('rahul.sharma@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      const queryParams = new URLSearchParams(location.search);
      const redirect = queryParams.get('redirect') || '/customer';
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 transition-colors duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl dark:shadow-2xl dark:shadow-black/60 max-w-md w-full space-y-6 transition-colors duration-200">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-brand-600/30">
            <Wrench className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sign In to Serviqa</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Access your customer or provider dashboard</p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-black text-xs rounded-2xl shadow-lg shadow-brand-600/25 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <span>Authenticating...</span> : <span>Sign In</span>}
          </button>
        </form>

        {/* Fast Role Evaluator Card Switcher */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            <span>One-Click Role Switcher</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={async () => {
                await switchDemoUser('CUSTOMER');
                navigate('/customer');
              }}
              className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 rounded-2xl text-center border border-slate-200/80 dark:border-slate-700 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <User className="w-4 h-4 mx-auto mb-1 text-slate-700 dark:text-slate-200" />
              <span className="text-[11px] font-black text-slate-900 dark:text-white block">Customer</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-medium">Rahul Sharma</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await switchDemoUser('PROVIDER');
                navigate('/provider');
              }}
              className="p-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 rounded-2xl text-center border border-emerald-200/80 dark:border-emerald-800 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Briefcase className="w-4 h-4 mx-auto mb-1 text-emerald-700 dark:text-emerald-400" />
              <span className="text-[11px] font-black text-emerald-950 dark:text-emerald-200 block">Provider</span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block font-medium">CoolCare AC</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await switchDemoUser('ADMIN');
                navigate('/admin');
              }}
              className="p-3 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100/70 dark:hover:bg-purple-900/40 rounded-2xl text-center border border-purple-200/80 dark:border-purple-800 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4 mx-auto mb-1 text-purple-700 dark:text-purple-400" />
              <span className="text-[11px] font-black text-purple-950 dark:text-purple-200 block">Admin</span>
              <span className="text-[9px] text-purple-600 dark:text-purple-400 block font-medium">Ops Console</span>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          New to Serviqa?{' '}
          <Link to="/register" className="font-extrabold text-brand-600 dark:text-brand-400 hover:underline">
            Register for Free
          </Link>
        </div>
      </div>
    </div>
  );
}
