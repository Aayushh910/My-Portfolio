import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { CheckSquare, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const { isAuthenticated, login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  // If already logged in, go straight to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleFillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!username.trim() || !password) {
      const msg = 'Please enter both username and password.';
      setValidationError(msg);
      showError(msg);
      return;
    }

    try {
      setIsLoading(true);
      await login(username.trim(), password);
      showSuccess('Login successful. Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || err.message || 'Invalid username or password.';
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
            Todo Management & Activity Audit System
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface rounded-3xl border border-borderMuted shadow-card p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-textMain">Welcome Back</h2>
            <p className="text-xs text-muted mt-0.5">
              Sign in with your administrator credentials to access your dashboard.
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
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bgMain/50 border border-borderMuted rounded-xl text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-all focus-ring disabled:opacity-50 flex items-center justify-center gap-2 group active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Link to Sign Up */}
          <div className="mt-4 pt-4 border-t border-borderMuted text-center">
            <p className="text-xs text-muted">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-bold text-brand-700 hover:text-brand-900 underline underline-offset-2 ml-1"
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Predefined credentials hint box */}
          <div className="mt-4 pt-4 border-t border-borderMuted/80">
            <div className="p-3.5 bg-brand-50/70 border border-brand-200/70 rounded-2xl flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 text-xs text-brand-900">
                <KeyRound className="w-4 h-4 text-brand-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Demo Admin Credentials:</p>
                  <p className="text-muted mt-0.5">
                    Username: <span className="font-mono text-brand-900 font-semibold">admin</span> | Password: <span className="font-mono text-brand-900 font-semibold">admin123</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[11px] font-bold text-brand-700 hover:text-brand-900 underline whitespace-nowrap pt-0.5"
              >
                Auto-fill
              </button>
            </div>
          </div>
        </div>

        {/* Security badge footer */}
        <div className="mt-6 text-center text-xs text-muted flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-brand-700" />
          <span>Secured with JWT & Real MongoDB Audit Logging</span>
        </div>
      </div>
    </div>
  );
};
