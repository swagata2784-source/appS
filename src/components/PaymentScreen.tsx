import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { Language, Theme, RecordedCourse, StudentAccount } from '../types';
import { Logo } from './Logo';

interface PaymentScreenProps {
  course: RecordedCourse;
  account: Partial<StudentAccount>;
  onBack: () => void;
  onPaymentSuccess: (transactionData: {
    transactionId: string;
    amountPaid: number;
    courseId: string;
  }) => void;
  lang: Language;
  theme: Theme;
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({
  course,
  account,
  onBack,
  onPaymentSuccess,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  // Calculate final amount exactly matching summary
  const courseFee = course.price;
  const requiredBook = course.requiredBooks && course.requiredBooks.length > 0
    ? course.requiredBooks[0]
    : null;
  const bookFee = requiredBook ? requiredBook.price : 0;
  const deliveryFee = requiredBook ? requiredBook.deliveryCharge || 100 : 0;
  const finalPayable = courseFee + bookFee + deliveryFee;

  // Payment states
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [upiMode, setUpiMode] = useState<'vpa' | 'qr'>('vpa');

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(account.fullName || '');

  // Net banking bank selection
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // Transaction processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Format card number with spaces
  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    const parts = digits.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : digits);
  };

  // Format expiry MM/YY
  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 2) {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    } else {
      setCardExpiry(digits);
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    setPaymentError(null);
    setIsProcessing(true);

    // Secure gateway transaction simulation with duplicate protection
    setTimeout(() => {
      // Create permanent academy transaction reference
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const transactionId = `PTA-PAY-${randomSuffix}`;

      setIsProcessing(false);
      onPaymentSuccess({
        transactionId,
        amountPaid: finalPayable,
        courseId: course.id,
      });
    }, 1800);
  };

  return (
    <div
      id="recorded-course-payment-screen"
      className={`w-full min-h-screen pb-24 transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-6 sm:pt-10 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className={`inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide transition-opacity text-[#C5A869] ${
              isProcessing
                ? 'opacity-40 cursor-not-allowed'
                : 'opacity-80 hover:opacity-100 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>
              {lang === 'en' ? 'Back to Summary' : 'Summary me Wapas'}
            </span>
          </button>

          <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-[#C5A869]">
            <Lock className="w-3.5 h-3.5" />
            <span>
              {lang === 'en' ? '256-Bit SSL Encrypted' : '256-Bit SSL Encrypted'}
            </span>
          </div>
        </div>

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-block mx-auto mb-1">
            <Logo size="md" isDark={isDark} />
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            {lang === 'en' ? 'Complete Payment' : 'Payment Complete Kijiye'}
          </h1>

          <p
            className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed ${
              isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
            }`}
          >
            {lang === 'en'
              ? 'Choose your preferred payment method to finalize your enrollment.'
              : 'Apna manpasand payment method select karein.'}
          </p>
        </div>

        {/* Order Payment Summary Header Card */}
        <div
          className={`p-5 sm:p-6 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
            isDark
              ? 'bg-[#081F5C]/40 border-[#0E2E80]'
              : 'bg-white border-[#081F5C]/10'
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869]">
              {lang === 'en' ? 'Course Enrollment' : 'Course Enrollment'}
            </span>
            <h3 className="font-display text-lg sm:text-xl font-bold">
              {lang === 'en' ? course.titleEn : course.titleHi}
            </h3>
            <p className="text-xs opacity-75">
              One-Time Payment • Self-Paced Recorded Course
            </p>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-6 border-[#081F5C]/10 dark:border-white/10">
            <span className="text-xs opacity-70 block">
              {lang === 'en' ? 'Total Amount' : 'Kul Rashi'}
            </span>
            <span className="font-display text-2xl sm:text-3xl font-bold text-[#C5A869]">
              ₹{finalPayable.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Error Notification if any */}
        {paymentError && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-500">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">
                {lang === 'en'
                  ? 'Payment Couldn’t Be Completed'
                  : 'Payment Complete Nahi Ho Saka'}
              </span>
              <p className="opacity-90">{paymentError}</p>
            </div>
          </div>
        )}

        {/* Payment Methods Selection Box */}
        <div
          className={`rounded-3xl border shadow-sm overflow-hidden ${
            isDark
              ? 'bg-[#081F5C]/30 border-[#0E2E80]'
              : 'bg-white border-[#081F5C]/10'
          }`}
        >
          {/* Method Tabs */}
          <div className="grid grid-cols-3 border-b border-[#081F5C]/10 dark:border-white/10 text-xs sm:text-sm font-semibold">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setSelectedMethod('upi')}
              className={`py-3.5 px-4 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                selectedMethod === 'upi'
                  ? 'bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869] border-b-2 border-[#C5A869]'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>UPI</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setSelectedMethod('card')}
              className={`py-3.5 px-4 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                selectedMethod === 'card'
                  ? 'bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869] border-b-2 border-[#C5A869]'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Card</span>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setSelectedMethod('netbanking')}
              className={`py-3.5 px-4 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                selectedMethod === 'netbanking'
                  ? 'bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869] border-b-2 border-[#C5A869]'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Net Banking</span>
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handlePay} className="p-6 sm:p-8 space-y-6">
            {/* UPI Option */}
            {selectedMethod === 'upi' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setUpiMode('vpa')}
                    className={`px-3 py-1.5 rounded-full font-semibold border cursor-pointer transition-colors ${
                      upiMode === 'vpa'
                        ? 'bg-[#C5A869]/20 text-[#C5A869] border-[#C5A869]'
                        : 'border-[#081F5C]/10 dark:border-white/10 opacity-70'
                    }`}
                  >
                    UPI ID / VPA
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpiMode('qr')}
                    className={`px-3 py-1.5 rounded-full font-semibold border cursor-pointer transition-colors ${
                      upiMode === 'qr'
                        ? 'bg-[#C5A869]/20 text-[#C5A869] border-[#C5A869]'
                        : 'border-[#081F5C]/10 dark:border-white/10 opacity-70'
                    }`}
                  >
                    Scan QR Code
                  </button>
                </div>

                {upiMode === 'vpa' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                      {lang === 'en'
                        ? 'Enter UPI ID (VPA)'
                        : 'Apna UPI ID Darj Karein'}
                    </label>
                    <input
                      type="text"
                      required={selectedMethod === 'upi' && upiMode === 'vpa'}
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. yourname@okhdfcbank or yourname@paytm"
                      className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                        isDark
                          ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                          : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                      }`}
                    />
                    <div className="flex flex-wrap gap-2 pt-1 text-[11px] opacity-75">
                      <span>Supported:</span>
                      <span className="font-semibold">Google Pay</span>•
                      <span className="font-semibold">PhonePe</span>•
                      <span className="font-semibold">Paytm</span>•
                      <span className="font-semibold">BHIM</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl border text-center space-y-3 bg-[#081F5C]/5 dark:bg-white/5 border-[#081F5C]/10 dark:border-white/10">
                    <div className="w-40 h-40 mx-auto rounded-xl bg-white p-3 flex items-center justify-center shadow-inner">
                      <QrCode className="w-32 h-32 text-[#081F5C]" />
                    </div>
                    <p className="text-xs opacity-80">
                      Scan with any UPI App (GPay, PhonePe, Paytm, BHIM)
                    </p>
                    <span className="text-sm font-bold text-[#C5A869] block">
                      Pay ₹{finalPayable.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Debit / Credit Card Option */}
            {selectedMethod === 'card' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                    {lang === 'en' ? 'Card Number' : 'Card Number'}
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                    <input
                      type="text"
                      required={selectedMethod === 'card'}
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      placeholder="4532 •••• •••• 8921"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                        isDark
                          ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                          : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                      {lang === 'en' ? 'Expiry (MM/YY)' : 'Expiry (MM/YY)'}
                    </label>
                    <input
                      type="text"
                      required={selectedMethod === 'card'}
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      placeholder="08/28"
                      className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                        isDark
                          ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                          : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                      {lang === 'en' ? 'CVV' : 'CVV'}
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required={selectedMethod === 'card'}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                      placeholder="•••"
                      className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                        isDark
                          ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                          : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                    {lang === 'en' ? 'Cardholder Name' : 'Card Par Naam'}
                  </label>
                  <input
                    type="text"
                    required={selectedMethod === 'card'}
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="Name as printed on card"
                    className={`w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                      isDark
                        ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                        : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Net Banking Option */}
            {selectedMethod === 'netbanking' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                  {lang === 'en' ? 'Select Your Bank' : 'Apna Bank Chuniye'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    'HDFC',
                    'State Bank of India',
                    'ICICI',
                    'Axis Bank',
                    'Kotak Mahindra',
                    'Punjab National Bank',
                  ].map((bank) => (
                    <button
                      key={bank}
                      type="button"
                      onClick={() => setSelectedBank(bank)}
                      className={`p-3 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                        selectedBank === bank
                          ? 'bg-[#C5A869]/20 text-[#C5A869] border-[#C5A869]'
                          : 'border-[#081F5C]/10 dark:border-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {bank}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Payment Action Button */}
            <div className="pt-4 space-y-3">
              <button
                id="execute-payment-btn"
                type="submit"
                disabled={isProcessing}
                className={`w-full py-4 px-6 rounded-full text-base font-bold tracking-wide flex items-center justify-center gap-3 transition-all duration-200 shadow-xl ${
                  isProcessing
                    ? 'opacity-70 cursor-not-allowed bg-[#C5A869] text-[#081F5C]'
                    : 'cursor-pointer bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-95'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>
                      {lang === 'en'
                        ? 'Processing Payment…'
                        : 'Payment Process Ho Rahi Hai…'}
                    </span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#C5A869]" />
                    <span>
                      {lang === 'en'
                        ? `Pay ₹${finalPayable.toLocaleString('en-IN')}`
                        : `₹${finalPayable.toLocaleString('en-IN')} Pay Kijiye`}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] opacity-70 text-center">
                <ShieldCheck className="w-4 h-4 text-[#C5A869]" />
                <span>
                  {lang === 'en'
                    ? 'Authorized Pianotastic Academy payment gateway. Double payment protection active.'
                    : 'Pianotastic Academy authorized payment gateway. Double payment suraksha active.'}
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
