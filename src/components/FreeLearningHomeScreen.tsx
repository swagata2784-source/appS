import React from 'react';
import { ArrowRight, PlayCircle, Sparkles } from 'lucide-react';
import { FREE_CATEGORIES } from '../data/content';
import { CategoryId, Language, Theme } from '../types';

interface FreeLearningHomeScreenProps {
  onSelectCategory: (categoryId: CategoryId) => void;
  lang: Language;
  theme: Theme;
}

export const FreeLearningHomeScreen: React.FC<FreeLearningHomeScreenProps> = ({
  onSelectCategory,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      id="free-learning-home-screen"
      className={`min-h-[calc(100vh-5rem)] py-8 px-4 sm:px-8 max-w-6xl mx-auto w-full transition-colors duration-300 ${
        isDark ? 'text-[#F7F2EB]' : 'text-[#081F5C]'
      }`}
    >
      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        <div className="flex justify-center mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase ${
              isDark
                ? 'bg-[#081F5C]/80 text-[#C5A869] border border-[#C5A869]/30'
                : 'bg-[#081F5C]/8 text-[#081F5C] border border-[#081F5C]/15'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === 'en' ? 'Open Access Series' : 'Free Video Series'}
            </span>
          </span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight mb-3">
          {lang === 'en' ? 'Free Learning' : 'Free Learning'}
        </h1>
        <p
          className={`text-base sm:text-lg leading-relaxed max-w-xl mx-auto ${
            isDark ? 'text-[#D8CFBC]' : 'text-[#47587E]'
          }`}
        >
          {lang === 'en'
            ? 'Start learning piano and music with our free video lessons.'
            : 'Humare muft video lessons ke sath piano aur sangeet seekhna shuru karein.'}
        </p>
      </div>

      {/* Bento Grid: Four Free Learning Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {FREE_CATEGORIES.map((cat) => {
          const name = lang === 'en' ? cat.nameEn : cat.nameHi;
          const desc = lang === 'en' ? cat.descEn : cat.descHi;
          const tag = lang === 'en' ? cat.tagEn : cat.tagHi;

          return (
            <div
              key={cat.id}
              id={`category-card-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`group relative rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col justify-between ${
                isDark
                  ? 'bg-[#081F5C]/40 border-[#0E2E80] hover:border-[#C5A869]/60 hover:bg-[#081F5C]/60'
                  : 'bg-white border-[#081F5C]/10 hover:border-[#081F5C]/40 hover:shadow-lg'
              }`}
            >
              {/* Category Cinematic Visual Header */}
              <div
                className="relative h-48 sm:h-52 w-full p-6 flex flex-col justify-between overflow-hidden"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #05143D 0%, #0A246B 100%)'
                    : 'linear-gradient(135deg, #081F5C 0%, #17387F 100%)',
                }}
              >
                {/* SVG Artistic Music Motif */}
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  <svg
                    viewBox="0 0 400 200"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full object-cover"
                  >
                    <circle cx="350" cy="50" r="120" stroke="#F7F2EB" strokeWidth="1" strokeDasharray="4 4" />
                    <circle cx="350" cy="50" r="80" stroke="#C5A869" strokeWidth="1.5" />
                    <path
                      d="M-20 160 C 100 120, 200 190, 420 140"
                      stroke="#C5A869"
                      strokeWidth="2"
                    />
                    {Array.from({ length: 14 }).map((_, i) => (
                      <line
                        key={i}
                        x1={i * 30}
                        y1="150"
                        x2={i * 30 + 10}
                        y2="200"
                        stroke="#F7F2EB"
                        strokeWidth="1.5"
                        strokeOpacity="0.4"
                      />
                    ))}
                  </svg>
                </div>

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span
                    className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase backdrop-blur-sm"
                    style={{
                      backgroundColor: 'rgba(247, 242, 235, 0.15)',
                      color: '#F7F2EB',
                      border: '1px solid rgba(247, 242, 235, 0.25)',
                    }}
                  >
                    {tag}
                  </span>
                  <span className="text-xs font-semibold text-[#C5A869] tracking-wider flex items-center gap-1.5 bg-black/30 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>3 Lessons</span>
                  </span>
                </div>

                {/* Category Title within Visual Area */}
                <div className="relative z-10">
                  <span className="text-xs tracking-widest font-semibold uppercase text-[#D8CFBC] block mb-1">
                    {lang === 'en' ? `Module 0${cat.order}` : `Bhag 0${cat.order}`}
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    {name}
                  </h2>
                </div>
              </div>

              {/* Lower Details & Explore Action */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <p
                  className={`text-sm sm:text-base leading-relaxed mb-6 ${
                    isDark ? 'text-[#D8CFBC]' : 'text-[#47587E]'
                  }`}
                >
                  {desc}
                </p>

                {/* Explore Button */}
                <div className="flex items-center justify-between pt-4 border-t border-current/10">
                  <span className="text-xs font-medium opacity-65">
                    {lang === 'en' ? 'Free pre-recorded series' : 'Muft video series'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 text-sm font-bold tracking-wide transition-transform group-hover:translate-x-1 ${
                      isDark ? 'text-[#C5A869]' : 'text-[#081F5C]'
                    }`}
                  >
                    <span>{lang === 'en' ? 'Explore Lessons' : 'Explore Karein'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bento reassurance notice */}
      <div
        className={`text-center py-5 px-6 rounded-2xl border text-xs sm:text-sm max-w-2xl mx-auto shadow-sm ${
          isDark
            ? 'bg-[#081F5C]/35 border-[#0E2E80] text-[#D8CFBC]'
            : 'bg-white border-[#081F5C]/10 text-[#47587E]'
        }`}
      >
        {lang === 'en'
          ? 'All lessons are pre-recorded and available to watch freely at your own pace without registration.'
          : 'Sabhi video lessons muft hain aur aap apni suvidha ke anusaar kabhi bhi bina registration ke dekh sakte hain.'}
      </div>
    </div>
  );
};
