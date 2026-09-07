import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import RazorpayCheckoutModal from '../../../components/shared/RazorpayCheckoutModal';
import {
  Building2,
  Users,
  MonitorPlay,
  Zap,
  CreditCard,
  Clock,
  ChevronRight,
  MapPin,
  Calendar,
  TrendingUp,
  ArrowRight,
  Camera,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Mail,
  Send,
  ExternalLink,
  History,
  Lock,
  Sparkles,
  Check,
  X,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  AnimatedCounter,
  containerStagger,
  itemFadeSlide,
} from '../components/MasterMotion';
import { toast } from 'sonner';

export default function MasterDashboard() {
  const { studiosList, pendingRequests, approveStudio, rejectStudio, requestPayment, emailLogs, refreshDashboardData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [apiData, setApiData] = useState<any>(null);
  const [studioSearch, setStudioSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'CONVERTED'>('all');

  // Checkout modal state
  const [selectedCheckoutStudio, setSelectedCheckoutStudio] = useState<any>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Email history drawer state
  const [selectedHistoryStudio, setSelectedHistoryStudio] = useState<any>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Fetch backend master dashboard statistics
  useEffect(() => {
    refreshDashboardData();
    api
      .getMasterDashboard()
      .then((res) => {
        if (res && res.success) {
          setApiData(res.data?.ownerDashboard || res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Compute Metrics from real dynamic backend store
  const totalFreeTrialRegistrations = studiosList.length;
  const pendingRequestsCount = pendingRequests.length;
  const activeTrialsCount = studiosList.filter((s) => s.trialStatus === 'ACTIVE').length;
  const expiringTrialsCount = studiosList.filter((s) => s.trialStatus === 'EXPIRING_SOON').length;
  const expiredTrialsCount = studiosList.filter((s) => s.trialStatus === 'EXPIRED').length;
  const demoRequestsCount = (apiData && apiData.platformStats?.demoRequestsCount) || 18;

  // Compute Payment Metrics
  const paymentPendingCount = studiosList.filter((s) => s.paymentStatus === 'PAYMENT_PENDING' || (s.trialStatus === 'EXPIRED' && s.paymentStatus !== 'PAYMENT_SUCCESS')).length;
  const paymentSuccessCount = studiosList.filter((s) => s.paymentStatus === 'PAYMENT_SUCCESS' || s.trialStatus === 'CONVERTED').length;
  const paymentFailedCount = studiosList.filter((s) => s.paymentStatus === 'PAYMENT_FAILED').length;
  const totalRevenueAmount = studiosList
    .filter((s) => s.paymentStatus === 'PAYMENT_SUCCESS')
    .reduce((sum, s) => sum + (s.amount || 4999), 0);

  // Conversion rate calculation
  const conversionRate = demoRequestsCount > 0 ? ((paymentSuccessCount / demoRequestsCount) * 100).toFixed(1) : '0.0';

  // 5 Months Performance Chart Data
  const performanceChartData = useMemo(() => {
    return [
      { month: 'May', demoRequests: 12, freeTrials: 8, paidStudios: 3 },
      { month: 'Jun', demoRequests: 15, freeTrials: 10, paidStudios: 5 },
      { month: 'Jul', demoRequests: 18, freeTrials: 12, paidStudios: 7 },
      { month: 'Aug', demoRequests: 22, freeTrials: 15, paidStudios: 9 },
      { month: 'Sept', demoRequests: demoRequestsCount, freeTrials: activeTrialsCount + expiringTrialsCount + expiredTrialsCount, paidStudios: paymentSuccessCount },
    ];
  }, [demoRequestsCount, activeTrialsCount, expiringTrialsCount, expiredTrialsCount, paymentSuccessCount]);

  // Detailed Master Table dataset
  const masterTableData = useMemo(() => {
    return studiosList.map((studio) => {
      const isPending = studio.status === 'pending';
      const isExpired = studio.trialStatus === 'EXPIRED' || studio.trialDaysRemaining === 0;
      const isExpiringSoon = studio.trialStatus === 'EXPIRING_SOON' || (studio.trialDaysRemaining === 1);
      const isConverted = studio.paymentStatus === 'PAYMENT_SUCCESS' || studio.trialStatus === 'CONVERTED';

      let computedTrialStatus = studio.trialStatus || 'PENDING';
      if (isPending) computedTrialStatus = 'PENDING';
      else if (isConverted) computedTrialStatus = 'CONVERTED';
      else if (isExpired) computedTrialStatus = 'EXPIRED';
      else if (isExpiringSoon) computedTrialStatus = 'EXPIRING_SOON';
      else computedTrialStatus = 'ACTIVE';

      let computedPaymentStatus = studio.paymentStatus || 'PENDING';
      if (isConverted) computedPaymentStatus = 'PAYMENT_SUCCESS';
      else if (isExpired && computedPaymentStatus === 'PENDING') computedPaymentStatus = 'PAYMENT_PENDING';

      return {
        ...studio,
        trialStatus: computedTrialStatus,
        paymentStatus: computedPaymentStatus,
        daysRemaining: studio.trialDaysRemaining !== undefined ? studio.trialDaysRemaining : (isPending ? 7 : 0),
        amount: studio.amount || 4999,
        formattedEndDate: studio.trialEndDate
          ? new Date(studio.trialEndDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'Pending Approval',
        formattedRegDate: studio.registrationDate
          ? new Date(studio.registrationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'Seed User',
      };
    });
  }, [studiosList]);

  // Filtered Master Table
  const filteredMasterTable = useMemo(() => {
    return masterTableData.filter((row) => {
      const matchSearch =
        row.name.toLowerCase().includes(studioSearch.toLowerCase()) ||
        row.adminEmail.toLowerCase().includes(studioSearch.toLowerCase()) ||
        row.adminName.toLowerCase().includes(studioSearch.toLowerCase());
      if (statusFilter === 'all') return matchSearch;
      return matchSearch && row.trialStatus === statusFilter;
    });
  }, [masterTableData, studioSearch, statusFilter]);

  const handleOpenCheckout = (studio: any) => {
    setSelectedCheckoutStudio(studio);
    setIsCheckoutOpen(true);
  };

  const handleOpenHistory = (studio: any) => {
    setSelectedHistoryStudio(studio);
    setIsHistoryOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* ─── 1. Header Section (Tight Spacing) ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17152B] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#68647A] mt-0.5">
            Monitor studios, demo requests, trials, payments, approvals and platform activity.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigate(location.pathname.startsWith('/great-master') ? '/great-master/approvals' : '/master/approvals')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5B42F3] text-white text-xs font-semibold shadow-md shadow-[#5B42F3]/25 hover:bg-[#4C33E0] transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>Review Access Requests ({pendingRequests.length})</span>
          </button>
        </div>
      </div>

      {/* ─── 2. 5 Business Metric KPI Cards (Immediately Below Header) ─── */}
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {/* Card 1: Total Studios */}
        <motion.div
          variants={itemFadeSlide}
          className="bg-white border border-[#E5E1F2] rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#68647A] uppercase tracking-wider">Total Studios</span>
            <div className="w-9 h-9 rounded-xl bg-[#ECE8FD] text-[#5B42F3] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#17152B]">
              <AnimatedCounter end={totalFreeTrialRegistrations} />
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              +12% <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-[11px] text-[#68647A] mt-1">Active platform accounts</p>
        </motion.div>

        {/* Card 2: Demo Requests */}
        <motion.div
          variants={itemFadeSlide}
          className="bg-white border border-[#E5E1F2] rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#68647A] uppercase tracking-wider">Demo Requests</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MonitorPlay className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#17152B]">
              <AnimatedCounter end={demoRequestsCount} />
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">
              +18% <ArrowUpRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-[11px] text-[#68647A] mt-1">Inbound sales inquiries</p>
        </motion.div>

        {/* Card 3: Free Trials */}
        <motion.div
          variants={itemFadeSlide}
          className="bg-white border border-[#E5E1F2] rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#68647A] uppercase tracking-wider">Free Trials</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#17152B]">
              <AnimatedCounter end={activeTrialsCount + expiringTrialsCount + expiredTrialsCount} />
            </span>
            <span className="text-xs font-semibold text-cyan-600">7-Day Active</span>
          </div>
          <p className="text-[11px] text-[#68647A] mt-1">{expiringTrialsCount} expiring soon</p>
        </motion.div>

        {/* Card 4: Paid Studios */}
        <motion.div
          variants={itemFadeSlide}
          className="bg-white border border-[#E5E1F2] rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#68647A] uppercase tracking-wider">Paid Studios</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#17152B]">
              <AnimatedCounter end={paymentSuccessCount} />
            </span>
            <span className="text-xs font-semibold text-emerald-600">Pro Plan</span>
          </div>
          <p className="text-[11px] text-[#68647A] mt-1">₹{totalRevenueAmount.toLocaleString('en-IN')} revenue</p>
        </motion.div>

        {/* Card 5: Pending Approvals */}
        <motion.div
          variants={itemFadeSlide}
          className="bg-white border border-[#E5E1F2] rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#68647A] uppercase tracking-wider">Pending Approvals</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#17152B]">
              <AnimatedCounter end={pendingRequestsCount} />
            </span>
            <span className="text-xs font-semibold text-rose-600">Action Required</span>
          </div>
          <p className="text-[11px] text-[#68647A] mt-1">Awaiting trial approval</p>
        </motion.div>
      </motion.div>

      {/* ─── 3. Business Overview & Conversion Funnel ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Overview & Conversion Rate */}
        <div className="bg-white border border-[#E5E1F2] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#17152B]">Business Overview</h3>
                <p className="text-xs text-[#68647A]">Track the journey from demo request to paid studio.</p>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-[#ECE8FD] text-[#5B42F3] text-xs font-bold">
                Funnel
              </div>
            </div>

            {/* Visual Conversion Funnel Flow */}
            <div className="mt-6 space-y-3.5">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F6FF] border border-[#E5E1F2]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#17152B]">Demo Requests</div>
                    <div className="text-[11px] text-[#68647A]">Inbound Leads</div>
                  </div>
                </div>
                <div className="text-base font-extrabold text-[#17152B]">{demoRequestsCount}</div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F6FF] border border-[#E5E1F2]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#5B42F3]/10 text-[#5B42F3] flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#17152B]">Free Trials</div>
                    <div className="text-[11px] text-[#68647A]">Approved & Active</div>
                  </div>
                </div>
                <div className="text-base font-extrabold text-[#17152B]">
                  {activeTrialsCount + expiringTrialsCount + expiredTrialsCount}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F6FF] border border-[#E5E1F2]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#17152B]">Paid Studios</div>
                    <div className="text-[11px] text-[#68647A]">Converted Pro Subscriptions</div>
                  </div>
                </div>
                <div className="text-base font-extrabold text-emerald-600">{paymentSuccessCount}</div>
              </div>
            </div>
          </div>

          {/* Conversion Rate Card */}
          <div className="mt-5 p-4 rounded-xl bg-[#ECE8FD]/50 border border-[#E5E1F2] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#68647A]">Conversion Rate</div>
              <div className="text-2xl font-extrabold text-[#5B42F3] mt-0.5">{conversionRate}%</div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Paid / Demo Ratio
              </span>
            </div>
          </div>
        </div>

        {/* ─── 4. Performance Analytics AreaChart ─── */}
        <div className="lg:col-span-2 bg-white border border-[#E5E1F2] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-[#17152B]">Performance Analytics</h3>
              <p className="text-xs text-[#68647A]">Demo requests, trials and paid conversions over the last 5 months.</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Inquiries</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#5B42F3]"></span> Trials</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Paid</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDemo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTrials" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B42F3" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#5B42F3" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#17152B', borderRadius: '12px', color: '#FFF', border: 'none', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="demoRequests" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorDemo)" />
                <Area type="monotone" dataKey="freeTrials" stroke="#5B42F3" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTrials)" />
                <Area type="monotone" dataKey="paidStudios" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPaid)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─── 5. Pending Access Requests Section ─── */}
      {pendingRequests.length > 0 && (
        <div className="bg-white border border-[#E5E1F2] rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-[#17152B]">Pending Access Requests</h3>
              <p className="text-xs text-[#68647A]">New studio registrations waiting for Master Admin 7-day trial approval.</p>
            </div>
            <Link to="/master/approvals" className="text-xs font-semibold text-[#5B42F3] hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.slice(0, 3).map((req) => (
              <div key={req.id} className="p-4 rounded-xl bg-[#F8F6FF] border border-[#E5E1F2] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-sm text-[#17152B]">{req.name}</div>
                    <div className="text-xs text-[#68647A]">{req.adminEmail || (req as any).email}</div>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                    Pending
                  </span>
                </div>

                <div className="text-xs text-[#68647A] flex items-center gap-3">
                  <span>Phone: {req.adminPhone || (req as any).phone}</span>
                  <span>•</span>
                  <span>{req.city || 'Mumbai'}</span>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#E5E1F2]">
                  <button
                    onClick={async () => {
                      await approveStudio(req.id);
                      toast.success(`Approved 7-day free trial for ${req.name}`);
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-[#5B42F3] text-white text-xs font-semibold hover:bg-[#4C33E0] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve Trial
                  </button>
                  <button
                    onClick={async () => {
                      await rejectStudio(req.id);
                      toast.error(`Rejected access for ${req.name}`);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200 hover:bg-rose-100 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 6. Master Studio Directory Table ─── */}
      <div className="bg-white border border-[#E5E1F2] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-[#17152B]">Studio Directory & Trial Tracking</h3>
            <p className="text-xs text-[#68647A]">Master Table listing all registered photography studios, trial timelines, and payment statuses.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search studio or email..."
                value={studioSearch}
                onChange={(e) => setStudioSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-xl border border-[#E5E1F2] bg-[#F8F6FF] text-xs text-[#17152B] focus:outline-none focus:border-[#5B42F3] w-56"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-[#E5E1F2] bg-[#F8F6FF] text-xs text-[#17152B] focus:outline-none focus:border-[#5B42F3]"
            >
              <option value="all">All Trial Statuses</option>
              <option value="ACTIVE">Active Trial</option>
              <option value="EXPIRING_SOON">Expiring Soon</option>
              <option value="EXPIRED">Expired Trial</option>
              <option value="CONVERTED">Paid / Converted</option>
              <option value="PENDING">Pending Approval</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E5E1F2]">
          <table className="w-full text-left text-xs text-[#17152B]">
            <thead className="bg-[#F8F6FF] text-[#68647A] uppercase text-[10px] font-bold border-b border-[#E5E1F2]">
              <tr>
                <th className="py-3 px-4">Studio / User</th>
                <th className="py-3 px-4">Trial Status</th>
                <th className="py-3 px-4">Trial End Date</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E1F2]">
              {filteredMasterTable.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#68647A] text-xs">
                    No matching studios found.
                  </td>
                </tr>
              ) : (
                filteredMasterTable.map((studio) => {
                  const isConverted = studio.paymentStatus === 'PAYMENT_SUCCESS' || studio.trialStatus === 'CONVERTED';
                  const isExpired = studio.trialStatus === 'EXPIRED';
                  const isExpiringSoon = studio.trialStatus === 'EXPIRING_SOON';
                  const isPending = studio.trialStatus === 'PENDING';

                  return (
                    <tr key={studio.id} className="hover:bg-[#F8F6FF]/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#17152B]">{studio.name}</div>
                        <div className="text-[11px] text-[#68647A]">{studio.adminEmail}</div>
                      </td>
                      <td className="py-3 px-4">
                        {isConverted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            PRO ACTIVE
                          </span>
                        ) : isExpired ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            TRIAL EXPIRED
                          </span>
                        ) : isExpiringSoon ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            EXPIRING ({studio.daysRemaining}d left)
                          </span>
                        ) : isPending ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            PENDING APPROVAL
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">
                            ACTIVE ({studio.daysRemaining}d left)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#68647A] font-medium">{studio.formattedEndDate}</td>
                      <td className="py-3 px-4">
                        {isConverted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            SUCCESS
                          </span>
                        ) : studio.paymentStatus === 'PAYMENT_PENDING' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            PAYMENT REQUESTED
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#17152B]">₹{(studio.amount || 4999).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {!isConverted && (
                            <button
                              onClick={async () => {
                                await requestPayment(studio.id);
                                toast.success(`Payment request email dispatched to ${studio.adminEmail}`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#5B42F3] text-white text-[11px] font-semibold hover:bg-[#4C33E0] transition-colors cursor-pointer"
                            >
                              Request Payment
                            </button>
                          )}
                          {!isConverted && (
                            <button
                              onClick={() => handleOpenCheckout(studio)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                            >
                              Pay Now
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenHistory(studio)}
                            className="px-2 py-1 rounded-lg bg-[#F8F6FF] text-[#5B42F3] text-[11px] font-semibold border border-[#E5E1F2] hover:bg-[#ECE8FD] transition-colors cursor-pointer"
                            title="View Email Logs"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 7. Razorpay Checkout Modal Integration ─── */}
      {selectedCheckoutStudio && (
        <RazorpayCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          studio={selectedCheckoutStudio}
          onSuccess={() => {
            refreshDashboardData();
            setIsCheckoutOpen(false);
          }}
        />
      )}

      {/* ─── 8. Email Activity History Drawer ─── */}
      <AnimatePresence>
        {isHistoryOpen && selectedHistoryStudio && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#E5E1F2]">
                  <div>
                    <h3 className="font-bold text-lg text-[#17152B]">Email Activity Logs</h3>
                    <p className="text-xs text-[#68647A]">{selectedHistoryStudio.name}</p>
                  </div>
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-6 space-y-4">
                  {emailLogs.filter((log) => log.recipientEmail?.toLowerCase() === selectedHistoryStudio.adminEmail?.toLowerCase()).length === 0 ? (
                    <div className="text-center py-8 text-xs text-[#68647A]">
                      No recorded email dispatches for this studio yet.
                    </div>
                  ) : (
                    emailLogs
                      .filter((log) => log.recipientEmail?.toLowerCase() === selectedHistoryStudio.adminEmail?.toLowerCase())
                      .map((log) => (
                        <div key={log.id} className="p-3.5 rounded-xl bg-[#F8F6FF] border border-[#E5E1F2] space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-[#5B42F3]">{log.templateType}</span>
                            <span className="text-[10px] text-[#68647A]">
                              {new Date(log.sentAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-[#17152B]">{log.subject}</div>
                          <div className="text-[11px] text-[#68647A]">To: {log.recipientEmail}</div>
                          <div className="pt-1 flex items-center justify-between text-[10px]">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                              {log.status}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E1F2]">
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="w-full py-2 rounded-xl bg-[#F8F6FF] text-[#17152B] font-semibold text-xs border border-[#E5E1F2] hover:bg-[#ECE8FD] transition-colors"
                >
                  Close Drawer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
