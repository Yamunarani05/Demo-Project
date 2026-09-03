import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Camera,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset errors
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    let hasError = false;

    // Validate email
    if (!email.trim()) {
      setEmailError('Please enter your email');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    }

    // Validate password
    if (!password) {
      setPasswordError('Please enter your password');
      hasError = true;
    }

    if (hasError) return;

    setIsLoading(true);

    try {
      const result = await login(email.trim(), password);
      toast.success(`Welcome back, ${result.user.name}!`, {
        description:
          result.user.role === 'super_admin'
            ? 'Logged in to Great Master Admin Overview.'
            : `Logged in to ${result.studio?.name || 'Studio'} Workspace.`,
      });

      if (result.user.role === 'super_admin') {
        navigate('/master/dashboard');
      } else {
        navigate('/studio/dashboard');
      }
    } catch (err: any) {
      const msg = err?.message || 'Invalid email or password';
      setGeneralError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative overflow-hidden">
      {/* Soft ambient background aura */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-100/50 blur-[130px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-indigo-100/40 blur-[100px] rounded-full pointer-events-none -z-0" />

      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md relative z-10">
        <Link to="/" className="flex items-center gap-3 text-slate-900 group">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-900/20 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-wider uppercase font-display leading-tight text-slate-900">
              DEMO PROJECT
            </div>
            <div className="text-[10px] text-purple-600 font-bold tracking-widest uppercase">
              Studio Login
            </div>
          </div>
        </Link>

        <Link
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-purple-700 px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/60"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Existing Studio Login</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              Sign in to your studio workspace and continue managing your photography business.
            </p>
          </div>

          {/* Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {generalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold flex items-center gap-2">
                <span>⚠</span>
                <span>{generalError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); setGeneralError(''); }}
                  placeholder="your@email.com"
                  className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    emailError || generalError
                      ? 'border-red-400 focus:ring-red-400/40'
                      : 'border-slate-200 focus:ring-purple-500'
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-xs text-red-500 mt-1.5 pl-1 flex items-center gap-1">
                  <span>⚠</span> {emailError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Password</span>
                <button
                  type="button"
                  className="text-[11px] text-purple-600 font-semibold hover:underline normal-case cursor-pointer"
                  onClick={() => toast.info('Please contact your administrator to reset your password.')}
                >
                  Forgot password?
                </button>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(''); setGeneralError(''); }}
                  placeholder="Enter your password"
                  className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    passwordError || generalError
                      ? 'border-red-400 focus:ring-red-400/40'
                      : 'border-slate-200 focus:ring-purple-500'
                  }`}
                />
              </div>
              {passwordError && (
                <p className="text-xs text-red-500 mt-1.5 pl-1 flex items-center gap-1">
                  <span>⚠</span> {passwordError}
                </p>
              )}
            </div>

            {/* Primary Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#5E35B1] hover:bg-[#512DA8] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Cross-link to Sign Up */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              New here?{' '}
              <Link
                to="/signup"
                className="text-purple-700 font-semibold hover:underline"
              >
                Create your studio account &rarr;
              </Link>
            </p>
          </div>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 relative z-10">
        Demo Project · Week 12 Scope · Studio Admin Portal
      </footer>
    </div>
  );
}
