import React from 'react';
import { ChordNoteInfo, ScaleNoteInfo } from '../types';

interface InteractiveStaffNotationProps {
  type: 'chord' | 'scale';
  clef?: 'treble' | 'bass';
  chordNotes?: ChordNoteInfo[];
  scaleNotes?: ScaleNoteInfo[];
  activeNoteMidi?: number | null;
  displayMode?: 'block' | 'arpeggio';
  keySignatureName?: string;
  timeSignature?: string;
  className?: string;
}

// Map MIDI note numbers to staff diatonic step offsets relative to Middle C (C4 = 0)
// Diatonic steps: C4 = 0, D4 = 1, E4 = 2, F4 = 3, G4 = 4, A4 = 5, B4 = 6, C5 = 7, etc.
function midiToStaffStep(midiNumber: number): { diatonicStep: number; accidental?: '♯' | '♭' } {
  // Octave relative to octave 4
  const semitonesFromC4 = midiNumber - 60;
  const octaveOffset = Math.floor(semitonesFromC4 / 12);
  const noteIndex = ((semitonesFromC4 % 12) + 12) % 12;

  // Semitone to diatonic mapping for natural/sharp/flat
  // 0: C, 1: C#/Db, 2: D, 3: D#/Eb, 4: E, 5: F, 6: F#/Gb, 7: G, 8: G#/Ab, 9: A, 10: A#/Bb, 11: B
  const mapping: { step: number; accidental?: '♯' | '♭' }[] = [
    { step: 0 },
    { step: 0, accidental: '♯' }, // C#
    { step: 1 },
    { step: 2, accidental: '♭' }, // Eb
    { step: 2 },
    { step: 3 },
    { step: 3, accidental: '♯' }, // F#
    { step: 4 },
    { step: 4, accidental: '♯' }, // G#
    { step: 5 },
    { step: 6, accidental: '♭' }, // Bb
    { step: 6 },
  ];

  const info = mapping[noteIndex] || { step: 0 };
  return {
    diatonicStep: info.step + octaveOffset * 7,
    accidental: info.accidental,
  };
}

export const InteractiveStaffNotation: React.FC<InteractiveStaffNotationProps> = ({
  type,
  clef = 'treble',
  chordNotes = [],
  scaleNotes = [],
  activeNoteMidi = null,
  displayMode = 'block',
  keySignatureName,
  timeSignature = '4/4',
  className = '',
}) => {
  // Staff Geometry
  const staffLineGap = 10; // vertical gap between lines in px
  const staffTopY = 40; // Y-coordinate of top staff line (Line 5)
  // Staff lines are:
  // Line 5 (top) = staffTopY
  // Line 4 = staffTopY + 10
  // Line 3 = staffTopY + 20
  // Line 2 = staffTopY + 30
  // Line 1 (bottom) = staffTopY + 40

  // In Treble clef:
  // Line 1 is E4 (diatonicStep = 2). Each diatonic step is staffLineGap / 2 = 5px upward.
  // So Y for diatonic step in Treble = (staffTopY + 40) - (diatonicStep - 2) * 5
  // For C4 (diatonicStep 0): Y = staffTopY + 40 - (-2 * 5) = staffTopY + 50 (1 ledger line below bottom line)

  // In Bass clef:
  // Line 1 is G2. G2 = midi 43. Middle C (C4) = midi 60 (diatonicStep 0).
  // C4 in Bass clef is 1 ledger line ABOVE line 5 (Y = staffTopY - 10).
  // Diatonic steps from C4: Line 5 in bass is A3 (diatonicStep -2).
  // Y for diatonic step in Bass = staffTopY - (diatonicStep) * 5 - 10

  const getYForMidi = (midi: number): number => {
    const { diatonicStep } = midiToStaffStep(midi);
    if (clef === 'treble') {
      const e4Y = staffTopY + 40; // Line 1
      const e4Diatonic = 2; // E4
      return e4Y - (diatonicStep - e4Diatonic) * (staffLineGap / 2);
    } else {
      // Bass clef: C4 is 1 ledger line above top line (staffTopY - 10)
      const c4Y = staffTopY - 10;
      return c4Y - diatonicStep * (staffLineGap / 2);
    }
  };

  // Determine width based on type and number of notes
  const totalNotes = type === 'chord' && displayMode === 'block' ? 1 : type === 'chord' ? chordNotes.length : scaleNotes.length;
  const svgWidth = Math.max(340, 90 + totalNotes * 45 + 50);
  const svgHeight = 120;

  return (
    <div className={`w-full overflow-x-auto select-none py-1 flex items-center justify-center ${className}`}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full max-w-full h-auto text-current"
        style={{ minWidth: '320px', maxHeight: '135px' }}
      >
        {/* Background Subtle Canvas */}
        <rect
          x="2"
          y="2"
          width={svgWidth - 4}
          height={svgHeight - 4}
          rx="12"
          className="fill-[#081F5C]/[0.03] dark:fill-white/[0.03] stroke-[#081F5C]/10 dark:stroke-white/10"
        />

        {/* 5 Staff Lines */}
        {[0, 1, 2, 3, 4].map((lineIndex) => {
          const y = staffTopY + lineIndex * staffLineGap;
          return (
            <line
              key={`staff-line-${lineIndex}`}
              x1="20"
              y1={y}
              x2={svgWidth - 20}
              y2={y}
              stroke="currentColor"
              strokeWidth="1.2"
              className="opacity-75 dark:opacity-80"
            />
          );
        })}

        {/* Staff Start Bar Line */}
        <line
          x1="24"
          y1={staffTopY}
          x2="24"
          y2={staffTopY + 40}
          stroke="currentColor"
          strokeWidth="2"
          className="opacity-80"
        />

        {/* Clef Sign */}
        {clef === 'treble' ? (
          <g transform={`translate(28, ${staffTopY - 8}) scale(0.6)`}>
            {/* Elegant SVG Treble Clef path */}
            <path
              d="M18,65 C14,65 9,60 11,50 C12,42 18,37 23,32 C26,29 27,24 26,17 C25,10 21,3 18,0 C17,1 17,4 18,8 C19,13 18,20 15,26 C12,32 5,39 4,49 C2,61 10,71 20,71 C22,71 24,70 25,69 L25,76 C25,82 22,86 18,87 C15,87 13,85 13,83 C13,81 15,80 16,80 C18,80 19,82 18,84 C19,85 20,85 21,83 C22,81 22,77 22,74 L22,66 C19,65 18,65 18,65 Z M19,45 C15,45 13,49 14,54 C15,58 19,60 21,58 C21,52 20,47 19,45 Z"
              fill="currentColor"
              className="opacity-90"
            />
          </g>
        ) : (
          <g transform={`translate(28, ${staffTopY + 2}) scale(0.65)`}>
            {/* Bass Clef */}
            <path
              d="M12,5 C6,5 2,9 2,16 C2,23 7,29 14,29 C21,29 26,23 26,16 C26,8 20,2 12,2 C6,2 0,7 0,15 C0,26 10,34 20,38 L21,36 C12,32 4,24 4,15 C4,8 8,4 12,4 C17,4 21,8 21,15 C21,20 18,25 13,25 C9,25 6,21 6,16 C6,11 9,8 12,8 C13,8 14,9 14,10 C14,11 13,12 12,12 C11,12 10,11 10,10 C10,9 11,8 12,8 Z"
              fill="currentColor"
              className="opacity-90"
            />
            <circle cx="28" cy="11" r="2.5" fill="currentColor" />
            <circle cx="28" cy="21" r="2.5" fill="currentColor" />
          </g>
        )}

        {/* Time Signature */}
        <g transform="translate(68, 40)" className="font-serif font-bold text-xs">
          <text x="0" y="16" fill="currentColor" fontSize="15" textAnchor="middle" className="font-mono">
            {timeSignature.split('/')[0] || '4'}
          </text>
          <text x="0" y="34" fill="currentColor" fontSize="15" textAnchor="middle" className="font-mono">
            {timeSignature.split('/')[1] || '4'}
          </text>
        </g>

        {/* Key Signature / Title Indicator */}
        {keySignatureName && (
          <text
            x={svgWidth - 24}
            y="22"
            fill="currentColor"
            fontSize="10"
            textAnchor="end"
            className="opacity-60 font-mono tracking-tight"
          >
            {keySignatureName}
          </text>
        )}

        {/* NOTES RENDERING */}
        {type === 'chord' && displayMode === 'block' ? (
          // Block chord: All notes aligned at the same X
          (() => {
            const chordX = 140;
            return (
              <g key="block-chord-group">
                {chordNotes.map((n, idx) => {
                  const noteY = getYForMidi(n.midiNumber);
                  const isNoteActive = activeNoteMidi === n.midiNumber;
                  const needsLedgerBelow = noteY >= staffTopY + 50; // C4 or below
                  const needsLedgerAbove = noteY <= staffTopY - 10; // A5 or above

                  return (
                    <g key={`chord-note-${idx}-${n.pitch}`}>
                      {/* Ledger Lines */}
                      {needsLedgerBelow && (
                        <line
                          x1={chordX - 14}
                          y1={staffTopY + 50}
                          x2={chordX + 14}
                          y2={staffTopY + 50}
                          stroke="currentColor"
                          strokeWidth="1.2"
                          className="opacity-80"
                        />
                      )}
                      {needsLedgerAbove && (
                        <line
                          x1={chordX - 14}
                          y1={staffTopY - 10}
                          x2={chordX + 14}
                          y2={staffTopY - 10}
                          stroke="currentColor"
                          strokeWidth="1.2"
                          className="opacity-80"
                        />
                      )}

                      {/* Accidental if present */}
                      {n.accidental && (
                        <text
                          x={chordX - 18}
                          y={noteY + 4}
                          fontSize="14"
                          fill="currentColor"
                          className="font-serif font-bold text-[#C5A869]"
                        >
                          {n.accidental}
                        </text>
                      )}

                      {/* Notehead (Rotated ellipse) */}
                      <ellipse
                        cx={chordX}
                        cy={noteY}
                        rx="6.5"
                        ry="4.8"
                        transform={`rotate(-22 ${chordX} ${noteY})`}
                        className={`transition-all duration-150 ${
                          isNoteActive
                            ? 'fill-[#22C55E] stroke-[#22C55E]'
                            : 'fill-current'
                        }`}
                      />

                      {/* Pitch Label underneath / to right */}
                      <text
                        x={chordX + 16}
                        y={noteY + 3.5}
                        fontSize="10"
                        fill="currentColor"
                        className={`font-mono font-bold ${
                          isNoteActive ? 'fill-[#22C55E]' : 'opacity-70'
                        }`}
                      >
                        {n.letter}
                      </text>
                    </g>
                  );
                })}

                {/* Common Chord Stem */}
                {chordNotes.length > 0 && (() => {
                  const sortedNotes = [...chordNotes].sort((a, b) => a.midiNumber - b.midiNumber);
                  const lowestY = getYForMidi(sortedNotes[0].midiNumber);
                  const highestY = getYForMidi(sortedNotes[sortedNotes.length - 1].midiNumber);
                  const stemX = chordX + 6;
                  return (
                    <line
                      x1={stemX}
                      y1={lowestY}
                      x2={stemX}
                      y2={Math.min(highestY - 26, staffTopY - 8)}
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="opacity-90"
                    />
                  );
                })()}
              </g>
            );
          })()
        ) : type === 'chord' && displayMode === 'arpeggio' ? (
          // Arpeggiated Chord
          chordNotes.map((n, idx) => {
            const noteX = 110 + idx * 48;
            const noteY = getYForMidi(n.midiNumber);
            const isNoteActive = activeNoteMidi === n.midiNumber;
            const needsLedgerBelow = noteY >= staffTopY + 50;

            return (
              <g key={`arp-note-${idx}-${n.pitch}`}>
                {needsLedgerBelow && (
                  <line
                    x1={noteX - 12}
                    y1={staffTopY + 50}
                    x2={noteX + 12}
                    y2={staffTopY + 50}
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                )}
                {n.accidental && (
                  <text
                    x={noteX - 14}
                    y={noteY + 4}
                    fontSize="13"
                    fill="currentColor"
                    className="font-serif font-bold text-[#C5A869]"
                  >
                    {n.accidental}
                  </text>
                )}
                <ellipse
                  cx={noteX}
                  cy={noteY}
                  rx="6"
                  ry="4.5"
                  transform={`rotate(-22 ${noteX} ${noteY})`}
                  className={`transition-all duration-150 ${
                    isNoteActive ? 'fill-[#22C55E]' : 'fill-current'
                  }`}
                />
                <line
                  x1={noteX + 5.5}
                  y1={noteY}
                  x2={noteX + 5.5}
                  y2={noteY - 24}
                  stroke="currentColor"
                  strokeWidth="1.3"
                  className="opacity-90"
                />
                <text
                  x={noteX}
                  y={staffTopY + 58}
                  fontSize="10"
                  textAnchor="middle"
                  fill="currentColor"
                  className={`font-mono font-bold ${
                    isNoteActive ? 'fill-[#22C55E]' : 'opacity-70'
                  }`}
                >
                  {n.letter}
                </text>
              </g>
            );
          })
        ) : (
          // Scale Notes (Sequential Left-to-Right)
          scaleNotes.map((n, idx) => {
            const noteX = 105 + idx * 36;
            const noteY = getYForMidi(n.midiNumber);
            const isNoteActive = activeNoteMidi === n.midiNumber;
            const needsLedgerBelow = noteY >= staffTopY + 50;
            const needsLedgerAbove = noteY <= staffTopY - 10;

            return (
              <g key={`scale-note-${idx}-${n.pitch}`}>
                {/* Bar line every 4 notes */}
                {idx > 0 && idx % 4 === 0 && (
                  <line
                    x1={noteX - 18}
                    y1={staffTopY}
                    x2={noteX - 18}
                    y2={staffTopY + 40}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="opacity-40"
                  />
                )}

                {/* Ledger Lines */}
                {needsLedgerBelow && (
                  <line
                    x1={noteX - 11}
                    y1={staffTopY + 50}
                    x2={noteX + 11}
                    y2={staffTopY + 50}
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                )}
                {needsLedgerAbove && (
                  <line
                    x1={noteX - 11}
                    y1={staffTopY - 10}
                    x2={noteX + 11}
                    y2={staffTopY - 10}
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                )}

                {/* Accidental */}
                {n.accidental && (
                  <text
                    x={noteX - 14}
                    y={noteY + 4}
                    fontSize="13"
                    fill="currentColor"
                    className="font-serif font-bold text-[#C5A869]"
                  >
                    {n.accidental}
                  </text>
                )}

                {/* Notehead */}
                <ellipse
                  cx={noteX}
                  cy={noteY}
                  rx="5.8"
                  ry="4.4"
                  transform={`rotate(-22 ${noteX} ${noteY})`}
                  className={`transition-all duration-150 ${
                    isNoteActive
                      ? 'fill-[#22C55E] stroke-[#22C55E]'
                      : 'fill-current'
                  }`}
                />

                {/* Stem */}
                <line
                  x1={noteX + 5.5}
                  y1={noteY}
                  x2={noteX + 5.5}
                  y2={noteY - 24}
                  stroke="currentColor"
                  strokeWidth="1.3"
                  className="opacity-90"
                />

                {/* Fingering indicator above note if available */}
                {n.fingeringRightHand && (
                  <text
                    x={noteX + 5.5}
                    y={noteY - 28}
                    fontSize="9"
                    textAnchor="middle"
                    fill="currentColor"
                    className="font-mono font-bold text-[#C5A869]"
                  >
                    {n.fingeringRightHand}
                  </text>
                )}

                {/* Note Letter Name below */}
                <text
                  x={noteX}
                  y={staffTopY + 56}
                  fontSize="10"
                  textAnchor="middle"
                  fill="currentColor"
                  className={`font-mono font-bold ${
                    isNoteActive ? 'fill-[#22C55E]' : 'opacity-75'
                  }`}
                >
                  {n.letter}
                </text>
              </g>
            );
          })
        )}

        {/* Final Double Bar Line */}
        <line
          x1={svgWidth - 28}
          y1={staffTopY}
          x2={svgWidth - 28}
          y2={staffTopY + 40}
          stroke="currentColor"
          strokeWidth="1"
          className="opacity-80"
        />
        <line
          x1={svgWidth - 24}
          y1={staffTopY}
          x2={svgWidth - 24}
          y2={staffTopY + 40}
          stroke="currentColor"
          strokeWidth="2.5"
          className="opacity-90"
        />
      </svg>
    </div>
  );
};
