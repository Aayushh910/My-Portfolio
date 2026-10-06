import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import {
  CheckSquare,
  Lock,
  User,
  Mail,
  Eye,
  EyeOff,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { GoogleAuthButton } from '../components/GoogleAuthButton';
import {
  PasswordStrengthIndicator,
  checkPasswordStrength,
} from '../components/PasswordStrengthIndicator';

export const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { isAuthenticated, register } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  // If already logged in, redirect straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!username.trim() || !password || !confirmPassword) {
      const msg = 'Please fill in all required fields.';
      setValidationError(msg);
      showError(msg);
      return;
    }

    if (username.trim().length < 3) {
      const msg = 'Username must be at least 3 characters long.';
      setValidationError(msg);
      showError(msg);
      return;
    }

    if (/\s/.test(username.trim())) {
      const msg = 'Username cannot contain spaces.';
      setValidationError(msg);
      showError(msg);
      return;
    }

    const { isStrong } = checkPasswordStrength(password);
    if (!isStrong) {
      const msg =
        'Password must meet all strong criteria: 8+ characters, uppercase, lowercase, number, and special symbol.';
      setValidationError(msg);
      showError(msg);
      return;
    }

    if (password !== confirmPassword) {
      const msg = 'Passwords do not match. Please re-enter.';
      setValidationError(msg);
      showError(msg);
      return;
    }

    try {
      setIsLoading(true);
      await register(username.trim(), password, email.trim());
      showSuccess('Account created successfully! Welcome to TaskFlow.');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Failed to create account.';
      setValidationError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgMain flex items-center justify-center p-3 sm:p-5 lg:p-6">
      <div className="w-full max-w-4xl bg-surface rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Side: Brand & Feature Showcase (Desktop / Side-by-Side) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-brand-900 via-brand-800 to-slate-900 text-white p-7 flex-col justify-between relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-brand-500/10 blur-2xl pointer-events-none" />

          {/* Top Brand */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs font-semibold text-emerald-200 mb-5">
              <CheckSquare className="w-4 h-4 text-emerald-300" />
              <span>TaskFlow Suite</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
              Organize Tasks. <br />
              Accelerate Delivery.
            </h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Real-time collaboration, intuitive Kanban boards, and comprehensive activity audit trails built for high-performing teams.
            </p>
          </div>

          {/* Key Feature Highlights */}
          <div className="relative z-10 space-y-3 my-6">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Full Kanban Lifecycle</h4>
                <p className="text-[11px] text-slate-300">Drag-and-drop tasks with priorities & due dates</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <BarChart3 className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Live Activity Audit Log</h4>
                <p className="text-[11px] text-slate-300">Every change tracked in MongoDB audit trail</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Role-Based Security</h4>
                <p className="text-[11px] text-slate-300">Bcrypt hashing, secure JWTs & Google OAuth</p>
              </div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span>Ready in seconds. No credit card required.</span>
          </div>
        </div>

        {/* Right Side: Compact Signup Form */}
        <div className="col-span-1 lg:col-span-7 p-5 sm:p-7 flex flex-col justify-center">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl sm:text-2xl font-extrabold text-textMain tracking-tight">
                Create Your Account
              </h1>
              <div className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 text-xs font-semibold">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>TaskFlow</span>
              </div>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Enter your details or register with Google below.
            </p>
          </div>

          {validationError && (
            <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Row 1: Username & Email side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bgMain/40 border border-slate-200 rounded-xl text-xs sm:text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">
                  Email <span className="text-muted text-[10px] font-normal">(for recovery)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-bgMain/40 border border-slate-200 rounded-xl text-xs sm:text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Password & Confirm Password side-by-side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-bgMain/40 border border-slate-200 rounded-xl text-xs sm:text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-textMain transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2 bg-bgMain/40 border border-slate-200 rounded-xl text-xs sm:text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted hover:text-textMain transition-colors"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Compact Real-time Password Strength Meter */}
            <PasswordStrengthIndicator password={password} compact={true} />

            {/* Create Account Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all focus-ring disabled:opacity-50 flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-3.5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-3 text-muted font-medium tracking-wider text-[11px]">
                Or continue with
              </span>
            </div>
          </div>

          {/* Real Google Sign Up Button (BELOW the Create Account button) */}
          <GoogleAuthButton text="Sign up with Google" isSignup={true} />

          {/* Link to Login */}
          <div className="mt-3.5 pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-muted">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-brand-700 hover:text-brand-900 underline underline-offset-2 ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
