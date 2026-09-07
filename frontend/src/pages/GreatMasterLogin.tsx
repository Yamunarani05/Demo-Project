import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Crown,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import PhotographySketchBackground from '../modules/master/components/PhotographySketchBackground';

export default function GreatMasterLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuth();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Validation States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [deniedUserEmail, setDeniedUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Validate form inputs
  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setIsAccessDenied(false);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Please enter your email address');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Please enter your password');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setGeneralError('');
    setIsAccessDenied(false);

    try {
      // 1. Authenticate user via authentication service
      const result = await login(email.trim(), password);

      // 2. Strict Role Verification: Must be Great Master
      const userRole = result.user.role;
      const isGreatMasterRole =
        userRole === 'great_master' ||
        userRole === 'super_admin' ||
        String(userRole).toUpperCase() === 'GREAT_MASTER';

      if (!isGreatMasterRole) {
        // Normal master / studio admin attempted login
        logout(); // Immediately clear non-privileged session
        setDeniedUserEmail(result.user.email);
        setIsAccessDenied(true);
        toast.error('Access Denied: Great Master clearance required.');
        setIsLoading(false);
        return;
      }

      // 3. Confirmed Great Master
      toast.success('Great Master Access Granted', {
        description: `Welcome back, ${result.user.name || 'Platform Administrator'}!`,
      });

      const origin = (location.state as any)?.from?.pathname || '/great-master/dashboard';
      navigate(origin, { replace: true });
    } catch (err: any) {
      console.warn('Great Master login failed:', err);
      const rawMessage = err?.message || '';

      if (rawMessage.toLowerCase().includes('password') || rawMessage.toLowerCase().includes('invalid')) {
        setGeneralError('Invalid email address or password. Please try again.');
      } else if (rawMessage.toLowerCase().includes('network') || rawMessage.toLowerCase().includes('failed to fetch')) {
        setGeneralError('Unable to connect to security server. Please check your connection.');
      } else {
        setGeneralError(rawMessage || 'Authentication failed. Please verify your credentials.');
      }
      toast.error('Sign-in failed', { description: generalError || 'Please check your inputs.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Quick filler for testing demonstration
  const handleFillDemoCredentials = () => {
    setEmail('master@greatmaster.io');
    setPassword('123456789');
    setEmailError('');
    setPasswordError('');
    setGeneralError('');
    setIsAccessDenied(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Animated Photography Sketches in Background */}
      <PhotographySketchBackground />

      {/* Soft ambient background aura matching first white theme */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-100/50 blur-[130px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[250px] bg-indigo-100/40 blur-[100px] rounded-full pointer-events-none -z-0" />

      {/* Top Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md relative z-10">
        <Link to="/" className="flex items-center gap-3 text-slate-900 group">
          <div className="w-10 h-10 rounded-xl bg-[#5B42F3] flex items-center justify-center text-white shadow-md shadow-[#5B42F3]/25 group-hover:scale-105 transition-transform">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-wider uppercase font-display leading-tight text-slate-900">
              DEMO PROJECT
            </div>
            <div className="text-[10px] text-[#5B42F3] font-bold tracking-widest uppercase">
              Great Master Portal
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECE8FD] border border-purple-200/80 text-[11px] font-semibold text-[#5B42F3]">
            <ShieldCheck size={13} className="text-[#5B42F3]" />
            <span>Platform Governance</span>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-purple-700 px-3.5 py-2 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Landing Page</span>
          </Link>
        </div>
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
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ECE8FD] border border-purple-200 text-[#5B42F3] text-xs font-bold mb-3">
              <Crown className="w-3.5 h-3.5" />
              <span>Great Master Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900">
              Welcome back, Great Master
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-sm mx-auto">
              Sign in with your platform master credentials to access system-wide governance and studio oversight.
            </p>
          </div>

          {/* Quick Fill Demo Credentials */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="w-full py-2.5 px-3.5 rounded-xl bg-[#F8F6FF] hover:bg-[#ECE8FD] border border-[#E5E1F2] hover:border-purple-300 transition text-left flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#ECE8FD] group-hover:bg-[#5B42F3] group-hover:text-white text-[#5B42F3] flex items-center justify-center transition-colors">
                  <Sparkles size={12} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-800">
                    Auto-fill Great Master Demo
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    master@greatmaster.io · 123456789
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#E5E1F2] text-[#5B42F3] group-hover:border-purple-300">
                Auto Fill
              </span>
            </button>
          </div>

          {/* Strict Role Denial Alert */}
          {isAccessDenied && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2"
            >
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <ShieldAlert size={16} className="text-rose-600 shrink-0" />
                <span>Access Denied: Clearance Required</span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Your account (<span className="font-semibold">{deniedUserEmail}</span>) does not have Great Master privileges. Normal studio masters must sign in through the Studio Portal.
              </p>
              <div className="pt-1 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition"
                >
                  Go to Studio Login &rarr;
                </button>
                <button
                  type="button"
                  onClick={() => setIsAccessDenied(false)}
                  className="text-xs text-rose-600 hover:underline font-medium"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}

          {/* General Error Alert */}
          {generalError && !isAccessDenied && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-semibold flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Great Master Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                    setGeneralError('');
                  }}
                  placeholder="master@greatmaster.io"
                  className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    emailError
                      ? 'border-red-400 focus:ring-red-400/40'
                      : 'border-slate-200 focus:ring-[#5B42F3]'
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-xs text-red-500 mt-1.5 pl-1 flex items-center gap-1">
                  <span>⚠</span> {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Master Key / Password</span>
                <button
                  type="button"
                  className="text-[11px] text-[#5B42F3] font-semibold hover:underline normal-case cursor-pointer"
                  onClick={() => setIsForgotPasswordOpen(true)}
                >
                  Forgot key?
                </button>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError('');
                    setGeneralError('');
                  }}
                  placeholder="••••••••••••"
                  className={`w-full bg-slate-50 border rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    passwordError
                      ? 'border-red-400 focus:ring-red-400/40'
                      : 'border-slate-200 focus:ring-[#5B42F3]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs text-red-500 mt-1.5 pl-1 flex items-center gap-1">
                  <span>⚠</span> {passwordError}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#5B42F3] focus:ring-[#5B42F3]"
                />
                <span>Remember this terminal</span>
              </label>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <ShieldCheck size={12} className="text-[#5B42F3]" /> Session Secured
              </span>
            </div>

            {/* Primary Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-[#5E35B1] hover:bg-[#512DA8] text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Crown size={15} />
                  <span>Sign In as Great Master</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Cross-links */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Studio Owner or Team Member?{' '}
              <Link
                to="/login"
                className="text-[#5B42F3] font-semibold hover:underline"
              >
                Sign in to Studio Workspace &rarr;
              </Link>
            </p>
            <p className="text-[11px] text-slate-400">
              Need studio onboarding?{' '}
              <Link
                to="/signup"
                className="text-slate-600 font-semibold hover:underline"
              >
                Register a new studio &rarr;
              </Link>
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 relative z-10">
        Demo Project · Platform Security Layer · Great Master Access
      </footer>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotPasswordOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setIsForgotPasswordOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>

              <div className="w-10 h-10 rounded-xl bg-[#ECE8FD] text-[#5B42F3] flex items-center justify-center mb-4">
                <HelpCircle size={20} />
              </div>

              <h3 className="text-base font-bold text-slate-900">
                Reset Great Master Access
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Platform master keys are managed via the secure deployment environment variables and backend database seeders.
              </p>

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Development Access:</div>
                <div>User: <span className="font-mono text-purple-700">master@greatmaster.io</span></div>
                <div>Password: <span className="font-mono text-purple-700">123456789</span></div>
              </div>

              <button
                onClick={() => {
                  handleFillDemoCredentials();
                  setIsForgotPasswordOpen(false);
                }}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#5E35B1] hover:bg-[#512DA8] text-white font-bold text-xs transition"
              >
                Auto-fill & Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
