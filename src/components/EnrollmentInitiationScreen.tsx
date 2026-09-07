import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ShieldCheck,
  BookOpen,
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Music,
  Check,
} from 'lucide-react';
import { Language, Theme, RecordedCourse } from '../types';

interface EnrollmentInitiationScreenProps {
  course: RecordedCourse;
  onBack: () => void;
  onComplete: () => void;
  onContinueToAccount?: (data: {
    fullName: string;
    email: string;
    phone: string;
    deliveryAddress: string;
    priorExperience: string;
  }) => void;
  lang: Language;
  theme: Theme;
}

export const EnrollmentInitiationScreen: React.FC<EnrollmentInitiationScreenProps> = ({
  course,
  onBack,
  onComplete,
  onContinueToAccount,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [priorExperience, setPriorExperience] = useState<'none' | 'beginner' | 'intermediate'>('none');
  const [confirmed, setConfirmed] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Financial calculations
  const courseFee = course.price;
  const bookTotal = course.requiredBooks?.reduce((sum, b) => sum + b.price + (b.deliveryCharge || 100), 0) || 0;
  const totalPayable = courseFee + bookTotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      return;
    }
    if (onContinueToAccount) {
      onContinueToAccount({
        fullName,
        email,
        phone,
        deliveryAddress: deliveryAddress || city,
        priorExperience,
      });
    } else {
      setFormSubmitted(true);
    }
  };

  return (
    <div
      id="enrollment-initiation-screen"
      className={`w-full min-h-screen pb-20 transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6 space-y-8">
        {/* Navigation Breadcrumb */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-[#C5A869]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'en' ? 'Back to Course Details' : 'Course Details me Wapas'}</span>
        </button>

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#C5A869]">
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'en' ? 'Academy Enrollment' : 'Academy Enrollment'}</span>
          </div>

          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
            {lang === 'en' ? 'Complete Your Enrollment' : 'Apna Enrollment Pura Karein'}
          </h1>

          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
            }`}
          >
            {lang === 'en'
              ? 'Confirm your course details, student contact information, and review your transparent fee summary.'
              : 'Apne course details aur student contact information verify karein.'}
          </p>
        </div>

        {formSubmitted ? (
          /* CELEBRATORY ORIENTATION RECEIPT MODAL / SCREEN (Prompt 12) */
          <div
            className={`p-6 sm:p-10 rounded-3xl border text-center space-y-6 animate-fade-in ${
              isDark
                ? 'bg-gradient-to-b from-[#081F5C] to-[#040C24] border-[#C5A869]/50'
                : 'bg-white border-[#081F5C]/20 shadow-xl'
            }`}
          >
            <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-[#C5A869]/20 text-[#C5A869]">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-[#C5A869]">
                {lang === 'en' ? 'Enrollment Registered' : 'Enrollment Saphal'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                {lang === 'en' ? `Welcome to Pianotastic Academy, ${fullName}!` : `Pianotastic Academy me Swagat Hai, ${fullName}!`}
              </h2>
              <p
                className={`text-xs sm:text-sm max-w-lg mx-auto leading-relaxed ${
                  isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
                }`}
              >
                {lang === 'en'
                  ? 'Your enrollment details for this recorded course have been initialized. A confirmation receipt and curriculum orientation guide have been noted for ' + email + '.'
                  : 'Aapke enrollment details register ho chuke hain. Orientation guide aapke email ' + email + ' par forward kar di jayegi.'}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div
              className={`p-5 rounded-2xl border text-left max-w-md mx-auto text-xs sm:text-sm space-y-3 ${
                isDark ? 'bg-[#040C24]/80 border-[#0E2E80]' : 'bg-[#F7F2EB] border-[#081F5C]/10'
              }`}
            >
              <div className="flex justify-between pb-2 border-b border-[#081F5C]/10 dark:border-white/10 font-semibold">
                <span>{lang === 'en' ? 'Course' : 'Course'}</span>
                <span className="text-right">{course.titleEn}</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'en' ? 'Format' : 'Format'}</span>
                <span>{course.format} (Self-Paced)</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'en' ? 'Student Name' : 'Student Name'}</span>
                <span>{fullName}</span>
              </div>
              <div className="flex justify-between">
                <span>{lang === 'en' ? 'Contact' : 'Contact'}</span>
                <span>{phone}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#081F5C]/10 dark:border-white/10 font-bold text-[#C5A869]">
                <span>{lang === 'en' ? 'Total One-Time Fee' : 'Kul Rashi'}</span>
                <span>₹{totalPayable.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onComplete}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm sm:text-base font-bold tracking-wide transition-all cursor-pointer shadow-lg bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C]"
              >
                {lang === 'en' ? 'Return to Courses' : 'Courses me Wapas Jayein'}
              </button>
            </div>
          </div>
        ) : (
          /* TWO-COLUMN ENROLLMENT LAYOUT: Course Summary & Contact Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Course & Fee Breakdown (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Course Overview Card */}
              <div
                className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                  isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10'
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#C5A869] block">
                  {lang === 'en' ? 'Selected Course' : 'Chuna Hua Course'}
                </span>

                <h3 className="font-display text-xl font-bold tracking-tight">
                  {lang === 'en' ? course.titleEn : course.titleHi}
                </h3>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#081F5C]/10 dark:bg-white/10 font-semibold">
                    {course.format}
                  </span>
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
                </div>

                <p className="text-xs opacity-75 leading-relaxed">
                  {course.duration} • {course.classesCount} Classes • Lifetime Access
                </p>
              </div>

              {/* Fee Breakdown Card */}
              <div
                className={`p-6 rounded-3xl border shadow-sm space-y-3 ${
                  isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10'
                }`}
              >
                <span className="text-[11px] uppercase tracking-wider font-bold text-[#C5A869] block mb-2">
                  {lang === 'en' ? 'Fee Breakdown' : 'Fee Breakdown'}
                </span>

                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="opacity-80">Course Fee (One-Time)</span>
                  <span className="font-semibold">₹{courseFee.toLocaleString('en-IN')}</span>
                </div>

                {course.requiredBooks && course.requiredBooks.length > 0 && (
                  <>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="opacity-80">Method Book: {course.requiredBooks[0].title}</span>
                      <span className="font-semibold">₹{course.requiredBooks[0].price}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="opacity-80">Shipping & Delivery</span>
                      <span className="font-semibold">₹{course.requiredBooks[0].deliveryCharge || 100}</span>
                    </div>
                  </>
                )}

                <div className="pt-3 border-t border-[#081F5C]/10 dark:border-white/10 flex justify-between items-baseline">
                  <span className="font-bold text-sm sm:text-base">Total Payable</span>
                  <span className="font-display text-2xl font-bold text-[#C5A869]">
                    ₹{totalPayable.toLocaleString('en-IN')}
                  </span>
                </div>

                <p className="text-[11px] opacity-70 leading-relaxed pt-1">
                  Transparent one-time fee. No recurring charges, monthly auto-debits, or late fees.
                </p>
              </div>

              {/* Reassurance Guarantee */}
              <div
                className={`p-5 rounded-2xl border flex items-start gap-3 text-xs ${
                  isDark ? 'bg-[#040C24]/60 border-[#0E2E80]' : 'bg-[#F7F2EB] border-[#081F5C]/10'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-[#C5A869] flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">Pianotastic Academy Promise</span>
                  <span className="opacity-75 leading-relaxed">
                    Access will be immediately activated upon orientation confirmation with continuous teacher support.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Student Details Form (7 Cols) */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handleSubmit}
                className={`p-6 sm:p-8 rounded-3xl border shadow-sm space-y-5 ${
                  isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10'
                }`}
              >
                <h3 className="font-display text-xl font-bold tracking-tight">
                  {lang === 'en' ? 'Student Information' : 'Student Information'}
                </h3>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                    {lang === 'en' ? 'Full Name *' : 'Pura Naam *'}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                        isDark
                          ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                          : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                      }`}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                    {lang === 'en' ? 'Email Address *' : 'Email Address *'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rahul@example.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                        isDark
                          ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                          : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                      }`}
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                    {lang === 'en' ? 'Phone / WhatsApp Number *' : 'Phone / WhatsApp Number *'}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                        isDark
                          ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                          : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                      }`}
                    />
                  </div>
                </div>

                {/* City & Delivery Address (if book required) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                    {course.requiredBooks && course.requiredBooks.length > 0
                      ? lang === 'en'
                        ? 'Book Shipping Address & City *'
                        : 'Book Delivery Pata & Shehar *'
                      : lang === 'en'
                      ? 'City / State'
                      : 'Shehar / Rajya'}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 opacity-50" />
                    <textarea
                      rows={2}
                      required={!!(course.requiredBooks && course.requiredBooks.length > 0)}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder={
                        course.requiredBooks && course.requiredBooks.length > 0
                          ? 'House / Flat no., Street, Area, City, Pincode'
                          : 'e.g. Mumbai, Maharashtra'
                      }
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                        isDark
                          ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                          : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                      }`}
                    />
                  </div>
                </div>

                {/* Prior Piano Experience */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                    {lang === 'en' ? 'Prior Piano Background' : 'Piano ka Purv Anubhav'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'none', label: 'Complete Beginner' },
                      { id: 'beginner', label: 'Some Keys' },
                      { id: 'intermediate', label: 'Reads Sheet' },
                    ].map((exp) => (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => setPriorExperience(exp.id as any)}
                        className={`p-2.5 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                          priorExperience === exp.id
                            ? 'bg-[#081F5C]/15 dark:bg-white/20 text-[#C5A869] border-[#C5A869]'
                            : 'border-[#081F5C]/15 dark:border-white/10 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {exp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Terms confirmation */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer text-xs opacity-80 select-none">
                    <input
                      type="checkbox"
                      required
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-0.5 rounded border-[#081F5C]/30 text-[#081F5C] focus:ring-[#C5A869]"
                    />
                    <span>
                      {lang === 'en'
                        ? 'I understand this is a self-paced recorded course with lifetime access and official academy notes.'
                        : 'Main samajhta hu ki yeh lifetime access wala recorded course hai.'}
                    </span>
                  </label>
                </div>

                {/* Submit Action */}
                <div className="pt-4">
                  <button
                    id="submit-enrollment-btn"
                    type="submit"
                    disabled={!confirmed}
                    className={`w-full py-4 px-6 rounded-full text-base font-bold tracking-wide flex items-center justify-center gap-3 transition-all duration-200 shadow-xl ${
                      confirmed
                        ? 'cursor-pointer bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-95'
                        : 'opacity-50 cursor-not-allowed bg-gray-400 text-white'
                    }`}
                  >
                    <span>{lang === 'en' ? 'Continue to Account' : 'Account Banane Ke Liye Aage Badhein'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
