import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Check,
  BookOpen,
  User,
  MapPin,
  Sparkles,
  Info,
  Clock,
  Layers,
} from 'lucide-react';
import { Language, Theme, RecordedCourse, StudentAccount } from '../types';
import { Logo } from './Logo';

interface EnrollmentSummaryScreenProps {
  course: RecordedCourse;
  account: Partial<StudentAccount>;
  onBack: () => void;
  onProceedToPayment: () => void;
  lang: Language;
  theme: Theme;
}

export const EnrollmentSummaryScreen: React.FC<EnrollmentSummaryScreenProps> = ({
  course,
  account,
  onBack,
  onProceedToPayment,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  // Pricing calculations
  const courseFee = course.price;
  const originalPrice = course.originalPrice;
  const discountAmount = originalPrice ? originalPrice - courseFee : 0;

  const requiredBook = course.requiredBooks && course.requiredBooks.length > 0
    ? course.requiredBooks[0]
    : null;

  const bookFee = requiredBook ? requiredBook.price : 0;
  const deliveryFee = requiredBook ? requiredBook.deliveryCharge || 100 : 0;
  const finalTotal = courseFee + bookFee + deliveryFee;

  // Masked email & phone helper
  const maskEmail = (emailStr?: string) => {
    if (!emailStr) return 'registered@student.com';
    const parts = emailStr.split('@');
    if (parts.length !== 2) return emailStr;
    const namePart = parts[0];
    const maskedName =
      namePart.length <= 2
        ? namePart[0] + '***'
        : namePart[0] + '***' + namePart[namePart.length - 1];
    return `${maskedName}@${parts[1]}`;
  };

  const maskPhone = (phoneStr?: string) => {
    if (!phoneStr) return '******0000';
    const trimmed = phoneStr.trim();
    if (trimmed.length < 4) return '******';
    return '******' + trimmed.slice(-4);
  };

  return (
    <div
      id="enrollment-summary-screen"
      className={`w-full min-h-screen pb-24 transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-6 sm:pt-10 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-[#C5A869]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {lang === 'en' ? 'Back to Account' : 'Account me Wapas'}
            </span>
          </button>

          <div className="text-xs uppercase font-bold tracking-wider text-[#C5A869] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Step 3 of 4</span>
          </div>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-block mx-auto mb-1">
            <Logo size="md" isDark={isDark} />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            {lang === 'en' ? 'Enrollment Summary' : 'Enrollment Summary'}
          </h1>

          <p
            className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${
              isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
            }`}
          >
            {lang === 'en'
              ? 'Please review your course details and total amount before proceeding to payment.'
              : 'Payment par aage badhne se pehle apna course details aur total amount review karein.'}
          </p>
        </div>

        {/* Two-Column Responsive Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Course & Included Materials (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Course Information Card */}
            <div
              className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                isDark
                  ? 'bg-[#081F5C]/35 border-[#0E2E80]'
                  : 'bg-white border-[#081F5C]/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#C5A869]">
                  {course.format}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#C5A869]/20 text-[#C5A869] font-semibold">
                  Self-Paced
                </span>
              </div>

              <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                {lang === 'en' ? course.titleEn : course.titleHi}
              </h2>

              <div className="flex flex-wrap gap-2 text-xs">
                {course.level && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#081F5C]/10 dark:bg-white/10 font-semibold capitalize">
                    {course.level} Level
                  </span>
                )}
                {course.indianStyle && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#081F5C]/10 dark:bg-white/10 font-semibold capitalize">
                    {course.indianStyle.replace('-', ' ')}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-[#081F5C]/10 dark:bg-white/10 font-semibold">
                  {course.duration}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#081F5C]/10 dark:bg-white/10 font-semibold">
                  {course.classesCount} Classes
                </span>
              </div>

              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
                }`}
              >
                {lang === 'en' ? course.shortDescEn : course.shortDescHi}
              </p>
            </div>

            {/* Included Materials List */}
            <div
              className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                isDark
                  ? 'bg-[#081F5C]/35 border-[#0E2E80]'
                  : 'bg-white border-[#081F5C]/10'
              }`}
            >
              <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#C5A869]">
                <Layers className="w-4 h-4" />
                <span>
                  {lang === 'en' ? 'Included Materials' : 'Sath me Included'}
                </span>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                {(lang === 'en' ? course.includedMaterialsEn : course.includedMaterialsHi).map(
                  (item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#C5A869] flex-shrink-0 mt-0.5" />
                      <span className="opacity-85">{item}</span>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Required Method Book (if applicable) */}
            {requiredBook && (
              <div
                className={`p-6 rounded-3xl border shadow-sm space-y-3 ${
                  isDark
                    ? 'bg-[#081F5C]/35 border-[#0E2E80]'
                    : 'bg-white border-[#081F5C]/10'
                }`}
              >
                <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#C5A869]">
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {lang === 'en' ? 'Required Method Book' : 'Zaroori Method Book'}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">{requiredBook.title}</h4>
                    <p className="text-xs opacity-75">
                      {lang === 'en' ? requiredBook.descEn : requiredBook.descHi}
                    </p>
                    <span className="inline-block text-[11px] font-semibold text-[#C5A869]">
                      Physical Print Edition (Delivered to your address)
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="font-bold text-sm">
                      ₹{requiredBook.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* After Payment Next Steps Note */}
            <div
              className={`p-5 rounded-2xl border flex items-start gap-3.5 text-xs ${
                isDark
                  ? 'bg-[#040C24]/60 border-[#0E2E80]'
                  : 'bg-[#F7F2EB] border-[#081F5C]/10'
              }`}
            >
              <Info className="w-4 h-4 text-[#C5A869] flex-shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <span className="font-bold block">
                  {lang === 'en' ? 'After Payment' : 'Payment ke baad'}
                </span>
                <p className="opacity-80">
                  {lang === 'en'
                    ? 'Your Recorded Course enrollment will be confirmed, your permanent Student ID will be issued, and your course access will become available immediately upon signing in.'
                    : 'Payment complete hote hi aapka enrollment confirm hoga, Student ID generate hoga, aur sign in karne par course unlock ho jayega.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Transparent Price Breakdown & Confirmation (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Price Breakdown Card */}
            <div
              className={`p-6 sm:p-7 rounded-3xl border shadow-md space-y-5 ${
                isDark
                  ? 'bg-[#081F5C]/40 border-[#0E2E80]'
                  : 'bg-white border-[#081F5C]/10'
              }`}
            >
              <span className="text-xs uppercase tracking-wider font-bold text-[#C5A869] block">
                {lang === 'en' ? 'Fee Breakdown' : 'Fee Breakdown'}
              </span>

              <div className="space-y-3 text-xs sm:text-sm">
                {/* Course Fee */}
                <div className="flex justify-between items-center">
                  <span className="opacity-80">Course Fee (One-Time)</span>
                  <span className="font-semibold">
                    ₹{courseFee.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Original Price / Discount if genuine */}
                {discountAmount > 0 && originalPrice && (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                    <span>Curriculum Discount</span>
                    <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Book Fee */}
                {requiredBook && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="opacity-80">
                        Method Book: {requiredBook.title}
                      </span>
                      <span className="font-semibold">
                        ₹{bookFee.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="opacity-80">Shipping & Delivery</span>
                      <span className="font-semibold">
                        ₹{deliveryFee.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Total Payable Area */}
              <div className="pt-4 border-t border-[#081F5C]/10 dark:border-white/10 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-display font-bold text-base sm:text-lg">
                    {lang === 'en' ? 'Total Payable' : 'Kul Rashi'}
                  </span>
                  <span className="font-display text-2xl sm:text-3xl font-bold text-[#C5A869]">
                    ₹{finalTotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-[11px] opacity-70">
                  {lang === 'en'
                    ? 'One-time enrollment payment. No recurring monthly auto-debits, renewal fees, or late charges.'
                    : 'Yeh one-time payment hai. Koi monthly fees ya recurring charge nahi hai.'}
                </p>
              </div>

              {/* Account Identity Confirmation */}
              <div
                className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                  isDark
                    ? 'bg-[#040C24]/80 border-[#0E2E80]'
                    : 'bg-[#F7F2EB] border-[#081F5C]/10'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold opacity-75">
                  <User className="w-3.5 h-3.5 text-[#C5A869]" />
                  <span>
                    {lang === 'en' ? 'Enrolling as' : 'Student Account'}
                  </span>
                </div>
                <div className="font-semibold text-sm">
                  {account.fullName || 'Registered Student'}
                </div>
                <div className="text-[11px] opacity-70 flex flex-col gap-0.5">
                  <span>{maskEmail(account.email)}</span>
                  <span>{maskPhone(account.phone)}</span>
                </div>
              </div>

              {/* Delivery Address Note (if book included) */}
              {requiredBook && account.deliveryAddress && (
                <div
                  className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    isDark
                      ? 'bg-[#040C24]/80 border-[#0E2E80]'
                      : 'bg-[#F7F2EB] border-[#081F5C]/10'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold opacity-75">
                    <MapPin className="w-3.5 h-3.5 text-[#C5A869]" />
                    <span>
                      {lang === 'en' ? 'Book Delivery Address' : 'Book Delivery Pata'}
                    </span>
                  </div>
                  <p className="opacity-80 text-[11px] leading-relaxed">
                    {account.deliveryAddress}
                  </p>
                </div>
              )}

              {/* Primary CTA: Proceed to Payment */}
              <div className="pt-2">
                <button
                  id="proceed-to-payment-btn"
                  onClick={onProceedToPayment}
                  className="w-full py-4 px-6 rounded-full text-base font-bold tracking-wide flex items-center justify-center gap-3 transition-all duration-200 shadow-xl cursor-pointer bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-95"
                >
                  <span>
                    {lang === 'en'
                      ? 'Proceed to Payment'
                      : 'Payment Par Jayein'}
                  </span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Safe Payment Guarantee */}
              <div className="flex items-center justify-center gap-2 text-[11px] opacity-70 pt-1">
                <ShieldCheck className="w-4 h-4 text-[#C5A869]" />
                <span>
                  {lang === 'en'
                    ? 'Encrypted & Secure Payment Gateway'
                    : 'Surakshit Payment Gateway'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
