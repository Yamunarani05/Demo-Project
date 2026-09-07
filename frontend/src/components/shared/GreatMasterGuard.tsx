import React from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut, Lock } from 'lucide-react';

interface GreatMasterGuardProps {
  children?: React.ReactNode;
}

export const GreatMasterGuard: React.FC<GreatMasterGuardProps> = ({ children }) => {
  const { user, isAuthenticated, isGreatMaster, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // 1. If not authenticated, redirect to Great Master Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/great-master/login" state={{ from: location }} replace />;
  }

  // 2. If authenticated, but NOT a Great Master (e.g. normal Master / Studio Admin)
  if (!isGreatMaster) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-sans">
        {/* Soft ambient background glow */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-rose-100/40 blur-[130px] rounded-full pointer-events-none -z-0" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[250px] bg-purple-100/30 blur-[100px] rounded-full pointer-events-none -z-0" />

        <div className="max-w-md w-full bg-white border border-rose-200 rounded-3xl p-8 sm:p-9 shadow-xl shadow-slate-200/60 text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <ShieldAlert size={32} />
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 inline-block mb-3">
            Great Master Clearance Required
          </span>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-display">
            Access Denied
          </h2>

          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Your account (<span className="text-slate-900 font-semibold">{user.email}</span>) does not have Great Master platform administration privileges.
          </p>

          <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 text-left space-y-1">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Lock size={12} className="text-[#5B42F3]" /> Platform Security Policy:
            </div>
            <p className="text-[11px] text-slate-500">
              Normal Master and Studio accounts are restricted to their studio workspaces. Only verified platform Great Masters may access platform governance.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => navigate('/studio/dashboard')}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#5E35B1] hover:bg-[#512DA8] transition shadow-md shadow-purple-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Return to Studio Portal</span>
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/great-master/login');
              }}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 transition border border-slate-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} />
              <span>Switch to Great Master Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Great Master
  return children ? <>{children}</> : <Outlet />;
};

export default GreatMasterGuard;
