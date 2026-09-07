import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar,
  Clock,
  Flame,
  Award,
  ChevronRight,
  Play,
  CheckCircle2,
  AlertCircle,
  BarChart2,
} from 'lucide-react';
import { Language, Theme, PracticeJournalDayInfo, PracticeTimerSession } from '../types';
import {
  get30DayPracticeJournalSummary,
  getLocalDateString,
} from '../utils/studentLearningService';

interface PracticeJournalModalProps {
  isOpen: boolean;
  studentId: string;
  onClose: () => void;
  onStartPractice?: () => void;
  lang: Language;
  theme: Theme;
}

export const PracticeJournalModal: React.FC<PracticeJournalModalProps> = ({
  isOpen,
  studentId,
  onClose,
  onStartPractice,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  const journalSummary = useMemo(
    () => get30DayPracticeJournalSummary(studentId),
    [studentId, isOpen]
  );

  const todayStr = getLocalDateString();
  const [selectedDay, setSelectedDay] = useState<PracticeJournalDayInfo | null>(() => {
    return (
      journalSummary.days.find((d) => d.dateString === todayStr) ||
      journalSummary.days[0] ||
      null
    );
  });

  const formatSessionTime = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatSeconds = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-[#081534] border-white/15 text-[#F7F2EB]'
            : 'bg-white border-[#081F5C]/15 text-[#081F5C]'
        }`}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-black/10 dark:border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C5A869]/20 text-[#C5A869] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg sm:text-xl">
                  {lang === 'en' ? '30-Day Practice Journal' : '30-Day Practice Journal'}
                </h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#C5A869]/20 text-[#C5A869]">
                  Cycle {journalSummary.cycle.cycleNumber}
                </span>
              </div>
              <p className="text-xs opacity-70">
                {lang === 'en'
                  ? 'Real practice duration recorded from your practice timer'
                  : 'Aapke practice timer se darj kiya gaya asali riyaz'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* STATS STRIP */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Today's practice */}
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <span className="text-[10px] uppercase font-bold opacity-60 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C5A869]" />
                {lang === 'en' ? "Today's Practice" : 'Aaj Ka Riyaz'}
              </span>
              <div className="font-display font-bold text-xl sm:text-2xl text-[#C5A869] mt-0.5">
                {journalSummary.todayMinutes}{' '}
                <span className="text-xs font-normal opacity-80">min</span>
              </div>
            </div>

            {/* Total 30-Day Cycle Minutes */}
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <span className="text-[10px] uppercase font-bold opacity-60 flex items-center gap-1">
                <BarChart2 className="w-3 h-3 text-[#C5A869]" />
                {lang === 'en' ? 'Cycle Total' : 'Kul Riyaz'}
              </span>
              <div className="font-display font-bold text-xl sm:text-2xl mt-0.5">
                {journalSummary.totalCycleMinutes}{' '}
                <span className="text-xs font-normal opacity-80">min</span>
              </div>
            </div>

            {/* Current Streak */}
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <span className="text-[10px] uppercase font-bold opacity-60 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" />
                {lang === 'en' ? 'Current Streak' : 'Streak'}
              </span>
              <div className="font-display font-bold text-xl sm:text-2xl text-amber-500 mt-0.5">
                {journalSummary.currentStreak}{' '}
                <span className="text-xs font-normal opacity-80">
                  {lang === 'en' ? 'days' : 'din'}
                </span>
              </div>
            </div>

            {/* Days with Practice */}
            <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <span className="text-[10px] uppercase font-bold opacity-60 flex items-center gap-1">
                <Award className="w-3 h-3 text-emerald-500" />
                {lang === 'en' ? 'Practice Days' : 'Riyaz Ke Din'}
              </span>
              <div className="font-display font-bold text-xl sm:text-2xl text-emerald-500 mt-0.5">
                {journalSummary.practiceDaysCount} / 30
              </div>
            </div>
          </div>

          {/* 30-DAY INTERACTIVE GRID */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-xs uppercase tracking-wider opacity-75">
                {lang === 'en' ? '30-Day Practice Calendar' : '30-Day Riyaz Calendar'}
              </span>
              <span className="opacity-60 text-[11px]">
                {lang === 'en'
                  ? `Day ${journalSummary.currentDayNumber} of 30`
                  : `30 me se Din ${journalSummary.currentDayNumber}`}
              </span>
            </div>

            <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
              {journalSummary.days.map((day) => {
                const isSelected = selectedDay?.dayNumber === day.dayNumber;
                const isToday = day.dateString === todayStr;

                return (
                  <button
                    key={`day-${day.dayNumber}`}
                    onClick={() => setSelectedDay(day)}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative border ${
                      isSelected
                        ? 'ring-2 ring-[#C5A869] border-[#C5A869] scale-105'
                        : ''
                    } ${
                      day.state === 'practiced'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                        : isToday
                        ? 'bg-[#C5A869]/15 border-[#C5A869] text-[#C5A869]'
                        : day.state === 'no_practice'
                        ? 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 opacity-70'
                        : 'bg-transparent border-dashed border-black/10 dark:border-white/10 opacity-40'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold">D{day.dayNumber}</span>
                    <span className="text-[9px] opacity-75 mt-0.5">{day.formattedDate}</span>
                    {day.totalMinutes > 0 ? (
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        {day.totalMinutes}m
                      </span>
                    ) : (
                      <span className="text-[9px] opacity-40 mt-1">—</span>
                    )}

                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A869] absolute -top-1 -right-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SELECTED DAY SESSIONS BREAKDOWN */}
          {selectedDay && (
            <div className="p-4 sm:p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C5A869]" />
                  <span className="font-display font-bold text-sm">
                    {lang === 'en'
                      ? `Day ${selectedDay.dayNumber} • ${selectedDay.formattedDate}`
                      : `Din ${selectedDay.dayNumber} • ${selectedDay.formattedDate}`}
                  </span>
                  {selectedDay.dateString === todayStr && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A869]/20 text-[#C5A869] font-bold">
                      {lang === 'en' ? 'Today' : 'Aaj'}
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold font-mono">
                  {selectedDay.totalMinutes > 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {selectedDay.totalMinutes} {lang === 'en' ? 'minutes total' : 'kul minute'}
                    </span>
                  ) : (
                    <span className="opacity-60">
                      {lang === 'en' ? 'No practice recorded' : 'Koi riyaz darj nahi'}
                    </span>
                  )}
                </div>
              </div>

              {/* Sessions list */}
              {selectedDay.sessions.length > 0 ? (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                    {lang === 'en' ? 'Completed Timer Sessions' : 'Pura Kiye Gaye Sessions'}
                  </span>
                  <div className="space-y-1.5">
                    {selectedDay.sessions.map((sess, idx) => (
                      <div
                        key={sess.id || idx}
                        className="p-3 rounded-xl bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <div>
                            <div className="font-bold">{sess.contextTitle}</div>
                            <div className="text-[11px] opacity-60">
                              {formatSessionTime(sess.startTime)} –{' '}
                              {formatSessionTime(sess.endTime)}
                            </div>
                          </div>
                        </div>

                        <div className="font-mono font-bold text-sm text-[#C5A869]">
                          {formatSeconds(sess.durationSeconds)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-xs opacity-60">
                  {selectedDay.dateString <= todayStr
                    ? lang === 'en'
                      ? 'No practice sessions were recorded on this day.'
                      : 'Is din koi riyaz record nahi hua tha.'
                    : lang === 'en'
                    ? 'Upcoming day. Keep up your daily practice journey!'
                    : 'Aane wala din. Apna daily riyaz banaye rakhein!'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 sm:p-5 border-t border-black/10 dark:border-white/10 flex items-center justify-between gap-3 flex-shrink-0 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="text-xs opacity-75 hidden sm:block">
            {lang === 'en'
              ? 'Consistency builds mastery. Even 15 minutes counts.'
              : 'Rozana ka riyaz hi safalta deta hai. 15 minute bhi kafi hain.'}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onStartPractice && (
              <button
                onClick={() => {
                  onClose();
                  onStartPractice();
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#081F5C] text-[#F7F2EB] dark:bg-[#C5A869] dark:text-[#081F5C] font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer hover:opacity-90"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'en' ? 'Start Practice' : 'Riyaz Shuru Karein'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-black/15 dark:border-white/15 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
            >
              {lang === 'en' ? 'Close' : 'Band Karein'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
