import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Video,
  CheckCircle,
  BookOpen,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { Language, Theme, RecordedCourse } from '../types';

interface CourseDetailsScreenProps {
  course: RecordedCourse;
  onEnroll: (course: RecordedCourse) => void;
  onBack: () => void;
  lang: Language;
  theme: Theme;
}

export const CourseDetailsScreen: React.FC<CourseDetailsScreenProps> = ({
  course,
  onEnroll,
  onBack,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      id="course-details-screen"
      className={`w-full min-h-screen pb-28 sm:pb-20 transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-4 sm:pt-6 space-y-10">
        {/* Navigation Breadcrumb / Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-[#C5A869]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'en' ? 'Back to Recorded Courses' : 'Courses Catalogue me Wapas'}</span>
        </button>

        {/* PROMPT 11: HERO SECTION */}
        <section
          id="course-hero-section"
          className={`relative rounded-3xl p-6 sm:p-10 md:p-12 border shadow-xl overflow-hidden transition-all duration-300 ${
            isDark
              ? 'bg-gradient-to-br from-[#061742] via-[#081F5C] to-[#0D2E7C] border-[#0E2E80]'
              : 'bg-gradient-to-br from-[#081F5C] via-[#0E2E80] to-[#1C469F] text-white border-[#081F5C]'
          }`}
        >
          {/* Acoustic Wave Background */}
          <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
            <svg
              viewBox="0 0 1000 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full object-cover"
            >
              <circle cx="900" cy="200" r="220" stroke="#C5A869" strokeWidth="1.5" />
              <path d="M-50 250 Q 250 100 550 250 T 1150 250" stroke="#F7F2EB" strokeWidth="2" strokeOpacity="0.4" />
            </svg>
          </div>

          <div className="relative z-10 max-w-3xl space-y-4 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-[#C5A869] text-[#081F5C]">
                {course.format}
              </span>
              {course.level && (
                <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[#F7F2EB]">
                  {course.level} Level
                </span>
              )}
              {course.indianStyle && (
                <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-[#F7F2EB]">
                  {course.indianStyle.replace('-', ' ')}
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              {lang === 'en' ? course.titleEn : course.titleHi}
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-[#DFD7C9] leading-relaxed max-w-2xl font-body">
              {lang === 'en' ? course.shortDescEn : course.shortDescHi}
            </p>

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-[#F7F2EB] pt-2">
              <span className="flex items-center gap-1.5 opacity-90">
                <Clock className="w-4 h-4 text-[#C5A869]" />
                <span>{course.duration}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 opacity-90">
                <Video className="w-4 h-4 text-[#C5A869]" />
                <span>{course.classesCount} Recorded Classes</span>
              </span>
              <span>•</span>
              <span className="opacity-90">Self-Paced Flexible Schedule</span>
            </div>

            {/* Price & Primary CTA */}
            <div className="pt-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider block opacity-75">One-Time Course Fee</span>
                <span className="text-3xl sm:text-4xl font-display font-bold text-[#C5A869]">
                  ₹{course.price.toLocaleString('en-IN')}
                </span>
                <span className="text-xs block opacity-75 mt-0.5">No monthly subscription fees</span>
              </div>

              <div className="sm:ml-6">
                <button
                  id="hero-enroll-btn"
                  onClick={() => onEnroll(course)}
                  className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold tracking-wide flex items-center justify-center gap-3 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl cursor-pointer bg-[#F7F2EB] text-[#081F5C] hover:bg-white"
                >
                  <span>{lang === 'en' ? 'Enroll in This Course' : 'Is Course Me Enroll Karein'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* PROMPT 11: WHO IS THIS COURSE FOR? */}
        <section
          id="who-is-this-course-for"
          className={`p-6 sm:p-8 rounded-3xl border ${
            isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#C5A869]/20 text-[#C5A869]">
              <HelpCircle className="w-4 h-4" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              {lang === 'en' ? 'Who Is This Course For?' : 'Yeh Course Kiske Liye Hai?'}
            </h2>
          </div>

          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
            }`}
          >
            {lang === 'en' ? course.whoIsItForEn : course.whoIsItForHi}
          </p>
        </section>

        {/* PROMPT 11: WHAT YOU'LL LEARN */}
        <section
          id="what-you-will-learn"
          className={`p-6 sm:p-8 rounded-3xl border ${
            isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#C5A869]/20 text-[#C5A869]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              {lang === 'en' ? "What You'll Learn" : 'Aap Kya Seekhenge'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {(lang === 'en' ? course.whatYoullLearnEn : course.whatYoullLearnHi).map(
              (outcome, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-2xl border flex items-start gap-3 ${
                    isDark
                      ? 'bg-[#040C24]/60 border-[#0E2E80]/80'
                      : 'bg-[#F7F2EB]/70 border-[#081F5C]/10'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-[#C5A869] flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm leading-relaxed">{outcome}</span>
                </div>
              )
            )}
          </div>
        </section>

        {/* PROMPT 11: COURSE STRUCTURE PREVIEW */}
        <section
          id="course-structure-preview"
          className={`p-6 sm:p-8 rounded-3xl border ${
            isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#C5A869]/20 text-[#C5A869]">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              {lang === 'en' ? 'Course Structure' : 'Course Structure'}
            </h2>
          </div>

          <p
            className={`text-xs sm:text-sm mb-6 ${
              isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
            }`}
          >
            {lang === 'en'
              ? 'Organized step-by-step into sequential modules for gradual muscle memory and musical fluency.'
              : 'Har hafte ke hisab se structured modules taaki aap bina kisi pressure ke aage badhein.'}
          </p>

          <div className="space-y-3">
            {course.courseStructure.map((module) => (
              <div
                key={module.weekNumber}
                className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-[#040C24]/50 border-[#0E2E80]' : 'bg-[#F7F2EB]/50 border-[#081F5C]/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A869]">
                    Week {module.weekNumber}
                  </span>
                  <span className="text-xs opacity-60">{module.classes.length} Lessons</span>
                </div>

                <h3 className="font-bold text-sm sm:text-base mb-2">
                  {lang === 'en' ? module.titleEn : module.titleHi}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs opacity-80">
                  {module.classes.map((cls, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#C5A869]" />
                      <span>{cls}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROMPT 11: THE RECORDED COURSE MODEL (Reassurance) */}
        <section
          id="recorded-course-model-reassurance"
          className={`p-6 sm:p-8 rounded-3xl border ${
            isDark
              ? 'bg-gradient-to-br from-[#081F5C]/50 to-[#040C24] border-[#0E2E80]'
              : 'bg-gradient-to-br from-[#F5EFE4] to-white border-[#081F5C]/15 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-6 h-6 text-[#C5A869]" />
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              {lang === 'en' ? 'The Recorded Course Advantage' : 'Recorded Course ke Fayde'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold">{lang === 'en' ? 'Self-Paced Practice' : 'Apni Speed Par'}</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                {lang === 'en'
                  ? 'Replay complex hand movements as many times as you need without rush.'
                  : 'Kayi bar lessons dobara dekhkar practice karein.'}
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold">{lang === 'en' ? 'One-Time Payment' : 'One-Time Payment'}</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                {lang === 'en'
                  ? 'No recurring monthly subscriptions or hidden charges.'
                  : 'Koi monthly subscription ya hidden fees nahi.'}
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold">{lang === 'en' ? 'Lifetime Access' : 'Lifetime Access'}</h3>
              <p className="text-xs opacity-75 leading-relaxed">
                {lang === 'en'
                  ? 'Return to your course materials anytime throughout your musical journey.'
                  : 'Kabhi bhi wapas aakar apne lessons access karein.'}
              </p>
            </div>
          </div>
        </section>

        {/* PROMPT 11: WHAT'S INCLUDED */}
        <section
          id="whats-included-in-course"
          className={`p-6 sm:p-8 rounded-3xl border ${
            isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-[#C5A869]" />
            <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
              {lang === 'en' ? "What's Included" : 'Is Course Me Kya Shamil Hai'}
            </h2>
          </div>

          <div className="space-y-2.5">
            {(lang === 'en' ? course.includedMaterialsEn : course.includedMaterialsHi).map(
              (mat, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm">
                  <CheckCircle className="w-4 h-4 text-[#C5A869] flex-shrink-0" />
                  <span>{mat}</span>
                </div>
              )
            )}
          </div>
        </section>

        {/* PROMPT 11: REQUIRED BOOKS (ONLY shown if configured for this course) */}
        {course.requiredBooks && course.requiredBooks.length > 0 && (
          <section
            id="required-books-section"
            className={`p-6 sm:p-8 rounded-3xl border ${
              isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-[#C5A869]" />
                <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                  {lang === 'en' ? 'Required Method Book' : 'Zaroori Method Book'}
                </h2>
              </div>
              <span className="text-xs uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-[#C5A869]/20 text-[#C5A869]">
                {lang === 'en' ? 'Official Course Material' : 'Course Material'}
              </span>
            </div>

            <div className="space-y-4">
              {course.requiredBooks.map((book) => (
                <div
                  key={book.id}
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDark ? 'bg-[#040C24]/60 border-[#0E2E80]' : 'bg-[#F7F2EB]/80 border-[#081F5C]/10'
                  }`}
                >
                  <div className="space-y-1 max-w-xl">
                    <h3 className="font-bold text-base">{book.title}</h3>
                    <p className="text-xs opacity-80 leading-relaxed">
                      {lang === 'en' ? book.descEn : book.descHi}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-semibold pt-1 text-[#C5A869]">
                      <span>Book Price: ₹{book.price}</span>
                      <span>•</span>
                      <span>Delivery Charge: ₹{book.deliveryCharge || 100}</span>
                    </div>
                  </div>

                  <div className="text-xs opacity-75">
                    <span>Included in Enrollment Breakdown</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* MOBILE STICKY ENROLLMENT BAR (Prompt 11 requirement) */}
      <div
        className={`sm:hidden fixed bottom-0 left-0 right-0 z-30 p-4 border-t backdrop-blur-md flex items-center justify-between gap-4 ${
          isDark
            ? 'bg-[#040C24]/95 border-[#0E2E80] text-[#F7F2EB]'
            : 'bg-[#F7F2EB]/95 border-[#081F5C]/15 text-[#081F5C]'
        }`}
      >
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">
            One-Time Fee
          </span>
          <span className="text-xl font-display font-bold text-[#C5A869]">
            ₹{course.price.toLocaleString('en-IN')}
          </span>
        </div>

        <button
          id="mobile-sticky-enroll-btn"
          onClick={() => onEnroll(course)}
          className="px-6 py-3 rounded-full text-sm font-bold tracking-wide flex items-center gap-2 transition-all cursor-pointer shadow-lg bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C]"
        >
          <span>{lang === 'en' ? 'Enroll Now' : 'Enroll Karein'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
