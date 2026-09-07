import React from 'react';

interface KeyConfig {
  midi: number;
  pitch: string;
  isBlack: boolean;
  name: string;
  octave: number;
  whiteIndex: number;
}

interface InteractivePianoKeyboardProps {
  startMidi?: number; // e.g. 53 (F3) or 55 (G3) or 60 (C4)
  endMidi?: number;   // e.g. 76 (E5) or 79 (G5) or 84 (C6)
  highlightedMidis?: number[]; // Notes belonging to chord or scale
  activeMidi?: number | null;  // Note currently sounding/playback cursor
  midiFeedback?: { midi: number; isCorrect: boolean } | null;
  fingerMap?: Record<number, number>; // midi -> finger number (1..5)
  onKeyClick?: (midi: number) => void;
  className?: string;
}

const SEMITONE_INFO = [
  { name: 'C', isBlack: false },
  { name: 'C#', isBlack: true },
  { name: 'D', isBlack: false },
  { name: 'D#', isBlack: true },
  { name: 'E', isBlack: false },
  { name: 'F', isBlack: false },
  { name: 'F#', isBlack: true },
  { name: 'G', isBlack: false },
  { name: 'G#', isBlack: true },
  { name: 'A', isBlack: false },
  { name: 'A#', isBlack: true },
  { name: 'B', isBlack: false },
];

export const InteractivePianoKeyboard: React.FC<InteractivePianoKeyboardProps> = ({
  startMidi = 53, // F3
  endMidi = 76,   // E5 (2 full octaves)
  highlightedMidis = [],
  activeMidi = null,
  midiFeedback = null,
  fingerMap = {},
  onKeyClick,
  className = '',
}) => {
  // Build keyboard keys
  const whiteKeys: KeyConfig[] = [];
  const blackKeys: KeyConfig[] = [];
  let currentWhiteIndex = 0;

  for (let midi = startMidi; midi <= endMidi; midi++) {
    const semitone = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    const info = SEMITONE_INFO[semitone];
    const pitch = `${info.name}${octave}`;

    if (!info.isBlack) {
      whiteKeys.push({
        midi,
        pitch,
        isBlack: false,
        name: info.name,
        octave,
        whiteIndex: currentWhiteIndex++,
      });
    } else {
      blackKeys.push({
        midi,
        pitch,
        isBlack: true,
        name: info.name,
        octave,
        whiteIndex: currentWhiteIndex - 1,
      });
    }
  }

  const totalWhite = whiteKeys.length;
  const whiteKeyWidth = 100 / totalWhite; // in percentage

  // Function to determine key background & styling
  const getKeyStyle = (midi: number, isBlack: boolean) => {
    const isHighlighted = highlightedMidis.includes(midi);
    const isActive = activeMidi === midi;
    const hasFeedback = midiFeedback?.midi === midi;
    const isCorrect = hasFeedback && midiFeedback?.isCorrect;
    const isWrong = hasFeedback && !midiFeedback?.isCorrect;

    if (isCorrect) {
      return 'bg-emerald-500 text-white shadow-md border-emerald-600 scale-[0.98] ring-2 ring-emerald-400';
    }
    if (isWrong) {
      return 'bg-rose-500 text-white shadow-md border-rose-600 ring-2 ring-rose-400';
    }
    if (isActive) {
      return 'bg-[#C5A869] text-[#081F5C] font-bold shadow-md ring-2 ring-[#C5A869]/80 scale-[0.99]';
    }
    if (isHighlighted) {
      return isBlack
        ? 'bg-[#C5A869] text-[#081F5C] border-[#B29253]'
        : 'bg-[#C5A869]/20 dark:bg-[#C5A869]/30 text-[#081F5C] dark:text-[#C5A869] border-[#C5A869]/50 font-bold';
    }
    return isBlack
      ? 'bg-[#151D2A] text-white/50 border-[#0B1017] hover:bg-slate-800'
      : 'bg-white dark:bg-[#0E1B38] text-[#081F5C]/70 dark:text-white/70 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#13244a]';
  };

  return (
    <div className={`w-full overflow-x-auto pb-1 select-none ${className}`}>
      <div
        className="relative h-32 sm:h-36 min-w-[340px] max-w-full rounded-2xl p-1 bg-slate-900 border border-slate-800 shadow-inner flex"
        style={{ touchAction: 'manipulation' }}
      >
        {/* White Keys */}
        {whiteKeys.map((k) => {
          const isHighlighted = highlightedMidis.includes(k.midi);
          const finger = fingerMap[k.midi];

          return (
            <button
              key={`white-${k.midi}`}
              type="button"
              onClick={() => onKeyClick?.(k.midi)}
              style={{ width: `${whiteKeyWidth}%` }}
              className={`relative h-full rounded-b-lg border-b-4 transition-colors flex flex-col justify-end items-center pb-2 cursor-pointer ${getKeyStyle(
                k.midi,
                false
              )}`}
              title={`${k.pitch}${finger ? ` (Finger ${finger})` : ''}`}
            >
              {/* Finger indication badge */}
              {finger && (
                <span className="w-5 h-5 rounded-full bg-[#081F5C] text-[#C5A869] dark:bg-white dark:text-[#081F5C] text-[10px] font-bold flex items-center justify-center mb-1 shadow-xs">
                  {finger}
                </span>
              )}

              {/* Note name */}
              <span className={`text-[10px] sm:text-xs font-mono font-bold ${isHighlighted ? 'opacity-100' : 'opacity-60'}`}>
                {k.name === 'C' ? `C${k.octave}` : k.name}
              </span>
            </button>
          );
        })}

        {/* Black Keys (Positioned absolutely over white keys) */}
        {blackKeys.map((k) => {
          const isHighlighted = highlightedMidis.includes(k.midi);
          const finger = fingerMap[k.midi];
          // Black key sits on the boundary between its whiteIndex and whiteIndex + 1
          const leftPercent = (k.whiteIndex + 1) * whiteKeyWidth - whiteKeyWidth * 0.32;
          const keyWidth = whiteKeyWidth * 0.64;

          return (
            <button
              key={`black-${k.midi}`}
              type="button"
              onClick={() => onKeyClick?.(k.midi)}
              style={{
                left: `${leftPercent}%`,
                width: `${keyWidth}%`,
                zIndex: 20,
              }}
              className={`absolute top-1 h-[60%] rounded-b-md border-b-3 transition-colors flex flex-col justify-end items-center pb-1.5 cursor-pointer shadow-md ${getKeyStyle(
                k.midi,
                true
              )}`}
              title={`${k.pitch}${finger ? ` (Finger ${finger})` : ''}`}
            >
              {finger && (
                <span className="w-4 h-4 rounded-full bg-[#081F5C] text-[#C5A869] text-[9px] font-bold flex items-center justify-center mb-1 shadow-xs">
                  {finger}
                </span>
              )}
              {isHighlighted && (
                <span className="text-[8px] font-mono font-bold text-center leading-none">
                  {k.name}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
