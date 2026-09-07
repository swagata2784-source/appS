import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Square,
  CheckCircle2,
  Clock,
  Flame,
  Calendar,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Language, Theme, PracticeTimerSession, HandSelection } from '../types';
import {
  savePracticeTimerSession,
  getTodayPracticeDuration,
  getLocalDateString,
  recordSongPracticeSession,
} from '../utils/studentLearningService';
import { SONG_LIBRARY_DATA } from '../data/songsData';

interface PracticeTimerModalProps {
  isOpen: boolean;
  studentId: string;
  courseId: string;
  classNumber?: number;
  initialContextTitle?: string;
  songId?: string;
  hand?: HandSelection;
  onClose: () => void;
  onOpenJournal?: () => void;
  lang: Language;
  theme: Theme;
}

export const PracticeTimerModal: React.FC<PracticeTimerModalProps> = ({
  isOpen,
  studentId,
  courseId,
  classNumber,
  initialContextTitle = 'Piano Practice Session',
  songId,
  hand,
  onClose,
  onOpenJournal,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  // Timer states: 'idle' | 'running' | 'paused' | 'completed'
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');

  // Elapsed active time in milliseconds
  const [elapsedMs, setElapsedMs] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const sessionStartIsoRef = useRef<string>(new Date().toISOString());
  const animationFrameRef = useRef<number | null>(null);

  // Accidental exit alert dialog
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);

  // Completed session summary state
  const [completedSession, setCompletedSession] = useState<PracticeTimerSession | null>(null);

  // Today's practice total
  const [todayPractice, setTodayPractice] = useState(() => getTodayPracticeDuration(studentId));

  // Refresh today's stats whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setTodayPractice(getTodayPracticeDuration(studentId));
    }
  }, [isOpen, studentId]);

  // Handle Tab Visibility / Screen Lock to prevent phantom practice time
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && timerState === 'running') {
        // Automatically pause timer if app is backgrounded or screen locks
        pauseTimer();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [timerState]);

  // High-accuracy timer loop using Date.now() delta
  useEffect(() => {
    if (timerState === 'running') {
      const lastTick = Date.now();
      const intervalId = setInterval(() => {
        const now = Date.now();
        setElapsedMs((prev) => prev + (now - lastTick));
      }, 100);

      return () => clearInterval(intervalId);
    }
  }, [timerState]);

  // Format milliseconds to 00:00:00
  const formatTimeDetailed = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format seconds to "12 min 34 sec"
  const formatFriendlyTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins === 0) {
      return `${secs} ${lang === 'en' ? 'sec' : 'second'}`;
    }
    return `${mins} ${lang === 'en' ? 'min' : 'minute'} ${secs} ${lang === 'en' ? 'sec' : 'second'}`;
  };

  // Start Practice
  const startTimer = () => {
    sessionStartIsoRef.current = new Date().toISOString();
    setTimerState('running');
  };

  // Pause Practice
  const pauseTimer = () => {
    setTimerState('paused');
  };

  // Resume Practice
  const resumeTimer = () => {
    setTimerState('running');
  };

  // Finish Practice & Save Session
  const finishPractice = () => {
    const totalSeconds = Math.floor(elapsedMs / 1000);

    if (totalSeconds >= 3) {
      // Save valid practice session
      const newSession: PracticeTimerSession = {
        id: `sess-${Date.now()}`,
        studentId,
        courseId,
        classNumber,
        date: getLocalDateString(),
        startTime: sessionStartIsoRef.current,
        endTime: new Date().toISOString(),
        durationSeconds: totalSeconds,
        contextTitle: initialContextTitle,
        hand,
      };

      savePracticeTimerSession(newSession);
      setCompletedSession(newSession);
      setTodayPractice(getTodayPracticeDuration(studentId));

      // Record song practice duration if practicing a song
      if (songId) {
        recordSongPracticeSession(studentId, songId, totalSeconds);
      } else if (initialContextTitle) {
        const found = SONG_LIBRARY_DATA.find(
          (s) =>
            s.title.toLowerCase() === initialContextTitle.toLowerCase() ||
            initialContextTitle.toLowerCase().includes(s.title.toLowerCase())
        );
        if (found) {
          recordSongPracticeSession(studentId, found.id, totalSeconds);
        }
      }
    }

    setTimerState('completed');
  };

  // Handle Close / Backdrop click
  const handleAttemptClose = () => {
    if (timerState === 'running' || timerState === 'paused') {
      setShowExitConfirm(true);
    } else {
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setTimerState('idle');
    setElapsedMs(0);
    setShowExitConfirm(false);
    setCompletedSession(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark
            ? 'bg-[#081534] border-white/15 text-[#F7F2EB]'
            : 'bg-white border-[#081F5C]/15 text-[#081F5C]'
        }`}
      >
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C5A869]/20 text-[#C5A869] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base sm:text-lg">
                {lang === 'en' ? 'Practice Timer' : 'Riyaz Stopwatch'}
              </h2>
              <span className="text-[11px] opacity-70 block truncate max-w-[200px]">
                {initialContextTitle}
              </span>
            </div>
          </div>

          <button
            onClick={handleAttemptClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-xs cursor-pointer transition-colors"
            title={lang === 'en' ? 'Close' : 'Band karein'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* VIEW 1: IDLE / READY TO PRACTISE */}
        {/* ======================================================== */}
        {timerState === 'idle' && (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-[#C5A869]">
                {lang === 'en' ? 'Practice' : 'Riyaz'}
              </span>
              <h3 className="font-display font-bold text-2xl sm:text-3xl">
                {lang === 'en' ? 'Ready to practise?' : 'Riyaz ke liye taiyar?'}
              </h3>
              <p className="text-xs sm:text-sm opacity-75 max-w-xs mx-auto">
                {lang === 'en'
                  ? 'Your practice timer measures real active time spent playing and learning.'
                  : 'Aapka stopwatch sirf wo samay jodta hai jab aap sach me riyaz karte hain.'}
              </p>
            </div>

            {/* Prominent Start Practice Button */}
            <div className="pt-2">
              <button
                onClick={startTimer}
                className="w-full py-4 rounded-2xl bg-[#081F5C] text-[#F7F2EB] dark:bg-[#C5A869] dark:text-[#081F5C] font-display font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{lang === 'en' ? 'Start Practice' : 'Riyaz Shuru Karein'}</span>
              </button>
            </div>

            {/* Today's Accumulated Real Practice Total */}
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#C5A869]" />
                <span className="font-semibold">
                  {lang === 'en' ? "Today's Practice:" : "Aaj ka Riyaz:"}
                </span>
              </div>
              <div className="font-bold">
                {todayPractice.totalMinutes > 0 ? (
                  <span className="text-[#C5A869]">
                    {todayPractice.totalMinutes} {lang === 'en' ? 'min' : 'minute'} (
                    {todayPractice.sessionCount} {lang === 'en' ? 'sessions' : 'sessions'})
                  </span>
                ) : (
                  <span className="opacity-60">
                    {lang === 'en' ? 'No practice sessions yet' : 'Abhi tak koi session nahi'}
                  </span>
                )}
              </div>
            </div>

            {onOpenJournal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenJournal();
                }}
                className="text-xs text-[#C5A869] hover:underline font-semibold cursor-pointer block mx-auto"
              >
                {lang === 'en' ? 'View 30-Day Practice Journal →' : '30-Day Practice Journal dekhein →'}
              </button>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2 & 3: RUNNING OR PAUSED */}
        {/* ======================================================== */}
        {(timerState === 'running' || timerState === 'paused') && (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    timerState === 'running'
                      ? 'bg-emerald-500 animate-ping'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="text-xs uppercase font-bold tracking-widest text-[#C5A869]">
                  {timerState === 'running'
                    ? lang === 'en'
                      ? 'Practice Time'
                      : 'Riyaz Samay'
                    : lang === 'en'
                    ? 'Paused'
                    : 'Ruka hua hai'}
                </span>
              </div>

              {/* Large Monospace Stopwatch Display */}
              <div className="font-mono font-bold text-5xl sm:text-6xl tracking-wider py-4 text-[#C5A869]">
                {formatTimeDetailed(elapsedMs)}
              </div>

              <p className="text-xs opacity-70">
                {timerState === 'running'
                  ? lang === 'en'
                    ? 'Active practice duration is recording.'
                    : 'Active riyaz record ho raha hai.'
                  : lang === 'en'
                  ? 'Timer paused. Tap Resume to continue.'
                  : 'Stopwatch ruka hua hai. Continue karne ke liye Resume dabayein.'}
              </p>
            </div>

            {/* Action Buttons: Pause / Resume & Finish */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {timerState === 'running' ? (
                <button
                  onClick={pauseTimer}
                  className="py-3 px-4 rounded-xl border border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-500/20 cursor-pointer transition-colors"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>{lang === 'en' ? 'Pause' : 'Pause'}</span>
                </button>
              ) : (
                <button
                  onClick={resumeTimer}
                  className="py-3 px-4 rounded-xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500/20 cursor-pointer transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{lang === 'en' ? 'Resume' : 'Resume'}</span>
                </button>
              )}

              <button
                onClick={finishPractice}
                className="py-3 px-4 rounded-xl bg-[#081F5C] text-[#F7F2EB] dark:bg-[#C5A869] dark:text-[#081F5C] font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 shadow-md cursor-pointer transition-all"
              >
                <Square className="w-4 h-4 fill-current" />
                <span>{lang === 'en' ? 'Finish Practice' : 'Riyaz Pura'}</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 4: COMPLETED SUMMARY CONFIRMATION */}
        {/* ======================================================== */}
        {timerState === 'completed' && (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center animate-in zoom-in-50 duration-300">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-bold text-2xl">
                {lang === 'en' ? 'Practice Session Complete' : 'Riyaz Session Pura Hua!'}
              </h3>
              <p className="text-xs opacity-75">
                {completedSession
                  ? lang === 'en'
                    ? 'Saved directly to your 30-Day Practice Journal.'
                    : 'Aapke 30-Day Practice Journal me safalta se jud gaya.'
                  : lang === 'en'
                  ? 'Session was under 3 seconds and was not logged.'
                  : 'Session bahut chhota tha isliye record nahi hua.'}
              </p>
            </div>

            {completedSession && (
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 space-y-2">
                <div className="text-xs opacity-70">
                  {lang === 'en' ? 'Recorded Active Practice' : 'Darj Kiya Gaya Riyaz'}
                </div>
                <div className="font-mono font-bold text-2xl text-[#C5A869]">
                  {formatFriendlyTime(completedSession.durationSeconds)}
                </div>
                <div className="text-xs font-medium pt-1 border-t border-black/5 dark:border-white/5 opacity-80">
                  {lang === 'en' ? "Today's Total Practice:" : "Aaj Ka Kul Riyaz:"}{' '}
                  <strong>
                    {todayPractice.totalMinutes} {lang === 'en' ? 'min' : 'minute'}
                  </strong>
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={resetAndClose}
                className="w-full py-3.5 rounded-2xl bg-[#081F5C] text-[#F7F2EB] dark:bg-[#C5A869] dark:text-[#081F5C] font-bold text-sm shadow-md cursor-pointer hover:opacity-95"
              >
                {lang === 'en' ? 'Done' : 'Ho Gaya'}
              </button>

              {onOpenJournal && (
                <button
                  onClick={() => {
                    resetAndClose();
                    onOpenJournal();
                  }}
                  className="w-full py-2.5 rounded-2xl border border-black/15 dark:border-white/15 text-xs font-semibold hover:border-[#C5A869] cursor-pointer"
                >
                  {lang === 'en' ? 'Open 30-Day Practice Journal' : '30-Day Practice Journal Kholein'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ACCIDENTAL EXIT CONFIRMATION MODAL OVERLAY */}
        {showExitConfirm && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center space-y-4 z-20">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-bold text-lg">
                {lang === 'en' ? 'Practice is still running' : 'Riyaz abhi chal raha hai'}
              </h4>
              <p className="text-xs opacity-80 max-w-xs">
                {lang === 'en'
                  ? 'Do you want to keep practising or finish and save this session?'
                  : 'Kya aap riyaz jari rakhna chahte hain ya finish karke save karna chahte hain?'}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="w-full py-2.5 rounded-xl bg-[#081F5C] text-[#F7F2EB] dark:bg-[#C5A869] dark:text-[#081F5C] text-xs font-bold cursor-pointer"
              >
                {lang === 'en' ? 'Keep Practising' : 'Riyaz Jari Rakhein'}
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  finishPractice();
                }}
                className="w-full py-2.5 rounded-xl border border-black/20 dark:border-white/20 text-xs font-bold hover:bg-black/10 cursor-pointer"
              >
                {lang === 'en' ? 'Finish & Save Session' : 'Finish aur Save Karein'}
              </button>
              <button
                onClick={resetAndClose}
                className="text-[11px] opacity-60 hover:opacity-100 underline pt-1 cursor-pointer"
              >
                {lang === 'en' ? 'Discard and Exit' : 'Discard karke bahar jayein'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
