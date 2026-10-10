import React from 'react';
import { Check, X } from 'lucide-react';

export const checkPasswordStrength = (pass) => {
  const password = pass || '';
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const score = Object.values(checks).filter(Boolean).length;
  const isStrong = checks.length && checks.upper && checks.lower && checks.number && checks.special;

  let label = 'Too Short';
  let color = 'text-slate-500';
  let barColor = 'bg-rose-500';

  if (score <= 1) {
    label = 'Weak';
    barColor = 'bg-rose-500';
    color = 'text-rose-600';
  } else if (score === 2 || score === 3) {
    label = 'Fair';
    barColor = 'bg-amber-500';
    color = 'text-amber-600';
  } else if (score === 4) {
    label = 'Good';
    barColor = 'bg-blue-500';
    color = 'text-blue-600';
  } else if (score === 5) {
    label = 'Strong';
    barColor = 'bg-emerald-600';
    color = 'text-emerald-700 font-bold';
  }

  return { checks, score, isStrong, label, barColor, color };
};

export const PasswordStrengthIndicator = ({ password = '', compact = false }) => {
  if (!password) return null;

  const { checks, score, label, barColor, color } = checkPasswordStrength(password);

  if (compact) {
    return (
      <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1.5 animate-fade-in text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted font-medium">Strength: <strong className={color}>{label}</strong></span>
          <div className="flex items-center gap-1 w-24">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  score >= lvl ? barColor : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px]">
          <span className={`inline-flex items-center gap-0.5 ${checks.length ? 'text-emerald-700 font-semibold' : 'text-muted'}`}>
            {checks.length ? '✓' : '•'} 8+ chars
          </span>
          <span className={`inline-flex items-center gap-0.5 ${checks.upper ? 'text-emerald-700 font-semibold' : 'text-muted'}`}>
            {checks.upper ? '✓' : '•'} Upper
          </span>
          <span className={`inline-flex items-center gap-0.5 ${checks.lower ? 'text-emerald-700 font-semibold' : 'text-muted'}`}>
            {checks.lower ? '✓' : '•'} Lower
          </span>
          <span className={`inline-flex items-center gap-0.5 ${checks.number ? 'text-emerald-700 font-semibold' : 'text-muted'}`}>
            {checks.number ? '✓' : '•'} Number
          </span>
          <span className={`inline-flex items-center gap-0.5 ${checks.special ? 'text-emerald-700 font-semibold' : 'text-muted'}`}>
            {checks.special ? '✓' : '•'} Symbol
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 p-3 bg-slate-50/70 border border-slate-200/60 rounded-xl space-y-2 animate-fade-in">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted font-medium">Password Strength:</span>
        <span className={`font-semibold ${color}`}>{label}</span>
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4, 5].map((lvl) => (
          <div
            key={lvl}
            className={`h-full rounded-full transition-all duration-300 ${
              score >= lvl ? barColor : 'bg-slate-200'
            }`}
          />
        ))}
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[11px]">
        <div className={`flex items-center gap-1.5 ${checks.length ? 'text-emerald-700' : 'text-muted'}`}>
          {checks.length ? <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" /> : <X className="w-3 h-3 text-slate-500 flex-shrink-0" />}
          <span>8+ characters</span>
        </div>
        <div className={`flex items-center gap-1.5 ${checks.upper ? 'text-emerald-700' : 'text-muted'}`}>
          {checks.upper ? <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" /> : <X className="w-3 h-3 text-slate-500 flex-shrink-0" />}
          <span>Uppercase letter</span>
        </div>
        <div className={`flex items-center gap-1.5 ${checks.lower ? 'text-emerald-700' : 'text-muted'}`}>
          {checks.lower ? <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" /> : <X className="w-3 h-3 text-slate-500 flex-shrink-0" />}
          <span>Lowercase letter</span>
        </div>
        <div className={`flex items-center gap-1.5 ${checks.number ? 'text-emerald-700' : 'text-muted'}`}>
          {checks.number ? <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" /> : <X className="w-3 h-3 text-slate-500 flex-shrink-0" />}
          <span>At least 1 number</span>
        </div>
        <div className={`flex items-center gap-1.5 col-span-2 ${checks.special ? 'text-emerald-700' : 'text-muted'}`}>
          {checks.special ? <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" /> : <X className="w-3 h-3 text-slate-500 flex-shrink-0" />}
          <span>Special symbol (!@#$%^&*)</span>
        </div>
      </div>
    </div>
  );
};
