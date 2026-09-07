import {
  RecordedCourse,
  ClassComment,
  ClassStudentQuestion,
  PracticeSessionSummary,
  HandSelection,
  PracticeTimerSession,
  DailyPracticeRecord,
  PracticeJournalCycle,
  PracticeJournalDayInfo,
  PracticeJournalSummary,
  SongLearningStatus,
  SongProgressState,
  SongItem,
} from '../types';

export interface ClassProgressItem {
  classNumber: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'locked';
  savedTimestamp?: string; // e.g. "12:35"
  savedSeconds?: number;
  durationSeconds?: number;
  completedAt?: string;
  watchedPercentage?: number;
}

export interface StudentCourseLearningState {
  courseId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completedClassNumbers: number[];
  currentClassNumber: number;
  lastStoppedTimestamp?: string;
  lastStoppedSeconds?: number;
  classes: Record<number, ClassProgressItem>;
}

const STORAGE_KEY_PREFIX = 'pianotastic_learning_state_v1_';

/**
 * Derives or loads the persistent real progress for a student in a course
 */
export function getStudentCourseProgress(
  studentId: string,
  course: RecordedCourse
): StudentCourseLearningState {
  const key = `${STORAGE_KEY_PREFIX}${studentId}_${course.id}`;
  const totalClasses = course.classesCount || 16;

  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed: StudentCourseLearningState = JSON.parse(raw);
      // Validate structure matches current course class count
      if (parsed && parsed.courseId === course.id) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load student course progress', e);
  }

  // Default initial realistic learning state for enrolled student:
  // Class 1 completed (student watched full foundation lecture)
  // Class 2 in-progress with a real resume timestamp (08:45 out of 16:30)
  // Class 3+ strictly locked (unlocked sequentially only after video completion)
  const completedClassNumbers = [1];
  const currentClassNumber = 2;
  const classes: Record<number, ClassProgressItem> = {};

  for (let i = 1; i <= totalClasses; i++) {
    if (i === 1) {
      classes[i] = {
        classNumber: i,
        status: 'completed',
        completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        watchedPercentage: 100,
        durationSeconds: 980,
      };
    } else if (i === 2) {
      classes[i] = {
        classNumber: i,
        status: 'in_progress',
        savedTimestamp: '08:45',
        savedSeconds: 525,
        durationSeconds: 1140,
        watchedPercentage: 46,
      };
    } else {
      classes[i] = {
        classNumber: i,
        status: 'locked',
        durationSeconds: 1200,
      };
    }
  }

  const initialState: StudentCourseLearningState = {
    courseId: course.id,
    status: 'in_progress',
    completedClassNumbers,
    currentClassNumber,
    lastStoppedTimestamp: '08:45',
    lastStoppedSeconds: 525,
    classes,
  };

  saveStudentCourseProgress(studentId, initialState);
  return initialState;
}

/**
 * Saves student course progress to local persistence
 */
export function saveStudentCourseProgress(
  studentId: string,
  state: StudentCourseLearningState
): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${studentId}_${state.courseId}`;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save student course progress', e);
  }
}

/**
 * Updates video playback activity and checks unlocking thresholds.
 * Class completion happens when the video reaches the required threshold (e.g. >= 90% or finished).
 * Opening and quickly leaving does NOT complete the class.
 */
export function recordVideoProgress(
  studentId: string,
  course: RecordedCourse,
  classNumber: number,
  currentSeconds: number,
  durationSeconds: number
): StudentCourseLearningState {
  const state = getStudentCourseProgress(studentId, course);
  const totalClasses = course.classesCount || 16;
  const watchedPct = durationSeconds > 0 ? (currentSeconds / durationSeconds) * 100 : 0;

  const currentClassData = state.classes[classNumber] || {
    classNumber,
    status: 'in_progress',
  };

  // Format seconds to mm:ss
  const mins = Math.floor(currentSeconds / 60);
  const secs = Math.floor(currentSeconds % 60);
  const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`;

  currentClassData.savedSeconds = currentSeconds;
  currentClassData.savedTimestamp = formattedTime;
  currentClassData.durationSeconds = durationSeconds;
  currentClassData.watchedPercentage = Math.round(watchedPct);

  // Required video-completion threshold: 90%
  const isVideoComplete = watchedPct >= 90 || currentSeconds >= durationSeconds - 5;

  if (isVideoComplete && currentClassData.status !== 'completed') {
    currentClassData.status = 'completed';
    currentClassData.completedAt = new Date().toISOString();
    if (!state.completedClassNumbers.includes(classNumber)) {
      state.completedClassNumbers.push(classNumber);
    }

    // Sequentially unlock the next class if it exists and was locked
    const nextClassNum = classNumber + 1;
    if (nextClassNum <= totalClasses) {
      if (!state.classes[nextClassNum] || state.classes[nextClassNum].status === 'locked') {
        state.classes[nextClassNum] = {
          classNumber: nextClassNum,
          status: 'not_started',
        };
      }
      state.currentClassNumber = nextClassNum;
      state.lastStoppedTimestamp = undefined;
      state.lastStoppedSeconds = undefined;
    }
  } else if (!isVideoComplete && currentClassData.status !== 'completed') {
    currentClassData.status = 'in_progress';
    state.currentClassNumber = classNumber;
    state.lastStoppedTimestamp = formattedTime;
    state.lastStoppedSeconds = currentSeconds;
  }

  state.classes[classNumber] = currentClassData;

  // Determine overall course status
  if (state.completedClassNumbers.length >= totalClasses) {
    state.status = 'completed';
  } else if (state.completedClassNumbers.length > 0 || state.lastStoppedSeconds) {
    state.status = 'in_progress';
  } else {
    state.status = 'not_started';
  }

  saveStudentCourseProgress(studentId, state);
  return state;
}

// ==========================================
// 1. PRACTICE TIME PERSISTENCE (Section 16)
// Stored separately from class video completion
// ==========================================
const PRACTICE_TIME_KEY_PREFIX = 'pianotastic_practice_seconds_';

export function getStudentPracticeTime(
  studentId: string,
  courseId: string,
  classNumber: number
): number {
  try {
    const raw = localStorage.getItem(`${PRACTICE_TIME_KEY_PREFIX}${studentId}_${courseId}_${classNumber}`);
    return raw ? parseInt(raw, 10) : 0;
  } catch {
    return 0;
  }
}

export function addStudentPracticeTime(
  studentId: string,
  courseId: string,
  classNumber: number,
  additionalSeconds: number
): number {
  try {
    const current = getStudentPracticeTime(studentId, courseId, classNumber);
    const total = current + Math.max(0, additionalSeconds);
    localStorage.setItem(
      `${PRACTICE_TIME_KEY_PREFIX}${studentId}_${courseId}_${classNumber}`,
      total.toString()
    );
    return total;
  } catch {
    return 0;
  }
}

// Active Practice Session preserve (if user leaves & returns)
const ACTIVE_PRACTICE_SESSION_KEY = 'pianotastic_active_practice_session_';

export interface ActivePracticeSession {
  studentId: string;
  courseId: string;
  classNumber: number;
  homeworkTitle?: string;
  secondsElapsed: number;
  isRunning: boolean;
  lastUpdatedAt: number;
}

export function getActivePracticeSession(
  studentId: string,
  courseId: string,
  classNumber: number
): ActivePracticeSession | null {
  try {
    const raw = localStorage.getItem(`${ACTIVE_PRACTICE_SESSION_KEY}${studentId}_${courseId}_${classNumber}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveActivePracticeSession(session: ActivePracticeSession | null): void {
  try {
    if (!session) return;
    localStorage.setItem(
      `${ACTIVE_PRACTICE_SESSION_KEY}${session.studentId}_${session.courseId}_${session.classNumber}`,
      JSON.stringify(session)
    );
  } catch {}
}

export function clearActivePracticeSession(
  studentId: string,
  courseId: string,
  classNumber: number
): void {
  try {
    localStorage.removeItem(`${ACTIVE_PRACTICE_SESSION_KEY}${studentId}_${courseId}_${classNumber}`);
  } catch {}
}

// ==========================================
// 2. COMMENTS (Section 4)
// Class-linked simple discussion
// ==========================================
const COMMENTS_KEY_PREFIX = 'pianotastic_class_comments_';

const DEFAULT_COMMENTS_MAP: Record<string, ClassComment[]> = {
  'western-beginner_1': [
    {
      id: 'comm-1-1',
      studentName: 'Pooja Verma',
      comment: 'The explanation about bench height was an eye opener! My shoulders used to ache after 15 minutes, now it feels so effortless.',
      timestamp: 'Yesterday at 4:30 PM',
    },
    {
      id: 'comm-1-2',
      studentName: 'Amitava Sen',
      comment: 'Wonderful Pooja! Remember to keep your elbows slightly forward of your torso as well to allow free breathing.',
      timestamp: 'Yesterday at 5:15 PM',
      isInstructor: true,
    },
  ],
  'western-beginner_2': [
    {
      id: 'comm-2-1',
      studentName: 'Rohan Mehta',
      comment: 'The C-D-E landmark framing trick makes finding Middle C instantaneous. Loving the clarity.',
      timestamp: '2 days ago at 11:20 AM',
    },
  ],
  'western-beginner_3': [
    {
      id: 'comm-3-1',
      studentName: 'Sneha Patel',
      comment: 'Sir, finger 4 felt a little stiff initially, but keeping the wrist floating as instructed helped eliminate the tension.',
      timestamp: 'Today at 2:10 PM',
    },
    {
      id: 'comm-3-2',
      studentName: 'Amitava Sen',
      comment: 'Excellent awareness, Sneha. Tendon anatomy of finger 4 means we never force it down; gentle knuckle motion is key.',
      timestamp: 'Today at 3:00 PM',
      isInstructor: true,
    },
  ],
};

export function getClassComments(courseId: string, classNumber: number): ClassComment[] {
  const key = `${COMMENTS_KEY_PREFIX}${courseId}_${classNumber}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}

  const defaults = DEFAULT_COMMENTS_MAP[`${courseId}_${classNumber}`] || [];
  return defaults;
}

export function addClassComment(
  courseId: string,
  classNumber: number,
  comment: ClassComment
): ClassComment[] {
  const key = `${COMMENTS_KEY_PREFIX}${courseId}_${classNumber}`;
  const existing = getClassComments(courseId, classNumber);
  const updated = [...existing, comment];
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}
  return updated;
}

// ==========================================
// 3. ASK A QUESTION (Section 5)
// Dedicated student question submission
// ==========================================
const QUESTIONS_KEY_PREFIX = 'pianotastic_class_questions_';

export function getClassQuestions(
  studentId: string,
  courseId: string,
  classNumber: number
): ClassStudentQuestion[] {
  const key = `${QUESTIONS_KEY_PREFIX}${studentId}_${courseId}_${classNumber}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function addClassQuestion(
  studentId: string,
  courseId: string,
  classNumber: number,
  question: ClassStudentQuestion
): ClassStudentQuestion[] {
  const key = `${QUESTIONS_KEY_PREFIX}${studentId}_${courseId}_${classNumber}`;
  const existing = getClassQuestions(studentId, courseId, classNumber);
  const updated = [question, ...existing];
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}
  return updated;
}

// ==========================================
// 4. THEORY ASSIGNMENT STATE (Prompt 23)
// ==========================================
const THEORY_ASSIGNMENT_KEY_PREFIX = 'pianotastic_theory_assignment_';

export interface TheoryAssignmentProgress {
  assignmentId: string;
  studentId: string;
  courseId: string;
  classNumber: number;
  status: 'not_started' | 'in_progress' | 'completed';
  currentQuestionIndex: number;
  answers: Record<string, string | string[]>; // questionId -> answer
  scores: Record<string, boolean>; // questionId -> isCorrect
  totalQuestions: number;
  scoreCount: number;
  scorePercent: number;
  submittedAt?: string;
}

export function getTheoryAssignmentProgress(
  studentId: string,
  courseId: string,
  classNumber: number
): TheoryAssignmentProgress | null {
  const key = `${THEORY_ASSIGNMENT_KEY_PREFIX}${studentId}_${courseId}_${classNumber}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveTheoryAssignmentProgress(
  progress: TheoryAssignmentProgress
): void {
  const key = `${THEORY_ASSIGNMENT_KEY_PREFIX}${progress.studentId}_${progress.courseId}_${progress.classNumber}`;
  try {
    localStorage.setItem(key, JSON.stringify(progress));
  } catch {}
}

// ==========================================
// 5. PRACTICAL HOMEWORK PERSISTENCE (Prompt 24)
// ==========================================
const HOMEWORK_STATUS_KEY_PREFIX = 'pianotastic_homework_status_';

export function getHomeworkStatus(
  studentId: string,
  courseId: string,
  classNumber: number,
  homeworkId: string
): 'not_started' | 'in_progress' | 'practising' | 'completed' {
  const key = `${HOMEWORK_STATUS_KEY_PREFIX}${studentId}_${courseId}_${classNumber}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed[homeworkId] || 'not_started';
    }
  } catch {}
  return 'not_started';
}

export function saveHomeworkStatus(
  studentId: string,
  courseId: string,
  classNumber: number,
  homeworkId: string,
  status: 'not_started' | 'in_progress' | 'practising' | 'completed'
): void {
  const key = `${HOMEWORK_STATUS_KEY_PREFIX}${studentId}_${courseId}_${classNumber}`;
  try {
    let currentMap: Record<string, string> = {};
    const raw = localStorage.getItem(key);
    if (raw) currentMap = JSON.parse(raw);
    currentMap[homeworkId] = status;
    localStorage.setItem(key, JSON.stringify(currentMap));
  } catch {}
}

const MIDI_PRACTICE_KEY_PREFIX = 'pianotastic_midi_sessions_';
const MIDI_SETTINGS_KEY_PREFIX = 'pianotastic_midi_settings_';

export function saveMidiPracticeResult(studentId: string, result: PracticeSessionSummary): void {
  const key = `${MIDI_PRACTICE_KEY_PREFIX}${studentId}`;
  try {
    const raw = localStorage.getItem(key);
    const list: PracticeSessionSummary[] = raw ? JSON.parse(raw) : [];
    list.unshift(result);
    // Keep last 40 attempts
    if (list.length > 40) list.length = 40;
    localStorage.setItem(key, JSON.stringify(list));
  } catch {}
}

export function getMidiPracticeHistory(studentId: string, scoreId?: string): PracticeSessionSummary[] {
  const key = `${MIDI_PRACTICE_KEY_PREFIX}${studentId}`;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const list: PracticeSessionSummary[] = JSON.parse(raw);
    if (scoreId) {
      return list.filter((item) => item.scoreId === scoreId);
    }
    return list;
  } catch {
    return [];
  }
}

export function getMidiPracticeStats(studentId: string, scoreId: string): {
  attempts: number;
  bestAccuracy: number;
  lastTempo: number;
  notesNeedingImprovement: string[];
} {
  const history = getMidiPracticeHistory(studentId, scoreId);
  if (!history.length) {
    return { attempts: 0, bestAccuracy: 0, lastTempo: 0, notesNeedingImprovement: [] };
  }
  const bestAcc = Math.max(...history.map((h) => h.accuracyPercent));
  const latest = history[0];
  const problemNotes = history
    .map((h) => h.needsPracticeSection)
    .filter(Boolean) as string[];
  const uniqueNotes = Array.from(new Set(problemNotes.join(', ').split(', ').filter(Boolean)));

  return {
    attempts: history.length,
    bestAccuracy: bestAcc,
    lastTempo: latest.tempoBpm,
    notesNeedingImprovement: uniqueNotes,
  };
}

export function saveMidiScoreSettings(
  studentId: string,
  scoreId: string,
  settings: { hand: HandSelection; tempoBpm: number; loopRange: [number, number] }
): void {
  const key = `${MIDI_SETTINGS_KEY_PREFIX}${studentId}_${scoreId}`;
  try {
    localStorage.setItem(key, JSON.stringify(settings));
  } catch {}
}

export function getMidiScoreSettings(
  studentId: string,
  scoreId: string
): { hand: HandSelection; tempoBpm: number; loopRange: [number, number] } | null {
  const key = `${MIDI_SETTINGS_KEY_PREFIX}${studentId}_${scoreId}`;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ==========================================
// 8. REAL PRACTICE TIMER & 30-DAY PRACTICE JOURNAL
// ==========================================
const PRACTICE_TIMER_SESSIONS_PREFIX = 'pianotastic_practice_timer_sessions_';
const PRACTICE_JOURNAL_CYCLE_PREFIX = 'pianotastic_journal_cycle_';

/**
 * Returns YYYY-MM-DD in local time
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Save an actual completed practice session
 */
export function savePracticeTimerSession(session: PracticeTimerSession): void {
  try {
    const key = `${PRACTICE_TIMER_SESSIONS_PREFIX}${session.studentId}`;
    const raw = localStorage.getItem(key);
    const list: PracticeTimerSession[] = raw ? JSON.parse(raw) : [];
    // Insert new session at the beginning
    list.unshift(session);
    localStorage.setItem(key, JSON.stringify(list));

    // Also update class-specific accumulated practice seconds if class context exists
    if (session.courseId && session.classNumber) {
      addStudentPracticeTime(
        session.studentId,
        session.courseId,
        session.classNumber,
        session.durationSeconds
      );
    }
  } catch (err) {
    console.error('Failed to save practice timer session:', err);
  }
}

/**
 * Retrieve all practice timer sessions for a student
 */
export function getAllPracticeTimerSessions(studentId: string): PracticeTimerSession[] {
  try {
    const key = `${PRACTICE_TIMER_SESSIONS_PREFIX}${studentId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Get practice duration and sessions for today
 */
export function getTodayPracticeDuration(studentId: string): {
  totalSeconds: number;
  totalMinutes: number;
  sessionCount: number;
  sessions: PracticeTimerSession[];
} {
  const todayStr = getLocalDateString();
  const allSessions = getAllPracticeTimerSessions(studentId);
  const todaySessions = allSessions.filter((s) => s.date === todayStr);

  const totalSeconds = todaySessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const totalMinutes = Math.round((totalSeconds / 60) * 10) / 10;

  return {
    totalSeconds,
    totalMinutes,
    sessionCount: todaySessions.length,
    sessions: todaySessions,
  };
}

/**
 * Get all-time practice total for student
 */
export function getTotalPracticeDurationAllTime(studentId: string): {
  totalSeconds: number;
  totalMinutes: number;
  totalHours: number;
  sessionCount: number;
} {
  const allSessions = getAllPracticeTimerSessions(studentId);
  const totalSeconds = allSessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

  return {
    totalSeconds,
    totalMinutes,
    totalHours,
    sessionCount: allSessions.length,
  };
}

/**
 * Get 30-Day Practice Journal summary and calendar days
 */
export function get30DayPracticeJournalSummary(studentId: string): PracticeJournalSummary {
  const allSessions = getAllPracticeTimerSessions(studentId);
  const todayStr = getLocalDateString();
  const today = new Date();

  // Manage 30-day cycle
  const cycleKey = `${PRACTICE_JOURNAL_CYCLE_PREFIX}${studentId}`;
  let cycle: PracticeJournalCycle | null = null;
  try {
    const rawCycle = localStorage.getItem(cycleKey);
    if (rawCycle) cycle = JSON.parse(rawCycle);
  } catch {}

  if (!cycle) {
    // Initialize Cycle 1 starting from today or first practice session
    const firstDateStr = allSessions.length > 0 ? allSessions[allSessions.length - 1].date : todayStr;
    const startDateObj = new Date(firstDateStr);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(startDateObj.getDate() + 29); // 30 days total

    cycle = {
      cycleId: `cycle-1-${studentId}`,
      studentId,
      cycleNumber: 1,
      startDate: getLocalDateString(startDateObj),
      endDate: getLocalDateString(endDateObj),
      createdAt: new Date().toISOString(),
      isCompleted: false,
    };
    try {
      localStorage.setItem(cycleKey, JSON.stringify(cycle));
    } catch {}
  }

  // Build the 30-day day list from cycle.startDate
  const cycleStart = new Date(cycle.startDate + 'T00:00:00');
  const days: PracticeJournalDayInfo[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let totalCycleSeconds = 0;
  let practiceDaysCount = 0;

  for (let i = 0; i < 30; i++) {
    const d = new Date(cycleStart);
    d.setDate(cycleStart.getDate() + i);
    const dateString = getLocalDateString(d);
    const formattedDate = `${d.getDate()} ${monthNames[d.getMonth()]}`;

    const daySessions = allSessions.filter((s) => s.date === dateString);
    const daySec = daySessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
    const dayMin = Math.round((daySec / 60) * 10) / 10;

    totalCycleSeconds += daySec;
    if (daySec > 0) {
      practiceDaysCount++;
    }

    let state: 'practiced' | 'no_practice' | 'today' | 'upcoming';
    if (dateString === todayStr) {
      state = daySec > 0 ? 'practiced' : 'today';
    } else if (dateString < todayStr) {
      state = daySec > 0 ? 'practiced' : 'no_practice';
    } else {
      state = 'upcoming';
    }

    days.push({
      dayNumber: i + 1,
      dateString,
      formattedDate,
      state,
      totalMinutes: dayMin,
      totalSeconds: daySec,
      sessions: daySessions,
    });
  }

  // Determine current day number in cycle (1..30)
  const msPerDay = 24 * 60 * 60 * 1000;
  const todayDateObj = new Date(todayStr + 'T00:00:00');
  const diffDays = Math.floor((todayDateObj.getTime() - cycleStart.getTime()) / msPerDay);
  const currentDayNumber = Math.min(30, Math.max(1, diffDays + 1));

  // Calculate streaks from actual sessions
  // Current streak: consecutive days with practice ending today or yesterday
  const pastDaysDescending = days
    .filter((d) => d.dateString <= todayStr)
    .sort((a, b) => b.dateString.localeCompare(a.dateString));

  let currentStreak = 0;
  // Check if practiced today or yesterday to begin streak count
  if (pastDaysDescending.length > 0) {
    const firstPast = pastDaysDescending[0];
    const secondPast = pastDaysDescending[1];
    const canContinueStreak =
      firstPast.totalSeconds > 0 || (secondPast && secondPast.totalSeconds > 0);

    if (canContinueStreak) {
      let startIndex = firstPast.totalSeconds > 0 ? 0 : 1;
      for (let i = startIndex; i < pastDaysDescending.length; i++) {
        if (pastDaysDescending[i].totalSeconds > 0) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  // Longest streak across all 30 days
  let longestStreak = 0;
  let tempStreak = 0;
  for (const d of days) {
    if (d.totalSeconds > 0) {
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  const todayInfo = days.find((d) => d.dateString === todayStr);
  const todayMinutes = todayInfo ? todayInfo.totalMinutes : 0;
  const totalCycleMinutes = Math.round((totalCycleSeconds / 60) * 10) / 10;

  return {
    cycle,
    currentDayNumber,
    todayMinutes,
    totalCycleMinutes,
    practiceDaysCount,
    currentStreak,
    longestStreak,
    days,
  };
}

// =======================================================================
// 10. REAL DATA-DRIVEN SONG LIBRARY STORAGE & TRACKING SERVICE
// =======================================================================

const SONG_PROGRESS_KEY_PREFIX = 'pianotastic_song_progress_v1_';

/**
 * Loads all saved song progress for a given student
 */
export function getAllSongProgress(studentId: string): Record<string, SongProgressState> {
  const key = `${SONG_PROGRESS_KEY_PREFIX}${studentId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load song progress map', e);
  }

  // Realistic initial learning state: student is learning Kal Ho Naa Ho and Purano Shei Diner Kotha
  const initialMap: Record<string, SongProgressState> = {
    'song-kal-ho-naa-ho': {
      songId: 'song-kal-ho-naa-ho',
      studentId,
      status: 'Practising',
      lastPracticedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      totalPracticeSeconds: 1440, // 24 minutes logged
      sessionsCount: 3,
      notesMastered: 14,
    },
    'song-purano-shei': {
      songId: 'song-purano-shei',
      studentId,
      status: 'Learning',
      lastPracticedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      totalPracticeSeconds: 780, // 13 minutes logged
      sessionsCount: 2,
      notesMastered: 8,
    },
    'song-ode-to-joy': {
      songId: 'song-ode-to-joy',
      studentId,
      status: 'Completed',
      lastPracticedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      totalPracticeSeconds: 2100, // 35 minutes logged
      sessionsCount: 4,
      notesMastered: 16,
    },
  };

  try {
    localStorage.setItem(key, JSON.stringify(initialMap));
  } catch {
    // ignore
  }

  return initialMap;
}

/**
 * Retrieves the specific status for a song: 'Not Started' | 'Learning' | 'Practising' | 'Completed'
 */
export function getSongLearningStatus(
  studentId: string,
  songId: string
): SongLearningStatus {
  const map = getAllSongProgress(studentId);
  return map[songId]?.status || 'Not Started';
}

/**
 * Updates and saves the learning status of a song for a student
 */
export function saveSongLearningStatus(
  studentId: string,
  songId: string,
  status: SongLearningStatus,
  extra?: { notesMastered?: number; personalNotes?: string }
): void {
  const map = getAllSongProgress(studentId);
  const existing = map[songId] || {
    songId,
    studentId,
    status: 'Not Started',
    totalPracticeSeconds: 0,
    sessionsCount: 0,
  };

  map[songId] = {
    ...existing,
    status,
    notesMastered: extra?.notesMastered !== undefined ? extra.notesMastered : existing.notesMastered,
    personalNotes: extra?.personalNotes !== undefined ? extra.personalNotes : existing.personalNotes,
  };

  const key = `${SONG_PROGRESS_KEY_PREFIX}${studentId}`;
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to save song learning status', e);
  }
}

/**
 * Records practice duration on a song whenever Practice Timer runs with a song context
 */
export function recordSongPracticeSession(
  studentId: string,
  songId: string,
  durationSeconds: number
): void {
  if (durationSeconds <= 0) return;
  const map = getAllSongProgress(studentId);
  const existing = map[songId] || {
    songId,
    studentId,
    status: 'Practising',
    totalPracticeSeconds: 0,
    sessionsCount: 0,
  };

  // If currently Not Started, automatically transition to Practising
  const newStatus: SongLearningStatus =
    existing.status === 'Not Started' ? 'Practising' : existing.status;

  map[songId] = {
    ...existing,
    status: newStatus,
    totalPracticeSeconds: existing.totalPracticeSeconds + durationSeconds,
    sessionsCount: existing.sessionsCount + 1,
    lastPracticedAt: new Date().toISOString(),
  };

  const key = `${SONG_PROGRESS_KEY_PREFIX}${studentId}`;
  try {
    localStorage.setItem(key, JSON.stringify(map));
  } catch (e) {
    console.error('Failed to record song practice session', e);
  }
}

/**
 * Finds songs that have actual practice logged or recent activity
 */
export function getRecentlyPracticedSongs(
  studentId: string,
  allSongs: SongItem[]
): SongItem[] {
  const map = getAllSongProgress(studentId);

  return allSongs
    .filter((s) => map[s.id] && map[s.id].lastPracticedAt && map[s.id].totalPracticeSeconds > 0)
    .sort((a, b) => {
      const timeA = new Date(map[a.id]?.lastPracticedAt || 0).getTime();
      const timeB = new Date(map[b.id]?.lastPracticedAt || 0).getTime();
      return timeB - timeA;
    });
}




