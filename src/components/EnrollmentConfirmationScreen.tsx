import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Receipt,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Sparkles,
  Lock,
  Download,
  X,
} from 'lucide-react';
import { Language, Theme, RecordedCourse, StudentAccount } from '../types';
import { Logo } from './Logo';

interface EnrollmentConfirmationScreenProps {
  course: RecordedCourse;
  student: StudentAccount;
  onContinueToSignIn: () => void;
  lang: Language;
  theme: Theme;
}

export const EnrollmentConfirmationScreen: React.FC<EnrollmentConfirmationScreenProps> = ({
  course,
  student,
  onContinueToSignIn,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [copiedId, setCopiedId] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(student.studentId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div
      id="enrollment-confirmation-screen"
      className={`w-full min-h-screen pb-24 transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-block mx-auto mb-1">
            <Logo size="md" isDark={isDark} />
          </div>

          {/* Success Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {lang === 'en' ? "You're Enrolled!" : 'Aap Enrolled Hain!'}
            </span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            {lang === 'en'
              ? 'Welcome to Pianotastic Academy'
              : 'Pianotastic Academy me Welcome'}
          </h1>

          <p
            className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${
              isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
            }`}
          >
            {lang === 'en'
              ? 'Your Recorded Course enrollment has been confirmed and your permanent student record is ready.'
              : 'Aapka enrollment confirm ho gaya hai aur student record taiyaar hai.'}
          </p>
        </div>

        {/* Academy-Generated Student ID Card */}
        <div
          className={`p-6 sm:p-7 rounded-3xl border shadow-lg relative overflow-hidden space-y-4 ${
            isDark
              ? 'bg-[#081F5C]/60 border-[#C5A869]/40'
              : 'bg-white border-[#C5A869]/30'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#C5A869]">
              {lang === 'en'
                ? 'Official Academy Student ID'
                : 'Official Academy Student ID'}
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#C5A869]/20 text-[#C5A869] font-bold">
              Permanent
            </span>
          </div>

          <div className="flex items-center justify-between bg-[#081F5C]/10 dark:bg-white/10 p-4 rounded-2xl border border-[#081F5C]/10 dark:border-white/10">
            <div className="space-y-0.5">
              <span className="text-[10px] opacity-60 uppercase font-semibold tracking-wider block">
                Student ID
              </span>
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-[#C5A869]">
                {student.studentId}
              </span>
            </div>

            <button
              onClick={handleCopyId}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-90"
            >
              {copiedId ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'en' ? 'Copied' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Copy ID' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs opacity-80 leading-relaxed">
            {lang === 'en'
              ? "Keep this ID safe. You'll use it along with your password to sign in to your Pianotastic Academy account across all devices."
              : 'Is ID ko sambhal kar rakhein. Aage login karne ke liye is ID ki zaroorat padegi.'}
          </p>

          <div className="pt-1 flex items-center gap-2 text-[11px] text-[#C5A869]">
            <Lock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {lang === 'en'
                ? 'Student ID is separate from your password. Never share your password.'
                : 'Student ID aur Password alag hain. Apna password kisi se share na karein.'}
            </span>
          </div>
        </div>

        {/* Enrollment & Course Context Summary */}
        <div
          className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDark
              ? 'bg-[#081F5C]/30 border-[#0E2E80]'
              : 'bg-white border-[#081F5C]/10'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#081F5C]/10 dark:border-white/10 pb-3">
            <span className="text-xs uppercase font-bold tracking-wider opacity-70">
              {lang === 'en' ? 'Enrolled Course' : 'Enrolled Course'}
            </span>
            <span className="text-xs font-semibold text-[#C5A869]">
              Lifetime Access
            </span>
          </div>

          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold">
              {lang === 'en' ? course.titleEn : course.titleHi}
            </h3>
            <p className="text-xs opacity-75">
              {course.format} • {course.duration} • {course.classesCount} Classes
            </p>
          </div>

          {/* Payment reference & line item */}
          <div className="pt-2 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="opacity-60 block text-[11px]">Payment Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Successful
              </span>
            </div>
            <div>
              <span className="opacity-60 block text-[11px]">Amount Paid</span>
              <span className="font-bold text-sm">
                ₹{(student.amountPaid || course.price).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="opacity-60 block text-[11px]">Reference No.</span>
              <span className="font-mono text-[11px] font-semibold opacity-90">
                {student.paymentReference || 'PTA-PAY-829103'}
              </span>
            </div>
            <div>
              <span className="opacity-60 block text-[11px]">Student Name</span>
              <span className="font-semibold truncate block">
                {student.fullName}
              </span>
            </div>
          </div>
        </div>

        {/* What's Next Steps Guide */}
        <div
          className={`p-6 rounded-3xl border shadow-sm space-y-3 ${
            isDark
              ? 'bg-[#081F5C]/20 border-[#0E2E80]'
              : 'bg-[#F7F2EB] border-[#081F5C]/10'
          }`}
        >
          <span className="text-xs uppercase font-bold tracking-wider text-[#C5A869] block">
            {lang === 'en' ? "What's Next?" : 'Aage Kya Karna Hai?'}
          </span>

          <ol className="space-y-2.5 text-xs sm:text-sm">
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#C5A869]/20 text-[#C5A869] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </span>
              <span>
                {lang === 'en'
                  ? 'Sign in using your new Student ID.'
                  : 'Apne naye Student ID ke sath sign in karein.'}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#C5A869]/20 text-[#C5A869] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </span>
              <span>
                {lang === 'en'
                  ? 'Confirm your private password when prompted.'
                  : 'Pehli baar login karte waqt apna password confirm karein.'}
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-[#C5A869]/20 text-[#C5A869] font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </span>
              <span>
                {lang === 'en'
                  ? 'Start your Recorded Course and open Class 1.'
                  : 'Apna Recorded Course shuru karein aur Class 1 open karein.'}
              </span>
            </li>
          </ol>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            id="continue-to-signin-btn"
            onClick={onContinueToSignIn}
            className="w-full py-4 px-6 rounded-full text-base font-bold tracking-wide flex items-center justify-center gap-3 transition-all duration-200 shadow-xl cursor-pointer bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-95"
          >
            <span>
              {lang === 'en' ? 'Continue to Sign In' : 'Sign In Kijiye'}
            </span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setShowReceiptModal(true)}
            className="w-full py-3 px-4 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 border border-[#081F5C]/20 dark:border-white/20 hover:border-[#C5A869] transition-colors cursor-pointer text-[#C5A869]"
          >
            <Receipt className="w-4 h-4" />
            <span>
              {lang === 'en' ? 'View Payment Receipt' : 'Payment Receipt Dekhein'}
            </span>
          </button>
        </div>
      </div>

      {/* Payment Receipt Modal */}
      {showReceiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-6 ${
              isDark
                ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                : 'bg-white border-[#081F5C]/15 text-[#081F5C]'
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#081F5C]/10 dark:border-white/10 pb-4">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869]">
                  Official Receipt
                </span>
                <h3 className="font-display text-lg font-bold">
                  Pianotastic Academy
                </h3>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-500/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="opacity-60 block">Receipt Date</span>
                  <span className="font-semibold">
                    {new Date().toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="opacity-60 block">Reference No.</span>
                  <span className="font-mono font-semibold">
                    {student.paymentReference || 'PTA-PAY-829103'}
                  </span>
                </div>
                <div>
                  <span className="opacity-60 block">Student ID</span>
                  <span className="font-mono font-bold text-[#C5A869]">
                    {student.studentId}
                  </span>
                </div>
                <div>
                  <span className="opacity-60 block">Student Name</span>
                  <span className="font-semibold">{student.fullName}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#081F5C]/10 dark:border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span>{lang === 'en' ? course.titleEn : course.titleHi} (Recorded)</span>
                  <span className="font-semibold">₹{course.price.toLocaleString('en-IN')}</span>
                </div>
                {student.amountPaid && student.amountPaid > course.price && (
                  <div className="flex justify-between text-opacity-80">
                    <span>Method Book & Shipping</span>
                    <span className="font-semibold">
                      ₹{(student.amountPaid - course.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-[#081F5C]/10 dark:border-white/10 font-bold text-sm">
                  <span>Total Paid (INR)</span>
                  <span className="text-[#C5A869]">
                    ₹{(student.amountPaid || course.price).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowReceiptModal(false)}
                className="w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-90"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
