import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  UserCheck,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Send
} from 'lucide-react';

interface SalesWorkflowStepperProps {
  leadsCount?: number;
  quotesCount?: number;
  clientsCount?: number;
  className?: string;
}

export default function SalesWorkflowStepper({
  leadsCount = 7,
  quotesCount = 4,
  clientsCount = 3,
  className = '',
}: SalesWorkflowStepperProps) {
  const steps = [
    {
      id: 1,
      title: '1. Lead Inquiry',
      subtitle: 'Inquiries & Qualifications',
      badge: `${leadsCount} Active`,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Users,
      iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
      link: '/sales/leads',
      description: 'Capture Instagram, web & referral leads into the pipeline board.',
    },
    {
      id: 2,
      title: '2. Quotation Engine',
      subtitle: 'Custom Pricing & Add-ons',
      badge: `${quotesCount} Sent`,
      badgeColor: 'bg-purple-100 text-[#5B42F3] border-purple-200',
      icon: FileText,
      iconBg: 'bg-purple-50 text-[#5B42F3] border-purple-200',
      link: '/sales/quotations',
      description: 'Auto-calculate packages, deliverables, discounts & 18% GST.',
    },
    {
      id: 3,
      title: '3. Client Decision',
      subtitle: 'Signed Contract & Advance',
      badge: `${clientsCount} Converted`,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: UserCheck,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      link: '/sales/clients',
      description: 'Proposal accepted, 30% advance recorded, onboarding triggered.',
    },
    {
      id: 4,
      title: '4. Pre-Production',
      subtitle: 'Shoot Project Handover',
      badge: 'Live Handover',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Layers,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      link: '/pre-production/dashboard',
      description: 'Instant project creation with moodboards, shotlists & crew.',
      isExternalModule: true,
    },
  ];

  return (
    <div className={`bg-white border border-[#E5E1F2] rounded-2xl p-5 sm:p-6 shadow-xs relative overflow-hidden ${className}`}>
      {/* Decorative subtle ambient gradient in corner */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-100/40 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Header of the workflow with animated pulse badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#5B42F3] bg-[#ECE8FD] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5B42F3] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#5B42F3]"></span>
              </span>
              Lumina Sales & Client Lifecycle
            </span>
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
              Continuous Automated Pipeline
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#17152B] tracking-tight mt-1">
            Seamless 4-Stage Workflow: From Inquiry to Production
          </h2>
        </div>

        {/* Action Link to Pre-Production */}
        <Link
          to="/pre-production/dashboard"
          className="group self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold text-[#5B42F3] hover:text-[#4A32D6] bg-purple-50/80 hover:bg-purple-100/80 border border-purple-200 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs"
        >
          <span>Open Pre-Production</span>
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Workflow Stepper Nodes with Animated Connectors */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-3">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.id} className="relative flex flex-col justify-between">
              {/* Animated Horizontal Connector Arrow (visible on desktop between items) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-3 top-7 z-20 pointer-events-none">
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: idx * 0.2 }}
                    className="w-6 h-6 rounded-full bg-white border border-purple-200 shadow-xs flex items-center justify-center text-[#5B42F3]"
                  >
                    <ChevronRight size={14} className="stroke-[2.5]" />
                  </motion.div>
                </div>
              )}

              {/* Card Node */}
              <Link
                to={step.link}
                className="group block h-full bg-[#F8F6FF]/60 hover:bg-white border border-[#E5E1F2] hover:border-[#5B42F3] rounded-2xl p-4 transition-all duration-300 shadow-2xs hover:shadow-md relative overflow-hidden"
              >
                {/* Animated top shimmer bar on hover */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#5B42F3] via-purple-400 to-[#5B42F3]"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />

                <div className="flex items-start justify-between gap-2 mb-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center ${step.iconBg} shadow-xs shrink-0`}
                  >
                    <Icon size={18} />
                  </motion.div>

                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${step.badgeColor}`}>
                    {step.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-[#17152B] group-hover:text-[#5B42F3] transition-colors flex items-center gap-1">
                    <span>{step.title}</span>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#5B42F3]" />
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{step.subtitle}</p>
                  <p className="text-[11px] text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Step Indicator with animated wave */}
                <div className="mt-4 pt-3 border-t border-[#E5E1F2]/70 flex items-center justify-between text-[10px] font-bold text-[#68647A]">
                  <span className="flex items-center gap-1 group-hover:text-[#5B42F3]">
                    <span>Step {step.id} of 4</span>
                  </span>
                  <span className="text-[#5B42F3] font-semibold group-hover:underline flex items-center gap-0.5">
                    View &rarr;
                  </span>
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Flowing Animated Progress Track at the Bottom */}
      <div className="mt-5 pt-3 border-t border-[#E5E1F2]/60 relative z-10">
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5 font-semibold">
          <span className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#5B42F3]" />
            <span>Automated Lifecycle Status</span>
          </span>
          <span className="text-[#5B42F3] font-extrabold">Active & Synchronized</span>
        </div>

        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden relative">
          {/* Animated flowing gradient beam */}
          <motion.div
            className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#5B42F3] to-transparent opacity-80"
            animate={{
              left: ['-33%', '100%'],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.2,
              ease: 'easeInOut',
            }}
          />
          <div className="w-full h-full bg-gradient-to-r from-blue-500/20 via-[#5B42F3]/30 to-indigo-500/20" />
        </div>
      </div>
    </div>
  );
}
