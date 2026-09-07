import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Heart,
  BookOpen,
  GraduationCap,
  Music2,
  Compass,
  Play,
  Volume2,
} from 'lucide-react';
import { Language, Theme } from '../types';
import { Logo } from './Logo';
import { FOUNDER_CONTENT } from '../data/founderData';

interface FounderWelcomeScreenProps {
  onContinue: () => void;
  onBack?: () => void;
  lang: Language;
  theme: Theme;
}

export const FounderWelcomeScreen: React.FC<FounderWelcomeScreenProps> = ({
  onContinue,
  lang,
  theme,
}) => {
  const [photoError, setPhotoError] = useState(false);
  const isDark = theme === 'dark';
  const content = FOUNDER_CONTENT;

  // Icon mapper for academy offerings
  const renderOfferingIcon = (iconType: string) => {
    switch (iconType) {
      case 'structured':
        return <GraduationCap className="w-5 h-5" />;
      case 'free':
        return <Play className="w-5 h-5 fill-current" />;
      case 'pathways':
        return <Compass className="w-5 h-5" />;
      case 'literacy':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <Music2 className="w-5 h-5" />;
    }
  };

  return (
    <div
      id="founder-welcome-screen"
      className={`min-h-[calc(100vh-4.5rem)] flex flex-col justify-between py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full transition-colors duration-300 ${
        isDark ? 'text-[#F7F2EB]' : 'text-[#081F5C]'
      }`}
    >
      <main className="flex-1 flex flex-col space-y-8 sm:space-y-10">
        {/* SECTION 1: FOUNDER IDENTITY & PHOTO AREA */}
        <section
          id="founder-profile-header"
          className="flex flex-col items-center text-center pt-2"
        >
          {/* Subtle Academy Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold tracking-wider uppercase mb-5 transition-all">
            <span
              className={`px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                isDark
                  ? 'bg-[#081F5C] text-[#C5A869] border border-[#C5A869]/30'
                  : 'bg-[#081F5C]/8 text-[#081F5C] border border-[#081F5C]/15'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Pianotastic Academy' : 'Pianotastic Academy'}</span>
            </span>
          </div>

          {/* Portrait / Video Area */}
          <div className="relative mb-4 group">
            <div
              className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-2 p-1.5 shadow-xl transition-all duration-300 ${
                isDark
                  ? 'bg-gradient-to-b from-[#0E2E80] to-[#040C24] border-[#C5A869]/60 shadow-black/40'
                  : 'bg-gradient-to-b from-[#EBE2D5] to-[#F7F2EB] border-[#081F5C]/25 shadow-[#081F5C]/10'
              }`}
            >
              {!photoError ? (
                <img
                  src="/founder.jpg"
                  alt={`${content.name} - Founder`}
                  className="w-full h-full object-cover rounded-2xl"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                /* Elegant Musical Monogram Fallback Frame */
                <div
                  className={`w-full h-full rounded-2xl flex flex-col items-center justify-center p-4 text-center transition-colors ${
                    isDark ? 'bg-[#081F5C]/85' : 'bg-white/95'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-sm ${
                      isDark
                        ? 'bg-[#0E2E80] text-[#C5A869] border border-[#C5A869]/40'
                        : 'bg-[#081F5C] text-[#C5A869]'
                    }`}
                  >
                    <Music2 className="w-7 h-7" />
                  </div>
                  <span className="font-display font-bold text-sm tracking-wide">
                    {content.name}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-[#C5A869] mt-0.5">
                    {lang === 'en' ? 'Founder' : 'Founder'}
                  </span>
                </div>
              )}
            </div>

            {/* Subtle floating badge */}
            <div
              className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md whitespace-nowrap ${
                isDark
                  ? 'bg-[#C5A869] text-[#081F5C]'
                  : 'bg-[#081F5C] text-[#F7F2EB]'
              }`}
            >
              {lang === 'en' ? 'Personal Welcome' : 'Personal Swagat'}
            </div>
          </div>

          {/* Founder Name & Title */}
          <div className="mt-3">
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              {content.name}
            </h2>
            <p
              className={`text-xs sm:text-sm font-medium ${
                isDark ? 'text-[#C5A869]' : 'text-[#64769E]'
              }`}
            >
              {lang === 'en' ? content.roleEn : content.roleHi} • {content.taglineEn}
            </p>
          </div>
        </section>

        {/* SECTION 2: WARM WELCOME HEADLINE & EDITORIAL MESSAGE */}
        <section
          id="founder-welcome-message"
          className={`p-6 sm:p-8 rounded-3xl border shadow-sm transition-all ${
            isDark
              ? 'bg-[#081F5C]/35 border-[#0E2E80]'
              : 'bg-white border-[#081F5C]/12'
          }`}
        >
          <div className="max-w-2xl mx-auto text-center mb-6">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3 leading-snug">
              {lang === 'en' ? (
                <>
                  Welcome to{' '}
                  <span className="text-[#C5A869]">Pianotastic Academy</span>
                </>
              ) : (
                <>
                  Pianotastic Academy me{' '}
                  <span className="text-[#C5A869]">Aapka Hardik Swagat Hai</span>
                </>
              )}
            </h1>

            {/* Warm personal invitation quote */}
            <p className="font-display italic text-base sm:text-lg text-[#C5A869] font-medium leading-relaxed">
              {lang === 'en' ? content.personalQuoteEn : content.personalQuoteHi}
            </p>
          </div>

          {/* Short Introduction Paragraphs */}
          <div
            className={`space-y-3.5 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto ${
              isDark ? 'text-[#E2D8C9]' : 'text-[#33446B]'
            }`}
          >
            {(lang === 'en'
              ? content.introParagraphsEn
              : content.introParagraphsHi
            ).map((para, index) => (
              <p key={index}>{para}</p>
            ))}
          </div>
        </section>

        {/* SECTION 3: WHAT PIANOTASTIC ACADEMY OFFERS */}
        <section id="founder-academy-offerings" className="space-y-4">
          <div className="text-center max-w-xl mx-auto">
            <span
              className={`text-[11px] sm:text-xs font-semibold tracking-widest uppercase block mb-1 ${
                isDark ? 'text-[#C5A869]' : 'text-[#64769E]'
              }`}
            >
              {lang === 'en' ? 'Our Philosophy' : 'Humara Nazariya'}
            </span>
            <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              {lang === 'en'
                ? content.offeringsTitleEn
                : content.offeringsTitleHi}
            </h3>
            <p
              className={`text-xs sm:text-sm mt-1 ${
                isDark ? 'text-[#D8CFBC]' : 'text-[#47587E]'
              }`}
            >
              {lang === 'en'
                ? content.offeringsSubtitleEn
                : content.offeringsSubtitleHi}
            </p>
          </div>

          {/* 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-2">
            {content.offerings.map((offering) => {
              const title = lang === 'en' ? offering.titleEn : offering.titleHi;
              const desc = lang === 'en' ? offering.descEn : offering.descHi;

              return (
                <div
                  key={offering.id}
                  id={`offering-${offering.id}`}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                    isDark
                      ? 'bg-[#081F5C]/25 border-[#0E2E80]/70'
                      : 'bg-white border-[#081F5C]/10 shadow-xs'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isDark
                        ? 'bg-[#0E2E80] text-[#C5A869] border border-[#C5A869]/25'
                        : 'bg-[#081F5C] text-[#C5A869]'
                    }`}
                  >
                    {renderOfferingIcon(offering.icon)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm sm:text-base leading-snug tracking-tight mb-1">
                      {title}
                    </h4>
                    <p
                      className={`text-xs leading-relaxed ${
                        isDark ? 'text-[#AFA492]' : 'text-[#5C6E97]'
                      }`}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quiet Reassurance Banner */}
        <div
          className={`text-center py-4 px-5 rounded-2xl border text-xs sm:text-sm max-w-xl mx-auto shadow-xs ${
            isDark
              ? 'bg-[#081F5C]/25 border-[#0E2E80]/60 text-[#D8CFBC]'
              : 'bg-[#F2ECE1] border-[#081F5C]/10 text-[#47587E]'
          }`}
        >
          <p>{lang === 'en' ? content.closingNoteEn : content.closingNoteHi}</p>
        </div>
      </main>

      {/* SECTION 4: PRIMARY ACTION - CONTINUE TO FREE LEARNING */}
      <footer className="w-full max-w-xl mx-auto pt-6 pb-4 safe-bottom">
        <button
          id="founder-continue-btn"
          type="button"
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-full text-base sm:text-lg font-semibold tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer min-h-[48px]"
          style={{
            backgroundColor: isDark ? '#F7F2EB' : '#081F5C',
            color: isDark ? '#081F5C' : '#F7F2EB',
          }}
        >
          <span>{lang === 'en' ? content.ctaButtonEn : content.ctaButtonHi}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p
          className={`text-center text-xs mt-3 ${
            isDark ? 'text-[#AFA492]' : 'text-[#64769E]'
          }`}
        >
          {lang === 'en'
            ? 'Step into Free Learning • 4 foundational video series • Watch freely'
            : 'Free Learning shuru karein • 4 video series • Bina kisi account ke dekhein'}
        </p>
      </footer>
    </div>
  );
};
