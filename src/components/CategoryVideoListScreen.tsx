import React from 'react';
import { Play, Clock, ArrowRight } from 'lucide-react';
import { FREE_CATEGORIES, FREE_LESSONS } from '../data/content';
import { CategoryId, Language, Theme, VideoLesson } from '../types';

interface CategoryVideoListScreenProps {
  categoryId: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  onSelectVideo: (video: VideoLesson) => void;
  onBack: () => void;
  lang: Language;
  theme: Theme;
}

export const CategoryVideoListScreen: React.FC<CategoryVideoListScreenProps> = ({
  categoryId,
  onSelectCategory,
  onSelectVideo,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  const currentCategory =
    FREE_CATEGORIES.find((c) => c.id === categoryId) || FREE_CATEGORIES[0];
  const categoryLessons = FREE_LESSONS.filter(
    (l) => l.categoryId === categoryId
  ).sort((a, b) => a.order - b.order);

  const catName = lang === 'en' ? currentCategory.nameEn : currentCategory.nameHi;
  const catDesc = lang === 'en' ? currentCategory.descEn : currentCategory.descHi;

  return (
    <div
      id="category-video-list-screen"
      className={`min-h-[calc(100vh-5rem)] py-8 px-4 sm:px-8 max-w-6xl mx-auto w-full transition-colors duration-300 ${
        isDark ? 'text-[#F7F2EB]' : 'text-[#081F5C]'
      }`}
    >
      {/* Category Switching Pills (All 4 Categories) */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-4 mb-6 scrollbar-none">
        {FREE_CATEGORIES.map((cat) => {
          const isActive = cat.id === categoryId;
          const name = lang === 'en' ? cat.nameEn : cat.nameHi;

          return (
            <button
              key={cat.id}
              id={`cat-pill-${cat.id}`}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                isActive
                  ? isDark
                    ? 'bg-[#F7F2EB] text-[#081F5C] border-[#F7F2EB] shadow-md'
                    : 'bg-[#081F5C] text-[#F7F2EB] border-[#081F5C] shadow-md'
                  : isDark
                  ? 'bg-[#081F5C]/40 text-[#D8CFBC] border-[#0E2E80] hover:bg-[#081F5C]/70'
                  : 'bg-white text-[#081F5C] border-[#081F5C]/15 hover:bg-[#EBE2D5]'
              }`}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Category Hero Bento Card */}
      <div
        className={`rounded-3xl p-6 sm:p-10 mb-8 border transition-all shadow-xl relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-r from-[#081F5C] via-[#0E2E80] to-[#05143D] border-[#0E2E80] text-[#F7F2EB]'
            : 'bg-gradient-to-r from-[#081F5C] via-[#102B73] to-[#1A3B8B] border-[#081F5C]/15 text-white'
        }`}
      >
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C5A869] block mb-2">
            {lang === 'en' ? 'Free Video Series' : 'Free Video Series'}
          </span>
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight mb-3 text-white">
            {catName}
          </h1>
          <p className="text-sm sm:text-base text-[#E2D8C9] leading-relaxed">
            {catDesc}
          </p>
        </div>

        {/* Ambient subtle glow */}
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#C5A869]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Video List Section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5 px-1">
          <h2 className="font-display text-lg sm:text-2xl font-bold tracking-tight">
            {lang === 'en' ? 'Available Video Lessons' : 'Uplabdh Video Lessons'}
          </h2>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border ${
              isDark
                ? 'bg-[#0E2E80]/80 text-[#C5A869] border-[#0E2E80]'
                : 'bg-[#081F5C]/8 text-[#081F5C] border-[#081F5C]/10'
            }`}
          >
            {categoryLessons.length} {lang === 'en' ? 'Lessons' : 'Lessons'}
          </span>
        </div>

        {/* Bento Grid of Video Cards */}
        <div className="flex flex-col gap-4">
          {categoryLessons.map((lesson) => {
            const title = lang === 'en' ? lesson.titleEn : lesson.titleHi;
            const desc = lang === 'en' ? lesson.descEn : lesson.descHi;
            const topics = lang === 'en' ? lesson.keyTopicsEn : lesson.keyTopicsHi;

            return (
              <div
                key={lesson.id}
                id={`video-card-${lesson.id}`}
                onClick={() => onSelectVideo(lesson)}
                className={`group rounded-2xl overflow-hidden border p-4 sm:p-5 transition-all duration-200 hover:shadow-lg cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 ${
                  isDark
                    ? 'bg-[#081F5C]/35 border-[#0E2E80] hover:border-[#C5A869]/50 hover:bg-[#081F5C]/55'
                    : 'bg-white border-[#081F5C]/10 hover:border-[#081F5C]/30 shadow-sm'
                }`}
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-4 w-full sm:w-auto flex-1 min-w-0">
                  {/* Stylized Thumbnail Poster */}
                  <div
                    className="relative w-32 sm:w-40 aspect-video rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-md"
                    style={{ background: lesson.posterGradient }}
                  >
                    {/* Visual keyboard accent on poster */}
                    <div className="absolute inset-x-0 bottom-0 h-4 bg-white/20 flex gap-0.5 px-1 items-end pb-0.5">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="flex-1 h-3 bg-[#F7F2EB] rounded-[1px]" />
                      ))}
                    </div>

                    {/* Center Play Button Overlay */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>

                    {/* Lesson Order Tag */}
                    <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white">
                      0{lesson.order}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold tracking-wider text-[#C5A869] uppercase">
                        {lang === 'en' ? `Lesson 0${lesson.order}` : `Lesson 0${lesson.order}`}
                      </span>
                      <span className="text-[11px] opacity-40">•</span>
                      <span
                        className={`text-xs font-medium flex items-center gap-1 ${
                          isDark ? 'text-[#D8CFBC]' : 'text-[#64769E]'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{lesson.duration}</span>
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base sm:text-lg mb-1 leading-snug group-hover:text-[#C5A869] transition-colors">
                      {title}
                    </h3>
                    <p
                      className={`text-xs sm:text-sm line-clamp-2 leading-relaxed mb-2.5 ${
                        isDark ? 'text-[#D8CFBC]' : 'text-[#47587E]'
                      }`}
                    >
                      {desc}
                    </p>

                    {/* Key takeaways pills */}
                    <div className="hidden sm:flex flex-wrap gap-1.5">
                      {topics.map((topic, i) => (
                        <span
                          key={i}
                          className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${
                            isDark
                              ? 'bg-[#0E2E80]/60 border-[#0E2E80] text-[#D8CFBC]'
                              : 'bg-[#081F5C]/5 border-[#081F5C]/10 text-[#081F5C]'
                          }`}
                        >
                          ✓ {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Watch Action Button */}
                <div className="w-full sm:w-auto flex sm:flex-col items-center justify-end sm:justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-current/10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectVideo(lesson);
                    }}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                      isDark
                        ? 'bg-[#F7F2EB] text-[#081F5C] hover:bg-white'
                        : 'bg-[#081F5C] text-[#F7F2EB] hover:bg-[#0E2E80]'
                    }`}
                  >
                    <span>{lang === 'en' ? 'Watch' : 'Dekhein'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
