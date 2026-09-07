import React, { useState, useEffect } from 'react';
import {
  Play,
  CheckCircle2,
  Lock,
  Clock,
  BookOpen,
  Calendar,
  Award,
  Sparkles,
  LogOut,
  User,
  Music,
  Compass,
  ArrowRight,
  Flame,
  Volume2,
  X,
  RotateCcw,
  Check,
  ChevronRight,
  Pause,
} from 'lucide-react';
import { Language, Theme, StudentAccount, RecordedCourse } from '../types';
import { Logo } from './Logo';
import { LearnHomeScreen } from './LearnHomeScreen';
import { SongLibraryScreen } from './SongLibraryScreen';
import { PracticeTimerModal } from './PracticeTimerModal';
import { PracticeJournalModal } from './PracticeJournalModal';

interface StudentHomeScreenProps {
  student: StudentAccount;
  course: RecordedCourse;
  onSignOut: () => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  lang: Language;
  theme: Theme;
  initialTab?: 'home' | 'learn' | 'practice' | 'profile';
  onRequireLogin?: () => void;
  onSelectCourse?: (course: RecordedCourse) => void;
  onOpenClass?: (classNumber: number) => void;
  onOpenSongLibrary?: () => void;
}

export const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({
  student,
  course,
  onSignOut,
  onToggleTheme,
  onToggleLang,
  lang,
  theme,
  initialTab = 'home',
  onRequireLogin,
  onSelectCourse,
  onOpenClass,
  onOpenSongLibrary,
}) => {
  const isDark = theme === 'dark';

  // Navigation tab in student portal
  const [activeTab, setActiveTab] = useState<'home' | 'learn' | 'practice' | 'profile'>(initialTab);
  const [showSongLibrary, setShowSongLibrary] = useState(false);

  // Practice state
  const [practiceMinutes, setPracticeMinutes] = useState(15);
  const [isPracticing, setIsPracticing] = useState(false);
  const [practiceTimerSeconds, setPracticeTimerSeconds] = useState(0);

  // Active class modal
  const [activeClassModal, setActiveClassModal] = useState<number | null>(null);

  // Full curriculum view modal
  const [showAllClassesModal, setShowAllClassesModal] = useState(false);

  // Practice Timer & Journal modals
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [showJournalModal, setShowJournalModal] = useState(false);

  // Metronome state for practice hub
  const [bpm, setBpm] = useState(80);
  const [isMetronomeActive, setIsMetronomeActive] = useState(false);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return lang === 'en' ? 'Good morning' : 'Shubh Prabhat';
    }
    if (hour < 17) {
      return lang === 'en' ? 'Good afternoon' : 'Shubh Dopahar';
    }
    return lang === 'en' ? 'Good evening' : 'Shubh Sandhya';
  };

  // Timer effect
  useEffect(() => {
    let interval: any;
    if (isPracticing) {
      interval = setInterval(() => {
        setPracticeTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPracticing]);

  // Audio metronome click simulation
  useEffect(() => {
    let metronomeInterval: any;
    if (isMetronomeActive) {
      const intervalMs = (60 / bpm) * 1000;
      metronomeInterval = setInterval(() => {
        try {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.06);
        } catch (e) {
          // audio context fallback
        }
      }, intervalMs);
    }
    return () => clearInterval(metronomeInterval);
  }, [isMetronomeActive, bpm]);

  // Syllabus classes list for enrolled course
  const classesList = [
    {
      id: 1,
      titleEn: 'Class 1: Keyboard Geography & Posture',
      titleHi: 'Class 1: Keyboard Geography aur Posture',
      duration: '42 min',
      status: 'ready', // ready | locked | completed
      descEn: 'Master finger posture, bench height, the 88-key layout, and finding Middle C.',
      descHi: 'Finger posture, bench height, 88 keys ka layout aur Middle C seekhein.',
    },
    {
      id: 2,
      titleEn: 'Class 2: The Grand Staff & Treble Clef',
      titleHi: 'Class 2: The Grand Staff aur Treble Clef',
      duration: '48 min',
      status: 'locked',
      descEn: 'Reading musical pitch, ledger lines, and the right-hand C position notes.',
      descHi: 'Musical pitch, ledger lines aur right hand C position notes padhna.',
    },
    {
      id: 3,
      titleEn: 'Class 3: Bass Clef & Left-Hand Harmony',
      titleHi: 'Class 3: Bass Clef aur Left-Hand Harmony',
      duration: '45 min',
      status: 'locked',
      descEn: 'Navigating the Bass Clef, foundational root-fifths, and bilateral finger independence.',
      descHi: 'Bass clef padhna aur dono haathon ki finger independence.',
    },
    {
      id: 4,
      titleEn: 'Class 4: Rhythm, Meter & Time Signatures',
      titleHi: 'Class 4: Rhythm, Meter aur Time Signatures',
      duration: '50 min',
      status: 'locked',
      descEn: 'Quarter notes, half notes, whole notes, and counting standard 4/4 meter with precision.',
      descHi: 'Quarter notes, half notes, whole notes aur 4/4 meter counting.',
    },
    {
      id: 5,
      titleEn: 'Class 5: Hands Together Coordination',
      titleHi: 'Class 5: Dono Haath Ek Saath Play Karna',
      duration: '52 min',
      status: 'locked',
      descEn: 'The core breakthrough: synchronizing melody in the right hand with bass chords.',
      descHi: 'Right hand melody ke saath left hand chords ko synchronize karna.',
    },
    {
      id: 6,
      titleEn: 'Class 6: First Classical Repertoire Etude',
      titleHi: 'Class 6: Pehla Classical Repertoire Etude',
      duration: '55 min',
      status: 'locked',
      descEn: 'Performing your first complete piece with phrasing, dynamics, and expression.',
      descHi: 'Dynamics aur musical phrasing ke sath pehla complete piece perform karein.',
    },
  ];

  if (showSongLibrary) {
    return (
      <SongLibraryScreen
        student={student}
        course={course}
        onBack={() => setShowSongLibrary(false)}
        lang={lang}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onToggleLang={onToggleLang}
      />
    );
  }

  return (
    <div
      id="student-home-screen"
      className={`w-full min-h-screen pb-28 transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      {/* Student Navigation Top Bar */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors ${
          isDark
            ? 'bg-[#040C24]/90 border-[#0E2E80]'
            : 'bg-[#F7F2EB]/90 border-[#081F5C]/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <Logo size="sm" isDark={isDark} />
        </div>

        {/* Student ID & Profile Action */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => {
              if (onOpenSongLibrary) {
                onOpenSongLibrary();
              } else {
                setShowSongLibrary(true);
              }
            }}
            className="px-3 py-1.5 rounded-full border border-[#C5A869]/50 bg-[#C5A869]/15 text-xs font-bold text-[#C5A869] hover:bg-[#C5A869]/25 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Open Song Library Repertoire"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{lang === 'en' ? 'Song Library' : 'Song Library'}</span>
          </button>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#C5A869]/40 bg-[#C5A869]/10 text-xs font-mono font-bold text-[#C5A869]">
            <span>ID:</span>
            <span>{student.studentId}</span>
          </div>

          <button
            onClick={onSignOut}
            className="p-2 rounded-xl border border-[#081F5C]/10 dark:border-white/10 text-xs font-semibold flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity cursor-pointer text-[#C5A869]"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">
              {lang === 'en' ? 'Sign Out' : 'Logout'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Student Hub Views */}
      <main className="max-w-5xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 space-y-8">
        {activeTab === 'home' && (
          <>
            {/* Header Greeting & Streak */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-[#C5A869]/20 text-[#C5A869]">
                    {student.studentId}
                  </span>
                  <span className="text-xs opacity-60">•</span>
                  <span className="text-xs opacity-75 capitalize">
                    {course.category} Pathway
                  </span>
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                  {getGreeting()}, {student.fullName.split(' ')[0]}
                </h1>
                <p
                  className={`text-xs sm:text-sm ${
                    isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
                  }`}
                >
                  {lang === 'en'
                    ? 'Ready for your daily practice session?'
                    : 'Aaj kya practice karna hai?'}
                </p>
              </div>

              {/* Habit / Practice Badge */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border flex items-center gap-3.5 shadow-sm ${
                  isDark
                    ? 'bg-[#081F5C]/40 border-[#0E2E80]'
                    : 'bg-white border-[#081F5C]/10'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] opacity-65 uppercase font-bold tracking-wider">
                    {lang === 'en' ? 'Practice Streak' : 'Practice Streak'}
                  </div>
                  <div className="font-bold text-sm sm:text-base text-[#C5A869]">
                    Day 1 Started
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Continue Learning Card */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-lg relative overflow-hidden space-y-4 ${
                isDark
                  ? 'bg-gradient-to-br from-[#081F5C] to-[#040C24] border-[#0E2E80]'
                  : 'bg-gradient-to-br from-[#081F5C] to-[#0A246B] text-[#F7F2EB] border-[#081F5C]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest font-bold text-[#C5A869]">
                  {lang === 'en' ? 'Continue Learning' : 'Learning Continue Kijiye'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-white font-medium">
                  Class 1 of {course.classesCount}
                </span>
              </div>

              <div className="space-y-2 max-w-xl">
                <h2 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold leading-snug">
                  Class 1: Keyboard Geography & Posture
                </h2>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Master the essential foundations: sitting alignment, natural wrist buoyancy, the 88-key topography, and orienting yourself from Middle C.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => (onOpenClass ? onOpenClass(1) : setActiveClassModal(1))}
                  className="py-3.5 px-6 rounded-full text-sm font-bold tracking-wide flex items-center gap-2.5 transition-transform hover:scale-102 cursor-pointer bg-[#C5A869] text-[#081F5C] shadow-lg"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {lang === 'en' ? 'Start Class 1 (42 min)' : 'Class 1 Shuru Karein'}
                  </span>
                </button>

                <button
                  onClick={() => setShowAllClassesModal(true)}
                  className="py-3.5 px-5 rounded-full text-xs font-semibold flex items-center gap-2 border border-white/20 hover:bg-white/10 transition-colors cursor-pointer text-white"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {lang === 'en' ? 'View Full Syllabus' : 'Pura Syllabus Dekhein'}
                  </span>
                </button>
              </div>
            </div>

            {/* Two-Column Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: My Course & Next Classes (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Course Card */}
                <div
                  className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                    isDark
                      ? 'bg-[#081F5C]/30 border-[#0E2E80]'
                      : 'bg-white border-[#081F5C]/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#C5A869]">
                      Enrolled Recorded Course
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      In Progress
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold">
                    {lang === 'en' ? course.titleEn : course.titleHi}
                  </h3>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#081F5C]/10 dark:bg-white/10 font-semibold">
                      {course.format}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#081F5C]/10 dark:bg-white/10 font-semibold">
                      {course.duration}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#081F5C]/10 dark:bg-white/10 font-semibold">
                      {course.classesCount} Classes
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="pt-2 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="opacity-75">Curriculum Progress</span>
                      <span className="font-semibold font-mono text-[#C5A869]">
                        0% Completed
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
                      <div className="w-[4%] h-full bg-[#C5A869] rounded-full" />
                    </div>
                  </div>
                </div>

                {/* My Classes Preview with lock states */}
                <div
                  className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                    isDark
                      ? 'bg-[#081F5C]/30 border-[#0E2E80]'
                      : 'bg-white border-[#081F5C]/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#C5A869]">
                      {lang === 'en' ? 'Upcoming Classes' : 'Aage Ki Classes'}
                    </span>
                    <button
                      onClick={() => setShowAllClassesModal(true)}
                      className="text-xs font-semibold text-[#C5A869] hover:underline cursor-pointer"
                    >
                      {lang === 'en' ? 'View All' : 'Sabhi Dekhein'}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {classesList.slice(0, 4).map((cls) => (
                      <div
                        key={cls.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          cls.status === 'ready'
                            ? isDark
                              ? 'bg-[#081F5C]/50 border-[#C5A869]/30'
                              : 'bg-white border-[#C5A869]/40 shadow-sm'
                            : isDark
                            ? 'bg-[#040C24]/40 border-[#0E2E80] opacity-60'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs ${
                              cls.status === 'ready'
                                ? 'bg-[#C5A869] text-[#081F5C]'
                                : 'bg-gray-200 dark:bg-gray-800 text-gray-500'
                            }`}
                          >
                            {cls.status === 'ready' ? (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-xs sm:text-sm">
                              {lang === 'en' ? cls.titleEn : cls.titleHi}
                            </div>
                            <div className="text-[11px] opacity-70">
                              {cls.duration} •{' '}
                              {cls.status === 'ready'
                                ? 'Ready to Start'
                                : 'Complete Class 1 to Unlock'}
                            </div>
                          </div>
                        </div>

                        {cls.status === 'ready' ? (
                          <button
                            onClick={() => setActiveClassModal(cls.id)}
                            className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] cursor-pointer hover:opacity-90"
                          >
                            Start
                          </button>
                        ) : (
                          <Lock className="w-4 h-4 opacity-40 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Today's Practice & Tools (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Today's Practice Goal Card */}
                <div
                  className={`p-6 sm:p-7 rounded-3xl border shadow-md space-y-5 ${
                    isDark
                      ? 'bg-[#081F5C]/40 border-[#0E2E80]'
                      : 'bg-white border-[#081F5C]/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold tracking-wider text-[#C5A869]">
                      {lang === 'en' ? "Today's Practice" : 'Aaj Ki Practice'}
                    </span>
                    <span className="text-xs font-semibold opacity-75">
                      Daily Goal: 30 min
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#081F5C]/5 dark:bg-white/5 border border-[#081F5C]/10 dark:border-white/10 space-y-3 text-center">
                    <div className="font-mono text-3xl sm:text-4xl font-bold tracking-tight text-[#C5A869]">
                      {Math.floor(practiceTimerSeconds / 60)}:
                      {(practiceTimerSeconds % 60).toString().padStart(2, '0')}
                    </div>
                    <p className="text-xs opacity-75">
                      {isPracticing
                        ? lang === 'en'
                          ? 'Session in progress… Focus on relaxed wrists.'
                          : 'Practice chal rahi hai… Wrist relaxed rakhein.'
                        : lang === 'en'
                        ? 'Track your daily keyboard practice time'
                        : 'Apna daily piano practice time track karein'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setIsPracticing(!isPracticing)}
                      className={`w-full py-3.5 px-6 rounded-full text-sm font-bold tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer ${
                        isPracticing
                          ? 'bg-rose-500 text-white hover:bg-rose-600'
                          : 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-95'
                      }`}
                    >
                      {isPracticing ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>
                            {lang === 'en' ? 'Pause Practice' : 'Practice Rokein'}
                          </span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>
                            {lang === 'en'
                              ? "Start Today's Practice"
                              : 'Practice Shuru Karein'}
                          </span>
                        </>
                      )}
                    </button>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setShowTimerModal(true)}
                        className="py-2.5 px-3 rounded-xl border border-[#C5A869]/40 bg-[#C5A869]/10 text-xs font-bold text-[#C5A869] flex items-center justify-center gap-1.5 hover:bg-[#C5A869]/20 cursor-pointer transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Stopwatch Timer' : 'Stopwatch'}</span>
                      </button>

                      <button
                        onClick={() => setShowJournalModal(true)}
                        className="py-2.5 px-3 rounded-xl border border-black/10 dark:border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 hover:border-[#C5A869] cursor-pointer transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-[#C5A869]" />
                        <span>{lang === 'en' ? '30-Day Journal' : 'Journal'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Built-in Piano Metronome Widget */}
                <div
                  className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                    isDark
                      ? 'bg-[#081F5C]/30 border-[#0E2E80]'
                      : 'bg-white border-[#081F5C]/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#C5A869]">
                      <Volume2 className="w-4 h-4" />
                      <span>Academy Metronome</span>
                    </div>
                    <span className="font-mono text-sm font-bold text-[#C5A869]">
                      {bpm} BPM
                    </span>
                  </div>

                  {/* BPM slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={40}
                      max={208}
                      value={bpm}
                      onChange={(e) => setBpm(Number(e.target.value))}
                      className="w-full accent-[#C5A869]"
                    />
                    <div className="flex justify-between text-[10px] opacity-60">
                      <span>Largo (40)</span>
                      <span>Andante (80)</span>
                      <span>Allegro (130)</span>
                      <span>Presto (200)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsMetronomeActive(!isMetronomeActive)}
                    className={`w-full py-3 rounded-full text-xs font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                      isMetronomeActive
                        ? 'bg-amber-500 text-white'
                        : 'border border-[#081F5C]/20 dark:border-white/20 hover:border-[#C5A869]'
                    }`}
                  >
                    {isMetronomeActive ? 'Stop Metronome' : 'Start Metronome'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Learn Tab: Dedicated Learn Home (Prompt 21) */}
        {activeTab === 'learn' && (
          <LearnHomeScreen
            student={student}
            currentCourse={course}
            onSelectCourse={onSelectCourse}
            onOpenClass={(cls) => {
              if (onOpenClass) {
                onOpenClass(cls.classNumber);
              }
            }}
            onRequireLogin={onRequireLogin}
            onOpenSongLibrary={() => {
              if (onOpenSongLibrary) {
                onOpenSongLibrary();
              } else {
                setShowSongLibrary(true);
              }
            }}
            lang={lang}
            theme={theme}
          />
        )}

        {/* Practice Hub Tab */}
        {activeTab === 'practice' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold">
                {lang === 'en' ? 'Practice Studio' : 'Practice Studio'}
              </h2>
              <p className="text-xs opacity-70">
                Pianotastic daily drill logs and tempo trainers.
              </p>
            </div>

            {/* Metronome & Timer Box */}
            <div
              className={`p-6 rounded-3xl border shadow-sm space-y-6 ${
                isDark
                  ? 'bg-[#081F5C]/40 border-[#0E2E80]'
                  : 'bg-white border-[#081F5C]/10'
              }`}
            >
              <div className="text-center space-y-2">
                <span className="text-xs uppercase font-bold tracking-wider text-[#C5A869]">
                  Live Practice Stopwatch
                </span>
                <div className="font-mono text-4xl font-bold text-[#C5A869]">
                  {Math.floor(practiceTimerSeconds / 60)}:
                  {(practiceTimerSeconds % 60).toString().padStart(2, '0')}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsPracticing(!isPracticing)}
                  className="flex-1 py-3 rounded-full text-sm font-bold bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] cursor-pointer"
                >
                  {isPracticing ? 'Pause' : 'Start Session'}
                </button>
                <button
                  onClick={() => {
                    setIsPracticing(false);
                    setPracticeTimerSeconds(0);
                  }}
                  className="px-5 py-3 rounded-full text-sm font-semibold border border-[#081F5C]/20 dark:border-white/20 cursor-pointer"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile & Student Record Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold">
                {lang === 'en' ? 'Student Profile' : 'Student Profile'}
              </h2>
              <p className="text-xs opacity-70">
                Permanent academy registration details and preferences.
              </p>
            </div>

            <div
              className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
                isDark
                  ? 'bg-[#081F5C]/40 border-[#0E2E80]'
                  : 'bg-white border-[#081F5C]/10'
              }`}
            >
              <div className="space-y-1 pb-3 border-b border-[#081F5C]/10 dark:border-white/10">
                <span className="text-xs opacity-60 block">Permanent Student ID</span>
                <span className="font-mono text-lg font-bold text-[#C5A869]">
                  {student.studentId}
                </span>
              </div>

              <div className="space-y-1 pb-3 border-b border-[#081F5C]/10 dark:border-white/10">
                <span className="text-xs opacity-60 block">Full Name</span>
                <span className="text-sm font-semibold">{student.fullName}</span>
              </div>

              <div className="space-y-1 pb-3 border-b border-[#081F5C]/10 dark:border-white/10">
                <span className="text-xs opacity-60 block">Email Address</span>
                <span className="text-sm font-semibold">{student.email}</span>
              </div>

              <div className="space-y-1 pb-3 border-b border-[#081F5C]/10 dark:border-white/10">
                <span className="text-xs opacity-60 block">Mobile</span>
                <span className="text-sm font-semibold">{student.phone}</span>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  onClick={onToggleTheme}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold border border-[#081F5C]/15 dark:border-white/15 flex items-center justify-between cursor-pointer"
                >
                  <span>App Theme</span>
                  <span className="font-bold uppercase text-[#C5A869]">
                    {theme}
                  </span>
                </button>

                <button
                  onClick={onToggleLang}
                  className="w-full py-3 px-4 rounded-xl text-xs font-semibold border border-[#081F5C]/15 dark:border-white/15 flex items-center justify-between cursor-pointer"
                >
                  <span>App Language</span>
                  <span className="font-bold uppercase text-[#C5A869]">
                    {lang === 'en' ? 'English' : 'Hindi'}
                  </span>
                </button>

                <button
                  onClick={onSignOut}
                  className="w-full py-3.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer mt-3"
                >
                  Sign Out from Academy
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Class Video Player Preview Modal */}
      {activeClassModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div
            className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 space-y-4 ${
              isDark
                ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                : 'bg-white border-[#081F5C]/15 text-[#081F5C]'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-[#C5A869]">
                Class {activeClassModal} Video Player
              </span>
              <button
                onClick={() => setActiveClassModal(null)}
                className="p-1.5 rounded-full hover:bg-gray-500/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated High-Res Video Screen */}
            <div className="aspect-video w-full rounded-2xl bg-black relative flex items-center justify-center overflow-hidden border border-white/10">
              <div className="text-center space-y-3 p-6">
                <button
                  onClick={() => {
                    const cNum = activeClassModal;
                    setActiveClassModal(null);
                    if (onOpenClass) {
                      onOpenClass(cNum);
                    }
                  }}
                  className="w-16 h-16 rounded-full bg-[#C5A869] text-[#081F5C] flex items-center justify-center mx-auto shadow-xl hover:scale-105 transition-transform cursor-pointer"
                >
                  <Play className="w-7 h-7 fill-current ml-1" />
                </button>
                <div className="font-display font-bold text-white text-base sm:text-lg">
                  Keyboard Geography & Posture
                </div>
                <p className="text-xs text-white/70 max-w-sm">
                  Instructor: Amitava Sen • 42 min • Official Pianotastic Academy HD Lesson
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 text-xs">
              <span className="opacity-70">
                Lesson materials, sheet music, theory & practice attached
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const cNum = activeClassModal;
                    setActiveClassModal(null);
                    if (onOpenClass) {
                      onOpenClass(cNum);
                    }
                  }}
                  className="py-2 px-5 rounded-full text-xs font-bold bg-[#C5A869] text-[#081F5C] cursor-pointer shadow-sm hover:opacity-95"
                >
                  Open Full Class Screen
                </button>
                <button
                  onClick={() => setActiveClassModal(null)}
                  className="py-2 px-4 rounded-full text-xs font-medium border border-[#081F5C]/20 dark:border-white/20 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Syllabus Modal */}
      {showAllClassesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div
            className={`w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl border shadow-2xl p-6 sm:p-8 space-y-5 ${
              isDark
                ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                : 'bg-white border-[#081F5C]/15 text-[#081F5C]'
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#081F5C]/10 dark:border-white/10 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869]">
                  Full Syllabus
                </span>
                <h3 className="font-display text-lg font-bold">
                  {lang === 'en' ? course.titleEn : course.titleHi}
                </h3>
              </div>
              <button
                onClick={() => setShowAllClassesModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-500/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {classesList.map((cls) => (
                <div
                  key={cls.id}
                  className="p-4 rounded-xl border border-[#081F5C]/10 dark:border-white/10 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-sm">
                      {lang === 'en' ? cls.titleEn : cls.titleHi}
                    </div>
                    <div className="opacity-70 text-[11px]">{cls.duration}</div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      cls.status === 'ready'
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-gray-500/10 text-gray-500'
                    }`}
                  >
                    {cls.status === 'ready' ? 'Active' : 'Locked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Student Portal Bottom Navigation Bar (Section 19) */}
      <nav
        id="student-bottom-nav"
        className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-md px-6 py-2.5 flex items-center justify-around transition-colors ${
          isDark
            ? 'bg-[#040C24]/95 border-[#0E2E80]'
            : 'bg-[#F7F2EB]/95 border-[#081F5C]/10'
        }`}
      >
        <button
          id="nav-tab-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'home' ? 'text-[#C5A869]' : 'opacity-60 hover:opacity-100'
          }`}
        >
          <Music className="w-5 h-5" />
          <span>{lang === 'en' ? 'Home' : 'Home'}</span>
        </button>

        <button
          id="nav-tab-learn"
          onClick={() => setActiveTab('learn')}
          className={`flex flex-col items-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'learn' ? 'text-[#C5A869]' : 'opacity-60 hover:opacity-100'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>{lang === 'en' ? 'Learn' : 'Sikhiye'}</span>
        </button>

        <button
          id="nav-tab-songs"
          onClick={() => setShowSongLibrary(true)}
          className="flex flex-col items-center gap-1 text-xs font-semibold transition-colors cursor-pointer opacity-60 hover:opacity-100 hover:text-[#C5A869]"
        >
          <Music className="w-5 h-5 text-[#C5A869]" />
          <span>{lang === 'en' ? 'Songs' : 'Songs'}</span>
        </button>

        <button
          id="nav-tab-practice"
          onClick={() => setActiveTab('practice')}
          className={`flex flex-col items-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'practice' ? 'text-[#C5A869]' : 'opacity-60 hover:opacity-100'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>{lang === 'en' ? 'Practice' : 'Riyaz'}</span>
        </button>

        <button
          id="nav-tab-profile"
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === 'profile' ? 'text-[#C5A869]' : 'opacity-60 hover:opacity-100'
          }`}
        >
          <User className="w-5 h-5" />
          <span>{lang === 'en' ? 'Profile' : 'Profile'}</span>
        </button>
      </nav>

      {/* PRACTICE TIMER MODAL */}
      {showTimerModal && (
        <PracticeTimerModal
          isOpen={showTimerModal}
          studentId={student.studentId}
          courseId={course.id}
          initialContextTitle={course.title}
          onClose={() => setShowTimerModal(false)}
          onOpenJournal={() => setShowJournalModal(true)}
          lang={lang}
          theme={theme}
        />
      )}

      {/* 30-DAY PRACTICE JOURNAL MODAL */}
      {showJournalModal && (
        <PracticeJournalModal
          isOpen={showJournalModal}
          studentId={student.studentId}
          onClose={() => setShowJournalModal(false)}
          onStartPractice={() => setShowTimerModal(true)}
          lang={lang}
          theme={theme}
        />
      )}
    </div>
  );
};
