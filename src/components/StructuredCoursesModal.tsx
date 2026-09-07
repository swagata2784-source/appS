import React from 'react';
import { X, Calendar, Users, Award, Bell } from 'lucide-react';
import { Language, Theme } from '../types';

interface StructuredCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreRecorded: () => void;
  lang: Language;
  theme: Theme;
}

export const StructuredCoursesModal: React.FC<StructuredCoursesModalProps> = ({
  isOpen,
  onClose,
  onExploreRecorded,
  lang,
  theme,
}) => {
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all duration-200 ${
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
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold block text-[#C5A869]">
                {lang === 'en' ? 'Academy Pathway' : 'Academy Pathway'}
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
                {lang === 'en' ? 'Structured Academy Courses' : 'Structured Academy Courses'}
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
            ? 'Pianotastic Academy offers comprehensive cohort-based Structured Courses with scheduled terms, direct teacher reviews, and graded assessment milestones.'
            : 'Pianotastic Academy me cohort-based structured courses aate hain jinme term schedule aur regular feedback rehta hai.'}
        </p>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#081F5C]/40 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
            }`}
          >
            <Users className="w-5 h-5 text-[#C5A869] mb-2" />
            <h3 className="font-semibold text-sm mb-1">
              {lang === 'en' ? 'Cohort Learning' : 'Cohort Learning'}
            </h3>
            <p className="text-xs opacity-75 leading-relaxed">
              {lang === 'en'
                ? 'Term-based batches with focused peer pacing.'
                : 'Batches ke sath ek sath aage badhein.'}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#081F5C]/40 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
            }`}
          >
            <Award className="w-5 h-5 text-[#C5A869] mb-2" />
            <h3 className="font-semibold text-sm mb-1">
              {lang === 'en' ? 'Teacher Reviews' : 'Teacher Reviews'}
            </h3>
            <p className="text-xs opacity-75 leading-relaxed">
              {lang === 'en'
                ? 'Detailed feedback on hand posture and tone.'
                : 'Technique aur posture par personalized feedback.'}
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl border ${
              isDark ? 'bg-[#081F5C]/40 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
            }`}
          >
            <Bell className="w-5 h-5 text-[#C5A869] mb-2" />
            <h3 className="font-semibold text-sm mb-1">
              {lang === 'en' ? 'Intake Cycles' : 'Intake Batches'}
            </h3>
            <p className="text-xs opacity-75 leading-relaxed">
              {lang === 'en'
                ? 'Seasonal batch admissions announced periodically.'
                : 'Samay-samay par naye batches ki announcement.'}
            </p>
          </div>
        </div>

        {/* Highlight regarding Recorded Courses */}
        <div className="p-4 rounded-2xl bg-[#C5A869]/10 border border-[#C5A869]/30 text-xs sm:text-sm leading-relaxed mb-6">
          <p className="font-semibold text-[#C5A869] mb-1">
            {lang === 'en' ? 'Want to start learning immediately?' : 'Turant seekhna shuru karna chahte hain?'}
          </p>
          <p className="opacity-90">
            {lang === 'en'
              ? 'Our Recorded Courses give you instant, permanent access to the complete structured curriculum with no batch waiting times.'
              : 'Hamare Recorded Courses se aap bina kisi batch wait ke aaj hi apna step-by-step course shuru kar sakte hain.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full text-sm font-semibold tracking-wide cursor-pointer opacity-70 hover:opacity-100 transition-opacity"
          >
            {lang === 'en' ? 'Close' : 'Band Karein'}
          </button>
          <button
            onClick={() => {
              onClose();
              onExploreRecorded();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide cursor-pointer transition-all bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C]"
          >
            {lang === 'en' ? 'Explore Recorded Courses' : 'Recorded Courses Dekhiye'}
          </button>
        </div>
      </div>
    </div>
  );
};
