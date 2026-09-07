import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../context/AuthContext';
import {
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  User,
  Mail,
  Phone,
  Building2,
  ShieldCheck,
  Search,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { containerStagger, itemFadeSlide } from '../components/MasterMotion';
import { toast } from 'sonner';

export default function MasterApprovals() {
  const { pendingRequests, approveStudio, rejectStudio } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = pendingRequests.filter(
    (req) =>
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleApprove = async (id: string, name: string) => {
    await approveStudio(id);
  };

  const handleReject = async (id: string, name: string) => {
    await rejectStudio(id);
  };

  return (
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemFadeSlide} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#1E1B2E] font-display">
              Free Trial Requests ({pendingRequests.length} Pending)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
              PENDING
            </span>
          </div>
          <p className="text-sm text-[#6B6780] mt-1">
            Review 7-day free trial registration requests from new photography studios and activate trial access.
          </p>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by studio, user or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-[#E8E5F2] rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5B42F3] w-64 shadow-xs"
            />
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      {pendingRequests.length === 0 ? (
        <motion.div
          variants={itemFadeSlide}
          className="bg-white rounded-2xl border border-[#E8E5F2] p-12 text-center shadow-xs"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#1E1B2E]">All Requests Processed</h3>
          <p className="text-sm text-[#6B6780] max-w-md mx-auto mt-1">
            There are currently no pending Free Trial requests waiting for Master Admin approval.
          </p>
        </motion.div>
      ) : (
        <motion.div variants={itemFadeSlide} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {filteredRequests.map((req) => {
              const regDateStr = req.registrationDate
                ? new Date(req.registrationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                : 'Just now';

              return (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl p-6 border border-[#E8E5F2] shadow-xs flex flex-col justify-between hover:border-[#5B42F3]/40 transition-all"
                >
                  <div>
                    {/* Top Bar */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#F8F6FF] text-[#5B42F3] border border-[#E8E2FF] flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-[#1E1B2E] text-base">{req.name}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-extrabold uppercase tracking-wide">
                              PENDING
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {req.city}, {req.state}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Request Meta Box */}
                    <div className="p-4 bg-[#F8F9FD] rounded-xl border border-[#E8E5F2] text-xs space-y-2 mb-5">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-semibold flex items-center gap-1.5 text-slate-900">
                          <User className="w-3.5 h-3.5 text-[#5B42F3]" />
                          User Name: {req.adminName}
                        </span>
                        <span className="text-[11px] text-amber-700 font-bold bg-amber-100/70 px-2 py-0.5 rounded-md border border-amber-200">
                          7-Day Free Trial Request
                        </span>
                      </div>

                      <div className="text-slate-600 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.adminEmail}</span>
                      </div>

                      {req.adminPhone && (
                        <div className="text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.adminPhone}</span>
                        </div>
                      )}

                      <div className="text-slate-600 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Registration Date: <strong>{regDateStr}</strong></span>
                      </div>

                      <div className="pt-2.5 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-center text-[11px]">
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <div className="text-slate-400">Trial Start Date</div>
                          <div className="font-bold text-slate-800 mt-0.5">Upon Approval</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200">
                          <div className="text-slate-400">Trial Duration</div>
                          <div className="font-bold text-purple-700 mt-0.5">7 Days</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Approve / Reject Actions */}
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => handleApprove(req.id, req.name)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-[#5B42F3] hover:bg-[#4d36db] text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve 7-Day Trial</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => handleReject(req.id, req.name)}
                      className="py-2.5 px-4 rounded-xl bg-white hover:bg-rose-50 text-rose-600 font-semibold text-xs border border-slate-200 hover:border-rose-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
