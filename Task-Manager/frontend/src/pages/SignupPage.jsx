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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

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

  // If already logged in, go straight to dashboard
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

    if (password.length < 6) {
      const msg = 'Password must be at least 6 characters long.';
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
    <div className="min-h-screen bg-bgMain flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-700 text-white mb-4 shadow-card ring-4 ring-brand-100">
            <CheckSquare className="w-7 h-7 text-emerald-200" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textMain tracking-tight">
            TaskFlow
          </h1>
          <p className="text-sm text-muted mt-1.5 font-medium">
            Create an Account to Start Managing Tasks
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-surface rounded-3xl border border-borderMuted shadow-card p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-textMain">Create Your Account</h2>
            <p className="text-xs text-muted mt-0.5">
              Enter your details below to set up your personal task workspace.
            </p>
          </div>

          {validationError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
                Username <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bgMain/50 border border-borderMuted rounded-xl text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
                />
              </div>
              <p className="text-[11px] text-muted mt-1">Minimum 3 characters, alphanumeric</p>
            </div>

            {/* Email (optional) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
                Email Address <span className="text-muted text-[11px] font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bgMain/50 border border-borderMuted rounded-xl text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-bgMain/50 border border-borderMuted rounded-xl text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-textMain transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
                Confirm Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-bgMain/50 border border-borderMuted rounded-xl text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-textMain transition-colors"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 py-3 px-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all focus-ring disabled:opacity-50 flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform ml-auto" />
                </>
              )}
            </button>
          </form>

          {/* Link to Login */}
          <div className="mt-6 pt-5 border-t border-borderMuted text-center">
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

        {/* Security badge footer */}
        <div className="mt-6 text-center text-xs text-muted flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-700" />
          <span>Secured with Bcrypt Hashing, JWT & MongoDB Audit Log</span>
        </div>
      </div>
    </div>
  );
};
