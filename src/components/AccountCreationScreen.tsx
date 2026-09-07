import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Info,
} from 'lucide-react';
import { Language, Theme, RecordedCourse } from '../types';
import { Logo } from './Logo';

interface AccountCreationScreenProps {
  course: RecordedCourse;
  initialData?: {
    fullName?: string;
    email?: string;
    phone?: string;
    deliveryAddress?: string;
  };
  onBack: () => void;
  onContinue: (accountData: {
    fullName: string;
    email: string;
    phone: string;
    dob: string;
    deliveryAddress: string;
  }) => void;
  onGoToLogin: () => void;
  lang: Language;
  theme: Theme;
}

export const AccountCreationScreen: React.FC<AccountCreationScreenProps> = ({
  course,
  initialData,
  onBack,
  onContinue,
  onGoToLogin,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  // Form states
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [dob, setDob] = useState('2000-01-01');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Errors / validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Password requirements
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid =
    fullName.trim().length >= 2 &&
    email.includes('@') &&
    phone.trim().length >= 8 &&
    dob.length > 0 &&
    hasMinLength &&
    hasLetter &&
    hasNumber &&
    passwordsMatch &&
    agreeTerms;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    onContinue({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      dob,
      deliveryAddress: initialData?.deliveryAddress || '',
    });
  };

  return (
    <div
      id="account-creation-screen"
      className={`w-full min-h-screen pb-24 transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-6 sm:pt-10 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-[#C5A869]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {lang === 'en'
                ? 'Back to Enrollment'
                : 'Enrollment me Wapas'}
            </span>
          </button>

          <div className="text-xs uppercase font-bold tracking-wider text-[#C5A869] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 2 of 4</span>
          </div>
        </div>

        {/* Brand Logo & Header */}
        <div className="text-center space-y-3">
          <div className="inline-block mx-auto mb-1">
            <Logo size="md" isDark={isDark} />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            {lang === 'en'
              ? 'Create Your Academy Account'
              : 'Apna Academy Account Banaiye'}
          </h1>

          <p
            className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${
              isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
            }`}
          >
            {lang === 'en'
              ? 'Create an academy account to manage your enrolled courses and permanent student record.'
              : 'Apne enrolled courses aur permanent student record ke liye academy account banaiye.'}
          </p>
        </div>

        {/* Context Banner: Selected Recorded Course */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDark
              ? 'bg-[#081F5C]/40 border-[#0E2E80]'
              : 'bg-white border-[#081F5C]/10 shadow-sm'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869] block">
              {lang === 'en' ? "You're enrolling in" : 'Aap enroll kar rahe hain'}
            </span>
            <div className="font-display font-bold text-base sm:text-lg">
              {lang === 'en' ? course.titleEn : course.titleHi}
            </div>
            <div className="text-xs opacity-70">
              {course.format} • {course.duration} • Lifetime Access
            </div>
          </div>

          <div className="text-right sm:border-l sm:pl-6 sm:border-[#081F5C]/10 sm:dark:border-white/10">
            <span className="text-[11px] opacity-70 block">
              {lang === 'en' ? 'Course Fee (One-Time)' : 'Course Fee'}
            </span>
            <span className="font-display text-lg sm:text-xl font-bold text-[#C5A869]">
              ₹{course.price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Two-Column Responsive Layout on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Account Creation Form */}
          <div className="lg:col-span-8">
            <form
              onSubmit={handleSubmit}
              className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6 ${
                isDark
                  ? 'bg-[#081F5C]/30 border-[#0E2E80]'
                  : 'bg-white border-[#081F5C]/10'
              }`}
            >
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider block opacity-80">
                  {lang === 'en' ? 'Full Name *' : 'Pura Naam *'}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                      isDark
                        ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                        : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                    }`}
                  />
                </div>
                {touched.fullName && fullName.trim().length < 2 && (
                  <p className="text-xs text-rose-400">
                    {lang === 'en'
                      ? 'Please enter your full name.'
                      : 'Kripya apna pura naam likhein.'}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider block opacity-80">
                  {lang === 'en' ? 'Email Address *' : 'Email Address *'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    placeholder="rahul@example.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                      isDark
                        ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                        : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                    }`}
                  />
                </div>
                <p className="text-[11px] opacity-60">
                  {lang === 'en'
                    ? 'Used for academy receipts and student account recovery.'
                    : 'Receipts aur account recovery ke liye use hoga.'}
                </p>
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider block opacity-80">
                  {lang === 'en'
                    ? 'Mobile Number *'
                    : 'Mobile Number *'}
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                    placeholder="+91 98765 43210"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                      isDark
                        ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                        : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                    }`}
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider block opacity-80">
                  {lang === 'en' ? 'Date of Birth *' : 'Janam Tithi (Date of Birth) *'}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                      isDark
                        ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                        : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                    }`}
                  />
                </div>
                <div className="flex items-start gap-1.5 text-[11px] opacity-70">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#C5A869]" />
                  <span>
                    {lang === 'en'
                      ? 'Recorded for official academy student registration and age-appropriate pedagogy.'
                      : 'Academy student registration aur curriculum records ke liye zaroori hai.'}
                  </span>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider block opacity-80">
                  {lang === 'en' ? 'Password *' : 'Password *'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
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

                {/* Inline Requirements Check */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasMinLength ? 'text-emerald-500 font-medium' : 'opacity-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>8+ characters</span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      hasLetter && hasNumber
                        ? 'text-emerald-500 font-medium'
                        : 'opacity-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>Letters & numbers</span>
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider block opacity-80">
                  {lang === 'en'
                    ? 'Confirm Password *'
                    : 'Confirm Password *'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() =>
                      setTouched((p) => ({ ...p, confirmPassword: true }))
                    }
                    placeholder="Repeat your password"
                    className={`w-full pl-10 pr-12 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                      isDark
                        ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                        : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-xs opacity-60 hover:opacity-100 transition-opacity"
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
                {touched.confirmPassword &&
                  confirmPassword.length > 0 &&
                  !passwordsMatch && (
                    <p className="text-xs text-rose-400">
                      {lang === 'en'
                        ? 'Passwords do not match.'
                        : 'Password match nahi kar rahe hain.'}
                    </p>
                  )}
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer text-xs opacity-85 select-none">
                  <input
                    type="checkbox"
                    required
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-[#081F5C]/30 text-[#081F5C] focus:ring-[#C5A869]"
                  />
                  <span>
                    {lang === 'en'
                      ? 'I agree to the Pianotastic Academy Terms and Privacy Policy.'
                      : 'Main Pianotastic Academy ke Terms aur Privacy Policy se sehmat hu.'}
                  </span>
                </label>
              </div>

              {/* Primary CTA: Create Account & Continue */}
              <div className="pt-3 space-y-3">
                <button
                  id="create-account-btn"
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full py-4 px-6 rounded-full text-base font-bold tracking-wide flex items-center justify-center gap-3 transition-all duration-200 shadow-xl ${
                    isFormValid
                      ? 'cursor-pointer bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-95'
                      : 'opacity-50 cursor-not-allowed bg-gray-400 text-white'
                  }`}
                >
                  <span>
                    {lang === 'en'
                      ? 'Create Account & Continue'
                      : 'Account Banakar Continue Kijiye'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Secondary Option: Existing Account */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={onGoToLogin}
                    className="text-xs sm:text-sm font-semibold opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-[#C5A869]"
                  >
                    {lang === 'en'
                      ? 'Already have an account? Log in'
                      : 'Pehle se account hai? Login Kijiye'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Security & Student ID Clarification */}
          <div className="lg:col-span-4 space-y-5">
            {/* Student ID Notice Card */}
            <div
              className={`p-5 rounded-2xl border space-y-2.5 ${
                isDark
                  ? 'bg-[#081F5C]/20 border-[#0E2E80]'
                  : 'bg-white border-[#081F5C]/10 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A869]">
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {lang === 'en' ? 'Student ID System' : 'Student ID Niyam'}
                </span>
              </div>
              <p className="text-xs opacity-80 leading-relaxed">
                {lang === 'en'
                  ? 'Your permanent Student ID (format PA-2026-0001) is automatically generated by the academy upon enrollment confirmation. You do not need to create one.'
                  : 'Aapka permanent Student ID (PA-2026-0001) enrollment confirm hone par academy generate karegi.'}
              </p>
            </div>

            {/* Separate Account vs Enrollment notice */}
            <div
              className={`p-5 rounded-2xl border space-y-2 text-xs ${
                isDark
                  ? 'bg-[#040C24]/60 border-[#0E2E80]'
                  : 'bg-[#F7F2EB] border-[#081F5C]/10'
              }`}
            >
              <span className="font-bold block text-sm">
                {lang === 'en'
                  ? 'Single Academy Account'
                  : 'Ek Hi Academy Account'}
              </span>
              <p className="opacity-75 leading-relaxed">
                {lang === 'en'
                  ? 'Your academy account stays permanent. Any future courses, certifications, or method books will automatically link to this account.'
                  : 'Aapka yeh academy account permanent rahega aur aage ke sabhi courses isse jude rahenge.'}
              </p>
            </div>

            {/* Privacy Guarantee */}
            <div className="p-4 rounded-xl border border-dashed border-[#081F5C]/20 dark:border-white/10 text-xs opacity-75 leading-relaxed">
              {lang === 'en'
                ? 'Your password is never shared or stored in plain text. Pianotastic Academy follows strict security protocols for student records.'
                : 'Aapka password surakshit rehta hai aur kabhi plain text mein save nahi hota.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
