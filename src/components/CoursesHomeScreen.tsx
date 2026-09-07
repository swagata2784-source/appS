import React from 'react';
import {
  ArrowRight,
  Video,
  Calendar,
  CheckCircle,
  Sparkles,
  Layers,
  ChevronRight,
  PlayCircle,
  BookOpen,
} from 'lucide-react';
import { Language, Theme, Screen } from '../types';

interface CoursesHomeScreenProps {
  onExploreRecorded: (filterCategory?: 'western' | 'indian', filterLevel?: string) => void;
  onExploreStructured: () => void;
  onOpenCourse: (courseId: string) => void;
  lang: Language;
  theme: Theme;
}

export const CoursesHomeScreen: React.FC<CoursesHomeScreenProps> = ({
  onExploreRecorded,
  onExploreStructured,
  onOpenCourse,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      id="courses-home-screen"
      className={`w-full min-h-screen pb-16 transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 space-y-10 sm:space-y-12">
        {/* Top Introduction */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-[#C5A869]/15 text-[#C5A869] border border-[#C5A869]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Pianotastic Curriculum' : 'Pianotastic Curriculum'}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {lang === 'en' ? 'Learn Piano Your Way' : 'Apne Tarike Se Piano Seekhein'}
          </h1>

          <p
            className={`text-base sm:text-lg leading-relaxed ${
              isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
            }`}
          >
            {lang === 'en'
              ? 'Choose the learning format that fits your lifestyle. Whether you prefer the self-paced flexibility of Recorded Courses or the cohort discipline of Structured Courses, our master curriculum is crafted for genuine musical fluency.'
              : 'Apni suvidha ke anusaar format chunein. Chahe aap self-paced Recorded Courses pasand karein ya cohort-based Structured Courses, har path aapko solid musicality ki taraf le jata hai.'}
          </p>
        </div>

        {/* PROMPT 9: TWO LEARNING FORMATS (Recorded vs Structured) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Format 1: RECORDED COURSES (Primary / Strong Emphasis) */}
          <div
            className={`relative rounded-3xl p-6 sm:p-8 border shadow-xl flex flex-col justify-between transition-all duration-300 ${
              isDark
                ? 'bg-gradient-to-br from-[#081F5C] to-[#040C24] border-[#C5A869]/40 ring-1 ring-[#C5A869]/30'
                : 'bg-gradient-to-br from-[#081F5C] to-[#0F2D7B] text-white border-[#081F5C]'
            }`}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-white/10 text-[#C5A869] backdrop-blur-sm">
                  <Video className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#C5A869] text-[#081F5C]">
                  {lang === 'en' ? 'Most Popular • Self-Paced' : 'Self-Paced • Instant Access'}
                </span>
              </div>

              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
                  {lang === 'en' ? 'Recorded Courses' : 'Recorded Courses'}
                </h2>
                <p className="text-sm sm:text-base text-[#DFD7C9] leading-relaxed">
                  {lang === 'en'
                    ? 'Learn at your own pace with meticulously structured pre-recorded video classes, downloadable notes, sheet music, and practice journals.'
                    : 'Pre-recorded HD video lessons, detailed notes, aur sheet music ke sath apni speed par seekhein.'}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  lang === 'en'
                    ? 'Instant start — no waiting for batch intakes'
                    : 'Turant shuruat — batch ka intezar nahi',
                  lang === 'en'
                    ? 'Lifetime access to review any class anytime'
                    : 'Lifetime access — kabhi bhi classes dobara dekhein',
                  lang === 'en'
                    ? 'One-time transparent pricing (no recurring monthly fees)'
                    : 'One-time fee — koi monthly recurring charge nahi',
                  lang === 'en'
                    ? 'Includes class notes, exercises & practice guides'
                    : 'Notes, exercises aur practice guides shamil',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-[#F7F2EB]">
                    <CheckCircle className="w-4 h-4 text-[#C5A869] flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <button
                id="explore-recorded-courses-btn"
                onClick={() => onExploreRecorded()}
                className="w-full py-4 px-6 rounded-full text-base font-bold tracking-wide flex items-center justify-center gap-3 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer bg-[#F7F2EB] text-[#081F5C] hover:bg-white"
              >
                <span>{lang === 'en' ? 'Explore Recorded Courses' : 'Recorded Courses Dekhiye'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Format 2: STRUCTURED COURSES (Clearly Visible) */}
          <div
            className={`rounded-3xl p-6 sm:p-8 border shadow-md flex flex-col justify-between transition-all duration-300 ${
              isDark
                ? 'bg-[#081F5C]/25 border-[#0E2E80]'
                : 'bg-white border-[#081F5C]/15'
            }`}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
                  {lang === 'en' ? 'Cohort Based' : 'Batch Based'}
                </span>
              </div>

              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                  {lang === 'en' ? 'Structured Courses' : 'Structured Courses'}
                </h2>
                <p
                  className={`text-sm sm:text-base leading-relaxed ${
                    isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
                  }`}
                >
                  {lang === 'en'
                    ? 'Learn through a structured academy pathway with fixed terms, regular instructor evaluations, and milestone reviews.'
                    : 'Scheduled academy batch terms, teacher evaluations aur milestone reviews ke sath disciplined learning.'}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  lang === 'en'
                    ? 'Term-based cohort progression with scheduled terms'
                    : 'Scheduled terms aur batch progression',
                  lang === 'en'
                    ? 'Periodic personalized teacher reviews on technique'
                    : 'Technique aur posture par personalized feedback',
                  lang === 'en'
                    ? 'Formal syllabus progression & milestone certificates'
                    : 'Formal syllabus aur milestone certificates',
                  lang === 'en'
                    ? 'Intakes open seasonally throughout the academic year'
                    : 'Academic year me alag-alag seasonal batches',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm">
                    <CheckCircle className="w-4 h-4 text-[#C5A869] flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8">
              <button
                id="explore-structured-courses-btn"
                onClick={onExploreStructured}
                className="w-full py-4 px-6 rounded-full text-base font-bold tracking-wide flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer border border-[#081F5C]/20 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <span>{lang === 'en' ? 'Explore Structured Courses' : 'Structured Info Dekhiye'}</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* WESTERN MUSIC OVERVIEW */}
        <div className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C5A869]" />
                <span className="text-xs uppercase font-bold tracking-wider text-[#C5A869]">
                  {lang === 'en' ? 'Western Music Progression' : 'Western Music Progression'}
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                {lang === 'en' ? 'From First Notes to Virtuosity' : 'Pehle Notes se lekar Virtuosity tak'}
              </h2>
            </div>
            <button
              onClick={() => onExploreRecorded('western')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#C5A869] hover:underline cursor-pointer"
            >
              <span>{lang === 'en' ? 'Browse All Western Courses' : 'Western Courses Dekhiye'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Beginner */}
            <div
              onClick={() => onOpenCourse('western-beginner')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer hover:shadow-lg ${
                isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
                  Beginner
                </span>
                <span className="text-sm font-display font-bold text-[#C5A869]">₹4,999</span>
              </div>
              <h3 className="font-display text-lg font-bold mb-2">
                {lang === 'en' ? 'Beginner Piano Mastery' : 'Beginner Piano Mastery'}
              </h3>
              <p
                className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                  isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
                }`}
              >
                {lang === 'en'
                  ? 'New to Western Music? Hand posture, 88-key map, reading notation, and your first 8 pieces.'
                  : 'Naye students ke liye: posture, keyboard map aur basic notation.'}
              </p>
              <div className="text-xs font-semibold flex items-center gap-1.5 opacity-80">
                <span>{lang === 'en' ? 'View Course Details' : 'Details Dekhein'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Intermediate */}
            <div
              onClick={() => onOpenCourse('western-intermediate')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer hover:shadow-lg ${
                isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
                  Intermediate
                </span>
                <span className="text-sm font-display font-bold text-[#C5A869]">₹6,499</span>
              </div>
              <h3 className="font-display text-lg font-bold mb-2">
                {lang === 'en' ? 'Intermediate Dexterity & Flow' : 'Intermediate Dexterity & Flow'}
              </h3>
              <p
                className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                  isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
                }`}
              >
                {lang === 'en'
                  ? 'Musical experience? Develop scale velocity, damper pedal artistry, and Clementi Sonatinas.'
                  : 'Anubhav wale pianists: scale velocity, damper pedal aur Classical repertoire.'}
              </p>
              <div className="text-xs font-semibold flex items-center gap-1.5 opacity-80">
                <span>{lang === 'en' ? 'View Course Details' : 'Details Dekhein'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Advanced */}
            <div
              onClick={() => onOpenCourse('western-advanced')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer hover:shadow-lg ${
                isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
                  Advanced
                </span>
                <span className="text-sm font-display font-bold text-[#C5A869]">₹8,999</span>
              </div>
              <h3 className="font-display text-lg font-bold mb-2">
                {lang === 'en' ? 'Advanced Artistry & Virtuosity' : 'Advanced Artistry & Virtuosity'}
              </h3>
              <p
                className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                  isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
                }`}
              >
                {lang === 'en'
                  ? 'Strong background? Command polyphony, polyrhythms, and Chopin & Beethoven masterworks.'
                  : 'Strong musical background: polyphony, polyrhythms aur concert repertoire.'}
              </p>
              <div className="text-xs font-semibold flex items-center gap-1.5 opacity-80">
                <span>{lang === 'en' ? 'View Course Details' : 'Details Dekhein'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* INDIAN MUSIC OVERVIEW (Separate Category) */}
        <div className="space-y-6 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C5A869]" />
                <span className="text-xs uppercase font-bold tracking-wider text-[#C5A869]">
                  {lang === 'en' ? 'Indian Music Category' : 'Indian Music Category'}
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                {lang === 'en' ? 'Bollywood, Rabindra Sangeet & Bengali Modern' : 'Bollywood, Rabindra Sangeet aur Bengali Modern'}
              </h2>
            </div>
            <button
              onClick={() => onExploreRecorded('indian')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#C5A869] hover:underline cursor-pointer"
            >
              <span>{lang === 'en' ? 'Browse All Indian Music Courses' : 'Indian Music Courses Dekhiye'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bollywood */}
            <div
              onClick={() => onOpenCourse('indian-bollywood')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer hover:shadow-lg ${
                isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
                  Bollywood
                </span>
                <span className="text-sm font-display font-bold text-[#C5A869]">₹3,999</span>
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Bollywood Piano</h3>
              <p
                className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                  isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
                }`}
              >
                {lang === 'en'
                  ? 'Iconic film melodies with rich left-hand arpeggios, song intros, and stylish fills.'
                  : 'Popular film songs ki melodies, intros aur acoustic chord accompaniments.'}
              </p>
              <div className="text-xs font-semibold flex items-center gap-1.5 opacity-80">
                <span>{lang === 'en' ? 'View Course Details' : 'Details Dekhein'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Rabindra Sangeet */}
            <div
              onClick={() => onOpenCourse('indian-rabindra-sangeet')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer hover:shadow-lg ${
                isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
                  Rabindra Sangeet
                </span>
                <span className="text-sm font-display font-bold text-[#C5A869]">₹4,499</span>
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Rabindra Sangeet</h3>
              <p
                className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                  isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
                }`}
              >
                {lang === 'en'
                  ? 'Tagore’s timeless melodies arranged gracefully with sensitive Western acoustic piano harmony.'
                  : 'Tagore ke sangeet ko acoustic piano par sensitive harmony ke sath bajana.'}
              </p>
              <div className="text-xs font-semibold flex items-center gap-1.5 opacity-80">
                <span>{lang === 'en' ? 'View Course Details' : 'Details Dekhein'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bengali Modern */}
            <div
              onClick={() => onOpenCourse('indian-bengali-modern')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer hover:shadow-lg ${
                isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
                  Bengali Modern
                </span>
                <span className="text-sm font-display font-bold text-[#C5A869]">₹3,999</span>
              </div>
              <h3 className="font-display text-lg font-bold mb-2">Bengali Modern Songs</h3>
              <p
                className={`text-xs sm:text-sm leading-relaxed mb-4 ${
                  isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
                }`}
              >
                {lang === 'en'
                  ? 'Memorable Bengali Adhunik melodies from golden era composers to contemporary hits.'
                  : 'Golden era se lekar modern era tak ke Bengali Adhunik gaano ki sheet music.'}
              </p>
              <div className="text-xs font-semibold flex items-center gap-1.5 opacity-80">
                <span>{lang === 'en' ? 'View Course Details' : 'Details Dekhein'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
