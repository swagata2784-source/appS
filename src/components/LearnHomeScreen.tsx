import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  CheckCircle2,
  Lock,
  BookOpen,
  ArrowRight,
  Clock,
  WifiOff,
  ChevronRight,
  Sparkles,
  Layers,
  AlertCircle,
  RotateCcw,
  Check,
  X,
  Compass,
  Music2,
} from 'lucide-react';
import { Language, Theme, StudentAccount, RecordedCourse } from '../types';
import { RECORDED_COURSES } from '../data/coursesData';
import { SONG_LIBRARY_DATA } from '../data/songsData';
import {
  getStudentCourseProgress,
  recordVideoProgress,
  StudentCourseLearningState,
  ClassProgressItem,
  getAllSongProgress,
} from '../utils/studentLearningService';
import { Logo } from './Logo';

export interface LearnHomeScreenProps {
  student: StudentAccount;
  currentCourse: RecordedCourse;
  onSelectCourse?: (course: RecordedCourse) => void;
  onRequireLogin?: () => void;
  lang: Language;
  theme: Theme;
  onOpenClass?: (classContext: {
    courseId: string;
    classNumber: number;
    title: string;
    weekNumber: number;
    savedTimestamp?: string;
    savedSeconds?: number;
  }) => void;
  onViewClassLibrary?: (course: RecordedCourse) => void;
  onOpenSongLibrary?: () => void;
}

interface ParsedClass {
  classNumber: number;
  title: string;
  weekNumber: number;
  weekTitleEn: string;
  weekTitleHi: string;
}

export const LearnHomeScreen: React.FC<LearnHomeScreenProps> = ({
  student,
  currentCourse,
  onSelectCourse,
  onRequireLogin,
  lang,
  theme,
  onOpenClass,
  onViewClassLibrary,
  onOpenSongLibrary,
}) => {
  const isDark = theme === 'dark';

  // Session verification: Learn Home is strictly private for authenticated students
  useEffect(() => {
    if (!student || !student.studentId) {
      if (onRequireLogin) {
        onRequireLogin();
      }
    }
  }, [student, onRequireLogin]);

  // Offline detection
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Active enrolled course
  const [activeCourse, setActiveCourse] = useState<RecordedCourse>(currentCourse);

  // Synchronize when currentCourse prop updates
  useEffect(() => {
    if (currentCourse && currentCourse.id !== activeCourse.id) {
      setActiveCourse(currentCourse);
    }
  }, [currentCourse]);

  // Multi-course enrollment list (student's enrolled courses)
  // Provides realistic support for multi-course enrollment (e.g. primary enrolled course + secondary)
  const enrolledCourses = useMemo(() => {
    const courses = [currentCourse];
    // If student has other courses or enrolled in primary beginner, also include bollywood or intermediate
    const secondaryId =
      currentCourse.id === 'western-beginner' ? 'bollywood-piano' : 'western-beginner';
    const secondaryCourse = RECORDED_COURSES.find((c) => c.id === secondaryId);
    if (secondaryCourse && !courses.some((c) => c.id === secondaryCourse.id)) {
      courses.push(secondaryCourse);
    }
    return courses;
  }, [currentCourse]);

  // Real learning progress from persistent service
  const [learningState, setLearningState] = useState<StudentCourseLearningState>(() =>
    getStudentCourseProgress(student?.studentId || 'PA-2026-0482', activeCourse)
  );

  // Reload progress when active course changes
  useEffect(() => {
    const state = getStudentCourseProgress(student?.studentId || 'PA-2026-0482', activeCourse);
    setLearningState(state);
  }, [activeCourse, student]);

  // Parse sequential learning path from actual course structure
  const parsedClasses: ParsedClass[] = useMemo(() => {
    if (!activeCourse.courseStructure || activeCourse.courseStructure.length === 0) {
      return [];
    }
    const list: ParsedClass[] = [];
    activeCourse.courseStructure.forEach((week) => {
      week.classes.forEach((classStr) => {
        // e.g. "Class 1: Instrument Setup & Natural Posture"
        const match = classStr.match(/^Class\s*(\d+)\s*:\s*(.+)$/i);
        if (match) {
          list.push({
            classNumber: parseInt(match[1], 10),
            title: match[2].trim(),
            weekNumber: week.weekNumber,
            weekTitleEn: week.titleEn,
            weekTitleHi: week.titleHi,
          });
        } else {
          list.push({
            classNumber: list.length + 1,
            title: classStr,
            weekNumber: week.weekNumber,
            weekTitleEn: week.titleEn,
            weekTitleHi: week.titleHi,
          });
        }
      });
    });
    return list;
  }, [activeCourse]);

  // Navigation context modal/notification states
  const [classNavigationTarget, setClassNavigationTarget] = useState<{
    classNumber: number;
    title: string;
    weekNumber: number;
    savedTimestamp?: string;
    status: string;
  } | null>(null);

  const [classLibraryTargetCourse, setClassLibraryTargetCourse] = useState<RecordedCourse | null>(
    null
  );

  // Simulation of completing a class video via actual playback (to demonstrate unlocking logic without fake buttons)
  const [videoPlaybackModal, setVideoPlaybackModal] = useState<{
    classNumber: number;
    title: string;
    currentSeconds: number;
    durationSeconds: number;
    isPlaying: boolean;
  } | null>(null);

  // Handle video playback progress & real unlocking threshold
  useEffect(() => {
    let timer: any;
    if (videoPlaybackModal && videoPlaybackModal.isPlaying) {
      timer = setInterval(() => {
        setVideoPlaybackModal((prev) => {
          if (!prev) return null;
          const nextSec = Math.min(prev.currentSeconds + 10, prev.durationSeconds);
          // Persist progress
          const updated = recordVideoProgress(
            student?.studentId || 'PA-2026-0482',
            activeCourse,
            prev.classNumber,
            nextSec,
            prev.durationSeconds
          );
          setLearningState(updated);
          return {
            ...prev,
            currentSeconds: nextSec,
            isPlaying: nextSec < prev.durationSeconds,
          };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [videoPlaybackModal, activeCourse, student]);

  // Determine current class to continue or start
  const nextClassToLearn = useMemo(() => {
    if (parsedClasses.length === 0) return null;

    // Check if there is an in-progress class
    const inProgressNum = parsedClasses.find(
      (c) => learningState.classes[c.classNumber]?.status === 'in_progress'
    );
    if (inProgressNum) return inProgressNum;

    // Else find the first not-started class that is unlocked
    const notStartedNum = parsedClasses.find((c) => {
      const clsState = learningState.classes[c.classNumber];
      return clsState && clsState.status === 'not_started';
    });
    if (notStartedNum) return notStartedNum;

    // If all available classes are completed
    return null;
  }, [parsedClasses, learningState]);

  // Compute completed classes count
  const completedCount = learningState.completedClassNumbers.length;
  const totalClassesCount = parsedClasses.length;
  const isCourseFullyCompleted = totalClassesCount > 0 && completedCount >= totalClassesCount;

  // Course status
  const courseStatusBadge = useMemo(() => {
    if (isCourseFullyCompleted) {
      return {
        labelEn: 'Completed',
        labelHi: 'Pura Hua',
        classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      };
    }
    if (completedCount > 0 || learningState.lastStoppedSeconds) {
      return {
        labelEn: 'In Progress',
        labelHi: 'Jari Hai',
        classes: 'bg-[#C5A869]/15 text-[#C5A869] border-[#C5A869]/30',
      };
    }
    return {
      labelEn: 'Not Started',
      labelHi: 'Shuru Nahi Hua',
      classes: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    };
  }, [isCourseFullyCompleted, completedCount, learningState]);

  // Recent classes preview (up to 3 sequential classes around current position)
  const recentClassesPreview = useMemo(() => {
    if (parsedClasses.length === 0) return [];
    const currentNum = nextClassToLearn ? nextClassToLearn.classNumber : 1;
    // Show previous, current, and next
    const targetNumbers = [currentNum - 1, currentNum, currentNum + 1].filter(
      (n) => n >= 1 && n <= totalClassesCount
    );

    return targetNumbers
      .map((num) => {
        const cls = parsedClasses.find((c) => c.classNumber === num);
        if (!cls) return null;
        const state = learningState.classes[num]?.status || (num === 1 ? 'not_started' : 'locked');
        const savedTime = learningState.classes[num]?.savedTimestamp;
        return {
          ...cls,
          status: state,
          savedTime,
        };
      })
      .filter(Boolean) as (ParsedClass & { status: string; savedTime?: string })[];
  }, [parsedClasses, nextClassToLearn, learningState, totalClassesCount]);

  // Trigger class opening navigation
  const handleTriggerClass = (classItem: ParsedClass) => {
    const classProgress = learningState.classes[classItem.classNumber];
    const isLocked = !classProgress || classProgress.status === 'locked';

    if (isLocked) {
      return; // Locked class cannot be bypassed
    }

    if (onOpenClass) {
      onOpenClass({
        courseId: activeCourse.id,
        classNumber: classItem.classNumber,
        title: classItem.title,
        weekNumber: classItem.weekNumber,
        savedTimestamp: classProgress?.savedTimestamp,
        savedSeconds: classProgress?.savedSeconds,
      });
      return;
    }

    // Open clean navigation entry modal
    setClassNavigationTarget({
      classNumber: classItem.classNumber,
      title: classItem.title,
      weekNumber: classItem.weekNumber,
      savedTimestamp: classProgress?.savedTimestamp,
      status: classProgress?.status || 'not_started',
    });
  };

  // Trigger Class Library navigation
  const handleTriggerClassLibrary = () => {
    if (onViewClassLibrary) {
      onViewClassLibrary(activeCourse);
    }
    setClassLibraryTargetCourse(activeCourse);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Offline Alert Banner (Section 33) */}
      {isOffline && (
        <div
          id="offline-banner"
          className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-3 text-xs"
        >
          <WifiOff className="w-4 h-4 flex-shrink-0" />
          <div className="leading-snug">
            <span className="font-bold">
              {lang === 'en' ? "You're offline" : 'Aap offline hain'}.
            </span>{' '}
            {lang === 'en'
              ? 'Previously available course information remains visible. New progress will sync when reconnected.'
              : 'Pehle se available course info dikhti rahegi. Online aate hi naya progress sync ho jayega.'}
          </div>
        </div>
      )}

      {/* 3. Learn Header (Section 3) */}
      <div id="learn-header" className="space-y-1">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#081F5C] dark:text-[#F7F2EB]">
          {lang === 'en' ? 'Learn' : 'Learn'}
        </h1>
        <p className="text-xs sm:text-sm text-[#081F5C]/75 dark:text-[#F7F2EB]/75">
          {lang === 'en'
            ? 'Continue your learning, one class at a time.'
            : 'Ek-ek class karke apni learning continue kijiye.'}
        </p>
      </div>

      {/* 16. Multiple Courses Selector (Section 16) */}
      {enrolledCourses.length > 1 && (
        <div id="course-selector-section" className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#C5A869]">
            {lang === 'en' ? 'My Courses' : 'Mere Courses'}
          </div>
          <div className="flex flex-wrap gap-2">
            {enrolledCourses.map((c) => {
              const isSelected = c.id === activeCourse.id;
              return (
                <button
                  key={c.id}
                  id={`course-select-${c.id}`}
                  onClick={() => {
                    setActiveCourse(c);
                    if (onSelectCourse) onSelectCourse(c);
                  }}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] border-transparent shadow-sm'
                      : isDark
                      ? 'bg-[#081F5C]/20 border-[#0E2E80] text-[#F7F2EB]/70 hover:text-[#F7F2EB]'
                      : 'bg-white border-[#081F5C]/15 text-[#081F5C]/70 hover:text-[#081F5C]'
                  }`}
                >
                  {lang === 'en' ? c.titleEn : c.titleHi}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Current Course Card (Section 4 & 23 Artwork) */}
      <div
        id="current-course-card"
        className={`p-5 sm:p-6 rounded-3xl border shadow-sm transition-all space-y-4 ${
          isDark
            ? 'bg-[#081F5C]/35 border-[#0E2E80]'
            : 'bg-white border-[#081F5C]/10'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-[#C5A869]">
              {lang === 'en' ? 'Your Course' : 'Aapka Course'}
            </span>
            <h2 className="font-display text-lg sm:text-xl font-bold">
              {lang === 'en' ? activeCourse.titleEn : activeCourse.titleHi}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${courseStatusBadge.classes}`}
            >
              {lang === 'en' ? courseStatusBadge.labelEn : courseStatusBadge.labelHi}
            </span>
          </div>
        </div>

        {/* Course Artwork banner */}
        <div
          className="h-28 sm:h-36 rounded-2xl relative overflow-hidden flex flex-col justify-end p-4 text-white shadow-inner"
          style={{ background: activeCourse.artworkGradient }}
        >
          <div className="absolute inset-0 bg-black/25 pointer-events-none" />
          <div className="relative z-10 space-y-1">
            <div className="text-[11px] font-medium opacity-85">
              {activeCourse.duration} • {activeCourse.classesCount}{' '}
              {lang === 'en' ? 'Recorded Classes' : 'Recorded Classes'}
            </div>
            <div className="text-xs sm:text-sm font-semibold opacity-95 line-clamp-1">
              {lang === 'en' ? activeCourse.shortDescEn : activeCourse.shortDescHi}
            </div>
          </div>
        </div>

        {/* 12. Course Progress (Section 12) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="opacity-75 font-medium">
              {lang === 'en' ? 'Course Progress' : 'Course Progress'}
            </span>
            <span className="font-bold text-[#C5A869]">
              {lang === 'en'
                ? `${completedCount} of ${totalClassesCount} classes completed`
                : `${totalClassesCount} me se ${completedCount} classes complete`}
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#081F5C]/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C5A869] transition-all duration-500 rounded-full"
              style={{
                width: `${
                  totalClassesCount > 0
                    ? Math.round((completedCount / totalClassesCount) * 100)
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 32. Empty State if course has no classes (Section 32) */}
      {parsedClasses.length === 0 ? (
        <div
          id="empty-course-state"
          className={`p-8 rounded-3xl border text-center space-y-3 ${
            isDark ? 'bg-[#081F5C]/20 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10'
          }`}
        >
          <BookOpen className="w-10 h-10 mx-auto text-[#C5A869] opacity-70" />
          <h3 className="font-display text-lg font-bold">
            {lang === 'en'
              ? "Your course content isn't ready yet."
              : 'Aapka course content abhi ready nahi hai.'}
          </h3>
          <p className="text-xs opacity-75 max-w-sm mx-auto">
            {lang === 'en'
              ? 'Please check back soon. The academy is preparing your structured modules.'
              : 'Kripya thoda intezaar karein. Academy aapke modules prepare kar rahi hai.'}
          </p>
        </div>
      ) : isCourseFullyCompleted ? (
        /* 15. Course Completed State (Section 15) */
        <div
          id="course-completed-banner"
          className={`p-6 sm:p-7 rounded-3xl border shadow-sm space-y-3 ${
            isDark
              ? 'bg-emerald-950/20 border-emerald-500/30 text-[#F7F2EB]'
              : 'bg-emerald-50/70 border-emerald-600/20 text-[#081F5C]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">
                {lang === 'en' ? 'Course Completed' : 'Course Completed'}
              </h3>
              <p className="text-xs opacity-80">
                {lang === 'en'
                  ? "You've completed all available classes in this course."
                  : 'Aapne is course ki sabhi available classes complete kar li hain.'}
              </p>
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                if (parsedClasses.length > 0) {
                  handleTriggerClass(parsedClasses[0]);
                }
              }}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Review from Class 1' : 'Class 1 se Review Karein'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* 5 & 6. Continue Learning / Next Relevant Class (Section 5, 6, 13) */
        nextClassToLearn && (
          <div
            id="continue-learning-card"
            className={`p-6 sm:p-7 rounded-3xl border shadow-md space-y-4 ${
              isDark
                ? 'bg-[#081F5C]/50 border-[#C5A869]/40'
                : 'bg-gradient-to-br from-white to-[#F7F2EB] border-[#C5A869]/35 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C5A869] animate-pulse" />
                <span className="text-xs uppercase font-bold tracking-wider text-[#C5A869]">
                  {lang === 'en' ? 'Continue Learning' : 'Learning Continue Kijiye'}
                </span>
              </div>
              <span className="text-[11px] font-mono opacity-70">
                Week {nextClassToLearn.weekNumber}
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-lg sm:text-xl font-bold">
                Class {nextClassToLearn.classNumber} — {nextClassToLearn.title}
              </h3>
              <p className="text-xs opacity-75 line-clamp-2">
                {lang === 'en'
                  ? nextClassToLearn.weekTitleEn
                  : nextClassToLearn.weekTitleHi}
              </p>
            </div>

            {/* 6. Last Learning Position: Resume vs Start */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div>
                {learningState.classes[nextClassToLearn.classNumber]?.savedTimestamp ? (
                  <div className="flex items-center gap-1.5 text-xs text-[#C5A869] font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'en'
                        ? `You stopped at ${
                            learningState.classes[nextClassToLearn.classNumber]
                              ?.savedTimestamp
                          }`
                        : `Aap ${
                            learningState.classes[nextClassToLearn.classNumber]
                              ?.savedTimestamp
                          } par ruke the`}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs opacity-60">
                    {lang === 'en' ? 'Not Started' : 'Shuru Nahi Hua'}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  id="continue-learning-cta"
                  onClick={() => handleTriggerClass(nextClassToLearn)}
                  className="w-full sm:w-auto py-3 px-6 rounded-full text-xs font-bold tracking-wide bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {learningState.classes[nextClassToLearn.classNumber]?.savedTimestamp
                      ? lang === 'en'
                        ? 'Continue'
                        : 'Continue Karein'
                      : lang === 'en'
                      ? 'Start Class'
                      : 'Class Shuru Karein'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* 13. Today's Learning Compact Section (Section 13) */}
      {!isCourseFullyCompleted && nextClassToLearn && (
        <div
          id="todays-learning-snippet"
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
            isDark ? 'bg-[#081F5C]/25 border-[#0E2E80]' : 'bg-white/70 border-[#081F5C]/10'
          }`}
        >
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5A869]">
              {lang === 'en' ? "Today's Learning" : 'Aaj Ki Learning'}
            </span>
            <div className="text-xs font-bold">
              Class {nextClassToLearn.classNumber} — {nextClassToLearn.title}
            </div>
          </div>
          <button
            onClick={() => handleTriggerClass(nextClassToLearn)}
            className="px-3 py-1.5 rounded-full text-xs font-bold text-[#081F5C] dark:text-[#F7F2EB] hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>{lang === 'en' ? 'Continue' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 7. Class Library Entry (Section 7 & 21) */}
      <div
        id="class-library-entry"
        className={`p-5 sm:p-6 rounded-3xl border shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDark
            ? 'bg-[#081F5C]/30 border-[#0E2E80]'
            : 'bg-white border-[#081F5C]/10'
        }`}
      >
        <div className="space-y-1">
          <h3 className="font-display text-base sm:text-lg font-bold">
            {lang === 'en' ? 'Class Library' : 'Class Library'}
          </h3>
          <p className="text-xs opacity-75">
            {lang === 'en'
              ? 'See all your classes organized by sequential weeks.'
              : 'Apni saari classes sequential weeks ke sath dekhiye.'}
          </p>
        </div>

        <button
          id="btn-view-classes"
          onClick={handleTriggerClassLibrary}
          className="py-2.5 px-5 rounded-full text-xs font-bold border border-[#081F5C]/30 dark:border-white/30 text-[#081F5C] dark:text-[#F7F2EB] hover:border-[#C5A869] transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>{lang === 'en' ? 'View Classes' : 'Classes Dekhiye'}</span>
        </button>
      </div>

      {/* 14. Class Library Preview (Recent Classes) (Section 14) */}
      {recentClassesPreview.length > 0 && (
        <div id="recent-classes-section" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm sm:text-base font-bold">
              {lang === 'en' ? 'Recent Classes' : 'Haal Ki Classes'}
            </h3>
            <button
              onClick={handleTriggerClassLibrary}
              className="text-xs font-bold text-[#C5A869] hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>{lang === 'en' ? 'View All Classes' : 'Sabhi Classes Dekhiye'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentClassesPreview.map((item) => {
              const isItemLocked = item.status === 'locked';
              const isItemCompleted = item.status === 'completed';

              return (
                <div
                  key={item.classNumber}
                  id={`recent-class-${item.classNumber}`}
                  onClick={() => !isItemLocked && handleTriggerClass(item)}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    !isItemLocked ? 'cursor-pointer hover:border-[#C5A869]/60' : 'opacity-65'
                  } ${
                    item.status === 'in_progress'
                      ? isDark
                        ? 'bg-[#081F5C]/60 border-[#C5A869]/50'
                        : 'bg-amber-500/5 border-[#C5A869]/40'
                      : isDark
                      ? 'bg-[#081F5C]/25 border-[#0E2E80]'
                      : 'bg-white border-[#081F5C]/10'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-[#C5A869]">
                      Class {item.classNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isItemCompleted
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : item.status === 'in_progress'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : isItemLocked
                          ? 'bg-gray-500/10 text-gray-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}
                    >
                      {isItemCompleted
                        ? lang === 'en'
                          ? 'Completed'
                          : 'Completed'
                        : item.status === 'in_progress'
                        ? lang === 'en'
                          ? 'Continue'
                          : 'Continue'
                        : isItemLocked
                        ? lang === 'en'
                          ? 'Locked'
                          : 'Locked'
                        : lang === 'en'
                        ? 'Not Started'
                        : 'Not Started'}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs line-clamp-2 leading-snug">
                    {item.title}
                  </h4>

                  <div className="text-[11px] opacity-70 flex items-center justify-between pt-1">
                    <span>Week {item.weekNumber}</span>
                    {isItemLocked ? (
                      <Lock className="w-3.5 h-3.5 opacity-60" />
                    ) : isItemCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Play className="w-3.5 h-3.5 text-[#C5A869] fill-current" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Repertoire & Song Library Card (Student -> Learn -> Song Library) */}
      <div
        id="learn-song-library-hub"
        className={`p-6 sm:p-7 rounded-3xl border shadow-sm transition-all relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-[#081F5C]/60 to-[#040C24] border-[#C5A869]/30'
            : 'bg-gradient-to-br from-white to-[#F7F2EB] border-[#C5A869]/35'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#C5A869]/20 text-[#C5A869] flex items-center justify-center">
                <Music2 className="w-4 h-4" />
              </div>
              <span className="text-xs uppercase font-bold tracking-wider text-[#C5A869]">
                {lang === 'en' ? 'Repertoire Library' : 'Song Sangrah'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#081F5C]/10 dark:bg-white/10 text-xs">
                {SONG_LIBRARY_DATA.length} Songs
              </span>
            </div>

            <h3 className="font-display text-lg sm:text-xl font-bold">
              {lang === 'en' ? 'Song Library: Play Real Music' : 'Song Library: Asli Gane Seekhein'}
            </h3>

            <p className="text-xs opacity-80 leading-relaxed">
              {lang === 'en'
                ? 'Apply your technique to curated repertoire across Bollywood, Bengali, Rabindra Sangeet, and Western Classical. Filter by level and difficulty, view engraved sheet music, practice with real MIDI, and track progress.'
                : 'Bollywood, Bengali, Rabindra Sangeet aur Western Classical ke gano par practice karein. Sheet music, live MIDI practice aur practice timer ke sath.'}
            </p>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-[#C5A869]/15 text-[#C5A869] border border-[#C5A869]/30">
                Bollywood
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                Bengali
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
                Rabindra Sangeet
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
                Western Classical
              </span>
            </div>
          </div>

          <div className="flex-shrink-0 self-start sm:self-center">
            <button
              id="btn-open-song-library"
              onClick={() => {
                if (onOpenSongLibrary) {
                  onOpenSongLibrary();
                }
              }}
              className="py-3.5 px-6 rounded-full text-xs sm:text-sm font-bold bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] hover:opacity-90 shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Music2 className="w-4 h-4 text-[#C5A869]" />
              <span>{lang === 'en' ? 'Open Song Library' : 'Song Library Kholein'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 8. Sequential Learning Structure: Your Learning Path (Section 8, 9, 10) */}
      <div id="learning-path-section" className="space-y-4 pt-2">
        <div className="space-y-1">
          <h3 className="font-display text-base sm:text-lg font-bold">
            {lang === 'en' ? 'Your Learning Path' : 'Aapka Learning Path'}
          </h3>
          <p className="text-xs opacity-70">
            {lang === 'en'
              ? 'Classes are unlocked sequentially as you complete each video.'
              : 'Har video complete karne par agla class sequence me unlock hota hai.'}
          </p>
        </div>

        <div className="space-y-5">
          {activeCourse.courseStructure.map((week) => (
            <div
              key={week.weekNumber}
              className={`p-5 rounded-2xl border space-y-3 ${
                isDark ? 'bg-[#081F5C]/25 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10'
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#081F5C]/10 dark:border-white/10 pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C5A869]">
                  Week {week.weekNumber}
                </span>
                <span className="text-xs font-semibold opacity-85">
                  {lang === 'en' ? week.titleEn : week.titleHi}
                </span>
              </div>

              <div className="space-y-2.5">
                {week.classes.map((rawClassStr) => {
                  const match = rawClassStr.match(/^Class\s*(\d+)\s*:\s*(.+)$/i);
                  const classNum = match ? parseInt(match[1], 10) : 1;
                  const classTitle = match ? match[2].trim() : rawClassStr;
                  const itemProgress = learningState.classes[classNum];
                  const isClassLocked = !itemProgress || itemProgress.status === 'locked';
                  const isClassCompleted = itemProgress?.status === 'completed';
                  const isClassInProgress = itemProgress?.status === 'in_progress';

                  return (
                    <div
                      key={classNum}
                      id={`learning-path-class-${classNum}`}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                        isClassLocked
                          ? 'opacity-65 border-transparent bg-gray-500/5'
                          : isClassInProgress
                          ? isDark
                            ? 'bg-[#081F5C]/50 border-[#C5A869]/50'
                            : 'bg-amber-50/50 border-[#C5A869]/40'
                          : isDark
                          ? 'bg-[#081F5C]/35 border-[#0E2E80]'
                          : 'bg-gray-50/50 border-[#081F5C]/10'
                      }`}
                    >
                      <div className="space-y-1 pr-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#C5A869]">
                            Class {classNum}
                          </span>
                          {/* 10. Clear textual state labels alongside indicators */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isClassCompleted
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : isClassInProgress
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                                : isClassLocked
                                ? 'bg-gray-500/10 text-gray-500'
                                : 'bg-blue-500/10 text-blue-500'
                            }`}
                          >
                            {isClassCompleted
                              ? lang === 'en'
                                ? 'Completed'
                                : 'Completed'
                              : isClassInProgress
                              ? lang === 'en'
                                ? 'Continue'
                                : 'Continue'
                              : isClassLocked
                              ? lang === 'en'
                                ? 'Locked'
                                : 'Locked'
                              : lang === 'en'
                              ? 'Not Started'
                              : 'Not Started'}
                          </span>
                        </div>
                        <div className="font-semibold text-xs truncate">{classTitle}</div>
                        {isClassLocked && (
                          <div className="text-[11px] text-rose-500/90 dark:text-rose-400/90 flex items-center gap-1">
                            <span>
                              {lang === 'en'
                                ? `Complete Class ${classNum - 1} to unlock this class.`
                                : `Unlock karne ke liye Class ${classNum - 1} complete karein.`}
                            </span>
                          </div>
                        )}
                        {isClassInProgress && itemProgress?.savedTimestamp && (
                          <div className="text-[11px] text-[#C5A869]">
                            {lang === 'en'
                              ? `You stopped at ${itemProgress.savedTimestamp}`
                              : `Aap ${itemProgress.savedTimestamp} par ruke the`}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        {isClassLocked ? (
                          <div className="p-2 text-gray-400">
                            <Lock className="w-4 h-4 opacity-50" />
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              handleTriggerClass({
                                classNumber: classNum,
                                title: classTitle,
                                weekNumber: week.weekNumber,
                                weekTitleEn: week.titleEn,
                                weekTitleHi: week.titleHi,
                              })
                            }
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              isClassInProgress
                                ? 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C]'
                                : isClassCompleted
                                ? 'border border-[#081F5C]/20 dark:border-white/20 hover:border-[#C5A869]'
                                : 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C]'
                            }`}
                          >
                            {isClassCompleted ? (
                              <>
                                <RotateCcw className="w-3 h-3" />
                                <span>{lang === 'en' ? 'Review' : 'Review'}</span>
                              </>
                            ) : isClassInProgress ? (
                              <>
                                <Play className="w-3 h-3 fill-current" />
                                <span>{lang === 'en' ? 'Continue' : 'Continue'}</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-3 h-3 fill-current" />
                                <span>{lang === 'en' ? 'Start' : 'Start'}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 20. Individual Class Navigation Entry Modal / Preview */}
      {classNavigationTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-5 ${
              isDark
                ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                : 'bg-white border-[#081F5C]/15 text-[#081F5C]'
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#081F5C]/10 dark:border-white/10 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869]">
                  Individual Recorded Class Navigation
                </span>
                <h3 className="font-display text-lg font-bold">
                  Class {classNavigationTarget.classNumber}
                </h3>
              </div>
              <button
                onClick={() => setClassNavigationTarget(null)}
                className="p-1.5 rounded-full hover:bg-gray-500/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#081F5C]/5 dark:bg-white/5 border border-[#081F5C]/10 dark:border-white/10 space-y-2">
                <div className="text-xs font-mono opacity-70">
                  Week {classNavigationTarget.weekNumber}
                </div>
                <div className="font-bold text-sm sm:text-base">
                  {classNavigationTarget.title}
                </div>
                {classNavigationTarget.savedTimestamp ? (
                  <div className="text-xs text-[#C5A869] font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'en'
                        ? `Saved resume point: ${classNavigationTarget.savedTimestamp}`
                        : `Saved resume point: ${classNavigationTarget.savedTimestamp}`}
                    </span>
                  </div>
                ) : (
                  <div className="text-xs opacity-65">
                    {lang === 'en'
                      ? 'No previous playback. Video will start from 00:00.'
                      : 'Koi purana playback nahi hai. Video 00:00 se shuru hoga.'}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs leading-relaxed">
                {lang === 'en'
                  ? 'Navigating to the Individual Recorded Class screen. Video playback, class notes, theory work, and sheet music will load with this class context.'
                  : 'Individual Recorded Class screen par ja rahe hain. Video player, class notes, theory aur sheet music is class context ke sath open honge.'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setClassNavigationTarget(null)}
                className="w-full sm:w-auto py-2.5 px-5 rounded-full text-xs font-semibold opacity-70 hover:opacity-100 cursor-pointer"
              >
                {lang === 'en' ? 'Back' : 'Peeche'}
              </button>
              <button
                onClick={() => {
                  const targetNum = classNavigationTarget.classNumber;
                  const currentProg = learningState.classes[targetNum];
                  const startSec = currentProg?.savedSeconds || 0;
                  const durationSec = currentProg?.durationSeconds || 960;
                  setClassNavigationTarget(null);
                  if (onOpenClass) {
                    onOpenClass({
                      courseId: activeCourse.id,
                      classNumber: targetNum,
                      title: classNavigationTarget.title,
                      weekNumber: classNavigationTarget.weekNumber,
                      savedTimestamp: classNavigationTarget.savedTimestamp,
                      savedSeconds: startSec,
                    });
                  } else {
                    // Open simulated video player context to allow actual video progress tracking
                    setVideoPlaybackModal({
                      classNumber: targetNum,
                      title: classNavigationTarget.title,
                      currentSeconds: startSec,
                      durationSeconds: durationSec,
                      isPlaying: true,
                    });
                  }
                }}
                className="w-full sm:w-auto py-2.5 px-6 rounded-full text-xs font-bold bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>
                  {classNavigationTarget.savedTimestamp
                    ? lang === 'en'
                      ? `Resume at ${classNavigationTarget.savedTimestamp}`
                      : `${classNavigationTarget.savedTimestamp} se Resume Karein`
                    : lang === 'en'
                    ? 'Start Class Video'
                    : 'Class Video Shuru Karein'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 21. Class Library Navigation Entry Modal / Preview */}
      {classLibraryTargetCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-5 ${
              isDark
                ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                : 'bg-white border-[#081F5C]/15 text-[#081F5C]'
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#081F5C]/10 dark:border-white/10 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869]">
                  Class Library Navigation
                </span>
                <h3 className="font-display text-lg font-bold">
                  {lang === 'en'
                    ? classLibraryTargetCourse.titleEn
                    : classLibraryTargetCourse.titleHi}
                </h3>
              </div>
              <button
                onClick={() => setClassLibraryTargetCourse(null)}
                className="p-1.5 rounded-full hover:bg-gray-500/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs opacity-80 leading-relaxed">
              {lang === 'en'
                ? `Navigating to the Class Library screen for ${classLibraryTargetCourse.titleEn}. The full chronological library of all ${classLibraryTargetCourse.classesCount} classes will be presented.`
                : `${classLibraryTargetCourse.titleHi} ke Class Library screen par ja rahe hain. Saari ${classLibraryTargetCourse.classesCount} classes chronological order me open hongi.`}
            </p>

            <div className="p-3.5 rounded-2xl bg-[#081F5C]/5 dark:bg-white/5 border border-[#081F5C]/10 dark:border-white/10 space-y-1.5 text-xs">
              <div className="font-semibold text-[#C5A869]">
                {completedCount} of {totalClassesCount} classes completed
              </div>
              <div className="opacity-75">
                {lang === 'en'
                  ? 'Sequential class unlocking is maintained according to real video progress.'
                  : 'Real video progress ke hisab se sequential unlock maintain rehta hai.'}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setClassLibraryTargetCourse(null)}
                className="py-2.5 px-6 rounded-full text-xs font-bold bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] cursor-pointer"
              >
                {lang === 'en' ? 'Close' : 'Band Karein'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Playback Activity Simulator Modal (Genuinely respects Section 11 & Section 9: no fake Mark as Complete button; tracks real video playback seconds until completion threshold is reached) */}
      {videoPlaybackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div
            className={`w-full max-w-xl rounded-3xl border shadow-2xl p-6 sm:p-7 space-y-5 ${
              isDark
                ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                : 'bg-white border-[#081F5C]/15 text-[#081F5C]'
            }`}
          >
            <div className="flex items-center justify-between border-b border-[#081F5C]/10 dark:border-white/10 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869]">
                  Recorded Class Player
                </span>
                <h3 className="font-display text-base sm:text-lg font-bold">
                  Class {videoPlaybackModal.classNumber}: {videoPlaybackModal.title}
                </h3>
              </div>
              <button
                onClick={() => setVideoPlaybackModal(null)}
                className="p-1.5 rounded-full hover:bg-gray-500/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Screen Representation */}
            <div className="aspect-video rounded-2xl bg-black relative flex flex-col justify-between p-4 overflow-hidden text-white shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-full bg-white/20 font-mono text-[10px]">
                  HD 1080p
                </span>
                <span className="font-mono text-xs text-[#C5A869]">
                  {Math.floor(videoPlaybackModal.currentSeconds / 60)}:
                  {(videoPlaybackModal.currentSeconds % 60).toString().padStart(2, '0')} /{' '}
                  {Math.floor(videoPlaybackModal.durationSeconds / 60)}:
                  {(videoPlaybackModal.durationSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#081F5C]/80 border border-[#C5A869] flex items-center justify-center mx-auto text-[#F7F2EB]">
                  <Play className="w-6 h-6 fill-current" />
                </div>
                <div className="text-xs font-semibold tracking-wide">
                  {videoPlaybackModal.isPlaying
                    ? 'Video playback in progress…'
                    : 'Video paused'}
                </div>
              </div>

              {/* Video Timeline Bar */}
              <div className="space-y-1">
                <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C5A869] transition-all"
                    style={{
                      width: `${Math.round(
                        (videoPlaybackModal.currentSeconds /
                          videoPlaybackModal.durationSeconds) *
                          100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] opacity-70">
                  <span>
                    {Math.round(
                      (videoPlaybackModal.currentSeconds /
                        videoPlaybackModal.durationSeconds) *
                        100
                    )}
                    % watched
                  </span>
                  <span>Unlocks Class {videoPlaybackModal.classNumber + 1} at 90%</span>
                </div>
              </div>
            </div>

            <p className="text-xs opacity-75 leading-relaxed">
              {lang === 'en'
                ? 'Video completion is tracked directly from playback activity. Simply closing without reaching the threshold will preserve your saved timestamp but will not unlock the next class.'
                : 'Video completion direct playback activity se calculate hota hai. Bina 90% dekhe band karne par aapka timestamp save rahega lekin agla class unlock nahi hoga.'}
            </p>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() =>
                  setVideoPlaybackModal((prev) =>
                    prev ? { ...prev, isPlaying: !prev.isPlaying } : null
                  )
                }
                className="py-2 px-4 rounded-full text-xs font-bold border border-[#081F5C]/20 dark:border-white/20 hover:border-[#C5A869] cursor-pointer"
              >
                {videoPlaybackModal.isPlaying ? 'Pause' : 'Resume Playback'}
              </button>

              <button
                onClick={() => setVideoPlaybackModal(null)}
                className="py-2.5 px-6 rounded-full text-xs font-bold bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] cursor-pointer"
              >
                Done Watching
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
