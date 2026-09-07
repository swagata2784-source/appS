import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { GOALS } from '../data/content';
import { Language, Theme } from '../types';

interface GoalSelectionScreenProps {
  selectedGoalIds: string[];
  onToggleGoal: (id: string) => void;
  onContinue: () => void;
  onBack: () => void;
  lang: Language;
  theme: Theme;
}

export const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({
  selectedGoalIds,
  onToggleGoal,
  onContinue,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      id="goal-selection-screen"
      className={`min-h-[calc(100vh-5rem)] flex flex-col justify-between py-8 px-4 sm:px-8 max-w-5xl mx-auto w-full transition-colors duration-300 ${
        isDark ? 'text-[#F7F2EB]' : 'text-[#081F5C]'
      }`}
    >
      {/* Header Section */}
      <div className="text-center mb-8 pt-2 max-w-xl mx-auto">
        <span
          className={`text-xs font-semibold tracking-[0.2em] uppercase mb-2 block ${
            isDark ? 'text-[#C5A869]' : 'text-[#64769E]'
          }`}
        >
          {lang === 'en' ? 'Step 1 of 2' : 'Pehla Kadam'}
        </span>
        <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight mb-2">
          {lang === 'en'
            ? 'What do you want to achieve?'
            : 'Aap kya achieve karna chahte hain?'}
        </h1>
        <p
          className={`text-xs sm:text-base ${
            isDark ? 'text-[#D8CFBC]' : 'text-[#47587E]'
          }`}
        >
          {lang === 'en'
            ? 'Select one or more musical aspirations that inspire you most.'
            : 'Apne pasandida goals chuniye. Aap ek se zyada bhi select kar sakte hain.'}
        </p>
      </div>

      {/* 9 Goal Cards in Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 mb-8">
        {GOALS.map((goal) => {
          const isSelected = selectedGoalIds.includes(goal.id);
          const label = lang === 'en' ? goal.labelEn : goal.labelHi;
          const subtitle = lang === 'en' ? goal.subtitleEn : goal.subtitleHi;

          return (
            <button
              key={goal.id}
              id={`goal-option-${goal.id}`}
              type="button"
              onClick={() => onToggleGoal(goal.id)}
              className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 cursor-pointer select-none group ${
                isSelected
                  ? isDark
                    ? 'bg-[#0E2E80]/80 border-[#C5A869] shadow-md shadow-black/20 ring-1 ring-[#C5A869]'
                    : 'bg-white border-[#081F5C] shadow-md shadow-[#081F5C]/10 ring-2 ring-[#081F5C]'
                  : isDark
                  ? 'bg-[#081F5C]/30 border-[#0E2E80]/70 hover:bg-[#081F5C]/50 hover:border-[#0E2E80]'
                  : 'bg-white border-[#081F5C]/10 hover:border-[#081F5C]/30 shadow-sm'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-center justify-between w-full">
                {/* Number indicator */}
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
                    isSelected
                      ? isDark
                        ? 'bg-[#C5A869] text-[#081F5C]'
                        : 'bg-[#081F5C] text-[#F7F2EB]'
                      : isDark
                      ? 'bg-[#081F5C] text-[#D8CFBC]'
                      : 'bg-[#EBE2D5] text-[#081F5C]'
                  }`}
                >
                  0{goal.order}
                </span>

                {/* Selection Check Indicator */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? isDark
                        ? 'bg-[#C5A869] text-[#081F5C]'
                        : 'bg-[#081F5C] text-[#F7F2EB]'
                      : isDark
                      ? 'border border-[#0E2E80]'
                      : 'border border-[#081F5C]/20'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>

              <div className="flex flex-col min-w-0 mt-1">
                <span
                  className={`font-semibold text-sm sm:text-base leading-snug line-clamp-1 ${
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

      {/* Sticky/Fixed bottom action for Continue */}
      <div className="pt-3 pb-4 safe-bottom">
        <button
          id="goals-continue-btn"
          type="button"
          onClick={onContinue}
          className="w-full py-4 px-6 rounded-full text-base sm:text-lg font-semibold tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg cursor-pointer"
          style={{
            backgroundColor: isDark ? '#F7F2EB' : '#081F5C',
            color: isDark ? '#081F5C' : '#F7F2EB',
          }}
        >
          <span>
            {lang === 'en'
              ? selectedGoalIds.length > 0
                ? `Continue (${selectedGoalIds.length} selected)`
                : 'Continue'
              : selectedGoalIds.length > 0
              ? `Aage Badhein (${selectedGoalIds.length} chune)`
              : 'Aage Badhein'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
        <p
          className={`text-center text-xs mt-2.5 ${
            isDark ? 'text-[#AFA492]' : 'text-[#64769E]'
          }`}
        >
          {lang === 'en'
            ? 'No placement test • You can change your goals at any time'
            : 'Koi test nahi • Aap kabhi bhi apne goals badal sakte hain'}
        </p>
      </div>
    </div>
  );
};
