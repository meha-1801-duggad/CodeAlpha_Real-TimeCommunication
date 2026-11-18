import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'register' | 'guest';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'login',
}) => {
  const [tab, setTab] = useState<'login' | 'register' | 'guest'>(defaultTab);
  const { login, register, guestLogin } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.message || 'Login failed');
        }
      } else if (tab === 'register') {
        const res = await register(name, email, password);
        if (res.success) {
          onClose();
        } else {
          setError(res.message || 'Registration failed');
        }
      } else if (tab === 'guest') {
        const ok = await guestLogin(name || 'Guest User');
        if (ok) {
          onClose();
        } else {
          setError('Failed to start guest session');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white border border-pearl-200 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-pearl-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-500 flex items-center justify-center text-xs font-black text-white shadow-xs">
              N
            </div>
            <h3 className="font-extrabold text-pearl-900 text-base tracking-tight">
              {tab === 'login' ? 'Sign In' : tab === 'register' ? 'Create Account' : 'Instant Guest Access'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-pearl-400 hover:text-pearl-700 hover:bg-pearl-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-pearl-200 bg-pearl-100/70 p-1.5 gap-1">
          <button
            onClick={() => { setTab('login'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'login' ? 'bg-white text-pearl-900 shadow-xs ring-1 ring-pearl-200' : 'text-pearl-600 hover:text-pearl-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'register' ? 'bg-white text-pearl-900 shadow-xs ring-1 ring-pearl-200' : 'text-pearl-600 hover:text-pearl-900'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => { setTab('guest'); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'guest' ? 'bg-white text-pearl-900 shadow-xs ring-1 ring-pearl-200' : 'text-pearl-600 hover:text-pearl-900'
            }`}
          >
            Guest Access
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {(tab === 'register' || tab === 'guest') && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pearl-700 mb-2">
                {tab === 'guest' ? 'Display Name' : 'Full Name'}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-pearl-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={tab === 'guest' ? 'e.g. Alex Rivera' : 'Enter your name'}
                  required={tab === 'register'}
                  className="w-full bg-pearl-50 border border-pearl-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-pearl-900 placeholder-pearl-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-medium transition-all"
                />
              </div>
            </div>
          )}

          {tab !== 'guest' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pearl-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-pearl-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full bg-pearl-50 border border-pearl-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-pearl-900 placeholder-pearl-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-pearl-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-pearl-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full bg-pearl-50 border border-pearl-200 rounded-2xl pl-10 pr-4 py-3 text-sm text-pearl-900 placeholder-pearl-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-medium transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {tab === 'guest' && (
            <p className="text-xs text-pearl-500 font-medium leading-relaxed">
              Guest access allows you to immediately join or host meetings without an email or password.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 disabled:opacity-50 active:scale-98"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{tab === 'login' ? 'Sign In' : tab === 'register' ? 'Create Account' : 'Continue as Guest'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
