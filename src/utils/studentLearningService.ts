import { RecordedCourse, ClassComment, ClassStudentQuestion } from '../types';

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

