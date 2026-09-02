import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Briefcase,
  User,
  Users,
  BarChart3,
  Settings,
  Folder,
  MessageSquare,
  FileText,
  ArrowRight,
  Camera,
} from 'lucide-react';

interface PortalSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortalSelectModal: React.FC<PortalSelectModalProps> = ({ isOpen, onClose }) => {
  const handleOpenAdminPortal = () => {
    window.location.href = 'http://localhost:5175/';
  };

  const handleOpenClientPortal = () => {
    window.location.href = 'http://localhost:5174/login';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto font-sans">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Compact Main Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] overflow-hidden z-10 p-5 sm:p-7 border border-slate-100"
          >
            {/* Background Glow Accents */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-blue-100/40 rounded-full blur-2xl -z-10 pointer-events-none -translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 right-0 w-52 h-52 bg-purple-100/50 rounded-full blur-2xl -z-10 pointer-events-none translate-x-1/3 translate-y-1/3" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center z-20"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header: Logo, Title & Subtitle */}
            <div className="flex flex-col items-center justify-center text-center mb-5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-sm">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-black tracking-wider text-slate-900 font-display uppercase">
                  DEMO STUDIO
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                Choose Your Portal
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Select your portal to continue
              </p>
              <div className="w-10 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mt-2.5" />
            </div>

            {/* Compact Two-Column Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* LEFT CARD: Admin Portal */}
              <motion.div
                whileHover={{ y: -3, scale: 1.005 }}
                transition={{ duration: 0.2 }}
                className="group relative rounded-2xl bg-white border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-blue-50/60 to-transparent -z-0 pointer-events-none" />

                <div className="relative z-10 text-center flex flex-col items-center">
                  {/* Briefcase Icon */}
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-blue-100 shadow-sm shadow-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:border-blue-300 transition-all">
                    <Briefcase className="w-6 h-6 text-[#1D61E8]" />
                  </div>

                  <h3 className="text-lg font-bold text-[#1D61E8]">
                    Admin Portal
                  </h3>
                  <div className="w-6 h-0.5 bg-[#1D61E8] rounded-full my-1.5 opacity-80" />

                  <p className="text-xs text-slate-500 leading-snug mb-3.5 max-w-xs font-normal">
                    Access the Sales & Admin dashboard to manage leads, customers, and reports.
                  </p>

                  {/* Compact Feature Box */}
                  <div className="w-full bg-[#F0F6FE] border border-blue-100/70 rounded-xl p-3 space-y-2 text-left mb-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <Users className="w-3.5 h-3.5 text-[#1D61E8] shrink-0" />
                      <span>Manage Leads & Customers</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <BarChart3 className="w-3.5 h-3.5 text-[#1D61E8] shrink-0" />
                      <span>Analytics & Reports</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <Settings className="w-3.5 h-3.5 text-[#1D61E8] shrink-0" />
                      <span>System & User Management</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleOpenAdminPortal}
                  className="relative z-10 w-full py-2.5 px-4 rounded-xl bg-[#1665D8] hover:bg-[#1253b3] active:bg-[#0f4698] text-white font-semibold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all group-hover:shadow-blue-600/35"
                >
                  <span>Go to Admin Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

              {/* RIGHT CARD: Client Portal */}
              <motion.div
                whileHover={{ y: -3, scale: 1.005 }}
                transition={{ duration: 0.2 }}
                className="group relative rounded-2xl bg-white border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-purple-50/60 to-transparent -z-0 pointer-events-none" />

                <div className="relative z-10 text-center flex flex-col items-center">
                  {/* User Icon */}
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-purple-100 shadow-sm shadow-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-105 group-hover:border-purple-300 transition-all">
                    <User className="w-6 h-6 text-[#8B5CF6]" />
                  </div>

                  <h3 className="text-lg font-bold text-[#8B5CF6]">
                    Client Portal
                  </h3>
                  <div className="w-6 h-0.5 bg-[#8B5CF6] rounded-full my-1.5 opacity-80" />

                  <p className="text-xs text-slate-500 leading-snug mb-3.5 max-w-xs font-normal">
                    Access your account to view projects, track updates, and communicate with our team.
                  </p>

                  {/* Compact Feature Box */}
                  <div className="w-full bg-[#F5F3FF] border border-purple-100/70 rounded-xl p-3 space-y-2 text-left mb-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <Folder className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                      <span>View Projects & Updates</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <MessageSquare className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                      <span>Communicate with Team</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                      <FileText className="w-3.5 h-3.5 text-[#8B5CF6] shrink-0" />
                      <span>Track Invoices & Payments</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleOpenClientPortal}
                  className="relative z-10 w-full py-2.5 px-4 rounded-xl bg-[#8046D3] hover:bg-[#6e39b9] active:bg-[#5e2f9f] text-white font-semibold text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 transition-all group-hover:shadow-purple-600/35"
                >
                  <span>Go to Client Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
