import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Camera, ArrowLeft, MoreVertical, Shield, UserCheck, Users } from "lucide-react";
import { api } from "../../api/axios";

import loginIllustration from "../../assets/focus-animate.svg";

import { HexagonBackground } from "../../components/animate-ui/components/backgrounds/hexagon";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPortalMenu, setShowPortalMenu] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = "Email is required";
    else if (!validateEmail(email))
      newErrors.email = "Enter a valid email";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);

      const res = await api.post("/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, role, userId, id, employeeId, adminId, partnerId, fullName } = res.data;

      if (!token || !role) throw new Error();

      const resolvedUserId = String(
        userId ?? id ?? employeeId ?? adminId ?? partnerId
      );

      if (!resolvedUserId) {
        throw new Error("User ID not returned from login API");
      }

      // Clear demo flag for authorized portal access
      localStorage.removeItem("isDemoPortal");
      localStorage.setItem("token", token);
      localStorage.setItem("authToken", token);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", resolvedUserId);
      localStorage.setItem("employeeId", resolvedUserId);
      if (fullName) {
        localStorage.setItem("fullName", fullName);
      }
      localStorage.setItem("user", JSON.stringify({
        id: resolvedUserId,
        userId: resolvedUserId,
        employeeId: resolvedUserId,
        role: role,
        fullName: fullName || "User",
        email: email.trim().toLowerCase()
      }));

      if (role === "admin") navigate("/admin/dashboard", { replace: true });
      else if (role === "employee")
        navigate("/employee/employee-profile", { replace: true });
      else if (role === "partner")
        navigate("/partner/dashboard", { replace: true });
      else navigate("/", { replace: true });

    } catch (err: any) {
      setAuthError(
        err?.response?.data?.message || "Incorrect email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
  e.preventDefault();
  setForgotError("");
  setForgotMessage("");

  if (!forgotEmail) {
    setForgotError("Email is required");
    return;
  }

  if (!validateEmail(forgotEmail)) {
    setForgotError("Enter a valid email");
    return;
  }

  try {
    setForgotLoading(true);

    await api.post("/auth/forgot-password", {
      email: forgotEmail.trim().toLowerCase(),
    });

    setForgotMessage(
      "If the email exists, a password reset link has been sent."
    );
  } catch (err: any) {
    setForgotError(
      err?.response?.data?.message ||
        "Failed to send reset email. Try again."
    );
  } finally {
    setForgotLoading(false);
  }
};


  const handlePortalDirectAccess = async (targetRole: "admin" | "employee" | "partner") => {
    setShowPortalMenu(false);
    setLoading(true);

    let defaultEmail = "admin@gmail.com";
    if (targetRole === "employee") {
      defaultEmail = "employee@test.com";
    } else if (targetRole === "partner") {
      defaultEmail = "Krishna@gmail.com";
    }

    const fallbackName = `Demo ${targetRole.toUpperCase()} User`;
    // Direct unauthorized demo access flag
    localStorage.setItem("isDemoPortal", "true");
    localStorage.setItem("token", "demo-portal-token");
    localStorage.setItem("authToken", "demo-portal-token");
    localStorage.setItem("role", targetRole);
    localStorage.setItem("userId", "999");
    localStorage.setItem("employeeId", "999");
    localStorage.setItem("fullName", fallbackName);
    localStorage.setItem("user", JSON.stringify({
      id: "999",
      userId: "999",
      employeeId: "999",
      role: targetRole,
      fullName: fallbackName,
      email: defaultEmail
    }));

    if (targetRole === "admin") navigate("/admin/dashboard", { replace: true });
    else if (targetRole === "employee") navigate("/employee/dashboard", { replace: true });
    else if (targetRole === "partner") navigate("/partner/dashboard", { replace: true });

    setLoading(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-violet-100 to-purple-200">
      {/* BACK TO HOME NAVIGATION BUTTON */}
      <a
        href="http://localhost:5173"
        className="absolute top-6 left-6 z-30 pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-purple-700 font-semibold text-xs shadow-md backdrop-blur-md transition-all border border-purple-200 hover:scale-105 active:scale-95"
      >
        <ArrowLeft className="w-4 h-4 text-purple-600" />
        <span>Back to Home</span>
      </a>

      {/* TOP RIGHT 3 DOTS PORTALS MENU */}
      <div className="absolute top-6 right-6 z-30 pointer-events-auto">
        <button
          onClick={() => setShowPortalMenu((prev) => !prev)}
          className="p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 hover:text-purple-700 shadow-md backdrop-blur-md transition-all border border-purple-200 hover:scale-105 active:scale-95 flex items-center justify-center"
          title="Portals Options"
        >
          <MoreVertical className="w-5 h-5 text-purple-600" />
        </button>

        {showPortalMenu && (
          <>
            {/* BACKDROP TO CLOSE MENU */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowPortalMenu(false)}
            />

            {/* DROPDOWN MENU */}
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-2xl border border-purple-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => handlePortalDirectAccess("admin")}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2.5 transition-colors"
              >
                <Shield className="w-4 h-4 text-purple-600" />
                Go To Admin Portal
              </button>

              <button
                onClick={() => handlePortalDirectAccess("employee")}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2.5 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-purple-600" />
                Go To Employee Portal
              </button>

              <button
                onClick={() => handlePortalDirectAccess("partner")}
                className="w-full text-left px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2.5 transition-colors"
              >
                <Users className="w-4 h-4 text-purple-600" />
                Go To Partner Portal
              </button>
            </div>
          </>
        )}
      </div>

      {/* BACKGROUND */}
      <HexagonBackground
        hexagonSize={90}
        hexagonMargin={6}
        className="absolute inset-0 z-0"
      />

      {/* CONTENT WRAPPER — pass mouse events through */}
      <div className="relative z-10 min-h-screen flex items-center pointer-events-none">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center py-12 md:py-20">

            {/* LEFT — Illustration */}
            <div className="hidden md:flex flex-col justify-center pointer-events-auto">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                Demo Studio
              </h2>

              <p className="text-gray-600 max-w-sm mb-10 leading-relaxed font-normal">
                Manage your sales workspace, leads, and team collaboration seamlessly
                with our intuitive platform.
              </p>

              <img
                src={loginIllustration}
                alt="Login illustration"
                className="w-full max-w-sm lg:max-w-md opacity-80 grayscale-[20%]"
              />
            </div>

            {/* RIGHT — LOGIN CARD */}
            <div className="flex justify-center md:justify-end pointer-events-auto">
              <div className="w-full max-w-md rounded-2xl bg-white/95 backdrop-blur-md border border-gray-200 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.15)] px-6 sm:px-7 pt-8 pb-6">

                {/* LOGO BADGE */}
                <div className="flex justify-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center shadow-md">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-extrabold text-xl tracking-wider uppercase font-display text-slate-900">
                        DEMO STUDIO
                      </span>
                      <span className="text-[10px] text-violet-600 tracking-widest uppercase font-semibold -mt-0.5">
                        Sales & Admin Portal
                      </span>
                    </div>
                  </div>
                </div>

                {/* TITLE */}
                <div className="mb-6 text-center sm:text-left">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Sign in
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Enter your credentials to continue
                  </p>
                </div>

              <form
                onSubmit={handleSubmit}
                className={`space-y-5 ${
                  authError ? "animate-shake" : ""
                }`}
              >
                {/* EMAIL FIELD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email)
                        setErrors((prev) => ({ ...prev, email: undefined }));
                      if (authError) setAuthError(null);
                    }}
                    className={`w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* PASSWORD FIELD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password)
                          setErrors((prev) => ({ ...prev, password: undefined }));
                        if (authError) setAuthError(null);
                      }}
                      className={`w-full px-4 py-3 rounded-lg border pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* FORGOT PASSWORD */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgot(true);
                      setForgotEmail(email);
                    }}
                    className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* AUTH ERROR (INCORRECT USERNAME/PASSWORD) */}
                {authError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                    {authError}
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-violet-600 text-white py-3 text-sm font-medium hover:bg-violet-700 transition disabled:opacity-60"
                >
                  {loading ? "Signing in…" : "Continue"}
                </button>
              </form>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
{showForgot && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 relative">
      <button
        onClick={() => {
          setShowForgot(false);
          setForgotMessage("");
          setForgotError("");
        }}
        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>

      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Forgot Password
      </h2>

      <p className="text-sm text-gray-500 mb-4">
        Enter your email address and we’ll send you a password reset link.
      </p>

      {forgotError && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 p-3 rounded">
          {forgotError}
        </div>
      )}

      {forgotMessage && (
        <div className="mb-3 text-sm text-green-600 bg-green-50 p-3 rounded">
          {forgotMessage}
        </div>
      )}

      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={forgotLoading}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 rounded-lg transition disabled:opacity-60"
        >
          {forgotLoading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  </div>
)}

    </div>
  );
};

export default Login;