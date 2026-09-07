import { InteractiveScore, NotationNote, NotationChord } from '../types';

export const INTERACTIVE_SCORES: InteractiveScore[] = [
  // SCORE 1: Class 1 - Middle C Landmark & Arm Drop Etude
  {
    id: 'sm-w1-1',
    courseId: 'western-beginner',
    classNumber: 1,
    titleEn: 'Middle C Landmark & Arm Drop Etude',
    titleHi: 'Middle C Landmark aur Arm Drop Etude',
    composer: 'Amitava Sen',
    keySignature: 'C Major',
    timeSignature: '4/4',
    defaultBpm: 60,
    minBpm: 40,
    maxBpm: 100,
    difficulty: 'Beginner',
    handMode: 'both',
    totalBars: 4,
    descriptionEn: 'Preparatory arm-drop and postural balance study centered on Middle C (C4).',
    descriptionHi: 'Middle C (C4) par kendrit preparatory arm-drop aur balance ka abhyas.',
    sections: [
      { id: 'sec-1', nameEn: 'Bars 1–2 (Right Hand Focus)', nameHi: 'Bars 1–2 (Right Hand Focus)', startBar: 1, endBar: 2 },
      { id: 'sec-2', nameEn: 'Bars 3–4 (Left Hand Focus)', nameHi: 'Bars 3–4 (Left Hand Focus)', startBar: 3, endBar: 4 },
      { id: 'sec-all', nameEn: 'All 4 Bars', nameHi: 'Sabhi 4 Bars', startBar: 1, endBar: 4 },
    ],
    measures: [
      {
        measureNumber: 1,
        timeSignature: '4/4',
        keySignature: 'C Major',
        sectionLabel: 'Right Hand Drop',
        trebleEvents: [
          {
            id: 'm1-t1',
            pitch: 'C4',
            midiNumber: 60,
            duration: 'semibreve',
            beatValue: 4,
            hand: 'right',
            clef: 'treble',
            fingering: 3,
            articulation: 'tenuto',
          } as NotationNote,
        ],
        bassEvents: [
          {
            id: 'm1-b1',
            pitch: 'REST',
            midiNumber: 0,
            duration: 'semibreve',
            beatValue: 4,
            hand: 'left',
            clef: 'bass',
            isRest: true,
          } as NotationNote,
        ],
      },
      {
        measureNumber: 2,
        trebleEvents: [
          {
            id: 'm2-t1',
            pitch: 'C4',
            midiNumber: 60,
            duration: 'minim',
            beatValue: 2,
            hand: 'right',
            clef: 'treble',
            fingering: 3,
          } as NotationNote,
          {
            id: 'm2-t2',
            pitch: 'C4',
            midiNumber: 60,
            duration: 'minim',
            beatValue: 2,
            hand: 'right',
            clef: 'treble',
            fingering: 3,
          } as NotationNote,
        ],
        bassEvents: [
          {
            id: 'm2-b1',
            pitch: 'REST',
            midiNumber: 0,
            duration: 'semibreve',
            beatValue: 4,
            hand: 'left',
            clef: 'bass',
            isRest: true,
          } as NotationNote,
        ],
      },
      {
        measureNumber: 3,
        sectionLabel: 'Left Hand Drop',
        trebleEvents: [
          {
            id: 'm3-t1',
            pitch: 'REST',
            midiNumber: 0,
            duration: 'semibreve',
            beatValue: 4,
            hand: 'right',
            clef: 'treble',
            isRest: true,
          } as NotationNote,
        ],
        bassEvents: [
          {
            id: 'm3-b1',
            pitch: 'C4',
            midiNumber: 60,
            duration: 'semibreve',
            beatValue: 4,
            hand: 'left',
            clef: 'bass',
            fingering: 3,
            articulation: 'tenuto',
          } as NotationNote,
        ],
      },
      {
        measureNumber: 4,
        repeatEnd: true,
        repeatCount: 2,
        trebleEvents: [
          {
            id: 'm4-t1',
            pitch: 'REST',
            midiNumber: 0,
            duration: 'semibreve',
            beatValue: 4,
            hand: 'right',
            clef: 'treble',
            isRest: true,
          } as NotationNote,
        ],
        bassEvents: [
          {
            id: 'm4-b1',
            pitch: 'C4',
            midiNumber: 60,
            duration: 'minim',
            beatValue: 2,
            hand: 'left',
            clef: 'bass',
            fingering: 3,
          } as NotationNote,
          {
            id: 'm4-b2',
            pitch: 'C4',
            midiNumber: 60,
            duration: 'minim',
            beatValue: 2,
            hand: 'left',
            clef: 'bass',
            fingering: 3,
          } as NotationNote,
        ],
      },
    ],
  },

  // SCORE 2: Class 2 - C-D-E Three-Note Step Etude
  {
    id: 'sm-w1-3',
    courseId: 'western-beginner',
    classNumber: 2,
    titleEn: 'C-D-E Three-Note Step Etude',
    titleHi: 'C-D-E Three-Note Step Etude',
    composer: 'Amitava Sen',
    keySignature: 'C Major',
    timeSignature: '4/4',
    defaultBpm: 72,
    minBpm: 45,
    maxBpm: 110,
    difficulty: 'Beginner',
    handMode: 'both',
    totalBars: 4,
    descriptionEn: 'First stepping exercise across the C-D-E cluster in Right Hand and Left Hand.',
    descriptionHi: 'Right Hand aur Left Hand me C-D-E stepping cluster ka pehla exercise.',
    sections: [
      { id: 'sec-1', nameEn: 'Bars 1–2 (Ascending)', nameHi: 'Bars 1–2 (Ascending)', startBar: 1, endBar: 2 },
      { id: 'sec-2', nameEn: 'Bars 3–4 (Descending)', nameHi: 'Bars 3–4 (Descending)', startBar: 3, endBar: 4 },
      { id: 'sec-all', nameEn: 'Full Etude (Bars 1–4)', nameHi: 'Full Etude (Bars 1–4)', startBar: 1, endBar: 4 },
    ],
    measures: [
      {
        measureNumber: 1,
        timeSignature: '4/4',
        keySignature: 'C Major',
        sectionLabel: 'Theme Ascending',
        trebleEvents: [
          {
            id: 'e2-m1-t1',
            pitch: 'C4',
            midiNumber: 60,
            duration: 'minim',
            beatValue: 2,
            hand: 'right',
            clef: 'treble',
            fingering: 1,
          } as NotationNote,
          {
            id: 'e2-m1-t2',
            pitch: 'D4',
            midiNumber: 62,
            duration: 'minim',
            beatValue: 2,
            hand: 'right',
            clef: 'treble',
            fingering: 2,
          } as NotationNote,
        ],
        bassEvents: [
          {
            id: 'e2-m1-b1',
            pitch: 'C3',
            midiNumber: 48,
            duration: 'semibreve',
            beatValue: 4,
            hand: 'left',
            clef: 'bass',
            fingering: 5,
          } as NotationNote,
        ],
      },
      {
        measureNumber: 2,
        trebleEvents: [
          {
            id: 'e2-m2-t1',
            pitch: 'E4',
            midiNumber: 64,
            duration: 'semibreve',
            beatValue: 4,
            hand: 'right',
            clef: 'treble',
            fingering: 3,
          } as NotationNote,
        ],
        bassEvents: [
          {
            id: 'e2-m2-b1',
            pitch: 'C3',
            midiNumber: 48,
            duration: 'semibreve',
            beatValue: 4,
            hand: 'left',
            clef: 'bass',
            fingering: 5,
          } as NotationNote,
        ],
      },
      {
        measureNumber: 3,
        sectionLabel: 'Step Down',
        trebleEvents: [
          {
            id: 'e2-m3-t1',
            pitch: 'D4',
            midiNumber: 62,
            duration: 'minim',
            beatValue: 2,
            hand: 'right',
            clef: 'treble',
            fingering: 2,
          } as NotationNote,
          {
            id: 'e2-m3-t2',
            pitch: 'C4',
            midiNumber: 60,
            duration: 'minim',
            beatValue: 2,
            hand: 'right',
            clef: 'treble',
            fingering: 1,
          } as NotationNote,
        ],
        bassEvents: [
          {
            id: 'e2-m3-b1',
            pitch: 'G3',
            midiNumber: 55,
            duration: 'semibreve',
            beatValue: 4,
            hand: 'left',
            clef: 'bass',
            fingering: 1,
          } as NotationNote,
        ],
      },
      {
        measureNumber: 4,
        repeatEnd: true,
        repeatCount: 2,
        trebleEvents: [
          {
            id: 'e2-m4-t1',
            pitch: 'C4',
            midiNumber: 60,
            duration: 'semibreve',
            beatValue: 4,
            hand: 'right',
            clef: 'treble',
            fingering: 1,
          } as NotationNote,
        ],
        bassEvents: [
          {
            id: 'e2-m4-b1',
            pitch: 'C3',
            midiNumber: 48,
            duration: 'semibreve',
            beatValue: 4,
            hand: 'left',
            clef: 'bass',
            fingering: 5,
          } as NotationNote,
        ],
      },
    ],
  },

  // SCORE 3: Class 3 - C Major Five-Finger Pattern & Etude (with simultaneous notes and real chords)
  {
    id: 'sm-w2-1',
    courseId: 'western-beginner',
    classNumber: 3,
    titleEn: 'C Major Five-Finger Pattern & Etude',
    titleHi: 'C Major Five-Finger Pattern & Etude',
    composer: 'Amitava Sen',
    keySignature: 'C Major',
    timeSignature: '4/4',
    defaultBpm: 80,
    minBpm: 45,
    maxBpm: 120,
    difficulty: 'Beginner',
    handMode: 'both',
    totalBars: 8,
    descriptionEn: 'Full 5-finger scale study with left-hand accompaniment, dynamic contrast, and C Major triad chord ending.',
    descriptionHi: 'Left hand accompaniment, dynamics aur C Major chord ending ke sath 5-finger scale etude.',
    sections: [
      { id: 'sec-1', nameEn: 'Bars 1–2 (Ascending 5-Finger)', nameHi: 'Bars 1–2 (Ascending 5-Finger)', startBar: 1, endBar: 2 },
      { id: 'sec-2', nameEn: 'Bars 3–4 (Descending 5-Finger)', nameHi: 'Bars 3–4 (Descending 5-Finger)', startBar: 3, endBar: 4 },
      { id: 'sec-3', nameEn: 'Bars 5–6 (Two-Hand Coordination)', nameHi: 'Bars 5–6 (Two-Hand Coordination)', startBar: 5, endBar: 6 },
      { id: 'sec-4', nameEn: 'Bars 7–8 (Final Cadence & Chord)', nameHi: 'Bars 7–8 (Final Cadence & Chord)', startBar: 7, endBar: 8 },
      { id: 'sec-all', nameEn: 'Complete Piece (Bars 1–8)', nameHi: 'Complete Piece (Bars 1–8)', startBar: 1, endBar: 8 },
    ],
    measures: [
      {
        measureNumber: 1,
        timeSignature: '4/4',
        keySignature: 'C Major',
        sectionLabel: 'Ascending',
        trebleEvents: [
          { id: 'w2-m1-t1', pitch: 'C4', midiNumber: 60, duration: 'crotchet', beatValue: 1, hand: 'right', clef: 'treble', fingering: 1 } as NotationNote,
          { id: 'w2-m1-t2', pitch: 'D4', midiNumber: 62, duration: 'crotchet', beatValue: 1, hand: 'right', clef: 'treble', fingering: 2 } as NotationNote,
          { id: 'w2-m1-t3', pitch: 'E4', midiNumber: 64, duration: 'crotchet', beatValue: 1, hand: 'right', clef: 'treble', fingering: 3 } as NotationNote,
          { id: 'w2-m1-t4', pitch: 'F4', midiNumber: 65, duration: 'crotchet', beatValue: 1, hand: 'right', clef: 'treble', fingering: 4 } as NotationNote,
        ],
        bassEvents: [
          { id: 'w2-m1-b1', pitch: 'C3', midiNumber: 48, duration: 'semibreve', beatValue: 4, hand: 'left', clef: 'bass', fingering: 5 } as NotationNote,
        ],
      },
      {
        measureNumber: 2,
        trebleEvents: [
          { id: 'w2-m2-t1', pitch: 'G4', midiNumber: 67, duration: 'semibreve', beatValue: 4, hand: 'right', clef: 'treble', fingering: 5 } as NotationNote,
        ],
        bassEvents: [
          { id: 'w2-m2-b1', pitch: 'C3', midiNumber: 48, duration: 'semibreve', beatValue: 4, hand: 'left', clef: 'bass', fingering: 5 } as NotationNote,
        ],
      },
      {
        measureNumber: 3,
        sectionLabel: 'Descending',
        trebleEvents: [
          { id: 'w2-m3-t1', pitch: 'G4', midiNumber: 67, duration: 'crotchet', beatValue: 1, hand: 'right', clef: 'treble', fingering: 5 } as NotationNote,
          { id: 'w2-m3-t2', pitch: 'F4', midiNumber: 65, duration: 'crotchet', beatValue: 1, hand: 'right', clef: 'treble', fingering: 4 } as NotationNote,
          { id: 'w2-m3-t3', pitch: 'E4', midiNumber: 64, duration: 'crotchet', beatValue: 1, hand: 'right', clef: 'treble', fingering: 3 } as NotationNote,
          { id: 'w2-m3-t4', pitch: 'D4', midiNumber: 62, duration: 'crotchet', beatValue: 1, hand: 'right', clef: 'treble', fingering: 2 } as NotationNote,
        ],
        bassEvents: [
          { id: 'w2-m3-b1', pitch: 'G3', midiNumber: 55, duration: 'semibreve', beatValue: 4, hand: 'left', clef: 'bass', fingering: 1 } as NotationNote,
        ],
      },
      {
        measureNumber: 4,
        trebleEvents: [
          { id: 'w2-m4-t1', pitch: 'C4', midiNumber: 60, duration: 'semibreve', beatValue: 4, hand: 'right', clef: 'treble', fingering: 1 } as NotationNote,
        ],
        bassEvents: [
          { id: 'w2-m4-b1', pitch: 'C3', midiNumber: 48, duration: 'semibreve', beatValue: 4, hand: 'left', clef: 'bass', fingering: 5 } as NotationNote,
        ],
      },
      {
        measureNumber: 5,
        sectionLabel: 'Stepping & Chords',
        trebleEvents: [
          { id: 'w2-m5-t1', pitch: 'C4', midiNumber: 60, duration: 'minim', beatValue: 2, hand: 'right', clef: 'treble', fingering: 1 } as NotationNote,
          { id: 'w2-m5-t2', pitch: 'E4', midiNumber: 64, duration: 'minim', beatValue: 2, hand: 'right', clef: 'treble', fingering: 3 } as NotationNote,
        ],
        bassEvents: [
          { id: 'w2-m5-b1', pitch: 'C3', midiNumber: 48, duration: 'minim', beatValue: 2, hand: 'left', clef: 'bass', fingering: 5 } as NotationNote,
          { id: 'w2-m5-b2', pitch: 'E3', midiNumber: 52, duration: 'minim', beatValue: 2, hand: 'left', clef: 'bass', fingering: 3 } as NotationNote,
        ],
      },
      {
        measureNumber: 6,
        trebleEvents: [
          { id: 'w2-m6-t1', pitch: 'G4', midiNumber: 67, duration: 'semibreve', beatValue: 4, hand: 'right', clef: 'treble', fingering: 5 } as NotationNote,
        ],
        bassEvents: [
          { id: 'w2-m6-b1', pitch: 'G3', midiNumber: 55, duration: 'semibreve', beatValue: 4, hand: 'left', clef: 'bass', fingering: 1 } as NotationNote,
        ],
      },
      {
        measureNumber: 7,
        trebleEvents: [
          { id: 'w2-m7-t1', pitch: 'F4', midiNumber: 65, duration: 'crotchet', beatValue: 1, hand: 'right', clef: 'treble', fingering: 4 } as NotationNote,
          { id: 'w2-m7-t2', pitch: 'E4', midiNumber: 64, duration: 'crotchet', beatValue: 1, hand: 'right', clef: 'treble', fingering: 3 } as NotationNote,
          { id: 'w2-m7-t3', pitch: 'D4', midiNumber: 62, duration: 'minim', beatValue: 2, hand: 'right', clef: 'treble', fingering: 2 } as NotationNote,
        ],
        bassEvents: [
          { id: 'w2-m7-b1', pitch: 'G3', midiNumber: 55, duration: 'semibreve', beatValue: 4, hand: 'left', clef: 'bass', fingering: 1 } as NotationNote,
        ],
      },
      {
        measureNumber: 8,
        repeatEnd: true,
        repeatCount: 2,
        sectionLabel: 'Final C Major Chord',
        // Bar 8 features a real simultaneous C Major Chord in RH and bass C3 in LH!
        trebleEvents: [
          {
            id: 'w2-m8-chord',
            beatValue: 4,
            beatPosition: 1,
            chordSymbol: 'C Major Triad',
            notes: [
              { id: 'w2-m8-c4', pitch: 'C4', midiNumber: 60, duration: 'semibreve', beatValue: 4, hand: 'right', clef: 'treble', fingering: 1 } as NotationNote,
              { id: 'w2-m8-e4', pitch: 'E4', midiNumber: 64, duration: 'semibreve', beatValue: 4, hand: 'right', clef: 'treble', fingering: 3 } as NotationNote,
              { id: 'w2-m8-g4', pitch: 'G4', midiNumber: 67, duration: 'semibreve', beatValue: 4, hand: 'right', clef: 'treble', fingering: 5 } as NotationNote,
            ],
          } as NotationChord,
        ],
        bassEvents: [
          { id: 'w2-m8-b1', pitch: 'C3', midiNumber: 48, duration: 'semibreve', beatValue: 4, hand: 'left', clef: 'bass', fingering: 5 } as NotationNote,
        ],
      },
    ],
  },
];

export function getInteractiveScoreById(id: string): InteractiveScore | undefined {
  return INTERACTIVE_SCORES.find((s) => s.id === id);
}

export function getInteractiveScoreForClass(courseId: string, classNumber: number): InteractiveScore {
  const match = INTERACTIVE_SCORES.find(
    (s) => s.courseId === courseId && s.classNumber === classNumber
  );
  return match || INTERACTIVE_SCORES[0];
}
