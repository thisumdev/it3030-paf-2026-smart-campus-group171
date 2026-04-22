import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { registerUser, initiateGoogleLogin } from "../services/authApi";

// ── Helpers ───────────────────────────────────────────────────────────────────
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Each rule: { label, test(password) → boolean }
const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter (A–Z)", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter (a–z)", test: (p) => /[a-z]/.test(p) },
  { label: "One number (0–9)", test: (p) => /[0-9]/.test(p) },
  {
    label: "One special character (!@#…)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

const STRENGTH_CONFIG = [
  { label: "", color: "bg-slate-200" }, // 0 — empty
  { label: "Weak", color: "bg-red-500" }, // 1
  { label: "Fair", color: "bg-orange-400" }, // 2
  { label: "Good", color: "bg-yellow-400" }, // 3
  { label: "Strong", color: "bg-emerald-500" }, // 4
  { label: "Very strong", color: "bg-emerald-600" }, // 5
];

// ── Sub-component: strength bar ───────────────────────────────────────────────
const PasswordStrengthMeter = ({ password }) => {
  const score = useMemo(
    () => PASSWORD_RULES.filter((r) => r.test(password)).length,
    [password],
  );

  const config = STRENGTH_CONFIG[score];

  if (!password) return null;

  return (
    <div className="mt-2.5 space-y-2">
      {/* Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= score ? config.color : "bg-slate-200"
              }`}
            />
          ))}
        </div>
        {score > 0 && (
          <span
            className={`text-[11px] font-bold min-w-[60px] text-right transition-colors duration-300 ${
              score <= 1
                ? "text-red-500"
                : score === 2
                  ? "text-orange-500"
                  : score === 3
                    ? "text-yellow-500"
                    : "text-emerald-600"
            }`}
          >
            {config.label}
          </span>
        )}
      </div>

      {/* Checklist — shown only when field is non-empty */}
      <ul className="grid grid-cols-1 gap-0.5">
        {PASSWORD_RULES.map((rule) => {
          const passed = rule.test(password);
          return (
            <li
              key={rule.label}
              className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors duration-200 ${
                passed ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {passed ? (
                <CheckCircle2 className="h-3 w-3 shrink-0" />
              ) : (
                <XCircle className="h-3 w-3 shrink-0" />
              )}
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const SignupPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Password is strong enough when all 5 rules pass
  const passwordScore = useMemo(
    () => PASSWORD_RULES.filter((r) => r.test(form.password)).length,
    [form.password],
  );
  const isPasswordStrong = passwordScore === 5;

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
    setError("");
    if (id === "password") setPasswordTouched(true);
    if (fieldErrors[id]) {
      setFieldErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleBlur = (e) => {
    const { id, value } = e.target;
    if (id === "email" && value && !isValidEmail(value)) {
      setFieldErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
    }
    if (id === "confirmPassword" && value && value !== form.password) {
      setFieldErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    }
  };

  const validate = () => {
    const errs = { fullName: "", email: "", password: "", confirmPassword: "" };
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email) errs.email = "Email is required";
    else if (!isValidEmail(form.email))
      errs.email = "Please enter a valid email address";
    if (!form.password) errs.password = "Password is required";
    else if (!isPasswordStrong)
      errs.password =
        "Password is too weak — please satisfy all requirements above";
    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setFieldErrors(errs);
    return Object.values(errs).every((v) => !v);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const authData = await registerUser({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      login(authData);
      navigate("/user/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Shared input class builder
  const inputCls = (field) =>
    `block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 bg-slate-50 focus:bg-white
     transition-all duration-300 sm:text-sm outline-none shadow-sm ${
       fieldErrors[field]
         ? "border-red-300 focus:ring-red-500/20 focus:border-red-400 bg-red-50 focus:bg-white"
         : "border-slate-200 hover:border-slate-300 focus:ring-primary-900 focus:border-primary-900"
     }`;

  const iconCls = (field) =>
    `h-5 w-5 ${fieldErrors[field] ? "text-red-400" : "text-slate-400"}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in relative">
      <div className="max-w-5xl w-full premium-glass rounded-3xl overflow-hidden flex flex-col md:flex-row-reverse min-h-[600px] animate-slide-up hover:shadow-[0_20px_50px_rgba(30,58,138,0.12)] transition-all duration-500 border border-white/40">
        {/* Right Side - Branding */}
        <div className="md:w-5/12 bg-primary-900 p-10 text-white flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 left-0 -ml-20 -mt-20 w-64 h-64 rounded-full bg-accent-amber opacity-20 blur-3xl group-hover:scale-110 group-hover:opacity-30 transition-all duration-700" />
          <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 rounded-full bg-blue-500 opacity-20 blur-3xl group-hover:scale-110 group-hover:opacity-30 transition-all duration-700 delay-100" />
          <div className="relative z-10 flex items-center space-x-2 justify-end animate-slide-down delay-100">
            <span className="text-xl font-bold tracking-tight">
              Smart Campus Hub
            </span>
            <ShieldCheck className="h-8 w-8 text-accent-emerald" />
          </div>
          <div className="relative z-10 mt-12 mb-12 text-right animate-slide-left delay-200">
            <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-white">
              Join the Hub
            </h1>
            <p className="text-blue-100 text-lg font-light leading-relaxed">
              Create an account to gain full access to university resources,
              facility bookings, and support systems.
            </p>
          </div>
          <div className="relative z-10 text-sm text-blue-200 font-medium text-right animate-slide-up delay-300">
            &copy; {new Date().getFullYear()} University Campus Hub
          </div>
        </div>

        {/* Left Side - Form */}
        <div className="md:w-7/12 p-10 sm:p-14 flex flex-col justify-center bg-white/50 backdrop-blur-sm">
          <div className="w-full max-w-md mx-auto animate-slide-right delay-400">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Create Account
            </h2>
            <p className="text-slate-500 mb-8">
              Fill in the details below to register.
            </p>

            {error && (
              <div className="mb-5 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Full Name */}
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1"
                  htmlFor="fullName"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className={iconCls("fullName")} />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={form.fullName}
                    onChange={handleChange}
                    className={inputCls("fullName")}
                    placeholder="John Doe"
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1"
                  htmlFor="email"
                >
                  University Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={iconCls("email")} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputCls("email")}
                    placeholder="student@university.edu"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password + strength meter */}
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1"
                  htmlFor="password"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={iconCls("password")} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    className={inputCls("password")}
                    placeholder="Min. 8 characters"
                  />
                </div>
                {/* Strength meter appears as soon as user starts typing */}
                {passwordTouched && (
                  <PasswordStrengthMeter password={form.password} />
                )}
                {fieldErrors.password && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  className="block text-sm font-medium text-slate-700 mb-1"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={iconCls("confirmPassword")} />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputCls("confirmPassword")}
                    placeholder="••••••••"
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="group w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary-900 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-900 transition-all duration-300 hover:shadow-lg hover:shadow-primary-900/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Creating account...
                    </span>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Divider + Google */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-slate-500 font-medium">
                    Or sign up with
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  onClick={initiateGoogleLogin}
                  className="w-full inline-flex justify-center items-center py-3 px-4 border border-slate-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-900 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign up with Google
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary-900 hover:text-primary-800 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
