
import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { Logo } from './Logo';
import { ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export const VerificationScreen = () => {
  // ... kept same logic ...
  const { user, resendVerification, checkVerification, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendVerification();
      setMessage('Sent. Check your inbox.');
    } catch (e) {
      setMessage('Error sending email. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-4 text-ink">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 border border-slate-100 shadow-2xl text-center relative overflow-hidden">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
          <Sparkles className="text-indigo-600" size={32} />
        </div>
        <h2 className="text-2xl font-black mb-2 text-slate-800 tracking-tight">Check your email</h2>
        <p className="text-slate-500 mb-8 font-medium">Link sent to <span className="text-indigo-600 font-bold">{user?.email}</span></p>

        <button onClick={async () => { setLoading(true); await checkVerification(); setLoading(false); }} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 mb-3">
          {loading && <Loader2 className="animate-spin" size={18} />}
          I've Verified
        </button>
        <button onClick={handleResend} className="w-full text-slate-400 font-bold text-sm hover:text-indigo-600 transition-colors">Resend Email</button>

        {message && <div className="mt-4 p-3 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-lg">{message}</div>}
        <button onClick={logout} className="mt-8 text-xs font-bold text-slate-300 hover:text-rose-500 transition-colors">Sign Out</button>
      </div>
    </div>
  );
};

export const AuthScreen = () => {
  const { login, signup, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) await login(formData.email, formData.password);
      else await signup(formData.email, formData.password, formData.name);
    } catch (error: any) {
      setError(error.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-[#0F1117]">
      {/* ELITE LEFT PANEL - CINEMATIC */}
      <div className="hidden lg:flex w-[50%] relative items-center justify-center overflow-hidden">
        {/* Radial Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0F1117] to-[#0F1117] z-0" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg p-12">
          {/* Logo with Blend Mode "Screen" to remove black box */}
          <div className="mb-10 p-8 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl shadow-indigo-500/10 animate-fade-in">
            <div style={{ mixBlendMode: 'screen' }}>
              <Logo size={80} />
            </div>
          </div>

          <h1 className="text-6xl font-black tracking-tighter text-white mb-6 drop-shadow-2xl">
            LifeHub.
          </h1>
          <p className="text-xl text-slate-400 font-medium leading-relaxed">
            Master your <span className="text-indigo-400">chaos</span>. <br />
            An intelligent OS for your life, habits, and wallet.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="w-full lg:w-[50%] bg-white flex items-center justify-center p-6 sm:p-12 relative">

        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile Header - IN FLOW (Fixed Overlap) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg text-white mb-4">
              <Logo size={24} className="text-white" filtered={true} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">LifeHub</h2>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              {isLogin ? 'Welcome Back' : 'Join LifeHub'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isLogin ? 'Continue to your dashboard.' : 'Start your journey today.'}
            </p>
          </div>

          {/* Google Button - Fixed Icon */}
          <button
            onClick={async () => { setLoading(true); await loginWithGoogle(); setLoading(false); }}
            className="w-full py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300 transition-all mb-8 group shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-slate-700 font-bold">Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <span className="relative bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or with email</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 ml-1">FULL NAME</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300" placeholder="John Doe" />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">EMAIL ADDRESS</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300" placeholder="name@example.com" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 ml-1">PASSWORD</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300" placeholder="••••••••" />
            </div>

            {error && <div className="p-4 rounded-xl bg-rose-50 text-rose-500 text-sm font-bold flex items-center gap-2"><AlertCircle size={16} />{error}</div>}

            <button disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 mt-4">
              {loading ? <Loader2 className="animate-spin" /> : <><span>{isLogin ? 'Sign In' : 'Create Account'}</span><ArrowRight size={20} /></>}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-400 font-medium text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-indigo-600 font-bold hover:underline">
              {isLogin ? "Join now" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};