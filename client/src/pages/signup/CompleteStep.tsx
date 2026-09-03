import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles, Camera, Users, Star } from "lucide-react";

const checklist = [
  { icon: CheckCircle2, label: "Account created", delay: 0.1 },
  { icon: CheckCircle2, label: "Studio profile completed", delay: 0.25 },
  { icon: CheckCircle2, label: "Ready to onboard your first client", delay: 0.4 },
];

export default function CompleteStep() {
  const navigate = useNavigate();
  const [accountData, setAccountData] = useState<{ fullName?: string } | null>(null);
  const [studioData, setStudioData] = useState<{ studioName?: string } | null>(null);

  useEffect(() => {
    const acc = sessionStorage.getItem("signup_account");
    const stu = sessionStorage.getItem("signup_studio");
    if (acc) setAccountData(JSON.parse(acc));
    if (stu) setStudioData(JSON.parse(stu));
  }, []);

  const firstName = accountData?.fullName?.split(" ")[0] || "there";
  const studioName = studioData?.studioName || "your studio";

  const handleGoToDashboard = () => {
    sessionStorage.removeItem("signup_account");
    sessionStorage.removeItem("signup_studio");
    navigate("/studio/dashboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 text-center">
        {/* Big success icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-900/25"
        >
          <CheckCircle2 className="w-10 h-10 text-white" />
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Ready</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 leading-tight mb-2">
            Your studio is ready, {firstName}!
          </h1>
          <p className="text-sm text-slate-500">
            Welcome to Lumina. Let&apos;s get your first client started.
          </p>
        </motion.div>

        {/* Studio name badge */}
        {studioData?.studioName && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-5 mb-5 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-purple-50 border border-purple-200"
          >
            <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center text-white">
              <Camera className="w-3.5 h-3.5" />
            </div>
            <span className="text-sm font-bold text-slate-800">{studioName}</span>
          </motion.div>
        )}

        {/* Checklist */}
        <div className="space-y-2.5 my-6 text-left">
          {checklist.map(({ icon: Icon, label, delay }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay }}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80"
            >
              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-slate-700">{label}</span>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.55 }}
          onClick={handleGoToDashboard}
          className="w-full bg-[#5E35B1] hover:bg-[#512DA8] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <span>Go to Studio Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>

        <p className="text-xs text-slate-400 mt-4">
          Your demo workspace with sample data is ready to explore.
        </p>
      </div>
    </motion.div>
  );
}
