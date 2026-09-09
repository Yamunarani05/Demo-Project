import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Crown,
  Briefcase,
  Clapperboard,
  ArrowRight,
  ShieldCheck,
  Users,
  Building2,
  CheckCircle2,
  Layers,
  Sparkles,
  Camera,
  Activity,
  FileText,
  DollarSign,
  FolderSync,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ModuleHub() {
  const navigate = useNavigate();
  const { user, logout, role } = useAuth();

  const modules = [
    {
      id: 'great-master',
      title: 'Great Master Portal',
      badge: 'Platform Administration',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Crown,
      iconBg: 'from-amber-500 to-amber-600',
      description:
        'Whole-platform governance: Total Masters, Studios, Platform Revenue, Approvals Queue, Master-wise Performance, and Platform Activity.',
      primaryRoute: '/great-master/dashboard',
      primaryAction: 'Launch Great Master Portal',
      cardBorder: 'hover:border-amber-400 group-hover:shadow-amber-500/10',
      accentColor: 'text-amber-600',
      stats: [
        { label: 'Platform Scope', value: 'Whole-Master' },
        { label: 'Role Access', value: 'Great Master' },
      ],
      quickLinks: [
        { label: 'Executive Dashboard', path: '/great-master/dashboard' },
        { label: 'Masters / Studios Directory', path: '/great-master/masters' },
        { label: 'Approvals Queue', path: '/great-master/approvals' },
        { label: 'Platform Activity', path: '/great-master/activity' },
      ],
    },
    {
      id: 'master-workspace',
      title: 'Master Studio Workspace',
      badge: 'Integrated Studio Operations',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Briefcase,
      iconBg: 'from-[#5E35B1] to-[#7E57C2]',
      description:
        'Individual studio workspace: Studio Dashboard, Clients, Products & Packages, Sales CRM, Pre-Production, Production, Projects, and Payments.',
      primaryRoute: '/master/dashboard',
      primaryAction: 'Enter Master Workspace',
      cardBorder: 'hover:border-purple-400 group-hover:shadow-purple-500/10',
      accentColor: 'text-[#5E35B1]',
      stats: [
        { label: 'Studio Ops', value: 'All-In-One' },
        { label: 'Role Access', value: 'Master & Master Admin' },
      ],
      quickLinks: [
        { label: 'Studio Dashboard', path: '/master/dashboard' },
        { label: 'Products & Packages', path: '/master/products' },
        { label: 'Sales CRM & Leads', path: '/sales/dashboard' },
        { label: 'Pre-Production', path: '/pre-production/dashboard' },
        { label: 'Production Pipeline', path: '/master/workflow' },
      ],
    },
    {
      id: 'sales-client',
      title: 'Sales & Client CRM',
      badge: 'Sales + Pre-Production',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Briefcase,
      iconBg: 'from-indigo-600 to-blue-600',
      description:
        'Integrated lead journey: Leads → Enquiries → Follow-ups → Quotations → Packages → Booking → Pre-Production handoff.',
      primaryRoute: '/sales/dashboard',
      primaryAction: 'Open Sales & Client',
      cardBorder: 'hover:border-indigo-400 group-hover:shadow-indigo-500/10',
      accentColor: 'text-indigo-600',
      stats: [
        { label: 'Pipeline', value: 'Leads & CRM' },
        { label: 'Quotations', value: 'Dynamic PDF' },
      ],
      quickLinks: [
        { label: 'Sales Dashboard', path: '/sales/dashboard' },
        { label: 'Active Leads', path: '/sales/leads' },
        { label: 'Quotation Builder', path: '/sales/quotation' },
        { label: 'Client Invoices', path: '/sales/invoice' },
      ],
    },
    {
      id: 'pre-production',
      title: 'Pre-Production CRM',
      badge: 'Creative Shoot Planning',
      badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
      icon: Clapperboard,
      iconBg: 'from-violet-600 to-purple-700',
      description:
        'Shoot preparation: Crew assignments, raw footage verification, QC approvals, work tracking, and delivery to post-production.',
      primaryRoute: '/pre-production/dashboard',
      primaryAction: 'Launch Pre-Production',
      cardBorder: 'hover:border-violet-400 group-hover:shadow-violet-500/10',
      accentColor: 'text-violet-600',
      stats: [
        { label: 'Shoot Stages', value: 'Phase 1 & 2' },
        { label: 'QC Checking', value: 'Automated' },
      ],
      quickLinks: [
        { label: 'Pre-Prod Dashboard', path: '/pre-production/dashboard' },
        { label: 'Assign Clients', path: '/pre-production/client' },
        { label: 'Raw Data Intake', path: '/pre-production/raw-data' },
        { label: 'QC Approvals', path: '/pre-production/qc-check' },
      ],
    },
    {
      id: 'production',
      title: 'Production & Live Events',
      badge: 'On-Ground Shoot Ops',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: Camera,
      iconBg: 'from-emerald-600 to-teal-600',
      description:
        'Live shoot coordination: On-ground crew schedules, runtime timer tracking, shot checklists, and SD/CF card check-in.',
      primaryRoute: '/production/dashboard',
      primaryAction: 'Open Production Ops',
      cardBorder: 'hover:border-emerald-400 group-hover:shadow-emerald-500/10',
      accentColor: 'text-emerald-600',
      stats: [
        { label: 'Live Events', value: 'Active Tracking' },
        { label: 'Card Check-In', value: 'Zero Data Loss' },
      ],
      quickLinks: [
        { label: 'Production Dashboard', path: '/production/dashboard' },
        { label: 'Shoot Schedules', path: '/production/schedules' },
        { label: 'Live Event Tracker', path: '/production/live-event' },
        { label: 'Media Card Check-In', path: '/production/cards' },
      ],
    },
    {
      id: 'post-production',
      title: 'Post-Production Studio',
      badge: '9-Discipline Editing',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      icon: Layers,
      iconBg: 'from-sky-600 to-blue-600',
      description:
        'Full post-production pipeline: 9 editing disciplines, Pixstudio/Pixoffice local drive management, and multi-tier QC reviews.',
      primaryRoute: '/post-production/tasks',
      primaryAction: 'Launch Post-Production',
      cardBorder: 'hover:border-sky-400 group-hover:shadow-sky-500/10',
      accentColor: 'text-sky-600',
      stats: [
        { label: 'Disciplines', value: '9 Workflows' },
        { label: 'Storage', value: 'Pixstudio / Drive' },
      ],
      quickLinks: [
        { label: 'Task Management', path: '/post-production/tasks' },
        { label: 'Quality Control (QC)', path: '/post-production/qc-check' },
        { label: 'Drive Data Manager', path: '/post-production/data-manager' },
      ],
    },
    {
      id: 'finance',
      title: 'Finance & Invoicing',
      badge: 'Billing & Payments',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: DollarSign,
      iconBg: 'from-rose-600 to-pink-600',
      description:
        'Studio financial control: Dynamic GST invoices, Razorpay checkout, quotation approvals, and client payment tracking.',
      primaryRoute: '/finance/invoices',
      primaryAction: 'Manage Studio Finance',
      cardBorder: 'hover:border-rose-400 group-hover:shadow-rose-500/10',
      accentColor: 'text-rose-600',
      stats: [
        { label: 'Gateway', value: 'Razorpay + UPI' },
        { label: 'Invoicing', value: 'GST Compliant' },
      ],
      quickLinks: [
        { label: 'All Invoices', path: '/finance/invoices' },
        { label: 'Payment Transactions', path: '/finance/payments' },
        { label: 'Finance Approvals', path: '/finance/approvals' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-indigo-50/30 text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-lg border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/20">
              <Camera size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Great Master Platform
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                  Unified SaaS
                </span>
              </h1>
              <p className="text-xs text-slate-500">Modern Multi-Studio Photography Workflow</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="font-semibold text-slate-800">{user.name || user.email}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-600 text-white">
                  {role || user.role}
                </span>
                <button
                  onClick={() => logout()}
                  className="text-slate-400 hover:text-red-600 transition-colors p-1"
                  title="Log out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-700 transition shadow-sm"
              >
                Sign In
              </Link>
            )}

            <Link
              to="/"
              className="text-xs font-medium text-slate-500 hover:text-slate-900 transition flex items-center gap-1 pl-2 border-l border-slate-200"
            >
              Public Site <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100/70 border border-purple-200 text-purple-800 text-xs font-semibold mb-3">
            <Sparkles size={13} className="text-purple-600" />
            Unified Workspace Hub
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Select Your Operating Module
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Access all business, creative, and technical workflows from one centralized platform.
            Switch between modules anytime using the integrated topbar navigation.
          </p>
        </div>

        {/* Workflow Roadmap Banner */}
        <div className="mb-10 p-4 bg-white/80 backdrop-blur rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">Unified Architecture Pipeline</h3>
              <p className="text-[11px] text-slate-500">
                Landing Page → Authentication → Module Selection Hub → Dedicated Studio Tools
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              API Server :5000 Online
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              Frontend :5173 Ready
            </span>
          </div>
        </div>

        {/* Module Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((mod, index) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`group bg-white rounded-3xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 ${mod.cardBorder}`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod.iconBg} flex items-center justify-center text-white shadow-md`}
                    >
                      <Icon size={24} />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border uppercase tracking-wider ${mod.badgeColor}`}
                    >
                      {mod.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-900 transition-colors">
                    {mod.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed min-h-[54px]">
                    {mod.description}
                  </p>

                  {/* Stats snippet */}
                  <div className="grid grid-cols-2 gap-2 mt-4 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 text-center">
                    {mod.stats.map((s, i) => (
                      <div key={i}>
                        <div className="text-[10px] text-slate-400 font-medium uppercase">{s.label}</div>
                        <div className="text-xs font-bold text-slate-800">{s.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Links */}
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                      Key Pages & Workflows
                    </div>
                    <ul className="space-y-1.5">
                      {mod.quickLinks.map((link, i) => (
                        <li key={i}>
                          <button
                            onClick={() => navigate(link.path)}
                            className="w-full text-left text-xs text-slate-600 hover:text-purple-600 hover:bg-purple-50/60 px-2 py-1 rounded-lg transition-colors flex items-center justify-between group/link"
                          >
                            <span>{link.label}</span>
                            <ArrowRight
                              size={12}
                              className="opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-purple-600"
                            />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Primary Button */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => navigate(mod.primaryRoute)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm group-hover:shadow-md"
                  >
                    <span>{mod.primaryAction}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
