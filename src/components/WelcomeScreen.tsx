import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Music2, Sparkles, BookOpen, Compass } from 'lucide-react';
import { Language, Theme } from '../types';
import { Logo } from './Logo';

interface WelcomeScreenProps {
  onExplore: () => void;
  lang: Language;
  theme: Theme;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onExplore,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      id="visitor-welcome-screen"
      className={`min-h-screen flex flex-col justify-between transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 sm:px-8 pt-6 pb-10 flex flex-col justify-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <Logo size="lg" isDark={isDark} className="mb-4" />
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase transition-colors ${
              isDark
                ? 'bg-[#081F5C]/80 text-[#C5A869] border border-[#C5A869]/30'
                : 'bg-[#081F5C]/8 text-[#081F5C] border border-[#081F5C]/15'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === 'en'
                ? 'Public Visitor Access • No Sign-up Required'
                : 'Public Visitor Access • Bina Sign-up ke Explore Karein'}
            </span>
          </div>
        </div>

        {/* Hero Bento Cinematic Piano Visual Card */}
        <div className="relative rounded-3xl overflow-hidden mb-8 shadow-2xl border border-[#081F5C]/10 dark:border-[#0E2E80] transition-all duration-300">
          <div
            className={`relative aspect-[16/10] sm:aspect-[21/9] w-full flex items-end p-6 sm:p-10 ${
              isDark
                ? 'bg-gradient-to-tr from-[#020617] via-[#081F5C] to-[#0A246B]'
                : 'bg-gradient-to-tr from-[#081F5C] via-[#0E2E80] to-[#1E4399] text-white'
            }`}
          >
            {/* Architectural Piano Key & Soundboard SVG Background Graphics */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
              <svg
                viewBox="0 0 1000 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full object-cover scale-110"
              >
                {/* Flowing harmonic resonance waves */}
                <path
                  d="M-100 200C150 100 350 350 600 220C850 90 950 300 1150 200"
                  stroke="#C5A869"
                  strokeWidth="2.5"
                  strokeOpacity="0.7"
                />
                <path
                  d="M-100 250C180 140 380 380 630 260C880 140 980 340 1150 240"
                  stroke="#F7F2EB"
                  strokeWidth="1.5"
                  strokeOpacity="0.5"
                />
                {/* Perspective piano keys motif */}
                <g opacity="0.65">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <rect
                      key={i}
                      x={i * 40}
                      y="260"
                      width="36"
                      height="150"
                      rx="2"
                      fill="#F7F2EB"
                    />
                  ))}
                  {Array.from({ length: 20 }).map((_, i) => {
                    const blackKeyOffsets = [
                      1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 15, 16, 18, 19, 20, 22,
                      23, 25, 26, 27,
                    ];
                    if (!blackKeyOffsets.includes(i)) return null;
                    return (
                      <rect
                        key={`b-${i}`}
                        x={i * 40 + 26}
                        y="260"
                        width="24"
                        height="90"
                        rx="2"
                        fill="#081F5C"
                      />
                    );
                  })}
                </g>
              </svg>
            </div>

            {/* Subtle radial warmth lighting */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#C5A869]/15 blur-3xl pointer-events-none" />

            {/* Foreground Hero Statement inside Card */}
            <div className="relative z-10 max-w-xl text-white">
              <span className="font-body text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-[#D8CFBC] mb-2 block">
                {lang === 'en'
                  ? 'Excellence in Pianoforte'
                  : 'Sangeet ki shreshthata'}
              </span>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-2 sm:mb-3 leading-tight">
                {lang === 'en'
                  ? 'The Art & Joy of Piano'
                  : 'Piano Bajane ki Kala aur Khushi'}
              </h2>
              <p className="text-[#E2D8C9] text-sm sm:text-base leading-relaxed max-w-md font-body">
                {lang === 'en'
                  ? 'Discover an inspiring musical sanctuary designed to take you from your very first keystroke to graceful mastery.'
                  : 'Ek aisi sangeet academy jahan pehli key se lekar graceful mastery tak ka safar asaan aur anandmayi hai.'}
              </p>
            </div>
          </div>
        </div>

        {/* Welcoming Headline & Concise Supporting Sentence */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            {lang === 'en'
              ? 'Welcome to Pianotastic Academy'
              : 'Pianotastic Academy me Aapka Swagat Hai'}
          </h1>
          <p
            className={`text-base sm:text-lg leading-relaxed ${
              isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
            }`}
          >
            {lang === 'en'
              ? 'Learn piano, understand music, and enjoy your musical journey.'
              : 'Piano seekhein, music samjhein, aur apni musical journey ka anand lein.'}
          </p>
        </div>

        {/* Bento Grid Highlights: 3 Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div
            className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
              isDark
                ? 'bg-[#081F5C]/40 border-[#0E2E80] hover:border-[#C5A869]/50'
                : 'bg-white border-[#081F5C]/10 hover:border-[#081F5C]/30 shadow-sm'
            }`}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
              <Music2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base mb-1">
              {lang === 'en' ? 'Structured Mastery' : 'Structured Learning'}
            </h3>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
              }`}
            >
              {lang === 'en'
                ? 'Step-by-step guidance from posture to repertoire.'
                : 'Posture se lekar songs tak step-by-step guidance.'}
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
              isDark
                ? 'bg-[#081F5C]/40 border-[#0E2E80] hover:border-[#C5A869]/50'
                : 'bg-white border-[#081F5C]/10 hover:border-[#081F5C]/30 shadow-sm'
            }`}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base mb-1">
              {lang === 'en' ? 'Deep Musicality' : 'Music ki Samajh'}
            </h3>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
              }`}
            >
              {lang === 'en'
                ? 'Demystify notation, harmony, and musical expression.'
                : 'Sheet music, chords aur musical expression ko samjhein.'}
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border transition-all hover:shadow-md ${
              isDark
                ? 'bg-[#081F5C]/40 border-[#0E2E80] hover:border-[#C5A869]/50'
                : 'bg-white border-[#081F5C]/10 hover:border-[#081F5C]/30 shadow-sm'
            }`}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base mb-1">
              {lang === 'en' ? 'Open Exploration' : 'Khula Anubhav'}
            </h3>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
              }`}
            >
              {lang === 'en'
                ? 'Instant access to free learning video lessons.'
                : 'Bina kisi rukawat ke free video lessons explore karein.'}
            </p>
          </div>
        </div>

        {/* Primary Clear Action: "Explore" */}
        <div className="flex flex-col items-center">
          <button
            id="welcome-explore-btn"
            onClick={onExplore}
            className="w-full sm:w-auto min-w-[280px] sm:min-w-[320px] px-8 py-4 rounded-full text-base sm:text-lg font-semibold tracking-wide flex items-center justify-center gap-3 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer"
            style={{
              backgroundColor: isDark ? '#F7F2EB' : '#081F5C',
              color: isDark ? '#081F5C' : '#F7F2EB',
            }}
          >
            <span>{lang === 'en' ? 'Explore' : 'Explore Karein'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          <span
            className={`text-xs mt-3 font-medium ${
              isDark ? 'text-[#AFA492]' : 'text-[#64769E]'
            }`}
          >
            {lang === 'en'
              ? 'Free public access • Choose your musical interest'
              : 'Bilkul muft • Apni pasand ke anusaar start karein'}
          </span>
        </div>
      </main>

      {/* Subtle Mobile Safe Footer */}
      <footer className="w-full text-center py-4 text-[11px] opacity-60 tracking-wider">
        Pianotastic Academy • Music Education
      </footer>
    </div>
  );
};
