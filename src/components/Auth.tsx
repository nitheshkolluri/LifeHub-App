
import React, { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { Logo } from './Logo';
import { ArrowRight, Loader2, Sparkles, AlertCircle, Mail, Lock, User as UserIcon, CheckCircle } from 'lucide-react';
import { PrivacyModal, TermsModal } from '../pages/Legal';
import { motion } from 'framer-motion';

export const VerificationScreen = () => {
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
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4 text-neutral-900 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2rem] p-10 border border-neutral-100/50 shadow-soft text-center relative overflow-hidden">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-indigo-50/50">
          <Sparkles className="text-indigo-600" size={32} />
        </div>
        <h2 className="text-3xl font-display font-bold mb-3 text-neutral-900 tracking-tight">Check your email</h2>
        <p className="text-neutral-500 mb-10 font-medium leading-relaxed">We sent a verification link to <br /><span className="text-neutral-900 font-bold">{user?.email}</span></p>

        <button onClick={async () => { setLoading(true); await checkVerification(); setLoading(false); }} className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-neutral-500/20 flex items-center justify-center gap-2 mb-4 hover:-translate-y-1">
          {loading && <Loader2 className="animate-spin" size={18} />}
          I've Verified
        </button>
        <button onClick={handleResend} className="w-full py-4 text-neutral-500 font-bold text-sm hover:text-indigo-600 hover:bg-neutral-50 rounded-2xl transition-all">Resend Email</button>

        {message && <div className="mt-4 p-3 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2"><CheckCircle size={14} /> {message}</div>}
        <button onClick={logout} className="mt-8 text-xs font-bold text-neutral-400 hover:text-rose-500 transition-colors uppercase tracking-widest">Sign Out</button>
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

  // Legal Modals State
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

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
    <div className="min-h-screen flex font-sans bg-white text-neutral-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* ELITE LEFT PANEL - PASTEL THEME */}
      <div className="hidden lg:flex w-[45%] relative items-center justify-center overflow-hidden bg-[#FDFBF7]">

        {/* Abstract Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 p-6 bg-white rounded-[2.5rem] border border-zinc-100 shadow-xl relative"
          >
            <div className="relative z-10">
              <Logo size={80} />
            </div>
          </motion.div>

          <h1 className="text-5xl font-display font-black tracking-tight text-zinc-900 mb-6">
            LifeHub
          </h1>
          <p className="text-lg text-zinc-500 font-medium leading-relaxed max-w-sm">
            The intelligent operating system for your daily life. <span className="text-indigo-600 font-bold">Focus on what matters.</span>
          </p>
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="w-full lg:w-[55%] bg-white flex items-center justify-center p-6 sm:p-12 relative">

        <div className="w-full max-w-[420px] animate-in-fade">
          {/* Mobile Header */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="mb-4 p-3 bg-neutral-50 rounded-2xl">
              <Logo size={40} />
            </div>
            <h2 className="text-2xl font-display font-bold text-neutral-900 tracking-tight">LifeHub</h2>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-neutral-900 tracking-tight mb-3">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-neutral-500 font-medium text-base">
              {isLogin ? 'Enter your details to access your workspace.' : 'Start your organized journey today.'}
            </p>
          </div>

          {/* Social Auth */}
          <button
            onClick={async () => { setLoading(true); await loginWithGoogle(); setLoading(false); }}
            className="w-full py-3.5 bg-white border border-neutral-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-neutral-50 hover:border-neutral-300 transition-all mb-8 group shadow-sm active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-neutral-600 font-bold text-sm">Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-neutral-100"></div></div>
            <span className="relative bg-white px-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Or continue with</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-transparent rounded-2xl font-bold text-neutral-900 outline-none focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-neutral-400"
                  placeholder="Full Name"
                />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-transparent rounded-2xl font-bold text-neutral-900 outline-none focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-neutral-400"
                placeholder="Email Address" />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
              <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-12 pr-4 py-4 bg-neutral-50 border border-transparent rounded-2xl font-bold text-neutral-900 outline-none focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-neutral-400"
                placeholder="Password" />
            </div>

            {error && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3 animate-in-fade"><AlertCircle size={18} />{error}</div>}

            <button disabled={loading} className="w-full bg-neutral-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-500/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 className="animate-spin" /> : <><span>{isLogin ? 'Sign In' : 'Create Account'}</span><ArrowRight size={20} /></>}
            </button>

            <p className="text-center text-[10px] text-neutral-400 mt-6 leading-relaxed">
              By continuing, you acknowledge that you have read and understood our <br />
              <button type='button' onClick={() => setShowTerms(true)} className="underline decoration-neutral-300 hover:text-indigo-600 font-semibold">Terms</button> and <button type='button' onClick={() => setShowPrivacy(true)} className="underline decoration-neutral-300 hover:text-indigo-600 font-semibold">Privacy Policy</button>.
            </p>
          </form>

          <div className="mt-8 text-center bg-neutral-50 rounded-2xl py-4">
            <p className="text-neutral-500 font-medium text-sm">
              {isLogin ? "New to LifeHub?" : "Already have an account?"}
              <button onClick={() => setIsLogin(!isLogin)} className="ml-2 text-indigo-600 font-bold hover:underline">
                {isLogin ? "Create account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* LEGAL MODALS */}
      <PrivacyModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
    </div>
  );
};