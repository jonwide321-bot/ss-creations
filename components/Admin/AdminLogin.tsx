import React, { useState, useEffect } from 'react';
import { Lock, Mail, LogIn, ArrowLeft, Loader2, AlertTriangle, Info } from 'lucide-react';
import Logo from '../Logo';
import { supabase, isSupabaseConfigured, isStripeKeyError } from '../../lib/supabase';

interface AdminLoginProps {
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(true);
  const [stripeWarning, setStripeWarning] = useState(false);

  useEffect(() => {
    setIsConfigured(!!isSupabaseConfigured());
    setStripeWarning(!!isStripeKeyError());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConfigured) {
      setError('Supabase is not configured properly. Check your connection.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message === 'Invalid login credentials') {
          throw new Error('Invalid email or password. Please check your credentials.');
        }
        throw authError;
      }
      
      // The session listener in App.tsx will pick up the successful login
      console.log('Login successful', data);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your connection or credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 hover:text-rose-500 transition-colors font-semibold"
      >
        <ArrowLeft className="w-5 h-5" />
        Return to Store
      </button>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-stone-100 animate-in zoom-in duration-300">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-slate-900 p-4 rounded-3xl mb-4 shadow-xl">
            <Logo className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 serif">Admin Access</h2>
          <p className="text-slate-400 text-sm mt-2">Management Portal</p>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex gap-3">
          <div className="flex-shrink-0">
            <Info className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-[10px] text-blue-700 leading-relaxed font-medium">
            Make sure you have created an admin account in your <b>Supabase Dashboard</b> under Authentication / Users first.
          </p>
        </div>

        {stripeWarning && (
          <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">Configuration Warning</p>
              <p className="text-[10px] text-amber-600 leading-relaxed">
                The provided key format might be incorrect for Supabase. If login fails, please ensure you are using the <b>anon public</b> key from your Supabase Dashboard.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Administrator Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-stone-50 border border-stone-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none transition-all text-sm font-medium"
                placeholder="admin@sscreations.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-stone-50 border border-stone-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/10 outline-none transition-all text-sm font-medium"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold text-rose-500 text-center bg-rose-50 py-3 rounded-xl border border-rose-100">
              {error}
            </p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 hover:bg-rose-500 text-white rounded-2xl font-bold transition-all shadow-xl hover:shadow-rose-500/20 active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                Sign In to Portal
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;