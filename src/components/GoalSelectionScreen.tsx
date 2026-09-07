import React from 'react';
import { Check, ArrowRight, Music, Sparkles } from 'lucide-react';
import { GOALS } from '../data/content';
import { Language, Theme } from '../types';

interface GoalSelectionScreenProps {
  selectedGoalId: string;
  onSelectGoal: (id: string) => void;
  onContinue: () => void;
  onBack?: () => void;
  lang: Language;
  theme: Theme;
}

export const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({
  selectedGoalId,
  onSelectGoal,
  onContinue,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  const handleCardClick = (goalId: string) => {
    onSelectGoal(goalId);
    try {
      sessionStorage.setItem('pianotastic_visitor_goal', goalId);
    } catch {
      // safe fallback
    }
  };

  const selectedGoal = GOALS.find((g) => g.id === selectedGoalId) || GOALS[0];

  return (
    <div
      id="goal-selection-screen"
      className={`min-h-[calc(100vh-4.5rem)] flex flex-col justify-between py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full transition-colors duration-300 ${
        isDark ? 'text-[#F7F2EB]' : 'text-[#081F5C]'
      }`}
    >
      {/* Header Section */}
      <header className="text-center max-w-2xl mx-auto mb-6 sm:mb-9">
        {/* Subtle decorative pill */}
        <div className="flex justify-center mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold tracking-wider uppercase ${
              isDark
                ? 'bg-[#081F5C]/80 text-[#C5A869] border border-[#C5A869]/30'
                : 'bg-[#081F5C]/8 text-[#081F5C] border border-[#081F5C]/15'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {lang === 'en' ? 'Welcome to Pianotastic' : 'Pianotastic me Swagat Hai'}
            </span>
          </span>
        </div>

        {/* Main Heading: "What do you want to achieve?" */}
        <h1
          id="goal-question-heading"
          className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-2 sm:mb-3 leading-tight"
        >
          {lang === 'en'
            ? 'What do you want to achieve?'
            : 'Aap kya achieve karna chahte hain?'}
        </h1>

        {/* Reassurance text */}
        <p
          className={`text-xs sm:text-base leading-relaxed max-w-lg mx-auto ${
            isDark ? 'text-[#D8CFBC]' : 'text-[#47587E]'
          }`}
        >
          {lang === 'en'
            ? 'Choose the musical interest that excites you most. You can explore freely without tests or commitments.'
            : 'Apna pasandida musical interest chunein. Bina kisi test ya compulsion ke aaram se explore karein.'}
        </p>
      </header>

      {/* 9 Selectable Cards Grid */}
      <main className="flex-1 max-w-4xl mx-auto w-full mb-6 sm:mb-8">
        <div
          role="radiogroup"
          aria-label={lang === 'en' ? 'Musical goals' : 'Musical lakshya'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          {GOALS.map((goal) => {
            const isSelected = selectedGoalId === goal.id;
            const label = lang === 'en' ? goal.labelEn : goal.labelHi;
            const subtitle = lang === 'en' ? goal.subtitleEn : goal.subtitleHi;

            return (
              <button
                key={goal.id}
                id={`goal-card-${goal.id}`}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => handleCardClick(goal.id)}
                className={`relative w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer select-none group min-h-[104px] sm:min-h-[120px] active:scale-[0.985] ${
                  isSelected
                    ? isDark
                      ? 'bg-[#0E2E80]/85 border-[#C5A869] shadow-md shadow-black/30 ring-2 ring-[#C5A869]/80'
                      : 'bg-white border-[#081F5C] shadow-md shadow-[#081F5C]/12 ring-2 ring-[#081F5C]'
                    : isDark
                    ? 'bg-[#081F5C]/35 border-[#0E2E80]/70 hover:bg-[#081F5C]/60 hover:border-[#0E2E80]'
                    : 'bg-white border-[#081F5C]/12 hover:border-[#081F5C]/35 hover:shadow-xs'
                }`}
              >
                {/* Top Row: Number/Icon Badge & Selection State */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                        isSelected
                          ? isDark
                            ? 'bg-[#C5A869] text-[#081F5C]'
                            : 'bg-[#081F5C] text-[#F7F2EB]'
                          : isDark
                          ? 'bg-[#081F5C] text-[#D8CFBC]'
                          : 'bg-[#F2ECE1] text-[#081F5C]'
                      }`}
                    >
                      0{goal.order}
                    </span>
                    {isSelected && (
                      <span
                        className={`text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full ${
                          isDark
                            ? 'bg-[#C5A869]/20 text-[#C5A869]'
                            : 'bg-[#081F5C]/10 text-[#081F5C]'
                        }`}
                      >
                        {lang === 'en' ? 'Selected' : 'Chuna gaya'}
                      </span>
                    )}
                  </div>

                  {/* Radio / Check Circle */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      isSelected
                        ? isDark
                          ? 'bg-[#C5A869] text-[#081F5C]'
                          : 'bg-[#081F5C] text-[#F7F2EB]'
                        : isDark
                        ? 'border border-[#0E2E80] bg-[#040C24]/50'
                        : 'border border-[#081F5C]/25 bg-[#F7F2EB]/50'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-40 bg-current transition-opacity" />
                    )}
                  </div>
                </div>

                {/* Content: Label & Subtitle */}
                <div className="flex flex-col min-w-0 mt-0.5">
                  <span
                    className={`font-semibold text-sm sm:text-base leading-snug tracking-tight ${
                      isSelected
                        ? isDark
                          ? 'text-[#F7F2EB]'
                          : 'text-[#081F5C]'
                        : isDark
                        ? 'text-[#E2D8C9]'
                        : 'text-[#081F5C]'
                    }`}
                  >
                    {label}
                  </span>
                  <span
                    className={`text-xs mt-1 line-clamp-2 leading-relaxed ${
                      isDark ? 'text-[#AFA492]' : 'text-[#64769E]'
                    }`}
                  >
                    {subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {/* Bottom Action Section */}
      <footer className="w-full max-w-xl mx-auto pt-2 pb-4 safe-bottom">
        <button
          id="goals-continue-btn"
          type="button"
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-full text-base sm:text-lg font-semibold tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer min-h-[48px]"
          style={{
            backgroundColor: isDark ? '#F7F2EB' : '#081F5C',
            color: isDark ? '#081F5C' : '#F7F2EB',
          }}
        >
          <span>
            {lang === 'en' ? 'Continue' : 'Aage Badhein'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Quiet Reassurance */}
        <p
          className={`text-center text-xs mt-3 ${
            isDark ? 'text-[#AFA492]' : 'text-[#64769E]'
          }`}
        >
          {lang === 'en'
            ? 'Interest selection only • No test or placement requirement • Change anytime'
            : 'Sirf aapki pasand jaanne ke liye • Koi test ya compulsion nahi • Kabhi bhi badal sakte hain'}
        </p>
      </footer>
    </div>
  );
};
