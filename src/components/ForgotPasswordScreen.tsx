import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  User,
  Mail,
  KeyRound,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Language, Theme, StudentAccount } from '../types';
import { Logo } from './Logo';

interface ForgotPasswordScreenProps {
  currentStudent?: StudentAccount | null;
  onBackToLogin: () => void;
  onCodeVerified: (verifiedStudent: StudentAccount) => void;
  lang: Language;
  theme: Theme;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  currentStudent,
  onBackToLogin,
  onCodeVerified,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  // Step 1: Request code | Step 2: Enter code
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [studentId, setStudentId] = useState(currentStudent?.studentId || '');
  const [contact, setContact] = useState(
    currentStudent?.email || currentStudent?.phone || ''
  );
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Timer for resend
  useEffect(() => {
    let timer: any;
    if (step === 'verify' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim() || !contact.trim()) {
      setErrorMessage(
        lang === 'en'
          ? 'Please provide both your Student ID and registered contact.'
          : 'Kripya apna Student ID aur registered contact dono darj karein.'
      );
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setStep('verify');
      setCountdown(30);
      setInfoMessage(
        lang === 'en'
          ? `A 6-digit verification code has been sent to your registered contact for ${studentId.toUpperCase()}.`
          : `Aapke registered contact par 6-digit verification code bhej diya gaya hai.`
      );
    }, 800);
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim().length < 6) {
      setErrorMessage(
        lang === 'en'
          ? 'Please enter the 6-digit verification code.'
          : 'Kripya 6-digit verification code enter karein.'
      );
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const studentRecord: StudentAccount = currentStudent || {
        studentId: studentId.toUpperCase().trim() || 'PA-2026-0482',
        fullName: 'Rahul Sharma',
        email: contact.includes('@') ? contact : 'student@pianotastic.com',
        phone: contact.includes('@') ? '+91 98765 43210' : contact,
        hasCustomPassword: false,
      };
      onCodeVerified(studentRecord);
    }, 600);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(30);
    setInfoMessage(
      lang === 'en'
        ? 'A new verification code has been sent.'
        : 'Naya verification code bhej diya gaya hai.'
    );
  };

  return (
    <div
      id="forgot-password-screen"
      className={`w-full min-h-screen pb-24 transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      <div className="max-w-md mx-auto px-4 sm:px-8 pt-8 sm:pt-14 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToLogin}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-[#C5A869]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {lang === 'en' ? 'Back to Sign In' : 'Sign In me Wapas'}
            </span>
          </button>

          <span className="text-[11px] uppercase tracking-wider font-bold opacity-60">
            Account Recovery
          </span>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-block mx-auto mb-1">
            <Logo size="md" isDark={isDark} />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            {lang === 'en' ? 'Reset Your Password' : 'Password Reset Kijiye'}
          </h1>

          <p
            className={`text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
            }`}
          >
            {lang === 'en'
              ? 'Recover access to your academy courses and student profile securely.'
              : 'Apne academy account ko surakshit dhang se recover karein.'}
          </p>
        </div>

        {/* Recovery Form Box */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border shadow-md space-y-6 ${
            isDark
              ? 'bg-[#081F5C]/40 border-[#0E2E80]'
              : 'bg-white border-[#081F5C]/10'
          }`}
        >
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{infoMessage}</span>
            </div>
          )}

          {step === 'request' ? (
            <form onSubmit={handleRequestCode} className="space-y-5">
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
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    placeholder="PA-2026-0001"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl font-mono text-sm uppercase tracking-wider border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                      isDark
                        ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                        : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                    }`}
                  />
                </div>
              </div>

              {/* Registered Contact */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                  {lang === 'en'
                    ? 'Registered Email or Mobile'
                    : 'Registered Email ya Mobile'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="email@example.com or +91..."
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                      isDark
                        ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                        : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                    }`}
                  />
                </div>
                <p className="text-[11px] opacity-60">
                  {lang === 'en'
                    ? 'Must match the email or mobile on your student record.'
                    : 'Aapke registered student record se match hona chahiye.'}
                </p>
              </div>

              {/* Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-full text-base font-bold tracking-wide flex items-center justify-center gap-3 transition-all duration-200 shadow-xl cursor-pointer bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-95"
                >
                  <span>
                    {isSubmitting
                      ? lang === 'en'
                        ? 'Sending Code…'
                        : 'Code Bhej Rahe Hain…'
                      : lang === 'en'
                      ? 'Send Verification Code'
                      : 'Verification Code Bhejein'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-5">
              {/* 6-digit Code */}
              <div className="space-y-1.5 text-center">
                <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                  {lang === 'en'
                    ? 'Enter 6-Digit Code'
                    : '6-Digit Code Darj Karein'}
                </label>
                <div className="relative max-w-[240px] mx-auto">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="123456"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl font-mono text-center text-lg tracking-[0.3em] font-bold border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                      isDark
                        ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                        : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                    }`}
                  />
                </div>
              </div>

              {/* Resend button */}
              <div className="text-center">
                <button
                  type="button"
                  disabled={countdown > 0}
                  onClick={handleResend}
                  className={`text-xs font-semibold transition-opacity ${
                    countdown > 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'text-[#C5A869] hover:underline cursor-pointer'
                  }`}
                >
                  {countdown > 0
                    ? lang === 'en'
                      ? `Resend code in ${countdown}s`
                      : `${countdown}s me resend karein`
                    : lang === 'en'
                    ? 'Resend Verification Code'
                    : 'Code Dobara Bhejein'}
                </button>
              </div>

              {/* Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-full text-base font-bold tracking-wide flex items-center justify-center gap-3 transition-all duration-200 shadow-xl cursor-pointer bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-95"
                >
                  <span>
                    {isSubmitting
                      ? lang === 'en'
                        ? 'Verifying…'
                        : 'Verify Kar Rahe Hain…'
                      : lang === 'en'
                      ? 'Verify & Create New Password'
                      : 'Verify Karke Password Banayein'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-xs opacity-70">
          <ShieldCheck className="w-4 h-4 text-[#C5A869]" />
          <span>
            {lang === 'en'
              ? 'Official Pianotastic Academy student identity verification'
              : 'Pianotastic Academy student identity verification'}
          </span>
        </div>
      </div>
    </div>
  );
};
