import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";

export default function AccountStep() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim() || !form.email.includes("@")) errs.email = "Valid email is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    if (form.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    // Save to sessionStorage for use in next step
    sessionStorage.setItem("signup_account", JSON.stringify(form));
    navigate("/signup/studio");
  };

  const fields = [
    {
      key: "fullName",
      label: "Full Name",
      type: "text",
      placeholder: "Priya Sharma",
      icon: User,
    },
    {
      key: "email",
      label: "Email Address",
      type: "email",
      placeholder: "priya@yourstudio.com",
      icon: Mail,
    },
    {
      key: "phone",
      label: "Phone Number",
      type: "tel",
      placeholder: "+91 98765 43210",
      icon: Phone,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50">
        {/* Header */}
        <div className="mb-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Free Trial — No credit card needed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 leading-tight">
            Create your studio account
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Start managing your photography studio with Lumina.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Text fields */}
          {fields.map(({ key, label, type, placeholder, icon: Icon }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {label}
              </label>
              <div className="relative">
                <Icon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => update(key, e.target.value)}
                  placeholder={placeholder}
                  className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all ${
                    errors[key] ? "border-red-300 focus:ring-red-400" : "border-slate-200"
                  }`}
                />
              </div>
              {errors[key] && (
                <p className="text-xs text-red-500 mt-1 pl-1">{errors[key]}</p>
              )}
            </div>
          ))}

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min. 6 characters"
                className={`w-full bg-slate-50 border rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all ${
                  errors.password ? "border-red-300" : "border-slate-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1 pl-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showConfirm ? "text" : "password"}
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                placeholder="Re-enter your password"
                className={`w-full bg-slate-50 border rounded-xl pl-10 pr-11 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all ${
                  errors.confirmPassword ? "border-red-300" : "border-slate-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1 pl-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* CTA */}
          <button
            type="submit"
            className="w-full mt-2 bg-[#5E35B1] hover:bg-[#512DA8] text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-700 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
