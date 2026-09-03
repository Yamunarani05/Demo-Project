import React from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, CheckCircle2 } from "lucide-react";

const STEPS = [
  { label: "Account", path: "/signup" },
  { label: "Studio Details", path: "/signup/studio" },
  { label: "Complete", path: "/signup/complete" },
];

function getStepIndex(pathname: string) {
  if (pathname.startsWith("/signup/complete")) return 2;
  if (pathname.startsWith("/signup/studio")) return 1;
  return 0;
}

export default function SignupLayout() {
  const { pathname } = useLocation();
  const currentStep = getStepIndex(pathname);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[420px] bg-purple-100/50 blur-[140px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-indigo-100/40 blur-[110px] rounded-full pointer-events-none -z-0" />
      <div className="absolute top-1/2 left-0 w-[350px] h-[350px] bg-pink-50/30 blur-[100px] rounded-full pointer-events-none -z-0" />

      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md relative z-10 flex-shrink-0">
        <Link to="/" className="flex items-center gap-3 text-slate-900 group">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md shadow-purple-900/20 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-wider uppercase font-display leading-tight text-slate-900">
              DEMO PROJECT
            </div>
            <div className="text-[10px] text-purple-600 font-bold tracking-widest uppercase">
              Studio Admin Portal
            </div>
          </div>
        </Link>
        <div className="text-xs text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-700 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 relative z-10">
        {currentStep < 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-0 mb-8"
          >
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;
              const isLast = idx === STEPS.length - 1;
              return (
                <React.Fragment key={step.label}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
                        isCompleted
                          ? "bg-purple-600 border-purple-600 text-white"
                          : isActive
                          ? "bg-white border-purple-600 text-purple-700 shadow-sm"
                          : "bg-white border-slate-300 text-slate-400"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <span>{idx + 1}</span>}
                    </div>
                    <span
                      className={`text-[11px] font-semibold whitespace-nowrap transition-colors ${
                        isActive ? "text-purple-700" : isCompleted ? "text-purple-500" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className="relative w-20 sm:w-28 h-0.5 mx-1 mb-5">
                      <div className="absolute inset-0 bg-slate-200 rounded-full" />
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-purple-500 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: isCompleted ? "100%" : "0%" }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </motion.div>
        )}
        <Outlet />
      </main>

      <footer className="py-3 text-center text-xs text-slate-400 border-t border-slate-200/60 relative z-10 flex-shrink-0">
        Lumina Photography Management © 2024
      </footer>
    </div>
  );
}
