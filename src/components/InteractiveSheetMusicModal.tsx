import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  Square,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Repeat,
  Music,
  Sliders,
  Award,
  ChevronRight,
  Flame,
  Radio,
  RefreshCw,
  Clock,
  Info,
  Timer as TimerIcon,
} from 'lucide-react';
import {
  InteractiveScore,
  NotationNote,
  NotationChord,
  HandSelection,
  Language,
  Theme,
  MidiDevice,
  MidiNoteEvent,
  PracticeSessionSummary,
} from '../types';
import { midiManager, midiToPitchName } from '../utils/midiService';
import { audioEngine } from '../utils/audioSynth';
import {
  saveMidiPracticeResult,
  getMidiPracticeHistory,
  getMidiPracticeStats,
  saveMidiScoreSettings,
  getMidiScoreSettings,
} from '../utils/studentLearningService';
import { Logo } from './Logo';
import { MusicalStaffNotation } from './MusicalStaffNotation';
import { PracticeTimerModal } from './PracticeTimerModal';

interface InteractiveSheetMusicModalProps {
  score: InteractiveScore;
  studentId: string;
  onClose: () => void;
  lang: Language;
  theme: Theme;
}

interface FlattenedMusicalEvent {
  id: string;
  measureNumber: number;
  beatPosition: number;
  beatDuration: number;
  isChord: boolean;
  notes: NotationNote[];
  expectedMidis: number[]; // e.g. [60] or [60, 64, 67]
  pitchesDisplay: string[]; // e.g. ["C4"] or ["C4", "E4", "G4"]
  hand: 'left' | 'right' | 'both';
  clef: 'treble' | 'bass';
  isRest: boolean;
  chordSymbol?: string;
  fingering?: string;
  sectionLabel?: string;
}

// 2.5 Octave Virtual Keyboard keys from C3 (MIDI 48) to G5 (MIDI 79)
const KEYBOARD_KEYS = [
  { midi: 48, name: 'C3', isBlack: false },
  { midi: 49, name: 'C#3', isBlack: true },
  { midi: 50, name: 'D3', isBlack: false },
  { midi: 51, name: 'D#3', isBlack: true },
  { midi: 52, name: 'E3', isBlack: false },
  { midi: 53, name: 'F3', isBlack: false },
  { midi: 54, name: 'F#3', isBlack: true },
  { midi: 55, name: 'G3', isBlack: false },
  { midi: 56, name: 'G#3', isBlack: true },
  { midi: 57, name: 'A3', isBlack: false },
  { midi: 58, name: 'A#3', isBlack: true },
  { midi: 59, name: 'B3', isBlack: false },
  { midi: 60, name: 'C4', isBlack: false, isMiddleC: true },
  { midi: 61, name: 'C#4', isBlack: true },
  { midi: 62, name: 'D4', isBlack: false },
  { midi: 63, name: 'D#4', isBlack: true },
  { midi: 64, name: 'E4', isBlack: false },
  { midi: 65, name: 'F4', isBlack: false },
  { midi: 66, name: 'F#4', isBlack: true },
  { midi: 67, name: 'G4', isBlack: false },
  { midi: 68, name: 'G#4', isBlack: true },
  { midi: 69, name: 'A4', isBlack: false },
  { midi: 70, name: 'A#4', isBlack: true },
  { midi: 71, name: 'B4', isBlack: false },
  { midi: 72, name: 'C5', isBlack: false },
  { midi: 73, name: 'C#5', isBlack: true },
  { midi: 74, name: 'D5', isBlack: false },
  { midi: 75, name: 'D#5', isBlack: true },
  { midi: 76, name: 'E5', isBlack: false },
  { midi: 77, name: 'F5', isBlack: false },
  { midi: 78, name: 'F#5', isBlack: true },
  { midi: 79, name: 'G5', isBlack: false },
];

export const InteractiveSheetMusicModal: React.FC<InteractiveSheetMusicModalProps> = ({
  score,
  studentId,
  onClose,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  // Restore saved settings if any
  const savedSettings = useMemo(
    () => getMidiScoreSettings(studentId, score.id),
    [studentId, score.id]
  );

  // Practice configuration
  const [selectedHand, setSelectedHand] = useState<HandSelection>(
    savedSettings?.hand || score.handMode || 'both'
  );
  const [tempoBpm, setTempoBpm] = useState<number>(
    savedSettings?.tempoBpm || score.defaultBpm || 60
  );
  const [practiceMode, setPracticeMode] = useState<'wait' | 'flow'>('wait');

  // Metronome & Time Signature state
  const [metronomeEnabled, setMetronomeEnabled] = useState<boolean>(true);
  const [timeSignaturePreset, setTimeSignaturePreset] = useState<string>(score.timeSignature || '4/4');
  const [customBeatsPerBar, setCustomBeatsPerBar] = useState<number>(5);
  const [currentBeat, setCurrentBeat] = useState<number>(1);

  // Looping state
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [loopStartBar, setLoopStartBar] = useState<number>(
    savedSettings?.loopRange ? savedSettings.loopRange[0] : 1
  );
  const [loopEndBar, setLoopEndBar] = useState<number>(
    savedSettings?.loopRange ? savedSettings.loopRange[1] : score.totalBars
  );

  // Playback & Practice Session state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeEventIndex, setActiveEventIndex] = useState<number>(0);

  // Real-time MIDI device states
  const [connectedDevices, setConnectedDevices] = useState<MidiDevice[]>([]);
  const [midiSupported, setMidiSupported] = useState<boolean>(true);
  const [disconnectNotice, setDisconnectNotice] = useState<string | null>(null);
  const [activeMidiKeys, setActiveMidiKeys] = useState<Set<number>>(new Set());

  // Note feedback state: null | 'correct' | 'wrong'
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [feedbackNote, setFeedbackNote] = useState<string>('');
  const [lastPlayedPitch, setLastPlayedPitch] = useState<string | null>(null);

  // Chord collection window buffer
  const chordBufferRef = useRef<{ midis: Set<number>; timer: any }>({
    midis: new Set<number>(),
    timer: null,
  });

  // Performance scoring during practice session
  const [sessionNotesAttempted, setSessionNotesAttempted] = useState<number>(0);
  const [sessionNotesCorrect, setSessionNotesCorrect] = useState<number>(0);
  const [sessionMistakes, setSessionMistakes] = useState<string[]>([]);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [completedSummary, setCompletedSummary] = useState<PracticeSessionSummary | null>(null);
  const [showPracticeTimer, setShowPracticeTimer] = useState<boolean>(false);

  // Historical stats
  const [historicalStats, setHistoricalStats] = useState(() =>
    getMidiPracticeStats(studentId, score.id)
  );

  // Save settings whenever they change
  useEffect(() => {
    saveMidiScoreSettings(studentId, score.id, {
      hand: selectedHand,
      tempoBpm,
      loopRange: [loopStartBar, loopEndBar],
    });
  }, [studentId, score.id, selectedHand, tempoBpm, loopStartBar, loopEndBar]);

  // Derive Beats Per Bar from selected Time Signature
  const beatsPerBar = useMemo(() => {
    if (timeSignaturePreset === '4/4') return 4;
    if (timeSignaturePreset === '3/4') return 3;
    if (timeSignaturePreset === '2/4') return 2;
    if (timeSignaturePreset === '6/8') return 6;
    if (timeSignaturePreset === '9/8') return 9;
    if (timeSignaturePreset === '12/8') return 12;
    if (timeSignaturePreset === 'Custom') return Math.max(1, customBeatsPerBar);
    return 4;
  }, [timeSignaturePreset, customBeatsPerBar]);

  // Flatten score measures into chronological events according to selectedHand and Loop boundaries
  const musicalEvents: FlattenedMusicalEvent[] = useMemo(() => {
    const events: FlattenedMusicalEvent[] = [];

    score.measures.forEach((measure) => {
      // Respect loop boundaries if enabled
      if (isLooping) {
        if (measure.measureNumber < loopStartBar || measure.measureNumber > loopEndBar) {
          return;
        }
      }

      if (selectedHand === 'right') {
        measure.trebleEvents.forEach((item, idx) => {
          if ('notes' in item) {
            const chord = item as NotationChord;
            events.push({
              id: chord.id,
              measureNumber: measure.measureNumber,
              beatPosition: chord.beatPosition,
              beatDuration: chord.beatValue,
              isChord: true,
              notes: chord.notes,
              expectedMidis: chord.notes.map((n) => n.midiNumber),
              pitchesDisplay: chord.notes.map((n) => n.pitch),
              hand: 'right',
              clef: 'treble',
              isRest: false,
              chordSymbol: chord.chordSymbol,
              fingering: chord.notes.map((n) => n.fingering).filter(Boolean).join('-'),
              sectionLabel: measure.sectionLabel,
            });
          } else {
            const note = item as NotationNote;
            if (note.isRest) return;
            events.push({
              id: note.id,
              measureNumber: measure.measureNumber,
              beatPosition: idx + 1,
              beatDuration: note.beatValue,
              isChord: false,
              notes: [note],
              expectedMidis: [note.midiNumber],
              pitchesDisplay: [note.pitch],
              hand: 'right',
              clef: 'treble',
              isRest: false,
              fingering: note.fingering ? `${note.fingering}` : undefined,
              sectionLabel: measure.sectionLabel,
            });
          }
        });
      } else if (selectedHand === 'left') {
        measure.bassEvents.forEach((item, idx) => {
          if ('notes' in item) {
            const chord = item as NotationChord;
            events.push({
              id: chord.id,
              measureNumber: measure.measureNumber,
              beatPosition: chord.beatPosition,
              beatDuration: chord.beatValue,
              isChord: true,
              notes: chord.notes,
              expectedMidis: chord.notes.map((n) => n.midiNumber),
              pitchesDisplay: chord.notes.map((n) => n.pitch),
              hand: 'left',
              clef: 'bass',
              isRest: false,
              chordSymbol: chord.chordSymbol,
              fingering: chord.notes.map((n) => n.fingering).filter(Boolean).join('-'),
              sectionLabel: measure.sectionLabel,
            });
          } else {
            const note = item as NotationNote;
            if (note.isRest) return;
            events.push({
              id: note.id,
              measureNumber: measure.measureNumber,
              beatPosition: idx + 1,
              beatDuration: note.beatValue,
              isChord: false,
              notes: [note],
              expectedMidis: [note.midiNumber],
              pitchesDisplay: [note.pitch],
              hand: 'left',
              clef: 'bass',
              isRest: false,
              fingering: note.fingering ? `${note.fingering}` : undefined,
              sectionLabel: measure.sectionLabel,
            });
          }
        });
      } else {
        // BOTH HANDS: combine and synchronize
        // Group by beat position within the measure
        const trebleList = measure.trebleEvents.filter((e) => !('isRest' in e && (e as any).isRest));
        const bassList = measure.bassEvents.filter((e) => !('isRest' in e && (e as any).isRest));

        // If one hand has chord/note and other has note at start of bar
        const maxEvents = Math.max(trebleList.length, bassList.length);
        for (let i = 0; i < maxEvents; i++) {
          const tItem = trebleList[i];
          const bItem = bassList[i];

          const combinedNotes: NotationNote[] = [];
          const combinedMidis: number[] = [];
          const combinedPitches: string[] = [];

          if (tItem) {
            if ('notes' in tItem) {
              combinedNotes.push(...tItem.notes);
              combinedMidis.push(...tItem.notes.map((n) => n.midiNumber));
              combinedPitches.push(...tItem.notes.map((n) => n.pitch));
            } else {
              combinedNotes.push(tItem);
              combinedMidis.push(tItem.midiNumber);
              combinedPitches.push(tItem.pitch);
            }
          }

          if (bItem) {
            if ('notes' in bItem) {
              combinedNotes.push(...bItem.notes);
              combinedMidis.push(...bItem.notes.map((n) => n.midiNumber));
              combinedPitches.push(...bItem.notes.map((n) => n.pitch));
            } else {
              combinedNotes.push(bItem);
              combinedMidis.push(bItem.midiNumber);
              combinedPitches.push(bItem.pitch);
            }
          }

          if (combinedMidis.length > 0) {
            events.push({
              id: `both-m${measure.measureNumber}-e${i}`,
              measureNumber: measure.measureNumber,
              beatPosition: i + 1,
              beatDuration: (tItem as any)?.beatValue || (bItem as any)?.beatValue || 1,
              isChord: combinedMidis.length > 1,
              notes: combinedNotes,
              expectedMidis: combinedMidis,
              pitchesDisplay: combinedPitches,
              hand: 'both',
              clef: 'treble',
              isRest: false,
              chordSymbol: (tItem as any)?.chordSymbol,
              fingering: combinedNotes.map((n) => n.fingering).filter(Boolean).join(','),
              sectionLabel: measure.sectionLabel,
            });
          }
        }
      }
    });

    return events;
  }, [score, selectedHand, isLooping, loopStartBar, loopEndBar]);

  const currentExpectedEvent = musicalEvents[activeEventIndex] || null;

  // Web MIDI setup and device listener
  useEffect(() => {
    let isMounted = true;

    const initMidi = async () => {
      const res = await midiManager.initialize({
        onNoteOn: (event: MidiNoteEvent) => {
          if (!isMounted) return;
          handleMidiNoteOn(event);
        },
        onNoteOff: (event: MidiNoteEvent) => {
          if (!isMounted) return;
          handleMidiNoteOff(event);
        },
        onDevicesChange: (devices: MidiDevice[]) => {
          if (!isMounted) return;
          setConnectedDevices(devices);
          if (devices.length > 0) {
            setDisconnectNotice(null);
          }
        },
        onDeviceDisconnect: (deviceName: string) => {
          if (!isMounted) return;
          setDisconnectNotice(
            lang === 'en'
              ? `MIDI keyboard "${deviceName}" was disconnected. Connect your keyboard to resume note feedback.`
              : `MIDI keyboard "${deviceName}" disconnect ho gaya. Note feedback jaari rakhne ke liye keyboard connect karein.`
          );
          // Pause evaluation safely
          setIsPlaying(false);
        },
      });

      if (isMounted) {
        setMidiSupported(res.supported);
        setConnectedDevices(res.devices);
      }
    };

    initMidi();

    return () => {
      isMounted = false;
      midiManager.cleanup();
    };
  }, [lang]);

  // Metronome tick scheduler
  useEffect(() => {
    let interval: any = null;

    if (isPlaying && metronomeEnabled) {
      const intervalMs = (60 / tempoBpm) * 1000;
      interval = setInterval(() => {
        setCurrentBeat((prevBeat) => {
          const nextBeat = prevBeat >= beatsPerBar ? 1 : prevBeat + 1;
          const isAccent =
            nextBeat === 1 ||
            (beatsPerBar === 6 && nextBeat === 4) ||
            (beatsPerBar === 9 && (nextBeat === 4 || nextBeat === 7)) ||
            (beatsPerBar === 12 && (nextBeat === 4 || nextBeat === 7 || nextBeat === 10));

          audioEngine.playMetronomeClick(isAccent);
          return nextBeat;
        });
      }, intervalMs);
    } else {
      setCurrentBeat(1);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, metronomeEnabled, tempoBpm, beatsPerBar]);

  // In 'flow' mode, auto-advance on beats
  useEffect(() => {
    let flowInterval: any = null;
    if (isPlaying && practiceMode === 'flow' && currentExpectedEvent) {
      const beatMs = (60 / tempoBpm) * 1000 * (currentExpectedEvent.beatDuration || 1);
      flowInterval = setTimeout(() => {
        advanceToNextEvent();
      }, beatMs);
    }
    return () => {
      if (flowInterval) clearTimeout(flowInterval);
    };
  }, [isPlaying, practiceMode, activeEventIndex, currentExpectedEvent, tempoBpm]);

  // Advance event helper
  const advanceToNextEvent = useCallback(() => {
    if (activeEventIndex + 1 < musicalEvents.length) {
      setActiveEventIndex((prev) => prev + 1);
      setFeedbackStatus('idle');
    } else {
      // Loop or End of Practice Run
      if (isLooping) {
        setActiveEventIndex(0);
        setFeedbackStatus('idle');
      } else {
        // Run finished - calculate and show summary
        finishPracticeRun();
      }
    }
  }, [activeEventIndex, musicalEvents.length, isLooping]);

  // Finish practice session and persist real results
  const finishPracticeRun = useCallback(() => {
    setIsPlaying(false);
    audioEngine.playSuccessChime();

    const totalAttempts = sessionNotesAttempted || musicalEvents.length;
    const correctCount = sessionNotesCorrect;
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 100;

    const summary: PracticeSessionSummary = {
      scoreId: score.id,
      scoreTitle: lang === 'en' ? score.titleEn : score.titleHi,
      totalNotesPlayed: totalAttempts,
      correctNotes: correctCount,
      wrongNotes: Math.max(0, totalAttempts - correctCount),
      accuracyPercent: Math.min(100, Math.max(0, accuracy)),
      handSelected: selectedHand,
      tempoBpm,
      completedAt: new Date().toISOString(),
      needsPracticeSection: sessionMistakes.length > 0 ? Array.from(new Set(sessionMistakes)).join(', ') : undefined,
    };

    saveMidiPracticeResult(studentId, summary);
    setCompletedSummary(summary);
    setShowSummaryModal(true);
    setHistoricalStats(getMidiPracticeStats(studentId, score.id));
  }, [
    sessionNotesAttempted,
    sessionNotesCorrect,
    sessionMistakes,
    musicalEvents.length,
    score.id,
    score.titleEn,
    score.titleHi,
    lang,
    selectedHand,
    tempoBpm,
    studentId,
  ]);

  // Real-time MIDI Note-On handler
  const handleMidiNoteOn = useCallback(
    (event: MidiNoteEvent) => {
      // Highlight on virtual keyboard
      setActiveMidiKeys((prev) => new Set(prev).add(event.midiNumber));

      // Play subtle acoustic bell feedback
      audioEngine.playNoteTone(event.midiNumber, event.velocity);

      setLastPlayedPitch(`${event.noteName}`);

      if (!isPlaying || !currentExpectedEvent) return;

      setSessionNotesAttempted((prev) => prev + 1);

      const expectedMidis = currentExpectedEvent.expectedMidis;
      const isChord = currentExpectedEvent.isChord;

      if (!isChord) {
        // Single Note Comparison with EXACT OCTAVE accuracy
        const targetMidi = expectedMidis[0];

        if (event.midiNumber === targetMidi) {
          // CORRECT NOTE!
          setFeedbackStatus('correct');
          setFeedbackNote(event.noteName);
          setSessionNotesCorrect((prev) => prev + 1);

          // Advance smoothly to next note
          setTimeout(() => {
            advanceToNextEvent();
          }, 180);
        } else {
          // WRONG NOTE
          setFeedbackStatus('wrong');
          setFeedbackNote(event.noteName);
          audioEngine.playWrongChime();
          setSessionMistakes((prev) => [
            ...prev,
            `Bar ${currentExpectedEvent.measureNumber} (${currentExpectedEvent.pitchesDisplay.join('+')})`,
          ]);
          // DO NOT ADVANCE!
        }
      } else {
        // CHORD OR MULTIPLE SIMULTANEOUS NOTES
        // Collect incoming notes within 350ms buffer window to support natural human hand arrival
        const buf = chordBufferRef.current;
        buf.midis.add(event.midiNumber);

        if (buf.timer) clearTimeout(buf.timer);

        buf.timer = setTimeout(() => {
          // Compare collected pitches with expected chord
          const playedArray: number[] = Array.from(buf.midis);
          const allExpectedPresent = expectedMidis.every((m) => buf.midis.has(m));
          const hasIncorrect = playedArray.some((m: number) => !expectedMidis.includes(m));

          if (allExpectedPresent && !hasIncorrect) {
            // Chord played completely & correctly!
            setFeedbackStatus('correct');
            setFeedbackNote(currentExpectedEvent.pitchesDisplay.join(' + '));
            setSessionNotesCorrect((prev) => prev + 1);
            buf.midis.clear();

            setTimeout(() => {
              advanceToNextEvent();
            }, 250);
          } else {
            // Missing notes or wrong notes in chord
            setFeedbackStatus('wrong');
            setFeedbackNote(
              playedArray.map((m: number) => midiToPitchName(m)).join(' + ') || event.noteName
            );
            audioEngine.playWrongChime();
            setSessionMistakes((prev) => [
              ...prev,
              `Bar ${currentExpectedEvent.measureNumber} (${currentExpectedEvent.pitchesDisplay.join('+')})`,
            ]);
            buf.midis.clear();
          }
        }, 350);
      }
    },
    [isPlaying, currentExpectedEvent, advanceToNextEvent]
  );

  // Real-time MIDI Note-Off handler
  const handleMidiNoteOff = useCallback((event: MidiNoteEvent) => {
    setActiveMidiKeys((prev) => {
      const next = new Set(prev);
      next.delete(event.midiNumber);
      return next;
    });
  }, []);

  // Virtual Keyboard Key Press (allows clicking keys on screen)
  const handleVirtualKeyPress = (midi: number) => {
    midiManager.triggerSimulatedNoteOn(midi, 80);
    setTimeout(() => {
      midiManager.triggerSimulatedNoteOff(midi);
    }, 280);
  };

  // Play / Pause / Stop controls
  const handlePlayToggle = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      setFeedbackStatus('idle');
    } else {
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setActiveEventIndex(0);
    setFeedbackStatus('idle');
    setFeedbackNote('');
  };

  const handleRestartSession = () => {
    setShowSummaryModal(false);
    setActiveEventIndex(0);
    setSessionNotesAttempted(0);
    setSessionNotesCorrect(0);
    setSessionMistakes([]);
    setFeedbackStatus('idle');
    setIsPlaying(true);
  };

  // Tempo adjustment presets
  const handleSpeedPreset = (multiplier: number) => {
    const newBpm = Math.round(score.defaultBpm * multiplier);
    setTempoBpm(Math.max(score.minBpm, Math.min(score.maxBpm, newBpm)));
  };

  // Check if MIDI keyboard is connected
  const hasMidiConnection = connectedDevices.length > 0;

  return (
    <div
      id="interactive-sheet-music-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-md overflow-y-auto"
    >
      <div
        className={`w-full max-w-5xl rounded-3xl border shadow-2xl flex flex-col max-h-[96vh] overflow-hidden ${
          isDark
            ? 'bg-[#081534] border-white/10 text-white'
            : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
        }`}
      >
        {/* HEADER BAR */}
        <div
          className={`px-4 sm:px-6 py-3.5 border-b flex items-center justify-between gap-3 ${
            isDark ? 'border-white/10 bg-[#081F5C]/40' : 'border-[#081F5C]/10 bg-white/70'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <Logo size="sm" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C5A869]/20 text-[#C5A869] border border-[#C5A869]/40 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {lang === 'en' ? 'Interactive MIDI Practice' : 'Interactive MIDI Riyaz'}
                </span>
                <span className="text-xs opacity-60 hidden sm:inline">
                  {score.keySignature} • {score.timeSignature}
                </span>
              </div>
              <h2 className="font-display font-bold text-base sm:text-lg truncate">
                {lang === 'en' ? score.titleEn : score.titleHi}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title={lang === 'en' ? 'Close' : 'Band karein'}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONNECTED MIDI STATUS BANNER */}
        <div
          className={`px-4 sm:px-6 py-2.5 text-xs border-b flex flex-wrap items-center justify-between gap-2 transition-all ${
            hasMidiConnection
              ? isDark
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : isDark
              ? 'bg-[#C5A869]/10 border-[#C5A869]/20 text-[#C5A869]'
              : 'bg-[#C5A869]/15 border-[#C5A869]/30 text-[#081F5C]'
          }`}
        >
          <div className="flex items-center gap-2">
            {hasMidiConnection ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">
                  {lang === 'en' ? 'MIDI Connected:' : 'MIDI Connected:'}
                </span>
                <span>{connectedDevices.map((d) => d.name).join(', ')}</span>
                {lastPlayedPitch && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono font-bold text-[11px]">
                    {lang === 'en' ? 'Key:' : 'Sur:'} {lastPlayedPitch}
                  </span>
                )}
              </>
            ) : (
              <>
                <Radio className="w-3.5 h-3.5 opacity-80" />
                <span>
                  {lang === 'en'
                    ? 'Connect your MIDI keyboard to practise with live note feedback.'
                    : 'Apna MIDI keyboard connect karein live note feedback ke sath practice karne ke liye.'}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!hasMidiConnection && (
              <button
                onClick={async () => {
                  await midiManager.initialize({
                    onNoteOn: handleMidiNoteOn,
                    onNoteOff: handleMidiNoteOff,
                    onDevicesChange: setConnectedDevices,
                    onDeviceDisconnect: (name) => setDisconnectNotice(`Disconnected: ${name}`),
                  });
                }}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#C5A869]/25 hover:bg-[#C5A869]/40 text-current flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{lang === 'en' ? 'Detect Keyboard' : 'Keyboard Dhundein'}</span>
              </button>
            )}
            <span className="opacity-70 text-[11px] hidden md:inline">
              {lang === 'en' ? 'Or tap virtual keys below' : 'Ya niche keys touch karein'}
            </span>
          </div>
        </div>

        {/* DISCONNECT NOTICE IF OCCURRED */}
        {disconnectNotice && (
          <div className="px-4 py-2 bg-amber-500/15 border-b border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span>{disconnectNotice}</span>
            </div>
            <button
              onClick={() => setDisconnectNotice(null)}
              className="text-xs font-bold underline cursor-pointer"
            >
              {lang === 'en' ? 'Dismiss' : 'Theek hai'}
            </button>
          </div>
        )}

        {/* MAIN BODY: SCROLLABLE NOTATION & PRACTICE STAGE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* CONTROL STRIP (Hands, Play, Tempo, Metronome, Loop) */}
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
              isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white border-[#081F5C]/10 shadow-sm'
            }`}
          >
            {/* Hand Selection */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold opacity-75 mr-1 hidden sm:inline">
                {lang === 'en' ? 'Hands:' : 'Haath:'}
              </span>
              <div className="p-0.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex">
                <button
                  onClick={() => {
                    setSelectedHand('right');
                    setActiveEventIndex(0);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedHand === 'right'
                      ? 'bg-[#081F5C] text-white dark:bg-[#C5A869] dark:text-[#081F5C] shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {lang === 'en' ? 'Right (RH)' : 'Daayan (RH)'}
                </button>
                <button
                  onClick={() => {
                    setSelectedHand('left');
                    setActiveEventIndex(0);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedHand === 'left'
                      ? 'bg-[#081F5C] text-white dark:bg-[#C5A869] dark:text-[#081F5C] shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {lang === 'en' ? 'Left (LH)' : 'Baayan (LH)'}
                </button>
                <button
                  onClick={() => {
                    setSelectedHand('both');
                    setActiveEventIndex(0);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    selectedHand === 'both'
                      ? 'bg-[#081F5C] text-white dark:bg-[#C5A869] dark:text-[#081F5C] shadow-sm'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {lang === 'en' ? 'Both Hands' : 'Dono Haath'}
                </button>
              </div>
            </div>

            {/* Play / Pause / Stop Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePlayToggle}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>{lang === 'en' ? 'Pause' : 'Pause'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>{lang === 'en' ? 'Start Practice' : 'Riyaz Shuru'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleStop}
                className="p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-xs font-semibold cursor-pointer"
                title={lang === 'en' ? 'Reset to Start' : 'Shuru se karein'}
              >
                <Square className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setPracticeMode(practiceMode === 'wait' ? 'flow' : 'wait');
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  practiceMode === 'wait'
                    ? 'border-[#C5A869] text-[#C5A869] bg-[#C5A869]/10'
                    : 'border-black/15 dark:border-white/15 opacity-80'
                }`}
                title={
                  lang === 'en'
                    ? 'Wait for Me waits for your note before advancing'
                    : 'Wait for Me aapke note ka intezaar karta hai'
                }
              >
                <Clock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {practiceMode === 'wait'
                    ? lang === 'en'
                      ? 'Wait For Note'
                      : 'Wait Mode'
                    : lang === 'en'
                    ? 'Rhythm Flow'
                    : 'Flow Mode'}
                </span>
              </button>

              {/* Real Practice Timer Quick Launcher */}
              <button
                onClick={() => setShowPracticeTimer(true)}
                className="px-2.5 py-1.5 rounded-xl border border-[#C5A869]/40 bg-[#C5A869]/10 hover:bg-[#C5A869]/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title={lang === 'en' ? 'Open Practice Timer' : 'Riyaz Stopwatch Kholein'}
              >
                <TimerIcon className="w-3.5 h-3.5 text-[#C5A869]" />
                <span className="hidden sm:inline text-[#C5A869] font-bold">
                  {lang === 'en' ? 'Practice Timer' : 'Riyaz Timer'}
                </span>
              </button>
            </div>

            {/* Metronome & Time Signature */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMetronomeEnabled(!metronomeEnabled)}
                className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 cursor-pointer transition-colors ${
                  metronomeEnabled
                    ? 'bg-[#081F5C] text-white dark:bg-[#C5A869] dark:text-[#081F5C] border-transparent'
                    : 'border-black/15 dark:border-white/15 opacity-60'
                }`}
                title={lang === 'en' ? 'Metronome Toggle' : 'Metronome Toggle'}
              >
                {metronomeEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="font-bold text-xs">
                  {lang === 'en' ? 'Click' : 'Click'}
                </span>
                {metronomeEnabled && isPlaying && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping ml-0.5" />
                )}
              </button>

              {/* Time Signature Preset Dropdown */}
              <select
                value={timeSignaturePreset}
                onChange={(e) => setTimeSignaturePreset(e.target.value)}
                className={`px-2 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                  isDark
                    ? 'bg-[#081534] border-white/20 text-white'
                    : 'bg-white border-[#081F5C]/20 text-[#081F5C]'
                }`}
              >
                <option value="4/4">4/4 Meter</option>
                <option value="3/4">3/4 Waltz</option>
                <option value="2/4">2/4 March</option>
                <option value="6/8">6/8 Compound</option>
                <option value="9/8">9/8 Meter</option>
                <option value="12/8">12/8 Slow Blues</option>
                <option value="Custom">Custom Beats</option>
              </select>

              {timeSignaturePreset === 'Custom' && (
                <div className="flex items-center gap-1 text-xs">
                  <input
                    type="number"
                    min={1}
                    max={16}
                    value={customBeatsPerBar}
                    onChange={(e) => setCustomBeatsPerBar(parseInt(e.target.value, 10) || 4)}
                    className="w-12 px-1.5 py-1 text-center rounded border bg-transparent text-xs"
                  />
                  <span className="opacity-70">beats</span>
                </div>
              )}
            </div>

            {/* Tempo Slow Practice Slider & Presets */}
            <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-black/10 dark:border-white/10">
              <span className="text-xs font-bold opacity-75">
                {tempoBpm} <span className="text-[10px] font-normal">BPM</span>
              </span>
              <input
                type="range"
                min={score.minBpm}
                max={score.maxBpm}
                value={tempoBpm}
                onChange={(e) => setTempoBpm(Number(e.target.value))}
                className="w-20 sm:w-28 accent-[#C5A869] cursor-pointer"
              />
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <button
                  onClick={() => handleSpeedPreset(0.5)}
                  className={`px-1.5 py-0.5 rounded border ${
                    tempoBpm === Math.round(score.defaultBpm * 0.5)
                      ? 'bg-[#C5A869] text-black font-bold'
                      : 'border-black/10 dark:border-white/10 hover:bg-black/5'
                  }`}
                  title="50% Practice Tempo"
                >
                  50%
                </button>
                <button
                  onClick={() => handleSpeedPreset(0.75)}
                  className={`px-1.5 py-0.5 rounded border ${
                    tempoBpm === Math.round(score.defaultBpm * 0.75)
                      ? 'bg-[#C5A869] text-black font-bold'
                      : 'border-black/10 dark:border-white/10 hover:bg-black/5'
                  }`}
                  title="75% Practice Tempo"
                >
                  75%
                </button>
                <button
                  onClick={() => handleSpeedPreset(1.0)}
                  className={`px-1.5 py-0.5 rounded border ${
                    tempoBpm === score.defaultBpm
                      ? 'bg-[#C5A869] text-black font-bold'
                      : 'border-black/10 dark:border-white/10 hover:bg-black/5'
                  }`}
                  title="100% Original Tempo"
                >
                  100%
                </button>
              </div>
            </div>

            {/* Looped Practice Bar Range */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`px-2 py-1 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                  isLooping
                    ? 'bg-[#C5A869]/20 border-[#C5A869] text-[#C5A869]'
                    : 'border-black/15 dark:border-white/15 opacity-70'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Loop' : 'Loop'}</span>
              </button>

              {isLooping && (
                <div className="flex items-center gap-1 text-xs">
                  <span className="opacity-70">Bars</span>
                  <input
                    type="number"
                    min={1}
                    max={loopEndBar}
                    value={loopStartBar}
                    onChange={(e) => setLoopStartBar(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-10 px-1 py-0.5 rounded border bg-transparent text-center text-xs"
                  />
                  <span>–</span>
                  <input
                    type="number"
                    min={loopStartBar}
                    max={score.totalBars}
                    value={loopEndBar}
                    onChange={(e) =>
                      setLoopEndBar(
                        Math.min(score.totalBars, parseInt(e.target.value, 10) || score.totalBars)
                      )
                    }
                    className="w-10 px-1 py-0.5 rounded border bg-transparent text-center text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* REAL-TIME FEEDBACK STATUS STRIP */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
              feedbackStatus === 'correct'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : feedbackStatus === 'wrong'
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-700 dark:text-rose-300'
                : isDark
                ? 'bg-white/[0.02] border-white/10'
                : 'bg-white border-[#081F5C]/10'
            }`}
          >
            <div className="flex items-center gap-3">
              {feedbackStatus === 'correct' ? (
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : feedbackStatus === 'wrong' ? (
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center animate-pulse">
                  <AlertCircle className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-[#C5A869]/20 text-[#C5A869] flex items-center justify-center">
                  <Music className="w-4 h-4" />
                </div>
              )}

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  {feedbackStatus === 'correct'
                    ? lang === 'en'
                      ? 'Correct Note!'
                      : 'Sahi Note!'
                    : feedbackStatus === 'wrong'
                    ? lang === 'en'
                      ? 'Try again'
                      : 'Dobara koshish kijiye'
                    : lang === 'en'
                    ? 'Target Note'
                    : 'Target Sur'}
                </div>
                <div className="font-display font-bold text-sm sm:text-base flex items-center gap-2">
                  {currentExpectedEvent ? (
                    <>
                      <span>
                        {lang === 'en' ? 'Play:' : 'Bajayein:'}{' '}
                        <strong className="text-[#C5A869]">
                          {currentExpectedEvent.pitchesDisplay.join(' + ')}
                        </strong>
                      </span>
                      {currentExpectedEvent.fingering && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 font-normal">
                          {lang === 'en' ? 'Finger' : 'Ungli'}: {currentExpectedEvent.fingering}
                        </span>
                      )}
                      <span className="text-xs opacity-60">
                        (Bar {currentExpectedEvent.measureNumber}, Beat {currentExpectedEvent.beatPosition})
                      </span>
                    </>
                  ) : (
                    <span>{lang === 'en' ? 'Practice ready' : 'Riyaz taiyar'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Current Real-time Run Accuracy Counter */}
            <div className="text-right flex items-center gap-3">
              <div className="hidden sm:block text-xs">
                <div className="opacity-60 text-[10px] uppercase font-bold">
                  {lang === 'en' ? 'Live Progress' : 'Live Pragati'}
                </div>
                <div className="font-bold">
                  {sessionNotesCorrect} / {sessionNotesAttempted || 0}{' '}
                  {sessionNotesAttempted > 0 && (
                    <span className="text-[#C5A869]">
                      ({Math.round((sessionNotesCorrect / sessionNotesAttempted) * 100)}%)
                    </span>
                  )}
                </div>
              </div>

              {historicalStats.attempts > 0 && (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs">
                  <Award className="w-3.5 h-3.5 text-[#C5A869]" />
                  <span>
                    {lang === 'en' ? 'Best:' : 'Sarvashrestha:'} {historicalStats.bestAccuracy}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* THE NOTATION STAGE: SOURCE OF TRUTH SHEET MUSIC DISPLAY */}
          <div
            className={`p-4 sm:p-6 rounded-3xl border relative overflow-x-auto ${
              isDark ? 'bg-[#071330] border-white/10' : 'bg-white border-[#081F5C]/15 shadow-sm'
            }`}
          >
            {/* Score Title & Meta Header */}
            <div className="text-center pb-4 border-b border-black/10 dark:border-white/10 mb-4">
              <h3 className="font-display font-bold text-lg sm:text-xl">
                {lang === 'en' ? score.titleEn : score.titleHi}
              </h3>
              <p className="text-xs opacity-75">
                {score.composer} • {score.keySignature} • {score.timeSignature}
              </p>
            </div>

            {/* PROMINENT ACTUAL MUSICAL STAFF NOTATION AT THE TOP */}
            <div className="mb-6">
              <MusicalStaffNotation
                score={score}
                selectedHand={selectedHand}
                timeSignature={timeSignaturePreset}
                customBeats={customBeatsPerBar}
                activeEventIndex={activeEventIndex}
                currentExpectedEvent={currentExpectedEvent}
                feedbackStatus={feedbackStatus}
                isLooping={isLooping}
                loopStartBar={loopStartBar}
                loopEndBar={loopEndBar}
                isPlaying={isPlaying}
                currentBeat={currentBeat}
                onSelectMeasure={(measureNumber) => {
                  const targetIdx = musicalEvents.findIndex(
                    (e) => e.measureNumber === measureNumber
                  );
                  if (targetIdx !== -1) {
                    setActiveEventIndex(targetIdx);
                  }
                }}
                lang={lang}
                theme={theme}
              />
            </div>

            {/* MEASURES BREAKDOWN HEADER */}
            <div className="flex items-center justify-between mb-3 pt-2 border-t border-black/10 dark:border-white/10">
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">
                {lang === 'en' ? 'Measure Breakdown & Note Cards' : 'Bar Cards aur Note Details'}
              </span>
              <span className="text-[10px] opacity-60">
                {lang === 'en' ? 'Synced with Staff Notation' : 'Staff Notation ke sath synchronized'}
              </span>
            </div>

            {/* GRAND STAFF MEASURES DISPLAY */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {score.measures.map((measure) => {
                const isMeasureInLoop =
                  !isLooping ||
                  (measure.measureNumber >= loopStartBar && measure.measureNumber <= loopEndBar);

                const isCurrentMeasure =
                  currentExpectedEvent?.measureNumber === measure.measureNumber;

                return (
                  <div
                    key={`measure-${measure.measureNumber}`}
                    className={`p-3 rounded-2xl border transition-all relative ${
                      isCurrentMeasure
                        ? 'border-[#C5A869] ring-2 ring-[#C5A869]/30 bg-[#C5A869]/[0.04]'
                        : isMeasureInLoop
                        ? isDark
                          ? 'border-white/10 bg-white/[0.01]'
                          : 'border-black/10 bg-black/[0.01]'
                        : 'opacity-40 border-dashed border-black/10 dark:border-white/10'
                    }`}
                  >
                    {/* Measure Number & Section Tag */}
                    <div className="flex items-center justify-between text-[11px] font-bold opacity-60 mb-2">
                      <span>Bar {measure.measureNumber}</span>
                      {measure.sectionLabel && (
                        <span className="text-[10px] text-[#C5A869] font-normal truncate max-w-[120px]">
                          {measure.sectionLabel}
                        </span>
                      )}
                      {measure.repeatEnd && (
                        <span className="text-amber-500 font-mono text-xs">:|| Repeat</span>
                      )}
                    </div>

                    {/* Treble Clef Lane (Right Hand) */}
                    <div className="py-2 border-b border-black/10 dark:border-white/10">
                      <div className="flex items-center justify-between text-[10px] font-bold text-blue-600 dark:text-blue-400 mb-1">
                        <span>𝄞 Treble (RH)</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap min-h-[38px]">
                        {measure.trebleEvents.map((tItem, tIdx) => {
                          const isNote = !('notes' in tItem);
                          const note = isNote ? (tItem as NotationNote) : null;
                          const chord = !isNote ? (tItem as NotationChord) : null;
                          const isTarget =
                            currentExpectedEvent?.measureNumber === measure.measureNumber &&
                            (currentExpectedEvent.id === (tItem as any).id ||
                              currentExpectedEvent.notes.some((n) => n.id === (tItem as any).id));

                          if (note?.isRest) {
                            return (
                              <span
                                key={`t-rest-${tIdx}`}
                                className="px-2 py-1 rounded bg-black/5 dark:bg-white/5 text-[10px] opacity-50 font-serif italic"
                              >
                                𝄽 Rest
                              </span>
                            );
                          }

                          return (
                            <div
                              key={`t-${tIdx}`}
                              className={`px-2 py-1 rounded-lg border text-xs font-bold flex flex-col items-center transition-all ${
                                isTarget
                                  ? feedbackStatus === 'correct'
                                    ? 'bg-emerald-500 text-white border-emerald-500 scale-105 shadow-md'
                                    : feedbackStatus === 'wrong'
                                    ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                                    : 'bg-[#C5A869] text-[#081F5C] border-[#C5A869] ring-2 ring-[#C5A869]/50 scale-105'
                                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 opacity-90'
                              }`}
                            >
                              <span>
                                {chord
                                  ? chord.notes.map((n) => n.pitch).join('+')
                                  : note?.pitch}
                              </span>
                              <span className="text-[9px] font-normal opacity-80">
                                {chord
                                  ? 'Chord'
                                  : note?.fingering
                                  ? `F${note.fingering}`
                                  : note?.duration}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bass Clef Lane (Left Hand) */}
                    <div className="py-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-600 dark:text-amber-400 mb-1">
                        <span>𝄢 Bass (LH)</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap min-h-[38px]">
                        {measure.bassEvents.map((bItem, bIdx) => {
                          const isNote = !('notes' in bItem);
                          const note = isNote ? (bItem as NotationNote) : null;
                          const chord = !isNote ? (bItem as NotationChord) : null;
                          const isTarget =
                            currentExpectedEvent?.measureNumber === measure.measureNumber &&
                            (currentExpectedEvent.id === (bItem as any).id ||
                              currentExpectedEvent.notes.some((n) => n.id === (bItem as any).id));

                          if (note?.isRest) {
                            return (
                              <span
                                key={`b-rest-${bIdx}`}
                                className="px-2 py-1 rounded bg-black/5 dark:bg-white/5 text-[10px] opacity-50 font-serif italic"
                              >
                                𝄽 Rest
                              </span>
                            );
                          }

                          return (
                            <div
                              key={`b-${bIdx}`}
                              className={`px-2 py-1 rounded-lg border text-xs font-bold flex flex-col items-center transition-all ${
                                isTarget
                                  ? feedbackStatus === 'correct'
                                    ? 'bg-emerald-500 text-white border-emerald-500 scale-105 shadow-md'
                                    : feedbackStatus === 'wrong'
                                    ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                                    : 'bg-[#C5A869] text-[#081F5C] border-[#C5A869] ring-2 ring-[#C5A869]/50 scale-105'
                                  : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 opacity-90'
                              }`}
                            >
                              <span>
                                {chord
                                  ? chord.notes.map((n) => n.pitch).join('+')
                                  : note?.pitch}
                              </span>
                              <span className="text-[9px] font-normal opacity-80">
                                {chord
                                  ? 'Chord'
                                  : note?.fingering
                                  ? `F${note.fingering}`
                                  : note?.duration}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VIRTUAL PIANO KEYBOARD WITH OCTAVE & NOTE SYNCHRONIZATION */}
          <div
            className={`p-4 rounded-3xl border ${
              isDark ? 'bg-[#071330] border-white/10' : 'bg-white border-[#081F5C]/15 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold">
                  {lang === 'en' ? 'Virtual Piano Keyboard' : 'Virtual Piano Keyboard'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A869]/20 text-[#C5A869] font-semibold">
                  Middle C = C4
                </span>
              </div>
              <span className="text-[11px] opacity-60">
                {lang === 'en'
                  ? 'Key lights up when pressed on MIDI'
                  : 'MIDI press hone par key chamakti hai'}
              </span>
            </div>

            {/* Piano Keys Container */}
            <div className="relative h-36 sm:h-40 overflow-x-auto select-none flex justify-center py-2">
              <div className="flex relative shadow-md rounded-b-xl overflow-hidden border border-black/20 dark:border-white/20 bg-black/10">
                {KEYBOARD_KEYS.map((key) => {
                  const isPressed = activeMidiKeys.has(key.midi);
                  const isExpected =
                    currentExpectedEvent?.expectedMidis.includes(key.midi);

                  if (key.isBlack) {
                    return (
                      <button
                        key={`key-${key.midi}`}
                        onClick={() => handleVirtualKeyPress(key.midi)}
                        className={`absolute z-10 w-6 sm:w-7 h-20 sm:h-24 rounded-b-md transition-all cursor-pointer border border-black ${
                          isPressed
                            ? isExpected
                              ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                              : 'bg-rose-500 shadow-lg shadow-rose-500/50'
                            : isExpected
                            ? 'bg-amber-600 ring-2 ring-[#C5A869]'
                            : 'bg-zinc-900 hover:bg-zinc-800'
                        }`}
                        style={{
                          // Calculate offset relative to white keys
                          left: `${getBlackKeyOffset(key.midi)}px`,
                        }}
                        title={`${key.name} (MIDI ${key.midi})`}
                      >
                        <span className="absolute bottom-1.5 inset-x-0 text-center text-[9px] font-mono text-white/70">
                          {key.name.replace('#', '♯')}
                        </span>
                      </button>
                    );
                  }

                  // White Key
                  return (
                    <button
                      key={`key-${key.midi}`}
                      onClick={() => handleVirtualKeyPress(key.midi)}
                      className={`relative w-8 sm:w-10 h-32 sm:h-36 rounded-b-lg border-r border-black/20 flex flex-col justify-end items-center pb-2 transition-all cursor-pointer ${
                        isPressed
                          ? isExpected
                            ? 'bg-emerald-400 text-black shadow-inner'
                            : 'bg-rose-400 text-white shadow-inner'
                          : isExpected
                          ? 'bg-amber-100 dark:bg-amber-950/60 ring-2 ring-inset ring-[#C5A869]'
                          : 'bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                      title={`${key.name} (MIDI ${key.midi})`}
                    >
                      {/* Gold dot landmark for Middle C */}
                      {key.isMiddleC && (
                        <div className="absolute top-2 w-2 h-2 rounded-full bg-[#C5A869] ring-2 ring-[#C5A869]/40" />
                      )}
                      <span className="text-[10px] font-bold font-mono">
                        {key.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* PRACTICE SUMMARY MODAL / DRAWER */}
        {showSummaryModal && completedSummary && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div
              className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl text-center space-y-4 ${
                isDark
                  ? 'bg-[#081534] border-white/10 text-white'
                  : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
              }`}
            >
              <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C5A869]/20 text-[#C5A869]">
                  {lang === 'en' ? 'Practice Run Completed' : 'Riyaz Session Poora Hua'}
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl mt-1">
                  {completedSummary.accuracyPercent}%{' '}
                  <span className="text-sm font-normal opacity-80">
                    {lang === 'en' ? 'Accuracy' : 'Sateekta'}
                  </span>
                </h3>
              </div>

              {/* Calculated Real Metrics Table */}
              <div
                className={`p-4 rounded-2xl border text-left space-y-2 text-xs ${
                  isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-[#081F5C]/10'
                }`}
              >
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="opacity-70">{lang === 'en' ? 'Score' : 'Bandish'}:</span>
                  <span className="font-bold">{completedSummary.scoreTitle}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="opacity-70">{lang === 'en' ? 'Hand Evaluated' : 'Haath'}:</span>
                  <span className="font-bold capitalize">{completedSummary.handSelected}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="opacity-70">{lang === 'en' ? 'Correct Notes' : 'Sahi Sur'}:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {completedSummary.correctNotes} / {completedSummary.totalNotesPlayed}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="opacity-70">{lang === 'en' ? 'Practice Tempo' : 'Tempo'}:</span>
                  <span className="font-bold">{completedSummary.tempoBpm} BPM</span>
                </div>
                {completedSummary.needsPracticeSection && (
                  <div className="py-1">
                    <span className="opacity-70 block mb-0.5">
                      {lang === 'en' ? 'Notes to review' : 'Jin suron par dhyan dein'}:
                    </span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {completedSummary.needsPracticeSection}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleRestartSession}
                  className="flex-1 py-3 rounded-2xl bg-[#081F5C] hover:bg-[#0c2a7a] text-white dark:bg-[#C5A869] dark:text-[#081F5C] font-bold text-sm cursor-pointer shadow-md transition-colors"
                >
                  {lang === 'en' ? 'Practise Again' : 'Dobara Riyaz Karein'}
                </button>
                <button
                  onClick={() => setShowSummaryModal(false)}
                  className="py-3 px-4 rounded-2xl border border-black/15 dark:border-white/15 font-semibold text-sm cursor-pointer"
                >
                  {lang === 'en' ? 'Done' : 'Theek hai'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: REAL PRACTICE TIMER */}
        {showPracticeTimer && (
          <PracticeTimerModal
            isOpen={showPracticeTimer}
            studentId={studentId}
            courseId={score.courseId}
            classNumber={score.classNumber}
            initialContextTitle={`${lang === 'en' ? score.titleEn : score.titleHi} (${
              selectedHand === 'right'
                ? 'Right Hand'
                : selectedHand === 'left'
                ? 'Left Hand'
                : 'Both Hands'
            })`}
            hand={selectedHand}
            onClose={() => setShowPracticeTimer(false)}
            lang={lang}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
};

// Helper: Calculate pixel offset for black keys based on 32px (mobile) / 40px (desktop) white key width
function getBlackKeyOffset(midi: number): number {
  // Base offset mapping relative to C3 (midi 48)
  const isSm = typeof window !== 'undefined' && window.innerWidth < 640;
  const whiteKeyWidth = isSm ? 32 : 40;

  // C3=0, D3=1, E3=2, F3=3, G3=4, A3=5, B3=6, C4=7, D4=8, E4=9, F4=10, G4=11, A4=12, B4=13, C5=14, D5=15, E5=16, F5=17, G5=18
  const blackKeyPositions: Record<number, number> = {
    49: whiteKeyWidth * 1 - 12, // C#3
    51: whiteKeyWidth * 2 - 14, // D#3
    54: whiteKeyWidth * 4 - 12, // F#3
    56: whiteKeyWidth * 5 - 13, // G#3
    58: whiteKeyWidth * 6 - 15, // A#3

    61: whiteKeyWidth * 8 - 12, // C#4
    63: whiteKeyWidth * 9 - 14, // D#4
    66: whiteKeyWidth * 11 - 12, // F#4
    68: whiteKeyWidth * 12 - 13, // G#4
    70: whiteKeyWidth * 13 - 15, // A#4

    73: whiteKeyWidth * 15 - 12, // C#5
    75: whiteKeyWidth * 16 - 14, // D#5
    78: whiteKeyWidth * 18 - 12, // F#5
  };

  return blackKeyPositions[midi] || 0;
}
