import { ChordInversionType, ChordPracticeProgress, ScaleDirection, ScalePracticeProgress } from '../types';

const CHORD_PROGRESS_PREFIX = 'pianotastic_chord_prog_';
const SCALE_PROGRESS_PREFIX = 'pianotastic_scale_prog_';
const LAST_SELECTED_CHORD_KEY = 'pianotastic_last_chord_';
const LAST_SELECTED_SCALE_KEY = 'pianotastic_last_scale_';

export function getChordProgress(studentId: string, chordId: string): ChordPracticeProgress {
  if (typeof window === 'undefined') {
    return {
      chordId,
      studentId,
      attemptsCount: 0,
      successfulMidiCompletions: 0,
      lastSelectedInversion: 'root',
      lastSelectedHand: 'Right Hand',
      lastSelectedMode: 'block',
      bestResult: 'Not Practised',
    };
  }

  try {
    const raw = localStorage.getItem(`${CHORD_PROGRESS_PREFIX}${studentId}_${chordId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  return {
    chordId,
    studentId,
    attemptsCount: 0,
    successfulMidiCompletions: 0,
    lastSelectedInversion: 'root',
    lastSelectedHand: 'Right Hand',
    lastSelectedMode: 'block',
    bestResult: 'Not Practised',
  };
}

export function saveChordProgress(
  studentId: string,
  chordId: string,
  updates: Partial<ChordPracticeProgress>
): ChordPracticeProgress {
  const current = getChordProgress(studentId, chordId);
  const updated: ChordPracticeProgress = {
    ...current,
    ...updates,
    chordId,
    studentId,
    lastPracticedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(`${CHORD_PROGRESS_PREFIX}${studentId}_${chordId}`, JSON.stringify(updated));
    localStorage.setItem(`${LAST_SELECTED_CHORD_KEY}${studentId}`, chordId);
  } catch {}

  return updated;
}

export function getLastSelectedChordId(studentId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(`${LAST_SELECTED_CHORD_KEY}${studentId}`);
  } catch {
    return null;
  }
}

export function getScaleProgress(studentId: string, scaleId: string): ScalePracticeProgress {
  if (typeof window === 'undefined') {
    return {
      scaleId,
      studentId,
      attemptsCount: 0,
      successfulCompletions: 0,
      lastSelectedHand: 'Right Hand',
      lastSelectedDirection: 'Ascending',
      lastSelectedTempo: 60,
    };
  }

  try {
    const raw = localStorage.getItem(`${SCALE_PROGRESS_PREFIX}${studentId}_${scaleId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}

  return {
    scaleId,
    studentId,
    attemptsCount: 0,
    successfulCompletions: 0,
    lastSelectedHand: 'Right Hand',
    lastSelectedDirection: 'Ascending',
    lastSelectedTempo: 60,
  };
}

export function saveScaleProgress(
  studentId: string,
  scaleId: string,
  updates: Partial<ScalePracticeProgress>
): ScalePracticeProgress {
  const current = getScaleProgress(studentId, scaleId);
  const updated: ScalePracticeProgress = {
    ...current,
    ...updates,
    scaleId,
    studentId,
    lastPracticedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(`${SCALE_PROGRESS_PREFIX}${studentId}_${scaleId}`, JSON.stringify(updated));
    localStorage.setItem(`${LAST_SELECTED_SCALE_KEY}${studentId}`, scaleId);
  } catch {}

  return updated;
}

export function getLastSelectedScaleId(studentId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(`${LAST_SELECTED_SCALE_KEY}${studentId}`);
  } catch {
    return null;
  }
}
