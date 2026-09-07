import React, { useState } from 'react';
import {
  ArrowRight,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { Language, Theme, StudentAccount } from '../types';
import { Logo } from './Logo';

interface CreatePasswordScreenProps {
  student: StudentAccount;
  onPasswordCreated: (updatedStudent: StudentAccount) => void;
  lang: Language;
  theme: Theme;
}

export const CreatePasswordScreen: React.FC<CreatePasswordScreenProps> = ({
  student,
  onPasswordCreated,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Requirements
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Strength calculation
  const getStrength = () => {
    if (!password) return 'none';
    let score = 0;
    if (hasMinLength) score++;
    if (hasLetter) score++;
    if (hasNumber) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (password.length >= 10) score++;

    if (score <= 2) return 'weak';
    if (score <= 4) return 'good';
    return 'strong';
  };

  const strength = getStrength();

  const isFormValid =
    hasMinLength && hasLetter && hasNumber && passwordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const updated: StudentAccount = {
        ...student,
        hasCustomPassword: true,
      };
      onPasswordCreated(updated);
    }, 600);
  };

  return (
    <div
      id="create-password-screen"
      className={`w-full min-h-screen pb-24 transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      <div className="max-w-md mx-auto px-4 sm:px-8 pt-8 sm:pt-14 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-block mx-auto mb-1">
            <Logo size="md" isDark={isDark} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A869]/20 text-[#C5A869] text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === 'en' ? 'First Login Setup' : 'Pehla Login Setup'}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            {lang === 'en' ? 'Create Your Password' : 'Apna Password Banaiye'}
          </h1>

          <p
            className={`text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
            }`}
          >
            {lang === 'en'
              ? "You're signing in for the first time. Please create a private password for your academy account."
              : 'Yeh aapka first login hai. Apne account ke liye ek private password banaiye.'}
          </p>
        </div>

        {/* Read-only Student Context Card */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex items-center justify-between ${
            isDark
              ? 'bg-[#081F5C]/40 border-[#0E2E80]'
              : 'bg-white border-[#081F5C]/10 shadow-sm'
          }`}
        >
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869] block">
              Permanent Student ID
            </span>
            <span className="font-mono text-base sm:text-lg font-bold">
              {student.studentId}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] opacity-60 uppercase font-semibold block">
              Student Name
            </span>
            <span className="text-xs sm:text-sm font-semibold">
              {student.fullName}
            </span>
          </div>
        </div>

        {/* Password Form Box */}
        <form
          onSubmit={handleSubmit}
          className={`p-6 sm:p-8 rounded-3xl border shadow-md space-y-6 ${
            isDark
              ? 'bg-[#081F5C]/40 border-[#0E2E80]'
              : 'bg-white border-[#081F5C]/10'
          }`}
        >
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
              {lang === 'en' ? 'New Password *' : 'Naya Password *'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a private password"
                className={`w-full pl-10 pr-12 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                  isDark
                    ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                    : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-xs opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Strength Meter */}
            {password.length > 0 && (
              <div className="pt-1 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="opacity-70">Password Strength:</span>
                  <span
                    className={`font-semibold capitalize ${
                      strength === 'weak'
                        ? 'text-rose-400'
                        : strength === 'good'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {strength}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      strength === 'weak'
                        ? 'w-1/3 bg-rose-400'
                        : strength === 'good'
                        ? 'w-2/3 bg-amber-400'
                        : 'w-full bg-emerald-400'
                    }`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
              {lang === 'en'
                ? 'Confirm New Password *'
                : 'Naye Password Ki Pushti Karein *'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className={`w-full pl-10 pr-12 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                  isDark
                    ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                    : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-xs opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-xs text-rose-400">
                {lang === 'en'
                  ? 'Passwords do not match.'
                  : 'Password match nahi kar rahe hain.'}
              </p>
            )}
          </div>

          {/* Requirement checklist */}
          <div className="p-3.5 rounded-xl border border-[#081F5C]/10 dark:border-white/10 space-y-2 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 block">
              Requirements
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div
                className={`flex items-center gap-1.5 ${
                  hasMinLength ? 'text-emerald-500 font-medium' : 'opacity-60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>At least 8 characters</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  hasLetter ? 'text-emerald-500 font-medium' : 'opacity-60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>At least 1 letter</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  hasNumber ? 'text-emerald-500 font-medium' : 'opacity-60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>At least 1 number</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  passwordsMatch ? 'text-emerald-500 font-medium' : 'opacity-60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Passwords match</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <button
              id="submit-create-password-btn"
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`w-full py-4 px-6 rounded-full text-base font-bold tracking-wide flex items-center justify-center gap-3 transition-all duration-200 shadow-xl ${
                isFormValid && !isSubmitting
                  ? 'cursor-pointer bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-95'
                  : 'opacity-50 cursor-not-allowed bg-gray-400 text-white'
              }`}
            >
              <span>
                {isSubmitting
                  ? lang === 'en'
                    ? 'Creating Password…'
                    : 'Password Ban Raha Hai…'
                  : lang === 'en'
                  ? 'Create Password & Go to Home'
                  : 'Password Banayein Aur Home Par Jayein'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Security disclaimer */}
        <div className="flex items-center justify-center gap-2 text-xs opacity-70">
          <ShieldCheck className="w-4 h-4 text-[#C5A869]" />
          <span>
            {lang === 'en'
              ? 'Password is encrypted and known only to you.'
              : 'Password encrypted rehta hai aur sirf aapko pata hota hai.'}
          </span>
        </div>
      </div>
    </div>
  );
};
