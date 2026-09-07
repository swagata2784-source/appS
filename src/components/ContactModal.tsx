import React, { useState } from 'react';
import { X, Mail, Phone, Clock, MessageSquare, Check } from 'lucide-react';
import { Language, Theme } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: Theme;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme,
}) => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !emailOrPhone.trim()) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setName('');
      setEmailOrPhone('');
      setMessage('');
      setFormSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all duration-200 ${
          isDark
            ? 'bg-[#040C24] text-[#F7F2EB] border-[#0E2E80]'
            : 'bg-[#F7F2EB] text-[#081F5C] border-[#081F5C]/15'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold block text-[#C5A869]">
                {lang === 'en' ? 'Direct Guidance' : 'Direct Guidance'}
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
                {lang === 'en' ? 'Contact Pianotastic Academy' : 'Pianotastic Academy se Sampark'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'}`}>
          {lang === 'en'
            ? 'Have questions about course pathways, choosing between Western or Indian music, or required materials? We are here to guide your musical journey.'
            : 'Course selection, Western ya Indian music pathway, ya kisi bhi jankari ke liye humse sampark karein.'}
        </p>

        {/* Quick Contact Points */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 ${
              isDark ? 'bg-[#081F5C]/40 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
            }`}
          >
            <div className="p-2 rounded-xl bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider block opacity-60">Email Support</span>
              <span className="text-xs sm:text-sm font-semibold">contact@pianotastic.com</span>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl border flex items-center gap-3 ${
              isDark ? 'bg-[#081F5C]/40 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
            }`}
          >
            <div className="p-2 rounded-xl bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider block opacity-60">WhatsApp / Helpline</span>
              <span className="text-xs sm:text-sm font-semibold">+91 98765 43210</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs opacity-75 mb-6 px-1">
          <Clock className="w-3.5 h-3.5 text-[#C5A869]" />
          <span>Academy Office Hours: Monday – Saturday, 10:00 AM – 7:00 PM IST</span>
        </div>

        {/* Inquiry Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <h3 className="text-sm font-bold uppercase tracking-wider opacity-80">
            {lang === 'en' ? 'Send an Inquiry' : 'Sawal ya Jankari Bhejein'}
          </h3>

          <div>
            <label className="block text-xs font-semibold mb-1 opacity-80">
              {lang === 'en' ? 'Your Name' : 'Aapka Naam'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={lang === 'en' ? 'e.g. Rahul Sharma' : 'Jaise Rahul Sharma'}
              className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                isDark ? 'bg-[#081F5C]/50 border-[#0E2E80] text-white' : 'bg-white border-[#081F5C]/20 text-[#081F5C]'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 opacity-80">
              {lang === 'en' ? 'Email or Phone Number' : 'Email ya Mobile Number'}
            </label>
            <input
              type="text"
              required
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              placeholder={lang === 'en' ? 'name@example.com or +91...' : 'name@example.com ya phone number'}
              className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                isDark ? 'bg-[#081F5C]/50 border-[#0E2E80] text-white' : 'bg-white border-[#081F5C]/20 text-[#081F5C]'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 opacity-80">
              {lang === 'en' ? 'Message or Question' : 'Aapka Sawal'}
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={lang === 'en' ? 'Tell us what you are looking to learn...' : 'Batayein aap kya seekhna chahte hain...'}
              className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                isDark ? 'bg-[#081F5C]/50 border-[#0E2E80] text-white' : 'bg-white border-[#081F5C]/20 text-[#081F5C]'
              }`}
            />
          </div>

          {formSubmitted ? (
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center gap-2 text-sm font-medium">
              <Check className="w-4 h-4" />
              <span>{lang === 'en' ? 'Inquiry received. We will respond shortly!' : 'Sandesh prapt hua. Hum jald sampark karenge!'}</span>
            </div>
          ) : (
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
              >
                {lang === 'en' ? 'Cancel' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide cursor-pointer transition-all bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C]"
              >
                {lang === 'en' ? 'Send Message' : 'Bhejein'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
