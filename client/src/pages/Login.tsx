import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Camera,
  ArrowLeft,
  Shield,
  Clapperboard,
  Building2,
  ExternalLink,
  AlertCircle,
  Eye,
  EyeOff,
  TrendingUp,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';

type PortalType = 'studio' | 'master_admin' | 'preproduction' | 'postproduction' | 'sales';

interface PresetAccount {
  portal: PortalType;
  title: string;
  badge: string;
  email: string;
  pass: string;
  targetRoute: string;
  description: string;
}

const PRESET_ACCOUNTS: PresetAccount[] = [
  {
    portal: 'preproduction',
    title: 'Preproduction Admin (Pre & Event)',
    badge: 'Preproduction & Event',
    email: 'preprodadmin@gmail.com',
    pass: '12345678',
    targetRoute: 'http://localhost:5178/login',
    description: 'Shoot assignments, event coordinator schedules, media raw uploads & Phase 1/Event QC.',
  },
];

const PORTAL_THEMES = {
  studio: {
    name: 'Studio Workspace',
    headline: 'Studio Aurora',
    tagline: 'Manage client bookings, milestone deliverables, and creative photo workflows with seamless AI culling.',
    bgHexStroke: '%23e9d5ff', // soft purple
    bgColor: '#faf5ff',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-200',
    badgeIconColor: 'text-purple-600',
    badgeLabel: 'Studio Workspace Portal',
    glowColor: 'bg-purple-300/40',
    illustration: '/login_illustration.png',
    cardBorder: 'border-purple-200/90',
    cardShadow: 'shadow-[0_20px_60px_-15px_rgba(94,53,177,0.20)]',
    tabActive: 'bg-white text-purple-700 shadow-md border-purple-200 ring-1 ring-purple-300/50',
    calloutBg: 'bg-purple-50/90 border-purple-200 text-purple-950',
    calloutDot: 'bg-purple-600',
    btnBg: 'bg-gradient-to-r from-[#5E35B1] to-[#7C3AED] hover:from-[#512DA8] hover:to-[#6D28D9] text-white shadow-[0_8px_20px_-6px_rgba(94,53,177,0.5)]',
    inputFocus: 'focus:border-purple-500',
    chipActive: 'bg-purple-50 border-purple-300 ring-1 ring-purple-400/40',
    chipBadge: 'text-purple-700 border-purple-200 bg-white',
    redirectNotice: 'Destination: Studio Dashboard on Demo Platform',
    btnText: 'Continue to Studio Workspace',
  },
  master_admin: {
    name: 'Master Admin',
    headline: 'Demo Master Admin',
    tagline: 'Oversee studio sales, track client invoices, audit revenue, and orchestrate business operations across departments.',
    bgHexStroke: '%23ddd6fe', // rich indigo/purple stroke
    bgColor: '#f8f7ff', // crisp executive lavender-slate
    badgeBg: 'bg-indigo-100 text-indigo-950 border-indigo-200',
    badgeIconColor: 'text-indigo-600',
    badgeLabel: 'Demo Master Admin Portal',
    glowColor: 'bg-indigo-300/40',
    illustration: '/photographer.png',
    cardBorder: 'border-indigo-200/90',
    cardShadow: 'shadow-[0_20px_60px_-15px_rgba(67,56,202,0.22)]',
    tabActive: 'bg-white text-indigo-800 shadow-md border-indigo-200 ring-1 ring-indigo-300/50',
    calloutBg: 'bg-indigo-50/90 border-indigo-200 text-indigo-950',
    calloutDot: 'bg-indigo-600',
    btnBg: 'bg-gradient-to-r from-[#4338CA] via-[#5E35B1] to-[#6D28D9] hover:from-[#3730A3] hover:to-[#5B21B6] text-white shadow-[0_8px_20px_-6px_rgba(67,56,202,0.5)]',
    inputFocus: 'focus:border-indigo-500',
    chipActive: 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400/40',
    chipBadge: 'text-indigo-800 border-indigo-200 bg-white',
    redirectNotice: 'Destination: Master Admin Dashboard (:5176 / :5173)',
    btnText: 'Continue to Master Admin',
  },
  preproduction: {
    name: 'Preproduction & Event',
    headline: 'Preproduction & Event',
    tagline: 'Coordinate shoot dates, event raw data verification, assign photographers & drones, and manage Phase 1 & Event approvals.',
    bgHexStroke: '%23bae6fd', // sky cyan stroke
    bgColor: '#f0f9ff', // sky-50
    badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
    badgeIconColor: 'text-sky-600',
    badgeLabel: 'Preproduction & Event Pipeline',
    glowColor: 'bg-sky-300/45',
    illustration: '/3d_photographer.png',
    cardBorder: 'border-sky-200/90',
    cardShadow: 'shadow-[0_20px_60px_-15px_rgba(14,165,233,0.22)]',
    tabActive: 'bg-white text-sky-800 shadow-md border-sky-300 ring-1 ring-sky-400/50',
    calloutBg: 'bg-sky-50/90 border-sky-200 text-sky-950',
    calloutDot: 'bg-sky-500',
    btnBg: 'bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white shadow-[0_8px_20px_-6px_rgba(14,165,233,0.5)]',
    inputFocus: 'focus:border-sky-500',
    chipActive: 'bg-sky-50 border-sky-300 ring-1 ring-sky-400/40',
    chipBadge: 'text-sky-800 border-sky-300 bg-white',
    redirectNotice: 'Destination: http://localhost:5178/login',
    btnText: 'Go to Preproduction',
  },
  postproduction: {
    name: 'Postproduction',
    headline: 'Postproduction Module',
    tagline: 'Assign video editors, retouch artists, album designers, track rework requests, and oversee final client deliveries.',
    bgHexStroke: '%23fed7aa', // warm amber stroke
    bgColor: '#fffdf5', // warm cream
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    badgeIconColor: 'text-amber-600',
    badgeLabel: 'Postproduction Pipeline Portal',
    glowColor: 'bg-amber-300/40',
    illustration: '/login_illustration.png',
    cardBorder: 'border-amber-200/90',
    cardShadow: 'shadow-[0_20px_60px_-15px_rgba(217,119,6,0.22)]',
    tabActive: 'bg-white text-amber-800 shadow-md border-amber-300 ring-1 ring-amber-400/50',
    calloutBg: 'bg-amber-50/90 border-amber-200 text-amber-950',
    calloutDot: 'bg-amber-500',
    btnBg: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white shadow-[0_8px_20px_-6px_rgba(217,119,6,0.5)]',
    inputFocus: 'focus:border-amber-500',
    chipActive: 'bg-amber-50 border-amber-300 ring-1 ring-amber-400/40',
    chipBadge: 'text-amber-800 border-amber-300 bg-white',
    redirectNotice: 'Destination: http://localhost:5178/post-production-crm',
    btnText: 'Continue to Postproduction (:5178)',
  },
  sales: {
    name: 'Sales & Invoices',
    headline: 'Demo Sales & CRM',
    tagline: 'Manage prospective leads, draft client quotations, monitor invoice settlements, and track sales revenue.',
    bgHexStroke: '%23fed7aa', // warm amber stroke
    bgColor: '#fffdf5', // amber-50/20 warm cream
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    badgeIconColor: 'text-amber-600',
    badgeLabel: 'Sales & CRM Pipeline Portal',
    glowColor: 'bg-amber-300/40',
    illustration: '/login_illustration.png',
    cardBorder: 'border-amber-200/90',
    cardShadow: 'shadow-[0_20px_60px_-15px_rgba(217,119,6,0.22)]',
    tabActive: 'bg-white text-amber-800 shadow-md border-amber-300 ring-1 ring-amber-400/50',
    calloutBg: 'bg-amber-50/90 border-amber-200 text-amber-950',
    calloutDot: 'bg-amber-500',
    btnBg: 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white shadow-[0_8px_20px_-6px_rgba(217,119,6,0.5)]',
    inputFocus: 'focus:border-amber-500',
    chipActive: 'bg-amber-50 border-amber-300 ring-1 ring-amber-400/40',
    chipBadge: 'text-amber-800 border-amber-300 bg-white',
    redirectNotice: 'Destination: http://localhost:5175/admin/dashboard',
    btnText: 'Continue to Sales Portal (:5175)',
  },
};

export default function Login() {
  const navigate = useNavigate();
  const {
    loginAsStudioAdmin,
    loginAsMasterAdmin,
    loginAsPreproduction,
    loginAsSales,
    loginAsGreatMaster,
    studiosList,
  } = useAuth();

  const [activePortal, setActivePortal] = useState<PortalType>('preproduction');
  const [email, setEmail] = useState('preprodadmin@gmail.com');
  const [password, setPassword] = useState('12345678');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentTheme = PORTAL_THEMES[activePortal];

  // Dynamic SVG Hexagon background
  const dynamicHexPattern = `url("data:image/svg+xml,%3Csvg width='60' height='103.92305' viewBox='0 0 60 103.92305' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 103.92305L0 86.60254V51.96152L30 34.64102l30 17.3205v34.64102L30 103.92305zM30 0l30 17.32051v34.64102M0 17.32051L30 0 M0 51.96152V17.32051' fill='none' stroke='${currentTheme.bgHexStroke}' stroke-width='2' stroke-opacity='0.7'/%3E%3C/svg%3E")`;

  // Sync default credentials when portal tab changes
  const handleSelectPortal = (portal: PortalType) => {
    setActivePortal(portal);
    setEmailError('');
    setPasswordError('');
    setEmail('preprodadmin@gmail.com');
    setPassword('12345678');
  };

  // Quick preset loader
  const applyPreset = (preset: PresetAccount) => {
    setActivePortal(preset.portal);
    setEmail(preset.email);
    setPassword(preset.pass);
    setEmailError('');
    setPasswordError('');
    toast.info(`Selected ${preset.title}`, {
      description: `Loaded demo credentials (${preset.email})`,
    });
  };

  // Auto-detect portal if user types custom email
  useEffect(() => {
    const trimmed = email.trim().toLowerCase();
    if (trimmed.includes('masteradmin') || trimmed === 'master@greatmaster.io') {
      if (activePortal !== 'master_admin') setActivePortal('master_admin');
    } else if (trimmed.includes('postprod') || trimmed.includes('operational')) {
      if (activePortal !== 'postproduction') setActivePortal('postproduction');
    } else if (trimmed.includes('preprod')) {
      if (activePortal !== 'preproduction') setActivePortal('preproduction');
    } else if (trimmed.includes('sales') || trimmed === 'admin@gmail.com' || trimmed === 'demoemp@gmail.com') {
      if (activePortal !== 'sales') setActivePortal('sales');
    }
  }, [email]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setEmailError('Please enter an email address.');
      return;
    }
    if (!password) {
      setPasswordError('Please enter a password.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Master Admin Authentication
      if (activePortal === 'master_admin' || cleanEmail.includes('masteradmin') || cleanEmail === 'master@greatmaster.io') {
        let authUser: any = null;
        let authToken: string = `master_token_${Date.now()}`;

        try {
          const resp = await fetch('http://127.0.0.1:5171/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password }),
          }).catch(() => null);

          if (resp && resp.ok) {
            const data = await resp.json();
            if (data.token) {
              authToken = data.token;
              authUser = data.user;
            }
          }
        } catch (err) {
          console.warn('Master Admin API direct check skipped or offline:', err);
        }

        if (cleanEmail === 'master@greatmaster.io') {
          loginAsGreatMaster();
          toast.success('Welcome, Great Master!', {
            description: 'Logged into Global Platform Administration.',
          });
          navigate('/master/dashboard');
          return;
        }

        loginAsMasterAdmin({
          name: authUser?.name || 'Master Administrator',
          email: cleanEmail,
          token: authToken,
        });

        toast.success('Master Admin Authenticated!', {
          description: 'Logged in to Master Admin Dashboard.',
          action: {
            label: 'Open Standalone (5176)',
            onClick: () => window.open('http://127.0.0.1:5176', '_blank'),
          },
        });
        navigate('/master/dashboard');
        return;
      }

      // 2. Preproduction Authentication
      if (activePortal === 'preproduction' || cleanEmail.includes('preprod')) {
        let authUser: any = null;
        let authToken: string = `preprod_token_${Date.now()}`;

        try {
          const resp = await fetch('http://localhost:5005/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password }),
          }).catch(() => null);

          if (resp && resp.ok) {
            const data = await resp.json();
            if (data.success && data.data) {
              authToken = data.data.token;
              authUser = data.data.user;
            }
          }
        } catch (err) {
          console.warn('Preproduction API direct check skipped or offline:', err);
        }

        loginAsPreproduction({
          name: authUser?.name || 'Preproduction Administrator',
          email: cleanEmail,
          token: authToken,
          role: authUser?.role || 'pre-production-crm',
        });

        toast.success('Preproduction & Event Authenticated!', {
          description: 'Redirecting to Preproduction & Event (http://localhost:5178/admin/dashboard)...',
        });

        const targetUrl = new URL('http://localhost:5178/admin/dashboard');
        if (authToken) {
          targetUrl.searchParams.set('token', authToken);
        }
        if (authUser) {
          targetUrl.searchParams.set('user', JSON.stringify(authUser));
        }

        setTimeout(() => {
          window.location.href = targetUrl.toString();
        }, 300);
        return;
      }

      // 2b. Postproduction Authentication
      if (activePortal === 'postproduction' || cleanEmail.includes('postprod') || cleanEmail.includes('operational')) {
        let authUser: any = { role: 'post-production-crm', name: 'Post-production Manager', email: cleanEmail };
        let authToken: string = `postprod_token_${Date.now()}`;

        try {
          const resp = await fetch('http://localhost:5005/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password }),
          }).catch(() => null);

          if (resp && resp.ok) {
            const data = await resp.json();
            if (data.success && data.data) {
              authToken = data.data.token;
              authUser = data.data.user;
            }
          }
        } catch (err) {
          console.warn('Postproduction API direct check skipped or offline:', err);
        }

        loginAsPreproduction({
          name: authUser?.name || 'Postproduction Manager',
          email: cleanEmail,
          token: authToken,
          role: authUser?.role || 'post-production-crm',
        });

        toast.success('Postproduction Authenticated!', {
          description: 'Redirecting to Postproduction Module (http://localhost:5178/post-production-crm)...',
        });

        const targetUrl = new URL('http://localhost:5178/post-production-crm');
        if (authToken) {
          targetUrl.searchParams.set('token', authToken);
        }
        if (authUser) {
          targetUrl.searchParams.set('user', JSON.stringify(authUser));
        }

        setTimeout(() => {
          window.location.href = targetUrl.toString();
        }, 300);
        return;
      }

      // 3. Sales Portal Authentication
      if (activePortal === 'sales' || cleanEmail.includes('sales') || cleanEmail === 'admin@gmail.com' || cleanEmail === 'demoemp@gmail.com') {
        let authUser: any = null;
        let authToken: string = `sales_token_${Date.now()}`;
        let userRole: string = 'admin';
        let userId: string = '1';
        let fullName: string = 'Sales Administrator';

        try {
          const resp = await fetch('http://localhost:5002/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail, password }),
          }).catch(() => null);

          if (resp && resp.ok) {
            const data = await resp.json();
            if (data.token) {
              authToken = data.token;
              userRole = data.role || 'admin';
              userId = String(data.userId ?? data.id ?? data.adminId ?? data.employeeId ?? '1');
              fullName = data.fullName || 'Sales Administrator';
              authUser = data;
            }
          }
        } catch (err) {
          console.warn('Sales API direct check skipped or offline:', err);
        }

        loginAsSales({
          name: fullName,
          email: cleanEmail,
          token: authToken,
          role: userRole,
          userId,
        });

        toast.success('Sales Portal Authenticated!', {
          description: 'Redirecting to Sales Management (http://localhost:5175)...',
        });

        const targetUrl = new URL('http://localhost:5175');
        if (authToken) targetUrl.searchParams.set('token', authToken);
        if (userRole) targetUrl.searchParams.set('role', userRole);
        if (userId) targetUrl.searchParams.set('userId', userId);
        if (fullName) targetUrl.searchParams.set('fullName', fullName);

        if (userRole === 'admin') {
          targetUrl.searchParams.set('redirect', '/admin/dashboard');
        } else if (userRole === 'employee') {
          targetUrl.searchParams.set('redirect', '/employee/employee-profile');
        } else if (userRole === 'partner') {
          targetUrl.searchParams.set('redirect', '/partner/dashboard');
        }

        setTimeout(() => {
          window.location.href = targetUrl.toString();
        }, 300);
        return;
      }

      // 4. Studio Admin Authentication (Default)
      const studio = studiosList[0];
      loginAsStudioAdmin(studio?.id || 'studio_1');
      toast.success(`Welcome back, ${studio?.adminName || 'Admin'}!`, {
        description: `Logged into ${studio?.name || 'Studio'} Workspace.`,
      });
      navigate('/studio/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setEmailError('Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans transition-colors duration-500"
      style={{
        backgroundColor: currentTheme.bgColor,
        backgroundImage: dynamicHexPattern,
        backgroundSize: '100px 173.205px',
        backgroundPosition: 'center',
      }}
    >
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-14px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Top Navbar with Demo Project Branding */}
      <header className="max-w-6xl w-full mx-auto px-2 py-3 flex items-center justify-between relative z-20">
        <Link to="/" className="flex items-center gap-3 text-slate-900 group">
          <div className="w-10 h-10 rounded-2xl bg-[#5E35B1] flex items-center justify-center text-white shadow-md shadow-purple-900/20 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-wider uppercase font-display leading-tight text-slate-900">
              DEMO PROJECT
            </span>
            <span className="text-[10px] text-purple-600 tracking-widest uppercase font-bold -mt-0.5">
              Photography Management SaaS
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="http://127.0.0.1:5176"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200/80 bg-white/90 hover:bg-white text-xs font-semibold text-slate-700 hover:text-indigo-700 transition-all shadow-sm"
            title="Open Standalone Master Admin app on port 5176"
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>Master Admin (:5176)</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          <a
            href="http://localhost:5175"
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200/80 bg-white/90 hover:bg-white text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-all shadow-sm"
            title="Open Standalone Sales app on port 5175"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sales (:5175)</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          <a
            href="http://localhost:5178/pre-production-crm"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-200/80 bg-white/90 hover:bg-white text-xs font-semibold text-slate-700 hover:text-sky-700 transition-all shadow-sm"
            title="Open Preproduction & Event Module on port 5178"
          >
            <Clapperboard className="w-3.5 h-3.5 text-sky-600" />
            <span>Preprod (:5178)</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          <a
            href="http://localhost:5178/post-production-crm"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200/80 bg-white/90 hover:bg-white text-xs font-semibold text-slate-700 hover:text-amber-700 transition-all shadow-sm"
            title="Open Postproduction Module on port 5178"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Postprod (:5178)</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white/90 hover:bg-white text-xs font-semibold text-slate-700 hover:text-purple-700 transition-all shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* Main 2-Column Section */}
      <main className="flex-1 flex items-center justify-center my-auto py-6 relative z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left Hero Side with Distinct Artwork & Glowing Backdrop */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePortal}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:flex flex-col justify-center text-left select-none"
            >
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold mb-4 w-max shadow-sm transition-colors ${currentTheme.badgeBg}`}
              >
                <Sparkles className={`w-3.5 h-3.5 ${currentTheme.badgeIconColor}`} />
                <span>{currentTheme.badgeLabel}</span>
              </div>

              <h1 className="text-4xl lg:text-[2.75rem] font-bold text-slate-900 tracking-tight leading-tight mb-4 font-display">
                {currentTheme.headline}
              </h1>

              <p className="text-slate-600 text-base max-w-md mb-8 leading-relaxed">
                {currentTheme.tagline}
              </p>

              {/* Dynamic Photographer Character Art & Portal Glow */}
              <div className="w-full max-w-sm relative pt-4 px-4">
                <div
                  className={`absolute inset-x-6 bottom-0 top-6 rounded-t-full blur-3xl -z-10 transition-colors duration-500 ${currentTheme.glowColor}`}
                />

                <div className="relative overflow-visible pb-2">
                  <img
                    src={currentTheme.illustration}
                    alt={currentTheme.headline}
                    className="w-[115%] -ml-[7%] max-w-none h-auto animate-float transition-transform duration-500 pointer-events-none origin-bottom mix-blend-multiply"
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right Card Side Matching the Active Portal */}
          <div className="flex items-center justify-center col-span-1">
            <motion.div
              key={`card-${activePortal}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`w-full max-w-[420px] bg-white rounded-[1.75rem] p-7 sm:p-9 relative border transition-all duration-500 ${currentTheme.cardBorder} ${currentTheme.cardShadow}`}
            >
              {/* Logo Header Inside Card - Demo Project Brand */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl bg-[#5E35B1] flex items-center justify-center text-white shadow-lg shadow-purple-900/25">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-extrabold text-xl tracking-wider uppercase font-display leading-tight text-slate-900">
                    DEMO PROJECT
                  </span>
                  <span className="text-[10px] text-purple-600 font-bold tracking-widest uppercase -mt-0.5">
                    Photography SaaS Platform
                  </span>
                </div>
              </div>

              {/* Titles */}
              <h2 className="text-2xl font-bold text-slate-900 text-center font-display">
                Sign in
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 text-center mt-1 mb-5">
                Select your portal and enter credentials
              </p>

              {/* Portal Selector Tabs with Demo SaaS Platform Styling */}
              <div className="bg-slate-100/80 p-1 rounded-2xl grid grid-cols-5 gap-1 mb-5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleSelectPortal('studio')}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${activePortal === 'studio'
                      ? 'bg-white text-purple-700 shadow-sm border border-purple-200 ring-1 ring-purple-300/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="truncate">Studio</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPortal('master_admin')}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${activePortal === 'master_admin'
                      ? 'bg-white text-indigo-800 shadow-sm border border-indigo-200 ring-1 ring-indigo-300/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                  <Shield className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">Master</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPortal('sales')}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${activePortal === 'sales'
                      ? 'bg-white text-emerald-800 shadow-sm border border-emerald-300 ring-1 ring-emerald-400/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Sales</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPortal('preproduction')}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${activePortal === 'preproduction'
                      ? 'bg-white text-sky-800 shadow-sm border border-sky-300 ring-1 ring-sky-400/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                  <Clapperboard className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate">Preprod</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPortal('postproduction')}
                  className={`flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${activePortal === 'postproduction'
                      ? 'bg-white text-amber-800 shadow-sm border border-amber-300 ring-1 ring-amber-400/50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                    }`}
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">Postprod</span>
                </button>
              </div>

              {/* Portal Mode Info Callout */}
              <div
                className={`mb-4 px-3.5 py-2.5 rounded-xl border text-xs flex items-center gap-2.5 transition-colors ${currentTheme.calloutBg}`}
              >
                <div className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${currentTheme.calloutDot}`} />
                <span className="font-semibold">{currentTheme.redirectNotice}</span>
              </div>

              {/* Form Error Alert */}
              {emailError && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium bg-red-50 text-red-600 border border-red-100 mb-4 animate-fade-in">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}

              {/* Login Form */}
              {activePortal === 'preproduction' ? (
                <div className="space-y-4">
                  <a
                    href="http://localhost:5178/login"
                    className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex justify-center items-center gap-2 active:scale-[0.98] cursor-pointer ${currentTheme.btnBg}`}
                  >
                    <span>Go to Preproduction</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError('');
                        }}
                        placeholder="name@example.com"
                        required
                        className={`w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:bg-white rounded-xl text-sm text-slate-900 transition-all outline-none placeholder:text-slate-400 ${currentTheme.inputFocus}`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Password
                      </label>
                      <span className="text-[11px] text-slate-400 font-normal">
                        Demo filled
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordError('');
                        }}
                        placeholder="••••••••"
                        required
                        className={`w-full pl-4 pr-11 py-3 bg-slate-50 border-2 border-transparent focus:bg-white rounded-xl text-sm text-slate-900 transition-all outline-none placeholder:text-slate-400 ${currentTheme.inputFocus}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors bg-white px-1.5 py-1 rounded-lg border border-slate-200"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-xs text-red-500 mt-1.5 pl-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {passwordError}
                      </p>
                    )}
                  </div>

                  {/* Primary Submit Button with Themed Gradient */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full mt-2 py-3.5 rounded-xl font-semibold text-sm transition-all flex justify-center items-center gap-2 active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer ${currentTheme.btnBg}`}
                  >
                    {isLoading ? (
                      <span>Authenticating...</span>
                    ) : (
                      <>
                        <span>{currentTheme.btnText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* One-Click Demo Accounts */}
              {activePortal !== 'preproduction' && PRESET_ACCOUNTS.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>Quick Demo Logins (Click to Fill)</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {PRESET_ACCOUNTS.map((preset) => {
                      const isSelected = email === preset.email;
                      return (
                        <button
                          key={preset.title}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className={`text-left p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                              ? preset.portal === 'master_admin'
                                ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-400/40'
                                : preset.portal === 'preproduction'
                                  ? 'bg-sky-50 border-sky-300 ring-1 ring-sky-400/40'
                                  : preset.portal === 'sales'
                                    ? 'bg-amber-50 border-amber-300 ring-1 ring-amber-400/40'
                                    : 'bg-purple-50 border-purple-300 ring-1 ring-purple-400/40'
                              : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/80'
                            }`}
                        >
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs text-slate-800 truncate">
                              {preset.title}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono truncate">
                              {preset.email}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ml-2 ${preset.portal === 'master_admin'
                                ? 'text-indigo-800 border-indigo-200 bg-indigo-50/50'
                                : preset.portal === 'preproduction'
                                  ? 'text-sky-800 border-sky-300 bg-sky-50/50'
                                  : preset.portal === 'sales'
                                    ? 'text-amber-800 border-amber-300 bg-amber-50/50'
                                    : 'text-purple-700 border-purple-200 bg-purple-50/50'
                              }`}
                          >
                            {preset.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bottom links */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                <span>New studio? </span>
                <Link to="/signup" className="text-purple-700 font-semibold hover:underline">
                  Create Studio Account &rarr;
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto px-2 py-3 text-center text-xs text-slate-400 border-t border-slate-200/60 relative z-20">
        Demo SaaS Platform · Modern Photography Business Management Ecosystem
      </footer>
    </div>
  );
}
