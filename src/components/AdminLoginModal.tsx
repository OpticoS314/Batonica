import React, { useState } from 'react';
import { X, ShieldCheck, Lock, Mail, Key, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { loginAsAdmin } = useAuth();
  const [email, setEmail] = useState('admin@botanica.com');
  const [password, setPassword] = useState('••••••••');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      loginAsAdmin(email);
      setIsLoading(false);
      onSuccess();
    }, 300);
  };

  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsAdmin('admin@botanica.com');
      setIsLoading(false);
      onSuccess();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 z-10 animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-100 text-base">Admin Sign In</h2>
              <p className="text-xs text-slate-400">Catalog & Pricing Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits banner */}
        <div className="my-4 p-3 bg-emerald-950/50 border border-emerald-500/25 rounded-2xl text-xs text-emerald-300 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <div className="font-bold text-emerald-200">Admin Permissions</div>
            <div>Add and adjust pricing for any plant size, upload photos, and introduce new plant species to the catalog.</div>
          </div>
        </div>

        {/* Quick 1-Click Demo Login Button */}
        <button
          onClick={handleQuickDemoLogin}
          disabled={isLoading}
          className="w-full py-3 px-4 mb-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-[0.98]"
        >
          <Key className="w-4 h-4" />
          <span>Quick 1-Click Admin Access</span>
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-medium">Or enter credentials</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 mt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@botanica.com"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-semibold text-sm transition-all"
          >
            {isLoading ? 'Verifying...' : 'Sign In as Administrator'}
          </button>
        </form>
      </div>
    </div>
  );
};
