import React from 'react';
import { ArrowRight, Sparkles, Heart } from 'lucide-react';
import { Language, Theme } from '../types';
import { Logo } from './Logo';

interface FounderWelcomeScreenProps {
  onContinue: () => void;
  onBack: () => void;
  lang: Language;
  theme: Theme;
}

export const FounderWelcomeScreen: React.FC<FounderWelcomeScreenProps> = ({
  onContinue,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      id="founder-welcome-screen"
      className={`min-h-[calc(100vh-5rem)] flex flex-col justify-between py-8 px-4 sm:px-8 max-w-5xl mx-auto w-full transition-colors duration-300 ${
        isDark ? 'text-[#F7F2EB]' : 'text-[#081F5C]'
      }`}
    >
      <main className="flex-1 flex flex-col justify-center my-auto py-4">
        {/* Subtle Badge */}
        <div className="flex justify-center mb-6">
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase ${
              isDark
                ? 'bg-[#081F5C]/70 text-[#C5A869] border border-[#C5A869]/30'
                : 'bg-[#081F5C]/8 text-[#081F5C] border border-[#081F5C]/15'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === 'en'
                ? 'From the Founder'
                : 'Sansthaapak ki aur se'}
            </span>
          </div>
        </div>

        {/* Bento Layout: Portrait Card + Message Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-8">
          {/* Founder Portrait Bento Card */}
          <div
            className={`md:col-span-5 rounded-3xl p-6 sm:p-8 border shadow-sm flex flex-col items-center justify-center text-center transition-all ${
              isDark
                ? 'bg-[#081F5C]/40 border-[#0E2E80]'
                : 'bg-white border-[#081F5C]/10'
            }`}
          >
            <div
              className={`relative w-44 sm:w-52 aspect-[4/5] rounded-2xl overflow-hidden border p-1 shadow-lg transition-all mb-4 ${
                isDark
                  ? 'bg-gradient-to-b from-[#0E2E80] to-[#040C24] border-[#C5A869]/40'
                  : 'bg-gradient-to-b from-[#EBE2D5] to-[#F7F2EB] border-[#081F5C]/20'
              }`}
            >
              {/* Inner photo frame */}
              <div
                className={`w-full h-full rounded-xl flex flex-col items-center justify-center p-6 text-center ${
                  isDark ? 'bg-[#081F5C]/70' : 'bg-white/90'
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm ${
                    isDark ? 'bg-[#0E2E80] text-[#C5A869]' : 'bg-[#081F5C] text-[#F7F2EB]'
                  }`}
                >
                  <Heart className="w-7 h-7 fill-current opacity-90" />
                </div>
                <h3 className="font-display font-bold text-base sm:text-lg mb-1 tracking-wide">
                  Founder
                </h3>
                <p className="text-xs opacity-75 font-body">
                  Pianotastic Academy
                </p>
                <div className="w-10 h-[1px] bg-[#C5A869] my-2.5 opacity-60" />
                <span className="text-[10px] tracking-widest uppercase font-semibold opacity-60">
                  {lang === 'en' ? 'Music Director' : 'Sangeet Nirdeshak'}
                </span>
              </div>
            </div>

            {/* Academy Logo mark */}
            <Logo size="sm" isDark={isDark} />
          </div>

          {/* Founder Personal Note Bento Card */}
          <div
            className={`md:col-span-7 rounded-3xl p-6 sm:p-10 border shadow-sm flex flex-col justify-center transition-all ${
              isDark
                ? 'bg-[#081F5C]/40 border-[#0E2E80]'
                : 'bg-white border-[#081F5C]/10'
            }`}
          >
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 leading-tight">
              {lang === 'en' ? (
                <>
                  A warm welcome to <br />
                  <span className="text-[#C5A869]">Pianotastic Academy.</span>
                </>
              ) : (
                <>
                  Pianotastic Academy me <br />
                  <span className="text-[#C5A869]">Aapka Hardik Swagat Hai.</span>
                </>
              )}
            </h1>

            {/* Editorial Message */}
            <div
              className={`space-y-3.5 text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-[#E2D8C9]' : 'text-[#304169]'
              }`}
            >
              <p className="font-semibold text-base sm:text-lg italic font-display text-[#C5A869]">
                {lang === 'en'
                  ? '“I’m happy you’re here.”'
                  : '“Humein behad khushi hai ki aap yahan hain.”'}
              </p>

              <p>
                {lang === 'en'
                  ? 'Whether you are starting from zero, learning your favorite songs, exploring western classical music, or developing performance skills, this academy is designed to help you truly enjoy your musical journey.'
                  : 'Chahe aap bilkul zero se start kar rahe hon, apne pasandida gaane bajana chahte hon, ya classical music seekhna chahte hon — yeh academy aapki musical journey ko aasan aur mazedaar banane ke liye banayi gayi hai.'}
              </p>

              <p>
                {lang === 'en'
                  ? 'Music is an expressive art meant to bring calm, creativity, and fulfillment to your life. Take your time, explore the free video lessons, and discover the joy of playing.'
                  : 'Music ek aisi kala hai jo mann ko shanti aur rachnatmakta deti hai. Aaram se bina kisi jaldbaazi ke humare free video lessons explore karein aur seekhne ka aanand lein.'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Primary Action */}
      <div className="pt-4 pb-4 safe-bottom">
        <button
          id="founder-continue-btn"
          type="button"
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-full text-base sm:text-lg font-semibold tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer"
          style={{
            backgroundColor: isDark ? '#F7F2EB' : '#081F5C',
            color: isDark ? '#081F5C' : '#F7F2EB',
          }}
        >
          <span>
            {lang === 'en' ? 'Continue to Free Learning' : 'Free Learning me Aage Badhein'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
        <p
          className={`text-center text-xs mt-2.5 ${
            isDark ? 'text-[#AFA492]' : 'text-[#64769E]'
          }`}
        >
          {lang === 'en'
            ? 'No sign-up or fee required • Explore free video lessons'
            : 'Bina kisi sign-up ya fee ke • Free lessons dekhein'}
        </p>
      </div>
    </div>
  );
};
