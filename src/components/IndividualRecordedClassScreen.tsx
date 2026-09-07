import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Clock,
  CheckCircle2,
  Lock,
  MessageSquare,
  HelpCircle,
  Timer as TimerIcon,
  FileText,
  Music2,
  Send,
  BookOpen,
  ChevronRight,
  Download,
  Sparkles,
  ExternalLink,
  ChevronLeft,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import {
  RecordedCourse,
  StudentAccount,
  Language,
  Theme,
  ClassComment,
  ClassStudentQuestion,
  SheetMusicItem,
  PracticalHomeworkItem,
  InteractiveScore,
} from '../types';
import {
  ClassProgressItem,
  getStudentCourseProgress,
  recordVideoProgress,
  getClassComments,
  addClassComment,
  getClassQuestions,
  addClassQuestion,
  getStudentPracticeTime,
  addStudentPracticeTime,
  getActivePracticeSession,
  saveActivePracticeSession,
  clearActivePracticeSession,
  getTheoryAssignmentProgress,
  getHomeworkStatus,
  saveHomeworkStatus,
} from '../utils/studentLearningService';
import { getClassLearningContent } from '../data/classLearningContent';
import { getInteractiveScoreById, getInteractiveScoreForClass } from '../data/interactiveScoresData';
import { SheetMusicViewerModal } from './SheetMusicViewerModal';
import { TheoryAssignmentModal } from './TheoryAssignmentModal';
import { InteractiveSheetMusicModal } from './InteractiveSheetMusicModal';
import { PracticeTimerModal } from './PracticeTimerModal';
import { PracticeJournalModal } from './PracticeJournalModal';

interface IndividualRecordedClassScreenProps {
  course: RecordedCourse;
  classNumber: number;
  student: StudentAccount;
  onBack: () => void;
  onOpenClass: (targetClassNumber: number) => void;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

export const IndividualRecordedClassScreen: React.FC<IndividualRecordedClassScreenProps> = ({
  course,
  classNumber,
  student,
  onBack,
  onOpenClass,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';

  // Load progress state for student & course
  const learningState = getStudentCourseProgress(student.studentId, course);
  const classProgress: ClassProgressItem = learningState.classes[classNumber] || {
    classNumber,
    status: 'not_started',
    savedSeconds: 0,
    durationSeconds: 1080,
  };

  // Find curriculum details for week/lesson information
  let currentWeekNumber = 1;
  let weekTitleEn = 'Week 1';
  let weekTitleHi = 'Week 1';
  let classCurriculumTitleEn = `Class ${classNumber}`;
  let classCurriculumTitleHi = `Class ${classNumber}`;
  let classCurriculumDuration = '18:00';

  if (course.courseStructure) {
    let globalIndex = 0;
    for (const week of course.courseStructure) {
      for (const classStr of week.classes) {
        globalIndex++;
        const match = classStr.match(/^Class\s*(\d+)\s*:\s*(.+)$/i);
        const cNum = match ? parseInt(match[1], 10) : globalIndex;
        const cTitle = match ? match[2].trim() : classStr;
        if (cNum === classNumber) {
          currentWeekNumber = week.weekNumber;
          weekTitleEn = week.titleEn;
          weekTitleHi = week.titleHi;
          classCurriculumTitleEn = cTitle;
          classCurriculumTitleHi = cTitle;
          classCurriculumDuration = '18:00';
          break;
        }
      }
    }
  }

  // Load class-specific rich pedagogical content
  const classContent = getClassLearningContent(
    course.id,
    classNumber,
    currentWeekNumber,
    lang === 'en' ? classCurriculumTitleEn : classCurriculumTitleHi
  );

  // VIDEO PLAYER STATE
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(classProgress.savedSeconds || 0);
  // Default realistic class video duration (approx 16-18 mins)
  const [duration, setDuration] = useState<number>(classProgress.durationSeconds || 1080);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showResumeBanner, setShowResumeBanner] = useState<boolean>(
    Boolean(classProgress.savedSeconds && classProgress.savedSeconds > 0 && classProgress.status !== 'completed')
  );
  const [hasReachedThreshold, setHasReachedThreshold] = useState<boolean>(
    classProgress.status === 'completed'
  );

  // SECTION TABS / SCROLL ANCHORS
  type ActiveSectionTab = 'all' | 'comments' | 'ask' | 'practice' | 'notes' | 'sheet';
  const [activeSectionFilter, setActiveSectionFilter] = useState<ActiveSectionTab>('all');

  // COMMENTS STATE
  const [commentsList, setCommentsList] = useState<ClassComment[]>(() =>
    getClassComments(course.id, classNumber)
  );
  const [newCommentText, setNewCommentText] = useState<string>('');

  // ASK A QUESTION STATE
  const [questionsList, setQuestionsList] = useState<ClassStudentQuestion[]>(() =>
    getClassQuestions(student.studentId, course.id, classNumber)
  );
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [questionSentNotice, setQuestionSentNotice] = useState<boolean>(false);

  // PRACTICE TIMER STATE (Independent stopwatch)
  const [totalPracticeSeconds, setTotalPracticeSeconds] = useState<number>(() =>
    getStudentPracticeTime(student.studentId, course.id, classNumber)
  );
  const [practiceTimerActive, setPracticeTimerActive] = useState<boolean>(false);
  const [practiceSessionSeconds, setPracticeSessionSeconds] = useState<number>(0);
  const [practiceContextTitle, setPracticeContextTitle] = useState<string>(
    classContent.practiceInstructions.titleEn
  );
  const practiceIntervalRef = useRef<any>(null);

  // MODALS
  const [activeSheetMusicModal, setActiveSheetMusicModal] = useState<SheetMusicItem | null>(null);
  const [activeInteractiveScore, setActiveInteractiveScore] = useState<InteractiveScore | null>(null);
  const [showTheoryModal, setShowTheoryModal] = useState<boolean>(false);
  const [showPracticeTimerModal, setShowPracticeTimerModal] = useState<boolean>(false);
  const [showPracticeJournalModal, setShowPracticeJournalModal] = useState<boolean>(false);
  const [interactiveNotice, setInteractiveNotice] = useState<boolean>(false);
  const [downloadSuccessNotice, setDownloadSuccessNotice] = useState<boolean>(false);

  // PRACTICAL HOMEWORK STATUSES
  const [homeworkStatusMap, setHomeworkStatusMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    classContent.practicalHomework.forEach((hw) => {
      map[hw.id] = getHomeworkStatus(student.studentId, course.id, classNumber, hw.id);
    });
    return map;
  });

  // Theory assignment progress for display badges
  const theoryProgress = getTheoryAssignmentProgress(student.studentId, course.id, classNumber);

  // Restore active practice session if student previously navigated away
  useEffect(() => {
    const restored = getActivePracticeSession(student.studentId, course.id, classNumber);
    if (restored) {
      setPracticeSessionSeconds(restored.secondsElapsed);
      if (restored.homeworkTitle) setPracticeContextTitle(restored.homeworkTitle);
      if (restored.isRunning) {
        setPracticeTimerActive(true);
      }
    }
  }, [student.studentId, course.id, classNumber]);

  // Handle practice timer ticker
  useEffect(() => {
    if (practiceTimerActive) {
      practiceIntervalRef.current = setInterval(() => {
        setPracticeSessionSeconds((prev) => {
          const next = prev + 1;
          saveActivePracticeSession({
            studentId: student.studentId,
            courseId: course.id,
            classNumber,
            homeworkTitle: practiceContextTitle,
            secondsElapsed: next,
            isRunning: true,
            lastUpdatedAt: Date.now(),
          });
          return next;
        });
      }, 1000);
    } else {
      if (practiceIntervalRef.current) {
        clearInterval(practiceIntervalRef.current);
      }
    }
    return () => {
      if (practiceIntervalRef.current) {
        clearInterval(practiceIntervalRef.current);
      }
    };
  }, [practiceTimerActive, student.studentId, course.id, classNumber, practiceContextTitle]);

  // Video time tracking and sync to persistent learning state
  const handleVideoTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || duration;
    setCurrentTime(cur);

    // Save timestamp to persistent service every 3 seconds or on milestones
    if (Math.floor(cur) % 3 === 0) {
      recordVideoProgress(student.studentId, course, classNumber, cur, dur);
    }

    // Video completion check (90% threshold or ended)
    if (dur > 0 && cur / dur >= 0.90 && !hasReachedThreshold) {
      setHasReachedThreshold(true);
      recordVideoProgress(student.studentId, course, classNumber, cur, dur);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setHasReachedThreshold(true);
    recordVideoProgress(student.studentId, course, classNumber, duration, duration);
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      // Persist exact pause position
      recordVideoProgress(
        student.studentId,
        course,
        classNumber,
        videoRef.current.currentTime,
        videoRef.current.duration || duration
      );
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
      setShowResumeBanner(false);
    }
  };

  const handleResumeClick = () => {
    if (videoRef.current && classProgress.savedSeconds) {
      videoRef.current.currentTime = classProgress.savedSeconds;
      setCurrentTime(classProgress.savedSeconds);
    }
    setShowResumeBanner(false);
    handleTogglePlay();
  };

  const handleRestartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
    }
    setShowResumeBanner(false);
    handleTogglePlay();
  };

  const formatSeconds = (totalSec: number): string => {
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Practice Timer Handlers
  const handleStartPracticeTimer = (customTitle?: string) => {
    if (customTitle) {
      setPracticeContextTitle(customTitle);
    }
    setShowPracticeTimerModal(true);
  };

  const handlePausePracticeTimer = () => {
    setPracticeTimerActive(false);
    saveActivePracticeSession({
      studentId: student.studentId,
      courseId: course.id,
      classNumber,
      homeworkTitle: practiceContextTitle,
      secondsElapsed: practiceSessionSeconds,
      isRunning: false,
      lastUpdatedAt: Date.now(),
    });
  };

  const handleStopAndSavePractice = () => {
    setPracticeTimerActive(false);
    if (practiceSessionSeconds > 0) {
      const updatedTotal = addStudentPracticeTime(
        student.studentId,
        course.id,
        classNumber,
        practiceSessionSeconds
      );
      setTotalPracticeSeconds(updatedTotal);
      setPracticeSessionSeconds(0);
      clearActivePracticeSession(student.studentId, course.id, classNumber);
    }
  };

  // Comments Handlers
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const newComm: ClassComment = {
      id: `c-${Date.now()}`,
      studentName: student.fullName || 'Academy Student',
      studentId: student.studentId,
      comment: newCommentText.trim(),
      timestamp: 'Just now',
    };

    const updated = addClassComment(course.id, classNumber, newComm);
    setCommentsList(updated);
    setNewCommentText('');
  };

  // Ask a Question Handlers
  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newQ: ClassStudentQuestion = {
      id: `q-${Date.now()}`,
      studentId: student.studentId,
      studentName: student.fullName || 'Academy Student',
      question: newQuestionText.trim(),
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Submitted',
    };

    const updated = addClassQuestion(student.studentId, course.id, classNumber, newQ);
    setQuestionsList(updated);
    setNewQuestionText('');
    setQuestionSentNotice(true);
    setTimeout(() => setQuestionSentNotice(false), 5000);
  };

  // Download Class Notes
  const handleDownloadNotes = () => {
    setDownloadSuccessNotice(true);
    setTimeout(() => {
      setDownloadSuccessNotice(false);
    }, 4000);
  };

  // Check next and previous classes
  const totalClasses = course.classesCount || 16;
  const isNextClassUnlocked =
    classNumber < totalClasses &&
    (learningState.completedClassNumbers.includes(classNumber) || hasReachedThreshold);

  return (
    <div
      id="individual-recorded-class-screen"
      className={`min-h-screen flex flex-col transition-colors ${
        isDark ? 'bg-[#030919] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      {/* Top Bar / Header */}
      <header className="sticky top-0 z-40 px-4 py-3 border-b border-[#081F5C]/10 dark:border-white/10 backdrop-blur-md bg-opacity-95 dark:bg-opacity-95 bg-[#F7F2EB] dark:bg-[#030919]">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-[#081F5C]/15 dark:border-white/15 hover:bg-[#081F5C]/5 dark:hover:bg-white/5 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {lang === 'en' ? 'Back to Course' : 'Course Par Wapas'}
              </span>
            </button>

            <div className="hidden sm:block h-4 w-[1px] bg-[#081F5C]/15 dark:bg-white/15" />

            <div className="text-xs font-semibold opacity-75 truncate max-w-[200px] md:max-w-xs">
              {lang === 'en' ? course.titleEn : course.titleHi}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Language Toggle */}
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-[#081F5C]/20 dark:border-white/20 hover:border-[#C5A869] cursor-pointer"
              title="Toggle Language"
            >
              {lang === 'en' ? 'हिन्दी' : 'English'}
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={onToggleTheme}
              className="px-2.5 py-1 rounded-lg text-xs font-bold border border-[#081F5C]/20 dark:border-white/20 hover:border-[#C5A869] cursor-pointer"
              title="Toggle Theme"
            >
              {isDark ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-5 space-y-6">
        {/* ================================================== */}
        {/* 1. INDIVIDUAL RECORDED CLASS HEADER & VIDEO PLAYER */}
        {/* ================================================== */}
        <section className="space-y-4">
          {/* Class Meta info Header */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#C5A869]">
              <span className="px-2.5 py-0.5 rounded-full bg-[#C5A869]/15 border border-[#C5A869]/30 font-bold uppercase tracking-wider text-[10px]">
                Class {classNumber}
              </span>
              <span>•</span>
              <span className="opacity-90">
                {lang === 'en' ? weekTitleEn : weekTitleHi}
              </span>
              <span>•</span>
              <span className="opacity-75">{lang === 'en' ? course.titleEn : course.titleHi}</span>
            </div>

            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
              {lang === 'en' ? classCurriculumTitleEn : classCurriculumTitleHi}
            </h1>
          </div>

          {/* Video Player Box */}
          <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl border border-black/40 aspect-video flex items-center justify-center group">
            {/* HTML5 Video Element */}
            <video
              ref={videoRef}
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={handleVideoEnded}
              playsInline
              className="w-full h-full object-cover"
              src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              poster="https://images.unsplash.com/photo-1520523839898-50712743e9d7?auto=format&fit=crop&w=1200&q=80"
            />

            {/* Video Playback Resume Overlay (Saved Video Position Logic) */}
            {showResumeBanner && !isPlaying && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-4 animate-fade-in z-20">
                <div className="w-12 h-12 rounded-full bg-[#C5A869]/20 border border-[#C5A869] text-[#C5A869] flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-widest text-[#C5A869]">
                    {lang === 'en' ? 'Saved Video Position' : 'Saved Video Position'}
                  </div>
                  <h3 className="font-display text-lg sm:text-xl font-bold">
                    {lang === 'en'
                      ? `You stopped at ${formatSeconds(classProgress.savedSeconds || 0)}`
                      : `Aap ${formatSeconds(classProgress.savedSeconds || 0)} par ruke the`}
                  </h3>
                  <p className="text-xs text-white/70 max-w-sm">
                    {lang === 'en'
                      ? 'Pick up right where you left off, or start this class from the beginning.'
                      : 'Wahin se shuru karein jahan chhora tha ya shuru se dekhein.'}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleResumeClick}
                    className="px-6 py-2.5 rounded-full bg-[#C5A869] text-[#081F5C] font-bold text-xs flex items-center gap-2 hover:bg-[#d8bc7e] transition-all cursor-pointer shadow-lg"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{lang === 'en' ? 'Continue Video' : 'Continue Karein'}</span>
                  </button>
                  <button
                    onClick={handleRestartVideo}
                    className="px-4 py-2.5 rounded-full border border-white/25 hover:border-white/50 text-xs font-semibold text-white/90 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Start From Beginning' : 'Shuru Se'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Custom Bottom Controls Bar */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 flex flex-col gap-2 z-10 opacity-95 group-hover:opacity-100 transition-opacity">
              {/* Progress Slider */}
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={duration || 1080}
                  value={currentTime}
                  onChange={(e) => {
                    const sec = parseFloat(e.target.value);
                    if (videoRef.current) {
                      videoRef.current.currentTime = sec;
                      setCurrentTime(sec);
                    }
                  }}
                  className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#C5A869]"
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTogglePlay}
                    className="p-2 rounded-full hover:bg-white/10 text-white cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <span className="font-mono text-[11px] opacity-80">
                    {formatSeconds(currentTime)} / {formatSeconds(duration || 1080)}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        videoRef.current.muted = !isMuted;
                        setIsMuted(!isMuted);
                      }
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-full cursor-pointer text-white"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                        } else {
                          videoRef.current.requestFullscreen();
                        }
                      }
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-full cursor-pointer text-white"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Video Completion Indicator (Transparent & Non-Intrusive) */}
            {hasReachedThreshold && (
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-md z-10 backdrop-blur-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Video Completed' : 'Video Complete'}</span>
              </div>
            )}
          </div>

          {/* Sequential Next Class Unlocking Strip (Strictly based on video completion condition) */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-[#081F5C]/10 dark:border-white/10 bg-[#081F5C]/5 dark:bg-white/5 text-xs">
            <div className="flex items-center gap-2">
              {hasReachedThreshold ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  {lang === 'en'
                    ? 'Class watched. Sequential progression active.'
                    : 'Class dekhi ja chuki hai. Agli class unlock hai.'}
                </span>
              ) : (
                <span className="opacity-75 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C5A869]" />
                  {lang === 'en'
                    ? 'Watch this class video to unlock Class ' + (classNumber + 1)
                    : `Class ${classNumber + 1} unlock karne ke liye is video ko complete dekhein.`}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {classNumber > 1 && (
                <button
                  onClick={() => onOpenClass(classNumber - 1)}
                  className="px-3 py-1.5 rounded-xl border border-[#081F5C]/20 dark:border-white/20 text-xs font-semibold hover:border-[#C5A869] cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Previous Class' : 'Pichli Class'}</span>
                </button>
              )}

              {classNumber < totalClasses && (
                <button
                  onClick={() => {
                    if (isNextClassUnlocked) {
                      onOpenClass(classNumber + 1);
                    }
                  }}
                  disabled={!isNextClassUnlocked}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    isNextClassUnlocked
                      ? 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] shadow-sm cursor-pointer'
                      : 'border border-dashed border-[#081F5C]/25 dark:border-white/25 opacity-50 cursor-not-allowed'
                  }`}
                  title={!isNextClassUnlocked ? 'Finish watching this class to unlock' : ''}
                >
                  {!isNextClassUnlocked && <Lock className="w-3 h-3 text-[#C5A869]" />}
                  <span>{lang === 'en' ? `Next: Class ${classNumber + 1}` : `Agli: Class ${classNumber + 1}`}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* QUICK NAVIGATION TABS FOR THE FIVE MANDATORY SECTIONS */}
        {/* Directly beneath the video: Comments, Ask a Question, Practice, Teacher Notes, Sheet Music */}
        {/* ================================================== */}
        <nav aria-label="Class learning sections" className="sticky top-[58px] z-30 bg-[#F7F2EB]/95 dark:bg-[#030919]/95 backdrop-blur-md py-2 border-b border-[#081F5C]/10 dark:border-white/10 -mx-3 px-3 sm:mx-0 sm:px-0">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
            <button
              onClick={() => {
                setActiveSectionFilter('all');
                const el = document.getElementById('section-comments');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                activeSectionFilter === 'all'
                  ? 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C]'
                  : 'bg-[#081F5C]/5 dark:bg-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              {lang === 'en' ? 'All Sections' : 'Sabhi Sections'}
            </button>

            <button
              onClick={() => {
                setActiveSectionFilter('comments');
                const el = document.getElementById('section-comments');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSectionFilter === 'comments'
                  ? 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C]'
                  : 'bg-[#081F5C]/5 dark:bg-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#C5A869]" />
              <span>1. {lang === 'en' ? 'Comments' : 'Comments'} ({commentsList.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveSectionFilter('ask');
                const el = document.getElementById('section-ask');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSectionFilter === 'ask'
                  ? 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C]'
                  : 'bg-[#081F5C]/5 dark:bg-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#C5A869]" />
              <span>2. {lang === 'en' ? 'Ask a Question' : 'Sawaal Puchein'}</span>
            </button>

            <button
              onClick={() => {
                setActiveSectionFilter('practice');
                const el = document.getElementById('section-practice');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSectionFilter === 'practice'
                  ? 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C]'
                  : 'bg-[#081F5C]/5 dark:bg-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              <TimerIcon className="w-3.5 h-3.5 text-[#C5A869]" />
              <span>3. {lang === 'en' ? 'Practice' : 'Practice'}</span>
            </button>

            <button
              onClick={() => {
                setActiveSectionFilter('notes');
                const el = document.getElementById('section-teacher-notes');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSectionFilter === 'notes'
                  ? 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C]'
                  : 'bg-[#081F5C]/5 dark:bg-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#C5A869]" />
              <span>4. {lang === 'en' ? 'Teacher Notes' : 'Teacher Notes'}</span>
            </button>

            <button
              onClick={() => {
                setActiveSectionFilter('sheet');
                const el = document.getElementById('section-sheet-music');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeSectionFilter === 'sheet'
                  ? 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C]'
                  : 'bg-[#081F5C]/5 dark:bg-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              <Music2 className="w-3.5 h-3.5 text-[#C5A869]" />
              <span>5. {lang === 'en' ? 'Sheet Music' : 'Sheet Music'}</span>
            </button>
          </div>
        </nav>

        {/* ================================================== */}
        {/* MANDATORY SECTION 1: COMMENTS */}
        {/* ================================================== */}
        <section
          id="section-comments"
          className="p-5 sm:p-6 rounded-3xl border border-[#081F5C]/15 dark:border-white/10 bg-[#081F5C]/[0.02] dark:bg-white/[0.02] space-y-4 scroll-mt-28"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#C5A869]/15 text-[#C5A869] flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold">
                  {lang === 'en' ? 'Class Comments & Discussion' : 'Class Comments aur Discussion'}
                </h2>
                <p className="text-xs opacity-70">
                  {lang === 'en'
                    ? 'Share your practice observations and discuss with fellow students.'
                    : 'Apne practice observations share karein aur batchmates se discuss karein.'}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-[#081F5C]/5 dark:bg-white/5">
              {commentsList.length} {lang === 'en' ? 'Comments' : 'Comments'}
            </span>
          </div>

          {/* New Comment Input Form */}
          <form onSubmit={handlePostComment} className="flex gap-2 pt-1">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Add a public comment about this class...'
                  : 'Is class ke baare me comment likhein...'
              }
              className={`flex-1 p-3 rounded-2xl border text-xs sm:text-sm focus:outline-none transition-colors ${
                isDark
                  ? 'bg-[#040C24] border-[#0E2E80] text-white focus:border-[#C5A869]'
                  : 'bg-white border-[#081F5C]/20 text-[#081F5C] focus:border-[#081F5C]'
              }`}
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="px-4 py-3 rounded-2xl bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] text-xs font-bold disabled:opacity-40 hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Post' : 'Post'}</span>
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-3 pt-2">
            {commentsList.map((comm) => (
              <div
                key={comm.id}
                className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                  comm.isInstructor
                    ? 'border-[#C5A869]/40 bg-[#C5A869]/5'
                    : 'border-[#081F5C]/10 dark:border-white/10 bg-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{comm.studentName}</span>
                    {comm.isInstructor && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#C5A869] text-[#081F5C] uppercase">
                        Instructor
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] opacity-60">{comm.timestamp}</span>
                </div>
                <p className="opacity-85 leading-relaxed">{comm.comment}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================== */}
        {/* MANDATORY SECTION 2: ASK A QUESTION */}
        {/* ================================================== */}
        <section
          id="section-ask"
          className="p-5 sm:p-6 rounded-3xl border border-[#081F5C]/15 dark:border-white/10 bg-[#081F5C]/[0.02] dark:bg-white/[0.02] space-y-4 scroll-mt-28"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C5A869]/15 text-[#C5A869] flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold">
                {lang === 'en' ? 'Ask a Question' : 'Sawaal Puchein'}
              </h2>
              <p className="text-xs opacity-70">
                {lang === 'en'
                  ? 'Have a specific query about this lesson? Send it directly to Amitava Sir & faculty.'
                  : 'Is lesson se juda koi specific sawaal hai? Amitava Sir aur faculty ko direct bhejiye.'}
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {questionSentNotice && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>
                {lang === 'en'
                  ? 'Question sent. Academy faculty will review and respond to your inquiry.'
                  : 'Aapka sawaal bhej diya gaya hai. Academy team review karegi.'}
              </span>
            </div>
          )}

          {/* Question Form */}
          <form onSubmit={handleSendQuestion} className="space-y-3">
            <textarea
              rows={3}
              value={newQuestionText}
              onChange={(e) => setNewQuestionText(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Describe your question in detail (e.g. hand positioning, finger slip, counting difficulty)...'
                  : 'Apna sawaal detail me likhein (jaise posture, finger placement, counting me dikkat)...'
              }
              className={`w-full p-3.5 rounded-2xl border text-xs sm:text-sm focus:outline-none transition-colors resize-none ${
                isDark
                  ? 'bg-[#040C24] border-[#0E2E80] text-white focus:border-[#C5A869]'
                  : 'bg-white border-[#081F5C]/20 text-[#081F5C] focus:border-[#081F5C]'
              }`}
            />
            <div className="flex justify-between items-center text-xs">
              <span className="opacity-60 text-[11px]">
                {lang === 'en' ? 'Answers typically provided within 24 hours.' : 'Aam taur par 24 ghante me response aata hai.'}
              </span>
              <button
                type="submit"
                disabled={!newQuestionText.trim()}
                className="px-5 py-2.5 rounded-full bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] text-xs font-bold disabled:opacity-40 hover:opacity-90 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Send Question' : 'Question Bhejiye'}</span>
              </button>
            </div>
          </form>

          {/* Student Submitted Questions History */}
          {questionsList.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                {lang === 'en' ? 'My Submitted Questions' : 'Mere Puche Gaye Sawaal'}
              </span>
              <div className="space-y-2">
                {questionsList.map((q) => (
                  <div
                    key={q.id}
                    className="p-3 rounded-2xl border border-[#081F5C]/10 dark:border-white/10 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#C5A869] text-[10px] uppercase tracking-wider">
                        Status: {q.status}
                      </span>
                      <span className="opacity-60 text-[10px]">{q.submittedAt}</span>
                    </div>
                    <p className="opacity-90 font-medium">{q.question}</p>
                    {q.instructorResponse && (
                      <div className="mt-2 p-2 rounded-xl bg-[#C5A869]/10 border border-[#C5A869]/20 text-[11px]">
                        <strong>Amitava Sen:</strong> {q.instructorResponse}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ================================================== */}
        {/* MANDATORY SECTION 3: PRACTICE */}
        {/* ================================================== */}
        <section
          id="section-practice"
          className="p-5 sm:p-6 rounded-3xl border border-[#081F5C]/15 dark:border-white/10 bg-[#081F5C]/[0.02] dark:bg-white/[0.02] space-y-5 scroll-mt-28"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#C5A869]/15 text-[#C5A869] flex items-center justify-center">
                <TimerIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold">
                  {lang === 'en'
                    ? classContent.practiceInstructions.titleEn
                    : classContent.practiceInstructions.titleHi}
                </h2>
                <p className="text-xs opacity-70">
                  {lang === 'en'
                    ? `Suggested practice duration: ${classContent.practiceInstructions.suggestedDurationMinutes} minutes`
                    : `Suggested practice samay: ${classContent.practiceInstructions.suggestedDurationMinutes} minute`}
                </p>
              </div>
            </div>

            {/* Total Class Practice Logged */}
            <div className="px-3.5 py-1.5 rounded-full border border-[#081F5C]/15 dark:border-white/15 text-xs font-mono font-bold bg-[#081F5C]/5 dark:bg-white/5">
              <span className="opacity-75 font-sans font-semibold mr-1.5">
                {lang === 'en' ? 'Class Logged:' : 'Total Riyaz:'}
              </span>
              <span className="text-[#C5A869]">{Math.round(totalPracticeSeconds / 60)} mins</span>
            </div>
          </div>

          {/* Daily Practice Instructions List */}
          <div className="p-4 rounded-2xl bg-[#081F5C]/5 dark:bg-white/5 border border-[#081F5C]/10 dark:border-white/10 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A869]">
              {lang === 'en' ? "Today's Practice Instructions" : 'Aaj Ke Practice Nirdesh'}
            </span>
            <ul className="space-y-1.5 text-xs opacity-90">
              {(lang === 'en'
                ? classContent.practiceInstructions.pointsEn
                : classContent.practiceInstructions.pointsHi
              ).map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#C5A869] font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* REAL INTERACTIVE PRACTICE TIMER STOPWATCH */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#C5A869]/30 bg-gradient-to-br from-[#C5A869]/5 to-transparent space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869]">
                  {lang === 'en' ? 'Practice Timer' : 'Practice Stopwatch'}
                </span>
                <div className="text-xs font-semibold opacity-80">
                  {practiceContextTitle}
                </div>
              </div>

              {/* Digital Elapsed Time Display */}
              <div className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-[#C5A869]">
                {formatSeconds(practiceSessionSeconds)}
              </div>
            </div>

            {/* Timer Action Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => handleStartPracticeTimer()}
                className="px-6 py-2.5 rounded-full bg-[#081F5C] text-[#F7F2EB] dark:bg-[#C5A869] dark:text-[#081F5C] text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer hover:opacity-90 transition-transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {lang === 'en' ? 'Launch Practice Timer' : 'Riyaz Stopwatch Kholein'}
                </span>
              </button>

              <button
                onClick={() => setShowPracticeJournalModal(true)}
                className="px-4 py-2.5 rounded-full border border-[#C5A869]/40 bg-[#C5A869]/10 text-xs font-bold flex items-center gap-2 hover:bg-[#C5A869]/20 transition-colors cursor-pointer text-[#C5A869]"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {lang === 'en' ? '30-Day Practice Journal' : '30-Day Practice Journal'}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* MANDATORY SECTION 4: TEACHER NOTES */}
        {/* ================================================== */}
        <section
          id="section-teacher-notes"
          className="p-5 sm:p-6 rounded-3xl border border-[#081F5C]/15 dark:border-white/10 bg-[#081F5C]/[0.02] dark:bg-white/[0.02] space-y-4 scroll-mt-28"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C5A869]/15 text-[#C5A869] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold">
                {lang === 'en' ? 'Teacher Notes — Amitava Sen' : 'Teacher Notes — Amitava Sen'}
              </h2>
              <p className="text-xs opacity-70">
                {lang === 'en'
                  ? 'Key technical reminders, anatomical posture guidelines, and musical nuances.'
                  : 'Posture, finger shape aur musical nuances par Amitava Sir ke nirdesh.'}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-1">
            {classContent.teacherNotes.map((note, index) => (
              <div
                key={note.id}
                className="p-4 rounded-2xl border border-[#081F5C]/10 dark:border-white/10 bg-[#081F5C]/5 dark:bg-white/5 text-xs space-y-1"
              >
                <div className="flex items-center gap-2 font-bold text-[#C5A869]">
                  <span>Point {index + 1}</span>
                </div>
                <p className="opacity-90 leading-relaxed text-xs sm:text-sm">
                  {lang === 'en' ? note.noteEn : note.noteHi}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================== */}
        {/* MANDATORY SECTION 5: SHEET MUSIC */}
        {/* ================================================== */}
        <section
          id="section-sheet-music"
          className="p-5 sm:p-6 rounded-3xl border border-[#081F5C]/15 dark:border-white/10 bg-[#081F5C]/[0.02] dark:bg-white/[0.02] space-y-4 scroll-mt-28"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#C5A869]/15 text-[#C5A869] flex items-center justify-center">
                <Music2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold">
                  {lang === 'en' ? 'Sheet Music' : 'Sheet Music'}
                </h2>
                <p className="text-xs opacity-70">
                  {lang === 'en'
                    ? 'Engraved staff notation, etudes, and exercise scores for this class.'
                    : 'Is class ke staff notation, etudes aur exercise scores.'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {classContent.sheetMusic.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl border border-[#081F5C]/15 dark:border-white/15 bg-white dark:bg-[#071333] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C5A869]/15 text-[#C5A869] uppercase">
                      {item.difficulty || 'Standard'}
                    </span>
                    {item.timeSignature && (
                      <span className="text-[11px] font-mono opacity-70">
                        Meter: {item.timeSignature}
                      </span>
                    )}
                    {item.keySignature && (
                      <span className="text-[11px] opacity-70">• Key: {item.keySignature}</span>
                    )}
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs opacity-75 line-clamp-2">{item.description}</p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                  {item.hasInteractiveVersion && (
                    <button
                      onClick={() => {
                        const iscore =
                          getInteractiveScoreById(item.id) ||
                          getInteractiveScoreForClass(course.id, classNumber);
                        setActiveInteractiveScore(iscore);
                      }}
                      className="px-3.5 py-2 rounded-full bg-[#C5A869]/15 text-[#C5A869] border border-[#C5A869]/40 hover:bg-[#C5A869]/25 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      title={lang === 'en' ? 'Practise with real-time MIDI feedback' : 'Live MIDI feedback ke sath riyaz karein'}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Interactive MIDI Practice' : 'Interactive MIDI Riyaz'}</span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveSheetMusicModal(item)}
                    className="px-4 py-2 rounded-full bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-90"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Open Sheet Music' : 'Notation Kholein'}</span>
                  </button>

                  <button
                    onClick={() => handleStartPracticeTimer(item.title)}
                    className="px-3.5 py-2 rounded-full border border-[#081F5C]/20 dark:border-white/20 text-xs font-semibold hover:border-[#C5A869] flex items-center gap-1 cursor-pointer"
                    title="Practice this piece with timer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{lang === 'en' ? 'Practice Piece' : 'Riyaz'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================== */}
        {/* REMAINING REAL CLASS LEARNING SECTIONS */}
        {/* ================================================== */}

        {/* WHAT YOU'LL LEARN */}
        <section className="p-5 sm:p-6 rounded-3xl border border-[#081F5C]/15 dark:border-white/10 bg-[#081F5C]/[0.02] dark:bg-white/[0.02] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C5A869]">
            <Layers className="w-4 h-4" />
            <span>{lang === 'en' ? "What You'll Learn in this Class" : 'Is Class Me Aap Kya Seekhenge'}</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
            {(lang === 'en' ? classContent.whatYoullLearn.en : classContent.whatYoullLearn.hi).map(
              (item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#081F5C]/5 dark:bg-white/5 border border-[#081F5C]/10 dark:border-white/10 text-xs flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#C5A869] flex-shrink-0 mt-0.5" />
                  <span className="leading-snug">{item}</span>
                </div>
              )
            )}
          </div>
        </section>

        {/* CLASS NOTES & SUMMARY */}
        <section className="p-5 sm:p-6 rounded-3xl border border-[#081F5C]/15 dark:border-white/10 bg-[#081F5C]/[0.02] dark:bg-white/[0.02] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869]">
                {lang === 'en' ? 'Lecture Material' : 'Lecture Material'}
              </span>
              <h2 className="font-display text-base sm:text-lg font-bold">
                {lang === 'en' ? 'Class Study Notes' : 'Class Study Notes'}
              </h2>
            </div>

            <button
              onClick={handleDownloadNotes}
              className="px-3.5 py-1.5 rounded-full border border-[#081F5C]/20 dark:border-white/20 text-xs font-bold flex items-center gap-1.5 hover:border-[#C5A869] cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#C5A869]" />
              <span>
                {downloadSuccessNotice
                  ? lang === 'en'
                    ? 'Notes Saved!'
                    : 'Notes Saved!'
                  : lang === 'en'
                  ? 'Download PDF Notes'
                  : 'PDF Notes Download'}
              </span>
            </button>
          </div>

          <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
            {lang === 'en' ? classContent.classNotes.summaryEn : classContent.classNotes.summaryHi}
          </p>

          <div className="p-4 rounded-2xl bg-[#081F5C]/5 dark:bg-white/5 border border-[#081F5C]/10 dark:border-white/10 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A869]">
              {lang === 'en' ? 'Key Takeaways' : 'Mukhya Baatein'}
            </span>
            <ul className="space-y-1 text-xs opacity-85">
              {(lang === 'en'
                ? classContent.classNotes.keyTakeawaysEn
                : classContent.classNotes.keyTakeawaysHi
              ).map((k, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#C5A869] font-bold">•</span>
                  <span>{k}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* THEORY ASSIGNMENT ENTRY CARD (Prompt 23) */}
        {classContent.theoryAssignment && (
          <section className="p-5 sm:p-6 rounded-3xl border border-[#C5A869]/40 bg-gradient-to-br from-[#C5A869]/10 via-transparent to-transparent space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869]">
                    {lang === 'en' ? 'Theory Assignment' : 'Theory Assignment'}
                  </span>
                  {theoryProgress?.status === 'completed' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      Completed ({theoryProgress.scorePercent}%)
                    </span>
                  ) : theoryProgress?.status === 'in_progress' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                      In Progress
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#081F5C]/10 dark:bg-white/10">
                      Not Started
                    </span>
                  )}
                </div>
                <h3 className="font-display text-base sm:text-lg font-bold">
                  {lang === 'en'
                    ? classContent.theoryAssignment.titleEn
                    : classContent.theoryAssignment.titleHi}
                </h3>
                <p className="text-xs opacity-75 max-w-xl">
                  {lang === 'en'
                    ? classContent.theoryAssignment.descriptionEn
                    : classContent.theoryAssignment.descriptionHi}
                </p>
              </div>

              <div className="flex-shrink-0 pt-1 sm:pt-0">
                <button
                  onClick={() => setShowTheoryModal(true)}
                  className="px-5 py-2.5 rounded-full bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] text-xs font-bold flex items-center gap-2 shadow-sm hover:opacity-95 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-[#C5A869]" />
                  <span>
                    {theoryProgress?.status === 'completed'
                      ? lang === 'en'
                        ? 'Review Assignment'
                        : 'Answers Review Karein'
                      : theoryProgress?.status === 'in_progress'
                      ? lang === 'en'
                        ? 'Continue Assignment'
                        : 'Assignment Continue'
                      : lang === 'en'
                      ? 'Start Assignment'
                      : 'Assignment Shuru Karein'}
                  </span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* PRACTICAL HOMEWORK SYSTEM (Prompt 24) */}
        {classContent.practicalHomework.length > 0 && (
          <section className="p-5 sm:p-6 rounded-3xl border border-[#081F5C]/15 dark:border-white/10 bg-[#081F5C]/[0.02] dark:bg-white/[0.02] space-y-4">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869]">
                {lang === 'en' ? 'Practical Repertoire & Drills' : 'Practical Repertoire aur Drills'}
              </span>
              <h2 className="font-display text-base sm:text-lg font-bold">
                {lang === 'en' ? 'Practical Homework' : 'Practical Homework'}
              </h2>
              <p className="text-xs opacity-70">
                {lang === 'en'
                  ? 'Specific keyboard exercises designed to develop finger muscle memory and rhythmic precision.'
                  : 'Muscle memory aur rhythm build karne ke liye class-specific keyboard exercises.'}
              </p>
            </div>

            <div className="space-y-3">
              {classContent.practicalHomework.map((hw) => {
                const currentStatus = homeworkStatusMap[hw.id] || 'not_started';

                return (
                  <div
                    key={hw.id}
                    className="p-4 sm:p-5 rounded-2xl border border-[#081F5C]/15 dark:border-white/15 bg-white dark:bg-[#071333] space-y-3 shadow-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="px-2 py-0.5 rounded font-bold bg-[#C5A869]/15 text-[#C5A869]">
                          {hw.skillType}
                        </span>
                        {hw.hands && (
                          <span className="font-semibold opacity-75">• Hands: {hw.hands}</span>
                        )}
                        {hw.startTempoBpm && (
                          <span className="font-mono opacity-75">
                            • Tempo: {hw.startTempoBpm} - {hw.targetTempoBpm || hw.startTempoBpm} BPM
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#081F5C]/5 dark:bg-white/5">
                        Status: {currentStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-sm sm:text-base">
                        {lang === 'en' ? hw.titleEn : hw.titleHi}
                      </h3>
                      <p className="text-xs opacity-85 leading-relaxed">
                        {lang === 'en' ? hw.detailedInstructionEn : hw.detailedInstructionHi}
                      </p>
                    </div>

                    {hw.focusPointEn && (
                      <div className="p-2.5 rounded-xl bg-[#081F5C]/5 dark:bg-white/5 text-[11px] flex items-center gap-2">
                        <strong className="text-[#C5A869] font-bold">Focus:</strong>
                        <span>{lang === 'en' ? hw.focusPointEn : hw.focusPointHi}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#081F5C]/10 dark:border-white/10">
                      <span className="text-[11px] opacity-70">
                        {hw.repetitions || '5 slow controlled repetitions'}
                      </span>

                      <div className="flex items-center gap-2">
                        {hw.associatedSheetMusicId && (
                          <button
                            onClick={() => {
                              const found = classContent.sheetMusic.find(
                                (s) => s.id === hw.associatedSheetMusicId
                              );
                              if (found) setActiveSheetMusicModal(found);
                            }}
                            className="px-3 py-1.5 rounded-full border border-[#081F5C]/20 dark:border-white/20 text-xs font-semibold hover:border-[#C5A869] flex items-center gap-1 cursor-pointer"
                          >
                            <BookOpen className="w-3 h-3 text-[#C5A869]" />
                            <span>{lang === 'en' ? 'View Notation' : 'Notation'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            saveHomeworkStatus(student.studentId, course.id, classNumber, hw.id, 'practising');
                            setHomeworkStatusMap((prev) => ({ ...prev, [hw.id]: 'practising' }));
                            handleStartPracticeTimer(lang === 'en' ? hw.titleEn : hw.titleHi);
                          }}
                          className="px-4 py-1.5 rounded-full bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:opacity-90"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>{lang === 'en' ? 'Start Practice' : 'Riyaz Karein'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* INTERACTIVE SHEET MUSIC CONNECTION CARD */}
        <section className="p-5 sm:p-6 rounded-3xl border border-[#081F5C]/15 dark:border-white/10 bg-[#081F5C]/[0.02] dark:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C5A869]/15 text-[#C5A869] flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-display font-bold text-sm sm:text-base">
                {lang === 'en' ? 'Interactive Sheet Music' : 'Interactive Sheet Music'}
              </h3>
              <p className="text-xs opacity-70">
                {lang === 'en'
                  ? 'Follow along with the dynamic cursor, tempo slow-down, and loop practice.'
                  : 'Dynamic cursor, tempo slow-down aur loop practice ke sath notation follow karein.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              const iscore = getInteractiveScoreForClass(course.id, classNumber);
              setActiveInteractiveScore(iscore);
            }}
            className="px-4 py-2 rounded-full bg-[#C5A869] text-[#081F5C] hover:bg-[#d6b772] text-xs font-bold flex items-center gap-1.5 flex-shrink-0 cursor-pointer shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>{lang === 'en' ? 'Open MIDI Practice' : 'MIDI Riyaz Kholein'}</span>
          </button>
        </section>

        {interactiveNotice && (
          <div className="p-3.5 rounded-2xl bg-[#C5A869]/15 border border-[#C5A869]/40 text-xs text-center font-semibold animate-fade-in">
            {lang === 'en'
              ? 'Interactive Notation Engine is configured for this score. Launching full interactive mode in the sheet music viewer.'
              : 'Is score ke liye interactive notation engine tayar hai.'}
          </div>
        )}

        {/* REFERENCE MATERIALS */}
        {classContent.referenceMaterials && classContent.referenceMaterials.length > 0 && (
          <section className="p-5 rounded-3xl border border-[#081F5C]/15 dark:border-white/10 bg-[#081F5C]/[0.02] dark:bg-white/[0.02] space-y-3 text-xs">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869]">
              {lang === 'en' ? 'Reference Materials & Audio' : 'Reference Materials aur Audio'}
            </span>
            <div className="space-y-2">
              {classContent.referenceMaterials.map((ref, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#081F5C]/5 dark:bg-white/5 border border-[#081F5C]/10 dark:border-white/10 flex items-start gap-3"
                >
                  <BookOpen className="w-4 h-4 text-[#C5A869] flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">{lang === 'en' ? ref.titleEn : ref.titleHi}</div>
                    <div className="opacity-75">{ref.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 30-DAY PRACTICE JOURNAL LINK */}
        <section className="p-5 rounded-3xl border border-dashed border-[#081F5C]/20 dark:border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-[#C5A869]/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C5A869]/15 text-[#C5A869] flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm block">
                {lang === 'en' ? '30-Day Practice Journal' : '30-Day Practice Journal'}
              </span>
              <span className="opacity-75 text-xs">
                {lang === 'en'
                  ? "Every practice session you complete with the timer is automatically logged to your calendar."
                  : 'Aapka practice timer se kiya har riyaz session automatically aapke calendar me judta hai.'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowPracticeJournalModal(true)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-full border border-[#C5A869]/40 bg-[#C5A869]/10 text-[#C5A869] text-xs font-bold hover:bg-[#C5A869]/20 cursor-pointer"
            >
              {lang === 'en' ? 'View 30-Day Journal' : 'Journal Kholein'}
            </button>
            <button
              onClick={() => handleStartPracticeTimer()}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-full bg-[#081F5C] text-[#F7F2EB] dark:bg-[#C5A869] dark:text-[#081F5C] text-xs font-bold shadow-sm cursor-pointer hover:opacity-90"
            >
              {lang === 'en' ? 'Start Practice' : 'Riyaz Shuru Karein'}
            </button>
          </div>
        </section>
      </main>

      {/* MODAL: SHEET MUSIC VIEWER */}
      {activeSheetMusicModal && (
        <SheetMusicViewerModal
          sheetMusic={activeSheetMusicModal}
          onClose={() => setActiveSheetMusicModal(null)}
          onStartPractice={(pieceTitle) => handleStartPracticeTimer(pieceTitle)}
          onOpenInteractive={() => {
            const iscore =
              getInteractiveScoreById(activeSheetMusicModal.id) ||
              getInteractiveScoreForClass(course.id, classNumber);
            setActiveInteractiveScore(iscore);
          }}
          lang={lang}
          theme={theme}
        />
      )}

      {/* MODAL: REAL-TIME MIDI INTERACTIVE SHEET MUSIC WITH GRAND STAFF */}
      {activeInteractiveScore && (
        <InteractiveSheetMusicModal
          score={activeInteractiveScore}
          studentId={student.studentId}
          onClose={() => setActiveInteractiveScore(null)}
          lang={lang}
          theme={theme}
        />
      )}

      {/* MODAL: THEORY ASSIGNMENT */}
      {showTheoryModal && classContent.theoryAssignment && (
        <TheoryAssignmentModal
          assignment={classContent.theoryAssignment}
          courseId={course.id}
          studentId={student.studentId}
          onClose={() => setShowTheoryModal(false)}
          lang={lang}
          theme={theme}
        />
      )}

      {/* MODAL: REAL PRACTICE TIMER */}
      {showPracticeTimerModal && (
        <PracticeTimerModal
          isOpen={showPracticeTimerModal}
          studentId={student.studentId}
          courseId={course.id}
          classNumber={classNumber}
          initialContextTitle={practiceContextTitle}
          onClose={() => {
            setShowPracticeTimerModal(false);
            setTotalPracticeSeconds(
              getStudentPracticeTime(student.studentId, course.id, classNumber)
            );
          }}
          onOpenJournal={() => setShowPracticeJournalModal(true)}
          lang={lang}
          theme={theme}
        />
      )}

      {/* MODAL: 30-DAY PRACTICE JOURNAL */}
      {showPracticeJournalModal && (
        <PracticeJournalModal
          isOpen={showPracticeJournalModal}
          studentId={student.studentId}
          onClose={() => setShowPracticeJournalModal(false)}
          onStartPractice={() => setShowPracticeTimerModal(true)}
          lang={lang}
          theme={theme}
        />
      )}
    </div>
  );
};
