import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { authService } from '../services/authService';
import { useNotification } from '../context/NotificationContext';
import {
  PasswordStrengthIndicator,
  checkPasswordStrength,
} from './PasswordStrengthIndicator';

export const ForgotPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Request Code, 2: Reset Password, 3: Success
  const [identifier, setIdentifier] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIdentifier('');
      setResetCode('');
      setNewPassword('');
      setConfirmPassword('');
      setErrorMsg('');
      setCopiedCode(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!identifier.trim()) {
      setErrorMsg('Please enter your username or registered email address.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.forgotPassword(identifier.trim());
      if (res.success) {
        setResetCode(res.resetCode || '');
        setStep(2);
        showSuccess(res.message || 'Verification reset code generated.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to process request.';
      setErrorMsg(msg);
      showError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!resetCode.trim()) {
      setErrorMsg('Please provide the 6-digit reset code.');
      return;
    }

    const { isStrong } = checkPasswordStrength(newPassword);
    if (!isStrong) {
      setErrorMsg('New password must meet all strong password criteria (8+ chars, upper, lower, number, special).');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.resetPassword(identifier.trim(), resetCode.trim(), newPassword);
      if (res.success) {
        setStep(3);
        showSuccess(res.message || 'Password successfully updated.');
        if (onSuccess) {
          onSuccess(identifier.trim());
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset password.';
      setErrorMsg(msg);
      showError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (resetCode) {
      navigator.clipboard.writeText(resetCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-surface rounded-2xl border border-slate-200 shadow-modal max-w-md w-full p-6 sm:p-7 animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 shadow-2xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-textMain">
                {step === 3 ? 'Password Updated' : 'Reset Your Password'}
              </h3>
              <p className="text-xs text-muted">
                {step === 1 && 'Enter your username or email to begin'}
                {step === 2 && 'Enter reset code and create new password'}
                {step === 3 && 'Your account is ready for sign in'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-muted hover:text-textMain rounded-xl hover:bg-black/5 transition-colors"
            aria-label="Close reset password dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter Identifier */}
        {step === 1 && (
          <form onSubmit={handleRequestCode} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
                Username or Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. admin or name@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-bgMain/40 border border-slate-200 rounded-xl text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
                />
              </div>
              <p className="text-[11px] text-muted mt-1.5">
                We'll verify your registered account in MongoDB and generate a secure reset code.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-textMain hover:bg-black/5 rounded-xl border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all focus-ring disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Enter Verification Code & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="mt-5 space-y-4">
            {/* Generated Code Notification Card */}
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-brand-700 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-medium text-brand-900">Your 6-Digit Reset Code:</p>
                  <p className="text-base font-mono font-bold tracking-widest text-brand-800">
                    {resetCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-brand-800 bg-white border border-brand-200 rounded-lg hover:bg-brand-50 transition-colors shadow-2xs"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Reset Code Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
                Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="6-digit code"
                className="w-full px-3.5 py-2.5 bg-bgMain/40 border border-slate-200 rounded-xl text-sm font-mono tracking-wider text-textMain placeholder:text-muted/60 focus-ring transition-colors"
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
                New Strong Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  placeholder="Strong password required"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-bgMain/40 border border-slate-200 rounded-xl text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-textMain transition-colors"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              <PasswordStrengthIndicator password={newPassword} />
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-textMain mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-bgMain/40 border border-slate-200 rounded-xl text-sm text-textMain placeholder:text-muted/60 focus-ring transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-textMain transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-brand-700 hover:text-brand-900 font-semibold underline"
              >
                Back to step 1
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all focus-ring disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Success Screen */}
        {step === 3 && (
          <div className="mt-5 text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-textMain">Password Reset Successfully!</h4>
              <p className="text-xs text-muted mt-1 max-w-xs mx-auto">
                Your password has been securely updated in MongoDB. You can now sign in with your new credentials.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-brand-700 hover:bg-brand-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all focus-ring"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
