import React from 'react';
import {
  ArrowRight,
  Music2,
  BookOpen,
  Sparkles,
  PlayCircle,
  GraduationCap,
  Award,
  ChevronRight,
  HelpCircle,
  Layers,
  Heart,
  Compass,
} from 'lucide-react';
import { Language, Theme, Screen } from '../types';
import { ShowcaseBanner } from './ShowcaseBanner';
import { Logo } from './Logo';

interface PublicHomeScreenProps {
  onNavigateScreen: (screen: Screen) => void;
  onOpenCourse: (courseId: string) => void;
  onOpenBooks: () => void;
  onOpenContact: () => void;
  lang: Language;
  theme: Theme;
}

export const PublicHomeScreen: React.FC<PublicHomeScreenProps> = ({
  onNavigateScreen,
  onOpenCourse,
  onOpenBooks,
  onOpenContact,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      id="public-home-screen"
      className={`w-full min-h-screen pb-16 transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6 space-y-10 sm:space-y-14">
        {/* PROMPT 8: Top Showcase Banner / Carousel */}
        <ShowcaseBanner
          onNavigate={(dest) => {
            if (dest === 'books') onOpenBooks();
            else if (dest === 'contact') onOpenContact();
            else onNavigateScreen(dest as Screen);
          }}
          lang={lang}
          theme={theme}
        />

        {/* PROMPT 7 — Section 1: Hero / Academy Introduction */}
        <section
          id="home-hero-intro"
          className="relative rounded-3xl overflow-hidden p-6 sm:p-10 md:p-12 border shadow-xl transition-all duration-300"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #06153D 0%, #081F5C 50%, #0E2E80 100%)'
              : 'linear-gradient(135deg, #081F5C 0%, #0E2E80 60%, #1A3E94 100%)',
            borderColor: isDark ? 'rgba(14, 46, 128, 0.8)' : 'rgba(8, 31, 92, 0.15)',
          }}
        >
          {/* Subtle Acoustic Visual Background Graphics */}
          <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
            <svg
              viewBox="0 0 1000 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full object-cover"
            >
              <circle cx="850" cy="200" r="180" stroke="#C5A869" strokeWidth="1.5" strokeOpacity="0.5" />
              <circle cx="850" cy="200" r="260" stroke="#F7F2EB" strokeWidth="1" strokeOpacity="0.3" />
              <path
                d="M50 300 C 300 200, 600 380, 950 220"
                stroke="#C5A869"
                strokeWidth="2"
                strokeOpacity="0.5"
              />
            </svg>
          </div>

          <div className="relative z-10 max-w-3xl text-white">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4 bg-white/10 backdrop-blur-md border border-white/15 text-[#EFE7D8]">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A869]" />
              <span>
                {lang === 'en'
                  ? 'Excellence in Piano Education'
                  : 'Piano Shiksha me Shreshthata'}
              </span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4 leading-[1.15]">
              {lang === 'en'
                ? 'Learn Piano & Understand Music in an Approachable, Structured Way'
                : 'Piano Seekhein aur Music Samjhein ek Asaan aur Structured Tarike Se'}
            </h1>

            <p className="text-[#DFD7C9] text-base sm:text-lg leading-relaxed mb-8 max-w-2xl font-body">
              {lang === 'en'
                ? 'Pianotastic Academy guides aspiring musicians from their very first keys to confident artistic expression through clear methods and authentic musicality.'
                : 'Pianotastic Academy har sangeet premi ko pehli key se lekar expressive performance tak le jane ke liye step-by-step guidance pradan karti hai.'}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                id="hero-explore-courses-btn"
                onClick={() => onNavigateScreen('courses-home')}
                className="px-7 py-3.5 rounded-full text-base font-semibold tracking-wide flex items-center gap-3 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer bg-[#F7F2EB] text-[#081F5C] hover:bg-white"
              >
                <span>{lang === 'en' ? 'Explore Courses' : 'Courses Dekhiye'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                id="hero-free-learning-btn"
                onClick={() => onNavigateScreen('free-learning-home')}
                className="px-6 py-3.5 rounded-full text-base font-semibold tracking-wide flex items-center gap-2 transition-all duration-200 cursor-pointer border border-white/30 text-white hover:bg-white/10"
              >
                <PlayCircle className="w-5 h-5 text-[#C5A869]" />
                <span>{lang === 'en' ? 'Start Free Learning' : 'Free Learning'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* PROMPT 7 — Section 2: Free Learning Entry (Compact, clear introduction) */}
        <section
          id="home-free-learning-entry"
          className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
            isDark
              ? 'bg-[#081F5C]/35 border-[#0E2E80]'
              : 'bg-white border-[#081F5C]/10 shadow-md'
          }`}
        >
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-[#C5A869]">
              <PlayCircle className="w-4 h-4" />
              <span>{lang === 'en' ? 'No Account Required' : 'Bina Kisi Account ke'}</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              {lang === 'en' ? 'Start Learning for Free' : 'Muft Me Seekhna Shuru Karein'}
            </h2>
            <p
              className={`text-sm sm:text-base leading-relaxed ${
                isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
              }`}
            >
              {lang === 'en'
                ? 'Explore our beginner-friendly piano and music-learning video lessons without creating an account or paying fees. Master posture, keyboard layout, and first notes.'
                : 'Bina kisi registration ya fee ke shuruati piano lessons dekhein. Sahi posture, keyboard layout aur pehle notes seekhein.'}
            </p>
          </div>

          <div className="flex-shrink-0">
            <button
              id="free-learning-entry-btn"
              onClick={() => onNavigateScreen('free-learning-home')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm sm:text-base font-semibold tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 cursor-pointer shadow-md bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-95"
            >
              <span>{lang === 'en' ? 'Explore Free Learning' : 'Free Lessons Dekhiye'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* PROMPT 7 — Section 3: Courses Entry ("Learn Piano Your Way") */}
        <section id="home-courses-pathways" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold block text-[#C5A869] mb-1">
                {lang === 'en' ? 'Academy Curriculum' : 'Academy Curriculum'}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                {lang === 'en' ? 'Learn Piano Your Way' : 'Apne Tarike Se Piano Seekhein'}
              </h2>
              <p
                className={`text-sm sm:text-base mt-2 max-w-xl ${
                  isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
                }`}
              >
                {lang === 'en'
                  ? 'Choose between self-paced Recorded Courses or structured cohort training across Western and Indian musical traditions.'
                  : 'Apni suvidha anusaar Recorded Courses ya Structured Training me se chunein.'}
              </p>
            </div>

            <button
              onClick={() => onNavigateScreen('courses-home')}
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-[#C5A869] hover:underline cursor-pointer"
            >
              <span>{lang === 'en' ? 'View All Courses' : 'Sabhi Courses Dekhiye'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* WESTERN MUSIC: PRIMARY PATHWAY (Strongest Visual Emphasis) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#C5A869]" />
              <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                {lang === 'en' ? 'Western Music' : 'Western Music'}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
                {lang === 'en' ? 'Primary Pathway' : 'Mukhya Pathway'}
              </span>
            </div>

            <p
              className={`text-xs sm:text-sm max-w-2xl ${
                isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
              }`}
            >
              {lang === 'en'
                ? 'Structured progression designed to take you from foundational keys to classical masterworks with technical poise.'
                : 'Beginner se lekar advanced stage tak classical aur contemporary Western piano sangeet ka structured safar.'}
            </p>

            {/* 3 Western Levels with distinct visual artwork and visitor-facing meanings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Level 1: Beginner */}
              <div
                onClick={() => onOpenCourse('western-beginner')}
                className={`group cursor-pointer rounded-3xl overflow-hidden border p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                  isDark
                    ? 'bg-gradient-to-b from-[#081F5C]/60 to-[#040C24] border-[#0E2E80]'
                    : 'bg-gradient-to-b from-[#F0EBE0] to-white border-[#081F5C]/15 shadow-sm'
                }`}
              >
                <div>
                  {/* Artwork Container: Fresh, Approachable, Exciting */}
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5 flex items-center justify-center p-4 bg-gradient-to-tr from-[#05143D] via-[#081F5C] to-[#153E8A] text-white">
                    <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-80" fill="none">
                      <circle cx="50" cy="50" r="38" stroke="#C5A869" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M35 60 V40 L65 30 V50" stroke="#F7F2EB" strokeWidth="2" />
                      <circle cx="35" cy="60" r="5" fill="#C5A869" />
                      <circle cx="65" cy="50" r="5" fill="#C5A869" />
                    </svg>
                    <span className="absolute bottom-3 left-3 text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-sm text-[#F7F2EB]">
                      Beginner
                    </span>
                  </div>

                  <h4 className="font-display text-lg font-bold tracking-tight mb-2 group-hover:text-[#C5A869] transition-colors">
                    {lang === 'en' ? 'Beginner Piano Mastery' : 'Beginner Piano Mastery'}
                  </h4>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                      isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
                    }`}
                  >
                    {lang === 'en'
                      ? 'New to Western Music? Begin with hand posture, the 88-key map, reading notation, and your first melodies.'
                      : 'Western Music me naye hain? Posture, keys layout aur basic notation se fresh shuruat karein.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#081F5C]/10 dark:border-white/10 flex items-center justify-between">
                  <span className="text-sm font-display font-bold text-[#C5A869]">₹4,999</span>
                  <span className="text-xs font-semibold flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <span>{lang === 'en' ? 'View Course' : 'Dekhein'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>

              {/* Level 2: Intermediate */}
              <div
                onClick={() => onOpenCourse('western-intermediate')}
                className={`group cursor-pointer rounded-3xl overflow-hidden border p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                  isDark
                    ? 'bg-gradient-to-b from-[#081F5C]/60 to-[#040C24] border-[#0E2E80]'
                    : 'bg-gradient-to-b from-[#EAE3D4] to-white border-[#081F5C]/15 shadow-sm'
                }`}
              >
                <div>
                  {/* Artwork Container: Dynamic, Confident, Growth-oriented */}
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5 flex items-center justify-center p-4 bg-gradient-to-tr from-[#061B4D] via-[#0E2E80] to-[#1F4596] text-white">
                    <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-80" fill="none">
                      <path d="M20 70 C40 30, 60 80, 80 30" stroke="#C5A869" strokeWidth="2.5" />
                      <circle cx="50" cy="55" r="4" fill="#F7F2EB" />
                      <path d="M25 80 L75 80" stroke="#F7F2EB" strokeWidth="1.5" strokeOpacity="0.5" />
                    </svg>
                    <span className="absolute bottom-3 left-3 text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-sm text-[#F7F2EB]">
                      Intermediate
                    </span>
                  </div>

                  <h4 className="font-display text-lg font-bold tracking-tight mb-2 group-hover:text-[#C5A869] transition-colors">
                    {lang === 'en' ? 'Intermediate Dexterity & Flow' : 'Intermediate Dexterity & Flow'}
                  </h4>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                      isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
                    }`}
                  >
                    {lang === 'en'
                      ? 'Already have musical experience? Develop scale velocity, damper pedal artistry, and Clementi Sonatinas.'
                      : 'Thoda musical anubhav hai? Scales ki speed, damper pedal aur Classical repertoire develop karein.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#081F5C]/10 dark:border-white/10 flex items-center justify-between">
                  <span className="text-sm font-display font-bold text-[#C5A869]">₹6,499</span>
                  <span className="text-xs font-semibold flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <span>{lang === 'en' ? 'View Course' : 'Dekhein'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>

              {/* Level 3: Advanced */}
              <div
                onClick={() => onOpenCourse('western-advanced')}
                className={`group cursor-pointer rounded-3xl overflow-hidden border p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 ${
                  isDark
                    ? 'bg-gradient-to-b from-[#081F5C]/60 to-[#040C24] border-[#0E2E80]'
                    : 'bg-gradient-to-b from-[#E2D8C5] to-white border-[#081F5C]/15 shadow-sm'
                }`}
              >
                <div>
                  {/* Artwork Container: Expressive, Sophisticated, Powerful */}
                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5 flex items-center justify-center p-4 bg-gradient-to-tr from-[#030D28] via-[#081F5C] to-[#173B7E] text-white">
                    <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-85" fill="none">
                      <polygon points="50,15 85,85 15,85" stroke="#C5A869" strokeWidth="2" />
                      <circle cx="50" cy="55" r="14" stroke="#F7F2EB" strokeWidth="1.5" />
                    </svg>
                    <span className="absolute bottom-3 left-3 text-[11px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-sm text-[#F7F2EB]">
                      Advanced
                    </span>
                  </div>

                  <h4 className="font-display text-lg font-bold tracking-tight mb-2 group-hover:text-[#C5A869] transition-colors">
                    {lang === 'en' ? 'Advanced Artistry & Virtuosity' : 'Advanced Artistry & Virtuosity'}
                  </h4>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                      isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
                    }`}
                  >
                    {lang === 'en'
                      ? 'Strong musical foundation? Command multi-voice polyphony, polyrhythms, and Chopin & Beethoven masterworks.'
                      : 'Mazboot anubhav wale pianists: Bach polyphony, polyrhythms aur concert repertoire par command payein.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#081F5C]/10 dark:border-white/10 flex items-center justify-between">
                  <span className="text-sm font-display font-bold text-[#C5A869]">₹8,999</span>
                  <span className="text-xs font-semibold flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <span>{lang === 'en' ? 'View Course' : 'Dekhein'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* INDIAN MUSIC: SEPARATE COURSE CATEGORY (Visually Secondary, clearly commercial) */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#C5A869]" />
              <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                {lang === 'en' ? 'Indian Music' : 'Indian Music'}
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
                {lang === 'en' ? 'Specialized Repertoire' : 'Vishesh Shailiyan'}
              </span>
            </div>

            <p
              className={`text-xs sm:text-sm max-w-2xl ${
                isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
              }`}
            >
              {lang === 'en'
                ? 'Dedicated courses arranged specifically for piano across Bollywood, Rabindra Sangeet, and Bengali Modern songs.'
                : 'Bollywood, Rabindra Sangeet aur Bengali Modern gaano ke liye acoustic piano arrangements aur accompaniment.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Bollywood Piano */}
              <div
                onClick={() => onOpenCourse('indian-bollywood')}
                className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-300 hover:shadow-lg ${
                  isDark
                    ? 'bg-[#081F5C]/30 border-[#0E2E80]'
                    : 'bg-white border-[#081F5C]/10 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A869]">
                    Bollywood
                  </span>
                  <span className="text-xs font-semibold opacity-70">6 Weeks</span>
                </div>
                <h4 className="font-display text-base font-bold mb-1.5 group-hover:text-[#C5A869] transition-colors">
                  {lang === 'en'
                    ? 'Bollywood Melodies & Chords'
                    : 'Bollywood Melodies & Chords'}
                </h4>
                <p
                  className={`text-xs leading-relaxed mb-4 ${
                    isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
                  }`}
                >
                  {lang === 'en'
                    ? 'Learn melody ornamentations, rhythm grooves, signature intros, and left-hand song accompaniments.'
                    : 'Popular film songs ki melodies, intros aur acoustic chord accompaniments.'}
                </p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#081F5C]/10 dark:border-white/10">
                  <span className="font-bold text-[#C5A869]">₹3,999</span>
                  <span className="font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>{lang === 'en' ? 'View Details' : 'Dekhein'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Rabindra Sangeet */}
              <div
                onClick={() => onOpenCourse('indian-rabindra-sangeet')}
                className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-300 hover:shadow-lg ${
                  isDark
                    ? 'bg-[#081F5C]/30 border-[#0E2E80]'
                    : 'bg-white border-[#081F5C]/10 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A869]">
                    Rabindra Sangeet
                  </span>
                  <span className="text-xs font-semibold opacity-70">8 Weeks</span>
                </div>
                <h4 className="font-display text-base font-bold mb-1.5 group-hover:text-[#C5A869] transition-colors">
                  {lang === 'en'
                    ? 'Rabindra Sangeet Poetic Harmony'
                    : 'Rabindra Sangeet Poetic Harmony'}
                </h4>
                <p
                  className={`text-xs leading-relaxed mb-4 ${
                    isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
                  }`}
                >
                  {lang === 'en'
                    ? 'Tagore’s timeless melodies arranged gracefully with sensitive Western acoustic piano harmony.'
                    : 'Gurudev Rabindranath Tagore ke timeless gaano ko acoustic piano par expressive touch ke sath bajana.'}
                </p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#081F5C]/10 dark:border-white/10">
                  <span className="font-bold text-[#C5A869]">₹4,499</span>
                  <span className="font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>{lang === 'en' ? 'View Details' : 'Dekhein'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

              {/* Bengali Modern Songs */}
              <div
                onClick={() => onOpenCourse('indian-bengali-modern')}
                className={`group cursor-pointer rounded-3xl p-5 border transition-all duration-300 hover:shadow-lg ${
                  isDark
                    ? 'bg-[#081F5C]/30 border-[#0E2E80]'
                    : 'bg-white border-[#081F5C]/10 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A869]">
                    Bengali Modern
                  </span>
                  <span className="text-xs font-semibold opacity-70">6 Weeks</span>
                </div>
                <h4 className="font-display text-base font-bold mb-1.5 group-hover:text-[#C5A869] transition-colors">
                  {lang === 'en'
                    ? 'Bengali Modern Songs'
                    : 'Bengali Modern Songs'}
                </h4>
                <p
                  className={`text-xs leading-relaxed mb-4 ${
                    isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
                  }`}
                >
                  {lang === 'en'
                    ? 'Master memorable Bengali Adhunik melodies from golden era composers to contemporary classics.'
                    : 'Golden era se lekar modern era tak ke Bengali Adhunik gaano ki sheet music aur chord arrangements.'}
                </p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-[#081F5C]/10 dark:border-white/10">
                  <span className="font-bold text-[#C5A869]">₹3,999</span>
                  <span className="font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>{lang === 'en' ? 'View Details' : 'Dekhein'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROMPT 7 — Section 4: Founder Presence ("Meet the Founder") */}
        <section
          id="home-founder-presence"
          className={`p-6 sm:p-10 rounded-3xl border transition-all duration-300 ${
            isDark
              ? 'bg-gradient-to-r from-[#040C24] via-[#081F5C]/50 to-[#040C24] border-[#0E2E80]'
              : 'bg-gradient-to-r from-[#F5EFE4] via-white to-[#F5EFE4] border-[#081F5C]/15 shadow-sm'
          }`}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Founder Avatar / Monogram */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 flex items-center justify-center p-2 bg-[#081F5C] text-[#C5A869] border border-[#C5A869]/30 shadow-md">
                <Music2 className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="space-y-1">
                <span className="text-xs uppercase tracking-widest font-semibold block text-[#C5A869]">
                  {lang === 'en' ? 'Meet the Founder' : 'Sansthapak se Miliye'}
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                  {lang === 'en' ? 'A Mission for Pure Musical Literacy' : 'Sangeet ko Sahaj Banane ka Prayas'}
                </h3>
                <p
                  className={`text-xs sm:text-sm max-w-xl leading-relaxed ${
                    isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
                  }`}
                >
                  {lang === 'en'
                    ? 'Founded by passionate concert pianist and educator to bridge traditional discipline with modern joyful learning.'
                    : 'Dedicated pianist aur educator dwara sthapit academy, jahan shastriya anushasan aur seekhne ka anand dono milte hain.'}
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 w-full md:w-auto">
              <button
                id="founder-presence-btn"
                onClick={() => onNavigateScreen('founder')}
                className="w-full md:w-auto px-6 py-3 rounded-full text-sm font-semibold tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-all border border-[#081F5C]/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <span>{lang === 'en' ? 'About Pianotastic Academy' : 'Academy ke Baare Me'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* PROMPT 7 — Section 5: Simple Public Footer */}
        <footer
          id="home-public-footer"
          className="pt-8 pb-4 border-t border-[#081F5C]/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs opacity-75"
        >
          <div className="flex items-center gap-3">
            <Logo size="sm" isDark={isDark} />
            <span>•</span>
            <span>{lang === 'en' ? 'Public Visitor Experience' : 'Public Visitor Experience'}</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigateScreen('public-home')}
              className="hover:underline cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => onNavigateScreen('free-learning-home')}
              className="hover:underline cursor-pointer"
            >
              Free Learning
            </button>
            <button
              onClick={() => onNavigateScreen('courses-home')}
              className="hover:underline cursor-pointer"
            >
              Courses
            </button>
            <button onClick={onOpenBooks} className="hover:underline cursor-pointer">
              Books
            </button>
            <button onClick={onOpenContact} className="hover:underline cursor-pointer">
              Contact
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
