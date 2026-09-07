export type Screen =
  | 'splash'
  | 'welcome'
  | 'goals'
  | 'founder'
  | 'free-learning-home'
  | 'category-list'
  | 'video-player'
  | 'public-home'
  | 'courses-home'
  | 'recorded-catalogue'
  | 'course-details'
  | 'enrollment-initiation'
  | 'account-creation'
  | 'enrollment-summary'
  | 'payment'
  | 'enrollment-confirmation'
  | 'student-login'
  | 'forgot-password'
  | 'create-password'
  | 'student-home'
  | 'individual-recorded-class'
  | 'interactive-sheet-music'
  | 'practice-journal';

export type Language = 'en' | 'hi';

export type Theme = 'light' | 'dark';

export interface Goal {
  id: string;
  order: number;
  labelEn: string;
  labelHi: string;
  subtitleEn: string;
  subtitleHi: string;
}

export type CategoryId = 'beginner' | 'foundation' | 'reading' | 'theory';

export interface FreeCategory {
  id: CategoryId;
  order: number;
  nameEn: string;
  nameHi: string;
  descEn: string;
  descHi: string;
  tagEn: string;
  tagHi: string;
  accent: string;
}

export interface VideoLesson {
  id: string;
  categoryId: CategoryId;
  order: number;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  duration: string;
  durationSec: number;
  videoUrl: string;
  posterGradient: string;
  keyTopicsEn: string[];
  keyTopicsHi: string[];
}

export interface ShowcaseSlide {
  id: string;
  titleEn: string;
  titleHi: string;
  subtitleEn: string;
  subtitleHi: string;
  ctaEn: string;
  ctaHi: string;
  destination: Screen | 'books' | 'contact';
  order: number;
  active: boolean;
  slideTheme: 'navy' | 'gold' | 'charcoal';
  accentTextEn: string;
  accentTextHi: string;
  imageUrl?: string;
  bgGradient: string;
}

export type MusicPathway = 'western' | 'indian';
export type WesternLevel = 'beginner' | 'intermediate' | 'advanced';
export type IndianStyle = 'bollywood' | 'rabindra-sangeet' | 'bengali-modern';

export interface RequiredBook {
  id: string;
  title: string;
  price: number;
  descEn: string;
  descHi: string;
  coverGradient: string;
  isRequired: boolean;
  isIncludedInBundle?: boolean;
  deliveryCharge?: number;
}

export interface CourseWeekStructure {
  weekNumber: number;
  titleEn: string;
  titleHi: string;
  classes: string[];
}

export interface RecordedCourse {
  id: string;
  titleEn: string;
  titleHi: string;
  shortDescEn: string;
  shortDescHi: string;
  category: MusicPathway;
  level?: WesternLevel;
  indianStyle?: IndianStyle;
  duration: string;
  classesCount: number;
  format: 'Recorded Course';
  price: number;
  originalPrice?: number;
  isNew?: boolean;
  featured?: boolean;
  active: boolean;
  artworkGradient: string;
  artworkAccent: string;
  whoIsItForEn: string;
  whoIsItForHi: string;
  whatYoullLearnEn: string[];
  whatYoullLearnHi: string[];
  courseStructure: CourseWeekStructure[];
  includedMaterialsEn: string[];
  includedMaterialsHi: string[];
  requiredBooks?: RequiredBook[];
}

export interface StudentAccount {
  studentId: string; // e.g. "PA-2026-0482"
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  hasCustomPassword?: boolean;
  enrolledCourseId?: string;
  enrolledAt?: string;
  paymentReference?: string;
  amountPaid?: number;
  deliveryAddress?: string;
}

export interface ClassComment {
  id: string;
  studentName: string;
  studentId?: string;
  comment: string;
  timestamp: string; // ISO or human readable
  isInstructor?: boolean;
}

export interface ClassStudentQuestion {
  id: string;
  studentId: string;
  studentName: string;
  question: string;
  submittedAt: string;
  status: 'Submitted' | 'Reviewed' | 'Answered';
  instructorResponse?: string;
}

export interface SheetMusicMeasure {
  measureNumber: number;
  trebleNotes?: string[];
  bassNotes?: string[];
  timeSignature?: string;
  dynamics?: string;
  fingering?: string[];
  repeatSign?: 'start' | 'end' | 'both';
}

export interface SheetMusicItem {
  id: string;
  title: string;
  composer?: string;
  courseId: string;
  classNumber: number;
  description?: string;
  pageCount: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  tempo?: string;
  keySignature?: string;
  timeSignature?: string;
  measures?: SheetMusicMeasure[];
  hasInteractiveVersion?: boolean;
  pdfUrl?: string;
}

export type TheoryQuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'note_identification'
  | 'staff_notation'
  | 'rhythm_counting'
  | 'symbol_identification'
  | 'short_answer';

export interface TheoryQuestion {
  id: string;
  type: TheoryQuestionType;
  promptEn: string;
  promptHi: string;
  options?: { id: string; textEn: string; textHi: string }[];
  correctAnswer: string | string[]; // Option ID or text string(s)
  explanationEn?: string;
  explanationHi?: string;
  notationSvg?: string; // Optional musical notation visual
  hintsEn?: string[];
  hintsHi?: string[];
}

export interface TheoryAssignment {
  id: string;
  classNumber: number;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  passingScorePercent: number;
  questions: TheoryQuestion[];
}

export interface PracticalHomeworkItem {
  id: string;
  titleEn: string;
  titleHi: string;
  shortInstructionEn: string;
  shortInstructionHi: string;
  detailedInstructionEn: string;
  detailedInstructionHi: string;
  skillType: 'Finger Exercises' | 'Scales' | 'Chords' | 'Sight Reading' | 'Repertoire' | 'Rhythm';
  hands?: 'Left Hand' | 'Right Hand' | 'Both Hands';
  startTempoBpm?: number;
  targetTempoBpm?: number;
  repetitions?: string;
  focusPointEn?: string;
  focusPointHi?: string;
  associatedBars?: string;
  associatedSheetMusicId?: string;
  hasInteractiveNotation?: boolean;
  teacherGuidanceEn?: string;
  teacherGuidanceHi?: string;
}

export interface ClassLearningContent {
  courseId: string;
  classNumber: number;
  weekNumber: number;
  titleEn: string;
  titleHi: string;
  teacherNotes: {
    id: string;
    noteEn: string;
    noteHi: string;
  }[];
  sheetMusic: SheetMusicItem[];
  practiceInstructions: {
    titleEn: string;
    titleHi: string;
    pointsEn: string[];
    pointsHi: string[];
    suggestedDurationMinutes: number;
  };
  theoryAssignment?: TheoryAssignment;
  practicalHomework: PracticalHomeworkItem[];
  whatYoullLearn: {
    en: string[];
    hi: string[];
  };
  classNotes: {
    summaryEn: string;
    summaryHi: string;
    keyTakeawaysEn: string[];
    keyTakeawaysHi: string[];
    downloadFileName: string;
  };
  referenceMaterials?: {
    titleEn: string;
    titleHi: string;
    type: 'Book' | 'Audio' | 'Reference PDF';
    detail: string;
  }[];
}

// ==========================================
// 6. REAL INTERACTIVE SHEET MUSIC & NOTATION
// ==========================================

export type NoteDurationType =
  | 'semibreve' // 4 beats (whole note)
  | 'minim' // 2 beats (half note)
  | 'crotchet' // 1 beat (quarter note)
  | 'quaver' // 1/2 beat (eighth note)
  | 'semiquaver' // 1/4 beat (sixteenth note)
  | 'demisemiquaver' // 1/8 beat (thirty-second note)
  | 'dotted_minim' // 3 beats
  | 'dotted_crotchet' // 1.5 beats
  | 'dotted_quaver' // 0.75 beat
  | 'triplet_quaver'; // 1/3 beat

export type ClefType = 'treble' | 'bass';
export type HandSelection = 'left' | 'right' | 'both';

export interface NotationNote {
  id: string;
  pitch: string; // e.g. "C4", "D4", "E4", "F#4", "Bb3", or "REST"
  midiNumber: number; // e.g. 60 for C4, 0 for rest
  duration: NoteDurationType;
  beatValue: number; // 4, 2, 1, 0.5, 0.25, etc.
  hand: 'left' | 'right';
  clef: ClefType;
  fingering?: number; // 1 to 5
  accidental?: '#' | 'b' | 'n';
  isRest?: boolean;
  tieToNext?: boolean;
  isTriplet?: boolean;
  tripletIndex?: number; // 0, 1, 2 for grouping visual
  articulation?: 'staccato' | 'accent' | 'tenuto' | 'fermata';
  lyricOrSyllable?: string;
}

export interface NotationChord {
  id: string;
  notes: NotationNote[];
  beatValue: number;
  beatPosition: number; // e.g. 1.0, 2.0, 2.5
  chordSymbol?: string; // e.g. "C", "G7", "Am", "F"
  dynamics?: 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff' | 'cresc' | 'dim';
}

export interface InteractiveMeasure {
  measureNumber: number;
  timeSignature?: string; // e.g. "4/4", "3/4"
  keySignature?: string; // e.g. "C Major", "G Major", "F Major"
  trebleEvents: (NotationNote | NotationChord)[];
  bassEvents: (NotationNote | NotationChord)[];
  repeatStart?: boolean;
  repeatEnd?: boolean;
  repeatCount?: number;
  firstEnding?: boolean;
  secondEnding?: boolean;
  jumpInstruction?: 'DC' | 'DS' | 'Coda' | 'Segno' | 'Fine';
  tempoBpm?: number;
  sectionLabel?: string; // e.g. "Theme A", "Bars 5–8"
}

export interface InteractiveScore {
  id: string;
  courseId: string;
  classNumber: number;
  titleEn: string;
  titleHi: string;
  composer: string;
  keySignature: string;
  timeSignature: string;
  defaultBpm: number;
  minBpm: number;
  maxBpm: number;
  difficulty: 'Beginner' | 'Elementary' | 'Intermediate';
  handMode: HandSelection;
  measures: InteractiveMeasure[];
  totalBars: number;
  descriptionEn?: string;
  descriptionHi?: string;
  sections?: {
    id: string;
    nameEn: string;
    nameHi: string;
    startBar: number;
    endBar: number;
  }[];
}

// ==========================================
// 7. REAL WEB MIDI TYPES
// ==========================================

export interface MidiDevice {
  id: string;
  name: string;
  manufacturer?: string;
  connectionType: 'usb' | 'bluetooth' | 'webmidi';
  state: 'connected' | 'disconnected';
}

export interface MidiNoteEvent {
  type: 'noteon' | 'noteoff';
  midiNumber: number;
  noteName: string; // e.g. "C4"
  octave: number;
  velocity: number;
  timestamp: number;
}

export interface RealtimePracticeFeedback {
  expectedNote: string;
  expectedMidi: number;
  playedMidi?: number;
  isCorrect: boolean;
  statusText: 'Correct' | 'Try again' | 'Waiting';
  timestamp: number;
}

export interface PracticeSessionSummary {
  scoreId: string;
  scoreTitle: string;
  totalNotesPlayed: number;
  correctNotes: number;
  wrongNotes: number;
  accuracyPercent: number;
  handSelected: HandSelection;
  tempoBpm: number;
  completedAt: string;
  needsPracticeSection?: string;
}

// ==========================================
// 8. REAL PRACTICE TIMER & SESSIONS
// ==========================================

export interface PracticeTimerSession {
  id: string;
  studentId: string;
  courseId: string;
  classNumber?: number;
  date: string; // YYYY-MM-DD local date
  startTime: string; // ISO timestamp
  endTime: string; // ISO timestamp
  durationSeconds: number;
  contextTitle: string; // e.g. "C Major Scale — Both Hands"
  hand?: HandSelection;
  bars?: string; // e.g. "Bars 5–8"
  tempoBpm?: number;
  notesPlayed?: number;
}

export interface DailyPracticeRecord {
  date: string; // YYYY-MM-DD
  totalMinutes: number;
  totalSeconds: number;
  sessionCount: number;
  sessions: PracticeTimerSession[];
}

// ==========================================
// 9. 30-DAY PRACTICE JOURNAL
// ==========================================

export interface PracticeJournalCycle {
  cycleId: string;
  studentId: string;
  cycleNumber: number; // 1, 2, 3...
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD (Day 30 date)
  createdAt: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface PracticeJournalDayInfo {
  dayNumber: number; // 1 to 30
  dateString: string; // YYYY-MM-DD
  formattedDate: string; // e.g. "7 Sep"
  state: 'practiced' | 'no_practice' | 'today' | 'upcoming';
  totalMinutes: number;
  totalSeconds: number;
  sessions: PracticeTimerSession[];
}

export interface PracticeJournalSummary {
  cycle: PracticeJournalCycle;
  currentDayNumber: number; // 1 to 30
  todayMinutes: number;
  totalCycleMinutes: number;
  practiceDaysCount: number; // Days with practice
  currentStreak: number;
  longestStreak: number;
  days: PracticeJournalDayInfo[];
}



