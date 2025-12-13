import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { BrainCircuit, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';

export const VerificationScreen = () => {
  const { user, resendVerification, checkVerification, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResend = async () => {
    setLoading(true);
    try {
      await resendVerification();
      setMessage('Verification email sent! Check your inbox (and spam).');
    } catch (e) {
      setMessage('Error sending email. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async () => {
    setLoading(true);
    await checkVerification();
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
       <div className="max-w-md w-full bg-white rounded-[32px] p-8 shadow-2xl border border-white text-center animate-slide-up">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
             <ShieldCheck className="text-indigo-600" size={40} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Identity</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">
            To secure your Digital Second Brain, please verify your email address <strong>{user?.email}</strong>.
          </p>

          <div className="space-y-3">
             <button 
                onClick={handleCheck}
                disabled={loading}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
             >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={18} />}
                <span>I've Verified My Email</span>
             </button>

             <button 
                onClick={handleResend}
                disabled={loading}
                className="w-full bg-slate-50 text-slate-700 py-4 rounded-2xl font-bold hover:bg-slate-100 transition-all"
             >
                Resend Email
             </button>
          </div>

          {message && (
            <p className="mt-4 text-xs font-bold text-emerald-600 bg-emerald-50 py-2 rounded-lg animate-in fade-in">
              {message}
            </p>
          )}

          <button onClick={logout} className="mt-8 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors">
            Sign Out
          </button>
       </div>
    </div>
  );
};

export const AuthScreen = () => {
  const { login, signup, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation for password length
    if (!isLogin && formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }

    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.name);
      }
    } catch (error: any) {
      console.error(error);
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
      setLoading(true);
      setError('');
      try {
          await loginWithGoogle();
      } catch (error: any) {
          console.error(error);
          handleAuthError(error);
          setLoading(false);
      }
  };

  const handleAuthError = (err: any) => {
    if (err.code === 'auth/unauthorized-domain') {
      setError('Domain not authorized. Please add this domain to Firebase Console > Authentication > Settings > Authorized Domains.');
    } else if (err.code === 'auth/popup-closed-by-user') {
      setError('Sign-in cancelled.');
    } else if (err.code === 'auth/weak-password') {
      setError('Password is too weak. It must be at least 6 characters.');
    } else if (err.code === 'auth/email-already-in-use') {
      setError('That email is already in use. Try logging in.');
    } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials') {
      setError('Invalid email or password. If you signed up with Google, try that instead.');
    } else if (err.message) {
      setError(err.message);
    } else {
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      
      {/* Left Panel - The Digital Cortex (Desktop Only) */}
      <div className="hidden md:flex w-[45%] bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] -mr-20 -mt-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[100px] -ml-20 -mb-20" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

        {/* Brand */}
        <div className="relative z-10 flex items-center space-x-3">
           <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
             <BrainCircuit size={24} className="text-white" />
           </div>
           <span className="text-xl font-bold tracking-tight">LifeHub</span>
        </div>

        {/* Manifesto */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-5xl font-extrabold leading-tight mb-6 tracking-tight">
            Your Digital <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Second Brain.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Stop relying on willpower. Offload your thoughts to an AI that organizes your life, tracks your habits, and manages your wallet.
          </p>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-slate-500 font-medium">
          © 2024 LifeHub Inc. • Intelligent Productivity
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full md:w-[55%] bg-[#F8FAFC] flex items-center justify-center p-6 md:p-12 relative">
        <div className="w-full max-w-md animate-slide-up">
           
           {/* Mobile Header */}
           <div className="md:hidden text-center mb-8">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                 <BrainCircuit className="text-white" size={28} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">LifeHub</h2>
              <p className="text-slate-500">Your digital second brain.</p>
           </div>

           <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-xl shadow-slate-200/50 border border-white">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                {isLogin ? 'Welcome Back' : 'Join LifeHub'}
              </h2>

              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-center space-x-3 hover:bg-slate-50 hover:border-slate-300 transition-all group"
              >
                {loading ? (
                    <Loader2 className="animate-spin text-slate-400" size={20} />
                ) : (
                    <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                           <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                           <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                           <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                           <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-slate-700 font-bold text-sm group-hover:text-slate-900">Continue with Google</span>
                    </>
                )}
              </button>

              <div className="relative flex py-6 items-center">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink-0 mx-4 text-slate-300 text-[10px] font-bold uppercase tracking-widest">Or with Email</span>
                  <div className="flex-grow border-t border-slate-100"></div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                      <input
                        type="text"
                        required={!isLogin}
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Your Name"
                        autoComplete="name"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-800 placeholder:text-slate-300 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="you@example.com"
                      autoComplete="username"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-800 placeholder:text-slate-300 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-800 placeholder:text-slate-300 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-rose-50 p-3 rounded-lg animate-in fade-in">
                    <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                    <p className="text-rose-600 text-xs font-medium leading-relaxed">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-slate-900/20 hover:bg-indigo-600 hover:shadow-indigo-500/30 active:scale-[0.98] transition-all flex items-center justify-center space-x-2 mt-6"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => { setIsLogin(!isLogin); setError(''); }}
                  className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {isLogin ? "New to LifeHub? Create an account" : "Already have an account? Sign in"}
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};