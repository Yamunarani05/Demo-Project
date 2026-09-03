import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, MapPin, Users, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export default function StudioDetailsStep() {
  const navigate = useNavigate();
  const { loginAsStudioAdmin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    studioName: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    totalEmployees: "",
    photographers: "",
    editors: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.studioName.trim()) errs.studioName = "Studio name is required";
    if (!form.city.trim()) errs.city = "City is required";
    if (!form.state.trim()) errs.state = "State is required";
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setIsLoading(true);
    sessionStorage.setItem("signup_studio", JSON.stringify(form));
    setTimeout(() => {
      loginAsStudioAdmin("studio_1");
      toast.success("Studio created successfully!", {
        description: "Welcome to Lumina — your studio workspace is ready.",
      });
      navigate("/signup/complete");
      setIsLoading(false);
    }, 600);
  };

  const teamFields = [
    { key: "totalEmployees", label: "Total Employees", placeholder: "12" },
    { key: "photographers", label: "Photographers", placeholder: "7" },
    { key: "editors", label: "Editors", placeholder: "5" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="w-full max-w-lg"
    >
      <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 leading-tight">
            Tell us about your studio
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Set up your studio profile to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Studio Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Studio Information
              </span>
            </div>
            <div className="space-y-3">
              {/* Studio Name */}
              {["studioName", "address"].map((key) => {
                const meta: Record<string, { label: string; placeholder: string; Icon: any }> = {
                  studioName: { label: "Studio Name", placeholder: "Aurora Photography Studio", Icon: Building2 },
                  address: { label: "Address", placeholder: "12, MG Road, Indiranagar", Icon: MapPin },
                };
                const { label, placeholder, Icon } = meta[key];
                return (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                    <div className="relative">
                      <Icon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={form[key as keyof typeof form]}
                        onChange={(e) => update(key, e.target.value)}
                        placeholder={placeholder}
                        className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all ${errors[key] ? "border-red-300" : "border-slate-200"}`}
                      />
                    </div>
                    {errors[key] && <p className="text-xs text-red-500 mt-1 pl-1">{errors[key]}</p>}
                  </div>
                );
              })}

              {/* City + State — side by side */}
              <div className="grid grid-cols-2 gap-3">
                {["city", "state"].map((key) => {
                  const placeholders: Record<string, string> = { city: "Bengaluru", state: "Karnataka" };
                  const labels: Record<string, string> = { city: "City", state: "State" };
                  return (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">{labels[key]}</label>
                      <input
                        type="text"
                        value={form[key as keyof typeof form]}
                        onChange={(e) => update(key, e.target.value)}
                        placeholder={placeholders[key]}
                        className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all ${errors[key] ? "border-red-300" : "border-slate-200"}`}
                      />
                      {errors[key] && <p className="text-xs text-red-500 mt-1 pl-1">{errors[key]}</p>}
                    </div>
                  );
                })}
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Country</label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  placeholder="India"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Team Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Team Information
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {teamFields.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => update(key, e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#5E35B1] hover:bg-[#512DA8] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-purple-900/20 hover:shadow-xl hover:shadow-purple-900/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <span>Creating Studio...</span>
              ) : (
                <>
                  <span>Create Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
