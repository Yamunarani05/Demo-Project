import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Camera, Building2, MapPin, Users, ShieldAlert, LogIn, Home } from "lucide-react";

export default function CompleteStep() {
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState<{ fullName?: string; email?: string; phone?: string } | null>(null);
  const [studioData, setStudioData] = useState<{ studioName?: string; city?: string; state?: string; totalEmployees?: string; photographers?: string; editors?: string } | null>(null);

  useEffect(() => {
    const acc = sessionStorage.getItem("signup_account");
    const stu = sessionStorage.getItem("signup_studio");
    if (acc) setAccountData(JSON.parse(acc));
    if (stu) setStudioData(JSON.parse(stu));
  }, []);

  const firstName = accountData?.fullName?.split(" ")[0] || "there";
  const studioName = studioData?.studioName || "your studio";

  const handleFinish = () => {
    sessionStorage.removeItem("signup_account");
    sessionStorage.removeItem("signup_studio");
    navigate("/login");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 text-center">
        {/* Big Pending Status Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-xl shadow-amber-900/20"
        >
          <Clock className="w-10 h-10 text-white" />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Access Request Submitted</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 leading-tight mb-2">
            Pending Approval, {firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Your studio access request has been received and is awaiting approval from Great Master Admin.
          </p>
        </motion.div>

        {/* Studio Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-6 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2 text-xs"
        >
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm pb-2 border-b border-slate-200/60">
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white shrink-0">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">{studioName}</span>
            <span className="ml-auto px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              Pending
            </span>
          </div>
          <div className="text-slate-600 pt-1 space-y-1">
            <div><strong className="text-slate-800">Admin:</strong> {accountData?.fullName} ({accountData?.email})</div>
            {studioData?.city && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{studioData.city}, {studioData.state}</span>
              </div>
            )}
            <div>
              <strong className="text-slate-800">Team Scope:</strong> {studioData?.totalEmployees || 1} staff · {studioData?.photographers || 1} photographers · {studioData?.editors || 1} editors
            </div>
          </div>
        </motion.div>

        {/* Notice alert */}
        <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/60 text-left text-xs text-purple-900 mb-6 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">What happens next?</div>
            <p className="text-[11px] text-purple-700 mt-0.5 leading-snug">
              Great Master Admin will review your studio access request. Once approved, your studio will become active and you will be able to log in.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <motion.button
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            onClick={handleFinish}
            className="w-full bg-[#5E35B1] hover:bg-[#512DA8] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Go to Sign In</span>
          </motion.button>

          <Link
            to="/"
            onClick={() => {
              sessionStorage.removeItem("signup_account");
              sessionStorage.removeItem("signup_studio");
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Landing Page</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

