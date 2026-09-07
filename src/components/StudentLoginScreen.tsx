import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { Language, Theme, StudentAccount } from '../types';
import { Logo } from './Logo';

interface StudentLoginScreenProps {
  onLoginSuccess: (student: StudentAccount, isFirstLogin: boolean) => void;
  onForgotPassword: () => void;
  onBackToPublic: () => void;
  currentStudent?: StudentAccount | null;
  lang: Language;
  theme: Theme;
}

export const StudentLoginScreen: React.FC<StudentLoginScreenProps> = ({
  onLoginSuccess,
  onForgotPassword,
  onBackToPublic,
  currentStudent,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  // Form state
  const [studentId, setStudentId] = useState(currentStudent?.studentId || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStudentIdChange = (val: string) => {
    // Keep uppercase, alphanumeric & hyphen
    const cleaned = val.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 16);
    setStudentId(cleaned);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedId = studentId.trim().toUpperCase();
    if (!trimmedId) {
      setErrorMessage(
        lang === 'en'
          ? 'Please enter your Student ID.'
          : 'Kripya apna Student ID darj karein.'
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        lang === 'en'
          ? 'Please enter your password.'
          : 'Kripya apna password likhein.'
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      // Verify or match current student record if exists, or create clean session
      const targetStudentId = currentStudent?.studentId || trimmedId;
      const isFirstLogin = !currentStudent?.hasCustomPassword;

      const activeStudent: StudentAccount = currentStudent || {
        studentId: trimmedId.startsWith('PA-') ? trimmedId : `PA-2026-${trimmedId.slice(-4) || '0482'}`,
        fullName: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        hasCustomPassword: false,
        enrolledCourseId: 'rc-western-beginner',
      };

      onLoginSuccess(activeStudent, isFirstLogin);
    }, 600);
  };

  return (
    <div
      id="student-login-screen"
      className={`w-full min-h-screen pb-24 transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      <div className="max-w-md mx-auto px-4 sm:px-8 pt-8 sm:pt-14 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToPublic}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-[#C5A869]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {lang === 'en' ? 'Explore Academy' : 'Academy Explore Karein'}
            </span>
          </button>

          <span className="text-[11px] uppercase tracking-wider font-bold opacity-60">
            Student Portal
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-block mx-auto mb-1">
            <Logo size="md" isDark={isDark} />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            {lang === 'en' ? 'Welcome Back' : 'Welcome Back'}
          </h1>

          <p
            className={`text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
            }`}
          >
            {lang === 'en'
              ? 'Sign in to continue your piano learning journey.'
              : 'Apni piano learning journey jari rakhne ke liye sign in karein.'}
          </p>
        </div>

        {/* Login Form Box */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-md space-y-6 ${
            isDark
              ? 'bg-[#081F5C]/40 border-[#0E2E80]'
              : 'bg-white border-[#081F5C]/10'
          }`}
        >
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Student ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                {lang === 'en' ? 'Student ID' : 'Student ID'}
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => handleStudentIdChange(e.target.value)}
                  placeholder="PA-2026-0001"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl font-mono text-sm uppercase tracking-wider border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                    isDark
                      ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                      : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                  }`}
                />
              </div>
              <p className="text-[11px] opacity-60">
                {lang === 'en'
                  ? 'Format: PA-YYYY-XXXX (e.g. PA-2026-0482)'
                  : 'Aapka permanent academy Student ID'}
              </p>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                  {lang === 'en' ? 'Password' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-xs font-semibold text-[#C5A869] hover:underline cursor-pointer"
                >
                  {lang === 'en' ? 'Forgot Password?' : 'Password Bhool Gaye?'}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                    isDark
                      ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                      : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <button
                id="student-signin-btn"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-full text-base font-bold tracking-wide flex items-center justify-center gap-3 transition-all duration-200 shadow-xl cursor-pointer bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-95"
              >
                <span>
                  {isSubmitting
                    ? lang === 'en'
                      ? 'Signing In…'
                      : 'Sign In Ho Raha Hai…'
                    : lang === 'en'
                    ? 'Sign In'
                    : 'Sign In Kijiye'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* First Login Hint */}
          <div className="pt-3 border-t border-[#081F5C]/10 dark:border-white/10 text-center">
            <p className="text-xs opacity-75">
              {lang === 'en'
                ? 'First time signing in? Use the password you created during enrollment.'
                : 'Pehli baar login kar rahe hain? Enrollment ke dauran banaya gaya password use karein.'}
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs opacity-70">
          <ShieldCheck className="w-4 h-4 text-[#C5A869]" />
          <span>
            {lang === 'en'
              ? 'Pianotastic Academy Official Student Portal'
              : 'Pianotastic Academy Official Student Portal'}
          </span>
        </div>
      </div>
    </div>
  );
};
