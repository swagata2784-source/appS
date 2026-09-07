import React, { useRef, useEffect, useMemo } from 'react';
import {
  InteractiveScore,
  NotationNote,
  NotationChord,
  HandSelection,
  Language,
  Theme,
} from '../types';

export interface FlattenedMusicalEvent {
  id: string;
  measureNumber: number;
  beatPosition: number;
  beatDuration: number;
  isChord: boolean;
  notes: NotationNote[];
  expectedMidis: number[];
  pitchesDisplay: string[];
  hand: 'left' | 'right' | 'both';
  clef: 'treble' | 'bass';
  isRest: boolean;
  chordSymbol?: string;
  fingering?: string;
  sectionLabel?: string;
}

interface MusicalStaffNotationProps {
  score: InteractiveScore;
  selectedHand: HandSelection;
  timeSignature: string;
  customBeats?: number;
  activeEventIndex: number;
  currentExpectedEvent: FlattenedMusicalEvent | null;
  feedbackStatus: 'idle' | 'correct' | 'wrong';
  isLooping: boolean;
  loopStartBar: number;
  loopEndBar: number;
  isPlaying: boolean;
  currentBeat: number;
  onSelectMeasure?: (measureNumber: number) => void;
  lang: Language;
  theme: Theme;
}

// -------------------------------------------------------------
// MUSIC THEORY COORDINATE MAPPER
// Staff line spacing: 10px. 5 lines per staff (span 40px).
// Treble: Top line = F5 (y=10), Bottom line = E4 (y=50). Middle C (C4) = y=60 (ledger line).
// Bass: Top line = A3 (y=110), Bottom line = G2 (y=150). Middle C (C4) = y=100 (ledger line).
// -------------------------------------------------------------

const TREBLE_TOP_LINE_Y = 15; // F5
const BASS_TOP_LINE_Y = 105; // A3

// Maps pitch (e.g. "C4", "D4", "F#4") to Y coordinate and ledger line requirements
function getNoteStaffPosition(pitch: string, clef: 'treble' | 'bass'): {
  y: number;
  ledgerLines: number[]; // Y coordinates of ledger lines needed
  accidental?: string;
} {
  const cleanPitch = pitch.toUpperCase().trim();
  let step = cleanPitch.charAt(0);
  let accidental = '';
  let octave = 4;

  if (cleanPitch.includes('#')) {
    accidental = '♯';
    octave = parseInt(cleanPitch.slice(2), 10) || 4;
  } else if (cleanPitch.includes('B') && cleanPitch.length > 2 && cleanPitch[1] === 'B') {
    accidental = '♭';
    octave = parseInt(cleanPitch.slice(2), 10) || 4;
  } else {
    octave = parseInt(cleanPitch.slice(1), 10) || 4;
  }

  // Diatonic scale degree number: C0 = 0, D0 = 1, E0 = 2, F0 = 3, G0 = 4, A0 = 5, B0 = 6
  const stepIndices: Record<string, number> = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  const diatonicIndex = octave * 7 + (stepIndices[step] ?? 0);

  // Reference notes:
  // Treble: F5 = octave 5, step F (5*7 + 3 = 38). At y = TREBLE_TOP_LINE_Y (15).
  // Bass: A3 = octave 3, step A (3*7 + 5 = 26). At y = BASS_TOP_LINE_Y (105).
  let y = 0;
  const ledgerLines: number[] = [];

  if (clef === 'treble') {
    const refF5 = 5 * 7 + 3; // 38
    const stepDiff = refF5 - diatonicIndex; // positive if lower than F5
    y = TREBLE_TOP_LINE_Y + stepDiff * 5;

    // Treble lines: 15 (F5), 25 (D5), 35 (B4), 45 (G4), 55 (E4)
    // Ledger lines below treble (E4 is line 1 at y=55):
    // C4 (Middle C) is at y=65 (ledger line 1 below: y=65)
    // A3 is at y=75 (ledger lines at y=65, y=75)
    if (y >= 65) {
      for (let ly = 65; ly <= y; ly += 10) {
        ledgerLines.push(ly);
      }
    }
    // Ledger lines above treble (F5 is line 5 at y=15):
    // A5 is at y=5 (ledger line 1 above: y=5)
    // C6 is at y=-5 (ledger lines at y=5, y=-5)
    if (y <= 5) {
      for (let ly = 5; ly >= y; ly -= 10) {
        ledgerLines.push(ly);
      }
    }
  } else {
    // Bass clef
    const refA3 = 3 * 7 + 5; // 26
    const stepDiff = refA3 - diatonicIndex;
    y = BASS_TOP_LINE_Y + stepDiff * 5;

    // Bass lines: 105 (A3), 115 (F3), 125 (D3), 135 (B2), 145 (G2)
    // Ledger lines above bass (A3 is line 5 at y=105):
    // C4 (Middle C) is at y=95 (ledger line 1 above: y=95)
    // E4 is at y=85 (ledger lines at y=95, y=85)
    if (y <= 95) {
      for (let ly = 95; ly >= y; ly -= 10) {
        ledgerLines.push(ly);
      }
    }
    // Ledger lines below bass (G2 is line 1 at y=145):
    // E2 is at y=155 (ledger line 1 below: y=155)
    // C2 is at y=165 (ledger lines at y=155, y=165)
    if (y >= 155) {
      for (let ly = 155; ly <= y; ly += 10) {
        ledgerLines.push(ly);
      }
    }
  }

  return { y, ledgerLines, accidental: accidental || undefined };
}

export const MusicalStaffNotation: React.FC<MusicalStaffNotationProps> = ({
  score,
  selectedHand,
  timeSignature,
  customBeats = 4,
  activeEventIndex,
  currentExpectedEvent,
  feedbackStatus,
  isLooping,
  loopStartBar,
  loopEndBar,
  isPlaying,
  currentBeat,
  onSelectMeasure,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const activeNoteRef = useRef<SVGGElement | null>(null);

  const showTreble = selectedHand === 'right' || selectedHand === 'both';
  const showBass = selectedHand === 'left' || selectedHand === 'both';
  const isGrandStaff = showTreble && showBass;

  // ViewBox dimensions
  // Standard measure width: 180px. Key/Clef header: 85px.
  const MEASURE_WIDTH = 190;
  const HEADER_WIDTH = 80;
  const totalSvgWidth = HEADER_WIDTH + score.measures.length * MEASURE_WIDTH + 40;

  // Height:
  // Treble only: ~110px. Bass only: ~110px. Grand staff: ~210px.
  const svgHeight = isGrandStaff ? 200 : showTreble ? 115 : 115;
  const trebleOffset = showTreble ? 0 : 0;
  const bassOffset = showBass ? (showTreble ? 0 : -90) : 0;

  // Colors
  const staffLineColor = isDark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(8, 31, 92, 0.35)';
  const barLineColor = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(8, 31, 92, 0.5)';
  const noteHeadFill = isDark ? '#F7F2EB' : '#081F5C';
  const ledgerColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(8, 31, 92, 0.8)';
  const goldAccent = '#C5A869';

  // Parse time signature numerator & denominator
  const [timeSigNum, timeSigDenom] = useMemo(() => {
    if (timeSignature === 'Custom') {
      return [customBeats.toString(), '4'];
    }
    const parts = timeSignature.split('/');
    return [parts[0] || '4', parts[1] || '4'];
  }, [timeSignature, customBeats]);

  // Key Signature sharps / flats count and positions
  const keyAccidentals = useMemo(() => {
    const key = (score.keySignature || 'C Major').toLowerCase();
    if (key.includes('g major') || key.includes('e minor')) {
      return [{ note: 'F#', trebleY: 15, bassY: 115 }]; // F# on top line treble, 4th line bass
    }
    if (key.includes('d major') || key.includes('b minor')) {
      return [
        { note: 'F#', trebleY: 15, bassY: 115 },
        { note: 'C#', trebleY: 30, bassY: 130 },
      ];
    }
    if (key.includes('f major') || key.includes('d minor')) {
      return [{ note: 'Bb', trebleY: 35, bassY: 135 }]; // Bb on middle line treble, 2nd line bass
    }
    return []; // C Major = natural
  }, [score.keySignature]);

  // Find X coordinate of the currently active expected event
  const currentCursorX = useMemo(() => {
    if (!currentExpectedEvent) return null;
    const mIdx = score.measures.findIndex(
      (m) => m.measureNumber === currentExpectedEvent.measureNumber
    );
    if (mIdx === -1) return null;

    const measureStartX = HEADER_WIDTH + mIdx * MEASURE_WIDTH;
    // Beat position usually 1.0, 2.0, 3.0 etc.
    const beatsInMeasure = parseInt(timeSigNum, 10) || 4;
    const beatFraction = Math.max(0, (currentExpectedEvent.beatPosition - 1) / beatsInMeasure);
    const eventX = measureStartX + 30 + beatFraction * (MEASURE_WIDTH - 50);

    return eventX;
  }, [currentExpectedEvent, score.measures, timeSigNum]);

  // Auto-scroll horizontal container when active note moves
  useEffect(() => {
    if (currentCursorX !== null && containerRef.current) {
      const container = containerRef.current;
      const targetScroll = currentCursorX - container.clientWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [currentCursorX]);

  return (
    <div className="w-full select-none">
      {/* Staff Notation Frame */}
      <div
        ref={containerRef}
        className={`w-full overflow-x-auto rounded-2xl border transition-colors shadow-inner relative ${
          isDark
            ? 'bg-[#060F26] border-white/15'
            : 'bg-[#FAF8F5] border-[#081F5C]/20'
        }`}
        style={{ scrollbarWidth: 'thin' }}
      >
        <svg
          width={totalSvgWidth}
          height={svgHeight}
          className="block mx-auto min-w-full font-serif"
          viewBox={`0 0 ${totalSvgWidth} ${svgHeight}`}
        >
          <defs>
            {/* Soft pulsing glow for target note */}
            <filter id="note-glow-gold" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#C5A869" floodOpacity="0.85" />
            </filter>
            <filter id="note-glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#10B981" floodOpacity="0.9" />
            </filter>
            <filter id="note-glow-rose" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4.5" floodColor="#EF4444" floodOpacity="0.9" />
            </filter>
          </defs>

          {/* ======================================================== */}
          {/* 1. CONTINUOUS HORIZONTAL 5-LINE STAVES & BRACE */}
          {/* ======================================================== */}
          <g id="staff-lines">
            {/* Grand Staff Left Connectors & Curly Brace */}
            {isGrandStaff && (
              <g id="grand-staff-brace">
                {/* Thick vertical line connecting treble and bass on far left */}
                <line
                  x1={18}
                  y1={TREBLE_TOP_LINE_Y}
                  x2={18}
                  y2={BASS_TOP_LINE_Y + 40}
                  stroke={barLineColor}
                  strokeWidth="3.5"
                />
                {/* Curly bracket / brace outline */}
                <path
                  d={`M 18 ${TREBLE_TOP_LINE_Y} C 8 ${(TREBLE_TOP_LINE_Y + 20)}, 10 ${(TREBLE_TOP_LINE_Y + BASS_TOP_LINE_Y + 40) / 2 - 10}, 4 ${(TREBLE_TOP_LINE_Y + BASS_TOP_LINE_Y + 40) / 2} C 10 ${(TREBLE_TOP_LINE_Y + BASS_TOP_LINE_Y + 40) / 2 + 10}, 8 ${(BASS_TOP_LINE_Y + 20)}, 18 ${BASS_TOP_LINE_Y + 40}`}
                  fill="none"
                  stroke={goldAccent}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* Treble 5 Lines: 15, 25, 35, 45, 55 */}
            {showTreble &&
              [0, 1, 2, 3, 4].map((i) => {
                const y = TREBLE_TOP_LINE_Y + i * 10;
                return (
                  <line
                    key={`treble-line-${i}`}
                    x1={20}
                    y1={y}
                    x2={totalSvgWidth - 20}
                    y2={y}
                    stroke={staffLineColor}
                    strokeWidth="1.2"
                  />
                );
              })}

            {/* Bass 5 Lines: 105, 115, 125, 135, 145 */}
            {showBass &&
              [0, 1, 2, 3, 4].map((i) => {
                const y = BASS_TOP_LINE_Y + bassOffset + i * 10;
                return (
                  <line
                    key={`bass-line-${i}`}
                    x1={20}
                    y1={y}
                    x2={totalSvgWidth - 20}
                    y2={y}
                    stroke={staffLineColor}
                    strokeWidth="1.2"
                  />
                );
              })}
          </g>

          {/* ======================================================== */}
          {/* 2. HEADER: CLEFS, KEY SIGNATURE & TIME SIGNATURE */}
          {/* ======================================================== */}
          <g id="staff-header">
            {/* Treble Clef Symbol (𝄞) */}
            {showTreble && (
              <g transform="translate(25, 52)">
                <text
                  x="0"
                  y="0"
                  fontSize="46"
                  fill={isDark ? '#93C5FD' : '#1D4ED8'}
                  textAnchor="middle"
                  className="font-music font-normal select-none pointer-events-none"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  𝄞
                </text>
                <title>Treble Clef (G-Clef)</title>
              </g>
            )}

            {/* Bass Clef Symbol (𝄢) */}
            {showBass && (
              <g transform={`translate(25, ${136 + bassOffset})`}>
                <text
                  x="0"
                  y="0"
                  fontSize="38"
                  fill={isDark ? '#FCD34D' : '#B45309'}
                  textAnchor="middle"
                  className="font-music font-normal select-none pointer-events-none"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  𝄢
                </text>
                <title>Bass Clef (F-Clef)</title>
              </g>
            )}

            {/* Key Signature Accidentals */}
            {keyAccidentals.map((acc, idx) => (
              <g key={`key-acc-${idx}`}>
                {showTreble && (
                  <text
                    x={46 + idx * 8}
                    y={acc.trebleY + 4}
                    fontSize="13"
                    fontWeight="bold"
                    fill={isDark ? '#F7F2EB' : '#081F5C'}
                    textAnchor="middle"
                  >
                    {acc.note.includes('#') ? '♯' : '♭'}
                  </text>
                )}
                {showBass && (
                  <text
                    x={46 + idx * 8}
                    y={acc.bassY + bassOffset + 4}
                    fontSize="13"
                    fontWeight="bold"
                    fill={isDark ? '#F7F2EB' : '#081F5C'}
                    textAnchor="middle"
                  >
                    {acc.note.includes('#') ? '♯' : '♭'}
                  </text>
                )}
              </g>
            ))}

            {/* Time Signature Numerator & Denominator */}
            {showTreble && (
              <g
                transform={`translate(${62 + keyAccidentals.length * 8}, 0)`}
                className="font-serif font-bold text-center"
              >
                <text
                  x="0"
                  y={TREBLE_TOP_LINE_Y + 16}
                  fontSize="17"
                  fontWeight="bold"
                  fill={isDark ? '#F7F2EB' : '#081F5C'}
                  textAnchor="middle"
                >
                  {timeSigNum}
                </text>
                <text
                  x="0"
                  y={TREBLE_TOP_LINE_Y + 36}
                  fontSize="17"
                  fontWeight="bold"
                  fill={isDark ? '#F7F2EB' : '#081F5C'}
                  textAnchor="middle"
                >
                  {timeSigDenom}
                </text>
              </g>
            )}

            {showBass && (
              <g
                transform={`translate(${62 + keyAccidentals.length * 8}, ${bassOffset})`}
                className="font-serif font-bold text-center"
              >
                <text
                  x="0"
                  y={BASS_TOP_LINE_Y + 16}
                  fontSize="17"
                  fontWeight="bold"
                  fill={isDark ? '#F7F2EB' : '#081F5C'}
                  textAnchor="middle"
                >
                  {timeSigNum}
                </text>
                <text
                  x="0"
                  y={BASS_TOP_LINE_Y + 36}
                  fontSize="17"
                  fontWeight="bold"
                  fill={isDark ? '#F7F2EB' : '#081F5C'}
                  textAnchor="middle"
                >
                  {timeSigDenom}
                </text>
              </g>
            )}
          </g>

          {/* ======================================================== */}
          {/* 3. MEASURES, BARLINES, NOTES, RESTS, AND CHORDS */}
          {/* ======================================================== */}
          {score.measures.map((measure, mIdx) => {
            const mStartX = HEADER_WIDTH + mIdx * MEASURE_WIDTH;
            const mEndX = mStartX + MEASURE_WIDTH;
            const isMeasureInLoop =
              !isLooping ||
              (measure.measureNumber >= loopStartBar && measure.measureNumber <= loopEndBar);
            const isCurrentMeasure =
              currentExpectedEvent?.measureNumber === measure.measureNumber;

            // Compute total beats in measure
            const beatsInMeasure = parseInt(timeSigNum, 10) || 4;

            return (
              <g
                key={`svg-measure-${measure.measureNumber}`}
                id={`svg-measure-${measure.measureNumber}`}
                onClick={() => onSelectMeasure && onSelectMeasure(measure.measureNumber)}
                className="cursor-pointer transition-opacity"
                opacity={isMeasureInLoop ? 1 : 0.4}
              >
                {/* Measure Background Tint if Active / Current */}
                {isCurrentMeasure && (
                  <rect
                    x={mStartX}
                    y={showTreble ? TREBLE_TOP_LINE_Y - 8 : BASS_TOP_LINE_Y + bassOffset - 8}
                    width={MEASURE_WIDTH}
                    height={
                      isGrandStaff
                        ? BASS_TOP_LINE_Y + 48 - (TREBLE_TOP_LINE_Y - 8)
                        : 56
                    }
                    fill={goldAccent}
                    fillOpacity={isDark ? '0.08' : '0.07'}
                    rx="6"
                  />
                )}

                {/* Measure Number Label above staff */}
                <text
                  x={mStartX + 8}
                  y={showTreble ? TREBLE_TOP_LINE_Y - 5 : BASS_TOP_LINE_Y + bassOffset - 5}
                  fontSize="10"
                  fontWeight="bold"
                  fill={isCurrentMeasure ? goldAccent : isDark ? '#A0AEC0' : '#4A5568'}
                  className="font-sans"
                >
                  Bar {measure.measureNumber}
                </text>

                {/* Section label if present */}
                {measure.sectionLabel && (
                  <text
                    x={mStartX + 46}
                    y={showTreble ? TREBLE_TOP_LINE_Y - 5 : BASS_TOP_LINE_Y + bassOffset - 5}
                    fontSize="9"
                    fill={goldAccent}
                    className="font-sans"
                  >
                    {measure.sectionLabel}
                  </text>
                )}

                {/* First / Second Ending Bracket */}
                {measure.firstEnding && (
                  <path
                    d={`M ${mStartX + 2} ${TREBLE_TOP_LINE_Y - 12} L ${mEndX - 2} ${TREBLE_TOP_LINE_Y - 12} L ${mEndX - 2} ${TREBLE_TOP_LINE_Y - 6}`}
                    fill="none"
                    stroke={goldAccent}
                    strokeWidth="1.5"
                  />
                )}
                {measure.firstEnding && (
                  <text
                    x={mStartX + 6}
                    y={TREBLE_TOP_LINE_Y - 14}
                    fontSize="9"
                    fontWeight="bold"
                    fill={goldAccent}
                  >
                    1.
                  </text>
                )}

                {/* Repeat Start Markings (|:) */}
                {measure.repeatStart && (
                  <g>
                    <line
                      x1={mStartX + 2}
                      y1={showTreble ? TREBLE_TOP_LINE_Y : BASS_TOP_LINE_Y + bassOffset}
                      x2={mStartX + 2}
                      y2={showBass ? BASS_TOP_LINE_Y + bassOffset + 40 : TREBLE_TOP_LINE_Y + 40}
                      stroke={barLineColor}
                      strokeWidth="3.5"
                    />
                    <circle
                      cx={mStartX + 8}
                      cy={showTreble ? TREBLE_TOP_LINE_Y + 15 : BASS_TOP_LINE_Y + bassOffset + 15}
                      r="2"
                      fill={goldAccent}
                    />
                    <circle
                      cx={mStartX + 8}
                      cy={showTreble ? TREBLE_TOP_LINE_Y + 25 : BASS_TOP_LINE_Y + bassOffset + 25}
                      r="2"
                      fill={goldAccent}
                    />
                  </g>
                )}

                {/* Treble Events (Right Hand) */}
                {showTreble &&
                  measure.trebleEvents.map((tItem, tIdx) => {
                    const isNote = !('notes' in tItem);
                    const note = isNote ? (tItem as NotationNote) : null;
                    const chord = !isNote ? (tItem as NotationChord) : null;

                    // Beat fraction calculation
                    const beatPosition = (tItem as any).beatPosition || (tIdx === 0 ? 1 : 1 + tIdx * 2);
                    const beatFrac = Math.max(0, (beatPosition - 1) / beatsInMeasure);
                    const eventX = mStartX + 30 + beatFrac * (MEASURE_WIDTH - 55);

                    const isTarget =
                      currentExpectedEvent?.measureNumber === measure.measureNumber &&
                      (currentExpectedEvent.id === (tItem as any).id ||
                        currentExpectedEvent.notes.some((n) => n.id === (tItem as any).id));

                    // Rests
                    if (note?.isRest) {
                      return (
                        <g key={`treble-rest-${tIdx}`}>
                          {note.duration === 'semibreve' ? (
                            // Whole rest hangs from line 4 (y=25)
                            <rect
                              x={eventX - 6}
                              y={TREBLE_TOP_LINE_Y + 10}
                              width="12"
                              height="6"
                              fill={noteHeadFill}
                            />
                          ) : note.duration === 'minim' ? (
                            // Half rest sits on line 3 (y=35)
                            <rect
                              x={eventX - 6}
                              y={TREBLE_TOP_LINE_Y + 14}
                              width="12"
                              height="6"
                              fill={noteHeadFill}
                            />
                          ) : (
                            // Quarter rest glyph
                            <text
                              x={eventX}
                              y={TREBLE_TOP_LINE_Y + 28}
                              fontSize="22"
                              textAnchor="middle"
                              fill={noteHeadFill}
                              opacity="0.75"
                            >
                              𝄽
                            </text>
                          )}
                          <text
                            x={eventX}
                            y={TREBLE_TOP_LINE_Y + 48}
                            fontSize="8"
                            textAnchor="middle"
                            fill={isDark ? '#A0AEC0' : '#718096'}
                            className="font-sans"
                          >
                            Rest
                          </text>
                        </g>
                      );
                    }

                    // Notes or Chord
                    const noteList: NotationNote[] = chord ? chord.notes : note ? [note] : [];
                    const isWholeNote = noteList.some((n) => n.duration === 'semibreve');
                    const isHalfNote = noteList.some((n) => n.duration === 'minim');
                    const isEighth = noteList.some((n) => n.duration === 'quaver');

                    // Filter glow ID
                    const glowFilter =
                      isTarget && feedbackStatus === 'correct'
                        ? 'url(#note-glow-emerald)'
                        : isTarget && feedbackStatus === 'wrong'
                        ? 'url(#note-glow-rose)'
                        : isTarget
                        ? 'url(#note-glow-gold)'
                        : undefined;

                    return (
                      <g
                        key={`treble-note-${tIdx}`}
                        id={`treble-ev-${(tItem as any).id}`}
                        filter={glowFilter}
                      >
                        {/* Target highlight ring */}
                        {isTarget && (
                          <ellipse
                            cx={eventX}
                            cy={getNoteStaffPosition(noteList[0].pitch, 'treble').y}
                            rx="14"
                            ry="11"
                            fill="none"
                            stroke={
                              feedbackStatus === 'correct'
                                ? '#10B981'
                                : feedbackStatus === 'wrong'
                                ? '#EF4444'
                                : goldAccent
                            }
                            strokeWidth="2.5"
                            strokeDasharray={feedbackStatus === 'wrong' ? '3,2' : undefined}
                            className={isPlaying ? 'animate-pulse' : ''}
                          />
                        )}

                        {/* Render Noteheads in chord or single note */}
                        {noteList.map((n, nIdx) => {
                          const pos = getNoteStaffPosition(n.pitch, 'treble');

                          return (
                            <g key={`t-head-${nIdx}`}>
                              {/* Ledger Lines */}
                              {pos.ledgerLines.map((ly, lIdx) => (
                                <line
                                  key={`t-ledger-${lIdx}`}
                                  x1={eventX - 11}
                                  y1={ly}
                                  x2={eventX + 11}
                                  y2={ly}
                                  stroke={ledgerColor}
                                  strokeWidth="1.5"
                                />
                              ))}

                              {/* Accidental (# or b) */}
                              {pos.accidental && (
                                <text
                                  x={eventX - 12}
                                  y={pos.y + 4}
                                  fontSize="13"
                                  fontWeight="bold"
                                  fill={
                                    isTarget
                                      ? feedbackStatus === 'correct'
                                        ? '#10B981'
                                        : feedbackStatus === 'wrong'
                                        ? '#EF4444'
                                        : goldAccent
                                      : noteHeadFill
                                  }
                                  textAnchor="end"
                                >
                                  {pos.accidental}
                                </text>
                              )}

                              {/* Note Head Oval */}
                              <ellipse
                                cx={eventX}
                                cy={pos.y}
                                rx="6"
                                ry="4.5"
                                transform={`rotate(-20 ${eventX} ${pos.y})`}
                                fill={
                                  isWholeNote || isHalfNote
                                    ? isDark
                                      ? '#060F26'
                                      : '#FAF8F5'
                                    : isTarget
                                    ? feedbackStatus === 'correct'
                                      ? '#10B981'
                                      : feedbackStatus === 'wrong'
                                      ? '#EF4444'
                                      : goldAccent
                                    : noteHeadFill
                                }
                                stroke={
                                  isTarget
                                    ? feedbackStatus === 'correct'
                                      ? '#10B981'
                                      : feedbackStatus === 'wrong'
                                      ? '#EF4444'
                                      : goldAccent
                                    : noteHeadFill
                                }
                                strokeWidth={isWholeNote || isHalfNote ? '2' : '1'}
                              />

                              {/* Fingering Number */}
                              {n.fingering && (
                                <text
                                  x={eventX}
                                  y={pos.y - 10}
                                  fontSize="9"
                                  fontWeight="bold"
                                  fill={goldAccent}
                                  textAnchor="middle"
                                  className="font-sans"
                                >
                                  {n.fingering}
                                </text>
                              )}

                              {/* Pitch Name Label */}
                              <text
                                x={eventX}
                                y={TREBLE_TOP_LINE_Y + 54 + (pos.y > 55 ? 14 : 0)}
                                fontSize="9"
                                fontWeight={isTarget ? 'bold' : 'normal'}
                                fill={
                                  isTarget
                                    ? goldAccent
                                    : isDark
                                    ? 'rgba(255,255,255,0.75)'
                                    : 'rgba(8,31,92,0.85)'
                                }
                                textAnchor="middle"
                                className="font-sans"
                              >
                                {n.pitch}
                              </text>
                            </g>
                          );
                        })}

                        {/* Vertical Stem (if not whole note) */}
                        {!isWholeNote && noteList.length > 0 && (
                          <g>
                            {(() => {
                              const minY = Math.min(
                                ...noteList.map((n) => getNoteStaffPosition(n.pitch, 'treble').y)
                              );
                              const maxY = Math.max(
                                ...noteList.map((n) => getNoteStaffPosition(n.pitch, 'treble').y)
                              );
                              // Stem goes up on right side if below middle line B4 (y=35)
                              const stemUp = maxY >= 35;
                              const stemX = stemUp ? eventX + 5.5 : eventX - 5.5;
                              const stemTopY = stemUp ? minY - 26 : minY;
                              const stemBottomY = stemUp ? maxY : maxY + 26;

                              return (
                                <g>
                                  <line
                                    x1={stemX}
                                    y1={stemTopY}
                                    x2={stemX}
                                    y2={stemBottomY}
                                    stroke={
                                      isTarget
                                        ? feedbackStatus === 'correct'
                                          ? '#10B981'
                                          : feedbackStatus === 'wrong'
                                          ? '#EF4444'
                                          : goldAccent
                                        : noteHeadFill
                                    }
                                    strokeWidth="1.5"
                                  />
                                  {/* Eighth note flag */}
                                  {isEighth && (
                                    <path
                                      d={`M ${stemX} ${stemTopY} C ${stemX + 6} ${stemTopY + 6}, ${stemX + 8} ${stemTopY + 12}, ${stemX + 1} ${stemTopY + 16}`}
                                      fill="none"
                                      stroke={noteHeadFill}
                                      strokeWidth="1.8"
                                    />
                                  )}
                                </g>
                              );
                            })()}
                          </g>
                        )}
                      </g>
                    );
                  })}

                {/* Bass Events (Left Hand) */}
                {showBass &&
                  measure.bassEvents.map((bItem, bIdx) => {
                    const isNote = !('notes' in bItem);
                    const note = isNote ? (bItem as NotationNote) : null;
                    const chord = !isNote ? (bItem as NotationChord) : null;

                    const beatPosition = (bItem as any).beatPosition || (bIdx === 0 ? 1 : 1 + bIdx * 2);
                    const beatFrac = Math.max(0, (beatPosition - 1) / beatsInMeasure);
                    const eventX = mStartX + 30 + beatFrac * (MEASURE_WIDTH - 55);

                    const isTarget =
                      currentExpectedEvent?.measureNumber === measure.measureNumber &&
                      (currentExpectedEvent.id === (bItem as any).id ||
                        currentExpectedEvent.notes.some((n) => n.id === (bItem as any).id));

                    // Rests
                    if (note?.isRest) {
                      return (
                        <g key={`bass-rest-${bIdx}`}>
                          {note.duration === 'semibreve' ? (
                            <rect
                              x={eventX - 6}
                              y={BASS_TOP_LINE_Y + bassOffset + 10}
                              width="12"
                              height="6"
                              fill={noteHeadFill}
                            />
                          ) : note.duration === 'minim' ? (
                            <rect
                              x={eventX - 6}
                              y={BASS_TOP_LINE_Y + bassOffset + 14}
                              width="12"
                              height="6"
                              fill={noteHeadFill}
                            />
                          ) : (
                            <text
                              x={eventX}
                              y={BASS_TOP_LINE_Y + bassOffset + 28}
                              fontSize="22"
                              textAnchor="middle"
                              fill={noteHeadFill}
                              opacity="0.75"
                            >
                              𝄽
                            </text>
                          )}
                          <text
                            x={eventX}
                            y={BASS_TOP_LINE_Y + bassOffset + 48}
                            fontSize="8"
                            textAnchor="middle"
                            fill={isDark ? '#A0AEC0' : '#718096'}
                            className="font-sans"
                          >
                            Rest
                          </text>
                        </g>
                      );
                    }

                    const noteList: NotationNote[] = chord ? chord.notes : note ? [note] : [];
                    const isWholeNote = noteList.some((n) => n.duration === 'semibreve');
                    const isHalfNote = noteList.some((n) => n.duration === 'minim');
                    const isEighth = noteList.some((n) => n.duration === 'quaver');

                    const glowFilter =
                      isTarget && feedbackStatus === 'correct'
                        ? 'url(#note-glow-emerald)'
                        : isTarget && feedbackStatus === 'wrong'
                        ? 'url(#note-glow-rose)'
                        : isTarget
                        ? 'url(#note-glow-gold)'
                        : undefined;

                    return (
                      <g
                        key={`bass-note-${bIdx}`}
                        id={`bass-ev-${(bItem as any).id}`}
                        filter={glowFilter}
                      >
                        {/* Target highlight ring */}
                        {isTarget && (
                          <ellipse
                            cx={eventX}
                            cy={getNoteStaffPosition(noteList[0].pitch, 'bass').y + bassOffset}
                            rx="14"
                            ry="11"
                            fill="none"
                            stroke={
                              feedbackStatus === 'correct'
                                ? '#10B981'
                                : feedbackStatus === 'wrong'
                                ? '#EF4444'
                                : goldAccent
                            }
                            strokeWidth="2.5"
                            strokeDasharray={feedbackStatus === 'wrong' ? '3,2' : undefined}
                            className={isPlaying ? 'animate-pulse' : ''}
                          />
                        )}

                        {/* Noteheads */}
                        {noteList.map((n, nIdx) => {
                          const pos = getNoteStaffPosition(n.pitch, 'bass');
                          const posY = pos.y + bassOffset;

                          return (
                            <g key={`b-head-${nIdx}`}>
                              {/* Ledger lines */}
                              {pos.ledgerLines.map((ly, lIdx) => (
                                <line
                                  key={`b-ledger-${lIdx}`}
                                  x1={eventX - 11}
                                  y1={ly + bassOffset}
                                  x2={eventX + 11}
                                  y2={ly + bassOffset}
                                  stroke={ledgerColor}
                                  strokeWidth="1.5"
                                />
                              ))}

                              {/* Accidental */}
                              {pos.accidental && (
                                <text
                                  x={eventX - 12}
                                  y={posY + 4}
                                  fontSize="13"
                                  fontWeight="bold"
                                  fill={
                                    isTarget
                                      ? feedbackStatus === 'correct'
                                        ? '#10B981'
                                        : feedbackStatus === 'wrong'
                                        ? '#EF4444'
                                        : goldAccent
                                      : noteHeadFill
                                  }
                                  textAnchor="end"
                                >
                                  {pos.accidental}
                                </text>
                              )}

                              {/* Note head oval */}
                              <ellipse
                                cx={eventX}
                                cy={posY}
                                rx="6"
                                ry="4.5"
                                transform={`rotate(-20 ${eventX} ${posY})`}
                                fill={
                                  isWholeNote || isHalfNote
                                    ? isDark
                                      ? '#060F26'
                                      : '#FAF8F5'
                                    : isTarget
                                    ? feedbackStatus === 'correct'
                                      ? '#10B981'
                                      : feedbackStatus === 'wrong'
                                      ? '#EF4444'
                                      : goldAccent
                                    : noteHeadFill
                                }
                                stroke={
                                  isTarget
                                    ? feedbackStatus === 'correct'
                                      ? '#10B981'
                                      : feedbackStatus === 'wrong'
                                      ? '#EF4444'
                                      : goldAccent
                                    : noteHeadFill
                                }
                                strokeWidth={isWholeNote || isHalfNote ? '2' : '1'}
                              />

                              {/* Fingering */}
                              {n.fingering && (
                                <text
                                  x={eventX}
                                  y={posY + 16}
                                  fontSize="9"
                                  fontWeight="bold"
                                  fill={goldAccent}
                                  textAnchor="middle"
                                  className="font-sans"
                                >
                                  {n.fingering}
                                </text>
                              )}

                              {/* Pitch label */}
                              <text
                                x={eventX}
                                y={BASS_TOP_LINE_Y + bassOffset + 54}
                                fontSize="9"
                                fontWeight={isTarget ? 'bold' : 'normal'}
                                fill={
                                  isTarget
                                    ? goldAccent
                                    : isDark
                                    ? 'rgba(255,255,255,0.75)'
                                    : 'rgba(8,31,92,0.85)'
                                }
                                textAnchor="middle"
                                className="font-sans"
                              >
                                {n.pitch}
                              </text>
                            </g>
                          );
                        })}

                        {/* Bass Stems */}
                        {!isWholeNote && noteList.length > 0 && (
                          <g>
                            {(() => {
                              const minY = Math.min(
                                ...noteList.map((n) => getNoteStaffPosition(n.pitch, 'bass').y + bassOffset)
                              );
                              const maxY = Math.max(
                                ...noteList.map((n) => getNoteStaffPosition(n.pitch, 'bass').y + bassOffset)
                              );
                              const stemUp = maxY >= BASS_TOP_LINE_Y + bassOffset + 20;
                              const stemX = stemUp ? eventX + 5.5 : eventX - 5.5;
                              const stemTopY = stemUp ? minY - 26 : minY;
                              const stemBottomY = stemUp ? maxY : maxY + 26;

                              return (
                                <line
                                  x1={stemX}
                                  y1={stemTopY}
                                  x2={stemX}
                                  y2={stemBottomY}
                                  stroke={
                                    isTarget
                                      ? feedbackStatus === 'correct'
                                        ? '#10B981'
                                        : feedbackStatus === 'wrong'
                                        ? '#EF4444'
                                        : goldAccent
                                      : noteHeadFill
                                  }
                                  strokeWidth="1.5"
                                />
                              );
                            })()}
                          </g>
                        )}
                      </g>
                    );
                  })}

                {/* Vertical Barline ending this measure */}
                <g>
                  {measure.repeatEnd ? (
                    // End repeat (:|)
                    <g>
                      <circle
                        cx={mEndX - 8}
                        cy={showTreble ? TREBLE_TOP_LINE_Y + 15 : BASS_TOP_LINE_Y + bassOffset + 15}
                        r="2"
                        fill={goldAccent}
                      />
                      <circle
                        cx={mEndX - 8}
                        cy={showTreble ? TREBLE_TOP_LINE_Y + 25 : BASS_TOP_LINE_Y + bassOffset + 25}
                        r="2"
                        fill={goldAccent}
                      />
                      <line
                        x1={mEndX - 4}
                        y1={showTreble ? TREBLE_TOP_LINE_Y : BASS_TOP_LINE_Y + bassOffset}
                        x2={mEndX - 4}
                        y2={showBass ? BASS_TOP_LINE_Y + bassOffset + 40 : TREBLE_TOP_LINE_Y + 40}
                        stroke={barLineColor}
                        strokeWidth="1.2"
                      />
                      <line
                        x1={mEndX}
                        y1={showTreble ? TREBLE_TOP_LINE_Y : BASS_TOP_LINE_Y + bassOffset}
                        x2={mEndX}
                        y2={showBass ? BASS_TOP_LINE_Y + bassOffset + 40 : TREBLE_TOP_LINE_Y + 40}
                        stroke={barLineColor}
                        strokeWidth="3.5"
                      />
                    </g>
                  ) : mIdx === score.measures.length - 1 ? (
                    // Final Double Barline
                    <g>
                      <line
                        x1={mEndX - 4}
                        y1={showTreble ? TREBLE_TOP_LINE_Y : BASS_TOP_LINE_Y + bassOffset}
                        x2={mEndX - 4}
                        y2={showBass ? BASS_TOP_LINE_Y + bassOffset + 40 : TREBLE_TOP_LINE_Y + 40}
                        stroke={barLineColor}
                        strokeWidth="1.2"
                      />
                      <line
                        x1={mEndX}
                        y1={showTreble ? TREBLE_TOP_LINE_Y : BASS_TOP_LINE_Y + bassOffset}
                        x2={mEndX}
                        y2={showBass ? BASS_TOP_LINE_Y + bassOffset + 40 : TREBLE_TOP_LINE_Y + 40}
                        stroke={barLineColor}
                        strokeWidth="3.5"
                      />
                    </g>
                  ) : (
                    // Standard Single Barline
                    <line
                      x1={mEndX}
                      y1={showTreble ? TREBLE_TOP_LINE_Y : BASS_TOP_LINE_Y + bassOffset}
                      x2={mEndX}
                      y2={showBass ? BASS_TOP_LINE_Y + bassOffset + 40 : TREBLE_TOP_LINE_Y + 40}
                      stroke={barLineColor}
                      strokeWidth="1.2"
                    />
                  )}
                </g>
              </g>
            );
          })}

          {/* ======================================================== */}
          {/* 4. MOVING REAL-TIME PLAYBACK CURSOR */}
          {/* ======================================================== */}
          {currentCursorX !== null && (
            <g id="playback-cursor" className="pointer-events-none transition-all duration-150">
              {/* Vertical glowing position cursor */}
              <line
                x1={currentCursorX}
                y1={showTreble ? TREBLE_TOP_LINE_Y - 8 : BASS_TOP_LINE_Y + bassOffset - 8}
                x2={currentCursorX}
                y2={showBass ? BASS_TOP_LINE_Y + bassOffset + 48 : TREBLE_TOP_LINE_Y + 48}
                stroke={goldAccent}
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.95"
              />
              {/* Cursor top triangle pointer */}
              <polygon
                points={`${currentCursorX - 4},${showTreble ? TREBLE_TOP_LINE_Y - 9 : BASS_TOP_LINE_Y + bassOffset - 9} ${currentCursorX + 4},${showTreble ? TREBLE_TOP_LINE_Y - 9 : BASS_TOP_LINE_Y + bassOffset - 9} ${currentCursorX},${showTreble ? TREBLE_TOP_LINE_Y - 3 : BASS_TOP_LINE_Y + bassOffset - 3}`}
                fill={goldAccent}
              />
            </g>
          )}
        </svg>
      </div>

      {/* Staff Legend & Hand Mode Quick Pill */}
      <div className="flex items-center justify-between text-[11px] opacity-75 mt-2 px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C5A869]" />
            <span className="font-semibold">{lang === 'en' ? 'Target Note' : 'Lakshya Sur'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold">{lang === 'en' ? 'Correct' : 'Sahi'}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="font-semibold">{lang === 'en' ? 'Try Again' : 'Dobara'}</span>
          </span>
        </div>
        <div className="font-medium text-[10px] hidden sm:block">
          {selectedHand === 'both'
            ? lang === 'en'
              ? 'Grand Staff (Treble + Bass)'
              : 'Grand Staff (Treble + Bass)'
            : selectedHand === 'right'
            ? lang === 'en'
              ? 'Treble Staff (Right Hand)'
              : 'Treble Staff (Daayan Haath)'
            : lang === 'en'
            ? 'Bass Staff (Left Hand)'
            : 'Bass Staff (Baayan Haath)'}
        </div>
      </div>
    </div>
  );
};
