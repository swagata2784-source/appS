import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Music2,
  Sparkles,
  Sliders,
  Radio,
  Layers,
} from 'lucide-react';
import {
  CourseChordItem,
  ChordInversionType,
  Language,
  Theme,
  UserStudentProfile,
  RecordedCourse,
  ChordPracticeProgress,
} from '../types';
import { COURSE_CHORDS_DATA, getChordsForCourse } from '../data/chordsData';
import { InteractiveStaffNotation } from './InteractiveStaffNotation';
import { InteractivePianoKeyboard } from './InteractivePianoKeyboard';
import { audioEngine } from '../utils/audioSynth';
import { midiManager } from '../utils/midiService';
import {
  getChordProgress,
  saveChordProgress,
  getLastSelectedChordId,
} from '../utils/chordScaleService';

interface ChordsScreenProps {
  student: UserStudentProfile;
  course: RecordedCourse;
  lang: Language;
  theme: Theme;
  onBack: () => void;
  onOpenPracticeTimer: (contextTitle: string) => void;
  initialChordId?: string;
}

export const ChordsScreen: React.FC<ChordsScreenProps> = ({
  student,
  course,
  lang,
  theme,
  onBack,
  onOpenPracticeTimer,
  initialChordId,
}) => {
  // Get all chords available for this student's recorded course
  const courseChords = useMemo(() => {
    const list = getChordsForCourse(course.id);
    return list.length > 0 ? list : COURSE_CHORDS_DATA;
  }, [course.id]);

  // Determine initial selected chord
  const [selectedChord, setSelectedChord] = useState<CourseChordItem | null>(() => {
    if (initialChordId) {
      const match = courseChords.find((c) => c.id === initialChordId);
      if (match) return match;
    }
    const lastId = getLastSelectedChordId(student.studentId);
    if (lastId) {
      const match = courseChords.find((c) => c.id === lastId);
      if (match) return match;
    }
    return null; // Show chords home list first
  });

  // Selected chord settings
  const [selectedInversion, setSelectedInversion] = useState<ChordInversionType>('root');
  const [selectedHand, setSelectedHand] = useState<'Right Hand' | 'Left Hand' | 'Both Hands'>('Right Hand');
  const [selectedMode, setSelectedMode] = useState<'block' | 'arpeggio'>('block');
  const [tempoBpm, setTempoBpm] = useState<number>(60);
  const [metronomeActive, setMetronomeActive] = useState<boolean>(false);

  // Playback & Animation states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activePlaybackMidi, setActivePlaybackMidi] = useState<number | null>(null);
  const playbackTimeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // MIDI practice states
  const [midiConnected, setMidiConnected] = useState<boolean>(false);
  const [midiDeviceName, setMidiDeviceName] = useState<string>('');
  const [pressedMidis, setPressedMidis] = useState<number[]>([]);
  const [midiEvaluation, setMidiEvaluation] = useState<{
    status: 'idle' | 'correct' | 'wrong';
    message: string;
    lastMidi?: number;
  }>({ status: 'idle', message: '' });

  // Progress tracking
  const [progress, setProgress] = useState<ChordPracticeProgress | null>(null);

  // Load progress when selected chord changes
  useEffect(() => {
    if (!selectedChord) return;
    const p = getChordProgress(student.studentId, selectedChord.id);
    setProgress(p);
    setSelectedInversion(p.lastSelectedInversion || 'root');
    setSelectedHand(p.lastSelectedHand || 'Right Hand');
    setSelectedMode(p.lastSelectedMode || 'block');
    setTempoBpm(selectedChord.defaultTempoBpm || 60);
  }, [selectedChord, student.studentId]);

  // Current active inversion configuration
  const currentInversionConfig = useMemo(() => {
    if (!selectedChord) return null;
    return (
      selectedChord.inversions.find((inv) => inv.inversion === selectedInversion) ||
      selectedChord.inversions[0]
    );
  }, [selectedChord, selectedInversion]);

  // Stop playback when component unmounts or settings change
  const stopPlayback = () => {
    playbackTimeoutRefs.current.forEach(clearTimeout);
    playbackTimeoutRefs.current = [];
    setIsPlaying(false);
    setActivePlaybackMidi(null);
  };

  useEffect(() => {
    return () => {
      stopPlayback();
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    };
  }, []);

  // Metronome tick effect
  useEffect(() => {
    if (!metronomeActive) {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
      metronomeIntervalRef.current = null;
      return;
    }
    const intervalMs = (60 / tempoBpm) * 1000;
    let beat = 0;
    audioEngine.playMetronomeClick(true);
    metronomeIntervalRef.current = setInterval(() => {
      beat = (beat + 1) % 4;
      audioEngine.playMetronomeClick(beat === 0);
    }, intervalMs);

    return () => {
      if (metronomeIntervalRef.current) clearInterval(metronomeIntervalRef.current);
    };
  }, [metronomeActive, tempoBpm]);

  // Web MIDI setup
  useEffect(() => {
    let isMounted = true;
    midiManager.initialize({
      onNoteOn: (evt) => {
        if (!isMounted) return;
        setPressedMidis((prev) => Array.from(new Set([...prev, evt.midiNumber])));
        audioEngine.playNoteTone(evt.midiNumber, evt.velocity);

        // Evaluate chord if student is practising on MIDI
        if (currentInversionConfig) {
          evaluateMidiChord(evt.midiNumber);
        }
      },
      onNoteOff: (evt) => {
        if (!isMounted) return;
        setPressedMidis((prev) => prev.filter((m) => m !== evt.midiNumber));
      },
      onDevicesChange: (devices) => {
        if (!isMounted) return;
        const connected = devices.length > 0;
        setMidiConnected(connected);
        setMidiDeviceName(connected ? devices[0].name : '');
      },
      onDeviceDisconnect: () => {
        if (!isMounted) return;
        setMidiConnected(false);
        setMidiDeviceName('');
      },
    }).then((res) => {
      if (!isMounted) return;
      setMidiConnected(res.devices.length > 0);
      if (res.devices.length > 0) setMidiDeviceName(res.devices[0].name);
    });

    return () => {
      isMounted = false;
    };
  }, [currentInversionConfig]);

  // Real chord evaluation
  const evaluateMidiChord = (incomingMidi: number) => {
    if (!currentInversionConfig || !selectedChord) return;
    const expectedMidis = currentInversionConfig.notes.map((n) => n.midiNumber);
    const expectedPitchClasses = currentInversionConfig.notes.map((n) => n.midiNumber % 12);

    // Check if incoming note is in the chord
    const incomingPitchClass = incomingMidi % 12;
    const isNoteInChord = expectedPitchClasses.includes(incomingPitchClass);

    if (isNoteInChord) {
      // Check if all expected chord notes are now pressed (or active)
      const currentCombined = Array.from(new Set([...pressedMidis, incomingMidi]));
      const allPressed = expectedMidis.every((m) =>
        currentCombined.some((p) => p % 12 === m % 12)
      );

      if (allPressed) {
        audioEngine.playSuccessChime();
        setMidiEvaluation({
          status: 'correct',
          message: lang === 'en' ? '✓ Correct Chord!' : '✓ Sahi Chord!',
          lastMidi: incomingMidi,
        });

        // Real progress update
        const updated = saveChordProgress(student.studentId, selectedChord.id, {
          attemptsCount: (progress?.attemptsCount || 0) + 1,
          successfulMidiCompletions: (progress?.successfulMidiCompletions || 0) + 1,
          bestResult: 'Correct',
          lastSelectedInversion: selectedInversion,
          lastSelectedHand: selectedHand,
          lastSelectedMode: selectedMode,
        });
        setProgress(updated);
      } else {
        setMidiEvaluation({
          status: 'idle',
          message: `${lang === 'en' ? 'Good note' : 'Achha note'}: ${incomingMidi}`,
          lastMidi: incomingMidi,
        });
      }
    } else {
      audioEngine.playWrongChime();
      setMidiEvaluation({
        status: 'wrong',
        message: lang === 'en' ? 'Try Again' : 'Dobara Prayas Karein',
        lastMidi: incomingMidi,
      });

      // Increment attempt count on error
      const updated = saveChordProgress(student.studentId, selectedChord.id, {
        attemptsCount: (progress?.attemptsCount || 0) + 1,
        bestResult: progress?.bestResult || 'Attempted',
      });
      setProgress(updated);
    }
  };

  // Real Playback Logic
  const handlePlayChord = () => {
    if (!currentInversionConfig) return;
    stopPlayback();
    setIsPlaying(true);

    if (selectedMode === 'block') {
      // Play all notes simultaneously as a block chord
      currentInversionConfig.notes.forEach((note) => {
        audioEngine.playNoteTone(note.midiNumber, 85, 1.8);
      });
      setActivePlaybackMidi(currentInversionConfig.notes[0].midiNumber);
      const t = setTimeout(() => {
        setIsPlaying(false);
        setActivePlaybackMidi(null);
      }, 1800);
      playbackTimeoutRefs.current.push(t);
    } else {
      // Arpeggiated sequence
      const seq =
        currentInversionConfig.arpeggioSequenceMidi ||
        currentInversionConfig.notes.map((n) => n.midiNumber);
      const noteDelay = (60 / tempoBpm) * 500; // eighth notes

      seq.forEach((midi, idx) => {
        const t = setTimeout(() => {
          setActivePlaybackMidi(midi);
          audioEngine.playNoteTone(midi, 85, 0.7);
          if (idx === seq.length - 1) {
            const finish = setTimeout(() => {
              setIsPlaying(false);
              setActivePlaybackMidi(null);
            }, 800);
            playbackTimeoutRefs.current.push(finish);
          }
        }, idx * noteDelay);
        playbackTimeoutRefs.current.push(t);
      });
    }
  };

  // Finger numbers map for keyboard
  const keyboardFingerMap = useMemo(() => {
    if (!currentInversionConfig) return {};
    const map: Record<number, number> = {};
    const fingers =
      selectedHand === 'Left Hand'
        ? currentInversionConfig.fingeringLeftHand
        : currentInversionConfig.fingeringRightHand;

    if (fingers && fingers.length === currentInversionConfig.notes.length) {
      currentInversionConfig.notes.forEach((n, idx) => {
        map[n.midiNumber] = fingers[idx];
      });
    }
    return map;
  }, [currentInversionConfig, selectedHand]);

  // Expected MIDI notes array for keyboard highlighting
  const chordMidis = useMemo(() => {
    if (!currentInversionConfig) return [];
    return currentInversionConfig.notes.map((n) => n.midiNumber);
  }, [currentInversionConfig]);

  // =========================================================================
  // VIEW 1: CHORDS HOME (List of course-specific chords)
  // =========================================================================
  if (!selectedChord) {
    return (
      <div className="min-h-screen bg-[#F7F2EB] dark:bg-[#050D24] text-[#081F5C] dark:text-[#F7F2EB] pb-24 transition-colors">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-[#081F5C] text-white px-4 py-3.5 shadow-md flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-white"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight">
                {lang === 'en' ? 'Chords' : 'Chords (हार्मनी)'}
              </h1>
              <p className="text-[11px] text-white/70">
                {course.titleEn}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#C5A869]/20 text-[#C5A869] border border-[#C5A869]/30">
            {courseChords.length} {lang === 'en' ? 'Available' : 'उपलब्ध'}
          </span>
        </div>

        {/* Content Container */}
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1736] border border-[#081F5C]/10 dark:border-white/10 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C5A869]/15 text-[#C5A869] flex items-center justify-center flex-shrink-0 mt-0.5">
                <Music2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display text-sm font-bold">
                  {lang === 'en' ? 'Recorded Course Chords' : 'रिकॉर्डेड कोर्स के Chords'}
                </h2>
                <p className="text-xs opacity-75 leading-relaxed">
                  {lang === 'en'
                    ? 'Learn, hear, and practise the actual piano chords taught in this course with real staff notation, fingering, inversions, and MIDI recognition.'
                    : 'इस कोर्स में सिखाए गए chords को real staff notation, fingering, inversions aur MIDI detection ke sath sikhein.'}
                </p>
              </div>
            </div>
          </div>

          {/* Chords List */}
          <div className="space-y-3">
            {courseChords.map((chord) => {
              const chordProg = getChordProgress(student.studentId, chord.id);
              const rootNotesStr = chord.inversions[0].notes.map((n) => n.letter).join(' – ');
              const rhFingering = chord.inversions[0].fingeringRightHand?.join(' – ');

              return (
                <div
                  key={chord.id}
                  onClick={() => setSelectedChord(chord)}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1E45] border border-[#081F5C]/10 dark:border-white/10 shadow-xs hover:border-[#C5A869]/50 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-base sm:text-lg font-bold group-hover:text-[#C5A869] transition-colors">
                          {chord.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#C5A869]/15 text-[#C5A869]">
                          {chord.chordType}
                        </span>
                      </div>

                      <p className="text-xs opacity-75 line-clamp-2">
                        {lang === 'en' ? chord.shortDescriptionEn : chord.shortDescriptionHi}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] pt-1 opacity-85">
                        <span className="font-mono font-semibold">
                          Notes: {rootNotesStr}
                        </span>
                        {rhFingering && (
                          <span className="font-mono text-[#C5A869]">
                            • Fingering (RH): {rhFingering}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        type="button"
                        className="px-3.5 py-1.5 rounded-full bg-[#081F5C] text-white dark:bg-[#F7F2EB] dark:text-[#081F5C] text-xs font-bold shadow-xs group-hover:scale-105 transition-transform flex items-center gap-1"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{lang === 'en' ? 'Practice' : 'खोलो'}</span>
                      </button>

                      {chordProg.bestResult !== 'Not Practised' && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{chordProg.bestResult}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: CHORD DETAIL & PRACTICE (Real Notation, Piano, Inversion, MIDI)
  // =========================================================================
  const notesDisplayString = currentInversionConfig
    ? currentInversionConfig.notes.map((n) => n.letter).join(' – ')
    : '';

  const currentFingering =
    selectedHand === 'Left Hand'
      ? currentInversionConfig?.fingeringLeftHand?.join(' – ')
      : currentInversionConfig?.fingeringRightHand?.join(' – ');

  return (
    <div className="min-h-screen bg-[#F7F2EB] dark:bg-[#050D24] text-[#081F5C] dark:text-[#F7F2EB] pb-24 transition-colors">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-[#081F5C] text-white px-4 py-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedChord(null)}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-white"
            aria-label="Back to Chords"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-lg font-bold tracking-tight">
              {selectedChord.name}
            </h1>
            <p className="text-[11px] text-[#C5A869]">
              {currentInversionConfig?.labelEn}
            </p>
          </div>
        </div>

        {/* Practice Timer Connection Button */}
        <button
          onClick={() =>
            onOpenPracticeTimer(`${selectedChord.name} (${currentInversionConfig?.labelEn || ''})`)
          }
          className="px-3 py-1.5 rounded-full bg-[#C5A869] text-[#081F5C] text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#b59859] cursor-pointer"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Practice Timer' : 'टाइमर'}</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Inversion Selector Tabs */}
        {selectedChord.inversions.length > 1 && (
          <div className="p-1 rounded-2xl bg-[#081F5C]/5 dark:bg-white/5 flex gap-1">
            {selectedChord.inversions.map((inv) => (
              <button
                key={inv.inversion}
                onClick={() => {
                  stopPlayback();
                  setSelectedInversion(inv.inversion);
                  saveChordProgress(student.studentId, selectedChord.id, {
                    lastSelectedInversion: inv.inversion,
                  });
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                  selectedInversion === inv.inversion
                    ? 'bg-[#081F5C] text-white dark:bg-[#F7F2EB] dark:text-[#081F5C] shadow-xs'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                {inv.inversion === 'root'
                  ? 'Root'
                  : inv.inversion === 'first'
                  ? '1st Inversion'
                  : '2nd Inversion'}
              </button>
            ))}
          </div>
        )}

        {/* Note Names & Fingering Header Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1E45] border border-[#081F5C]/10 dark:border-white/10 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A869]">
              Notes
            </span>
            <div className="font-mono text-lg font-extrabold tracking-wide">
              {notesDisplayString}
            </div>
          </div>

          {currentFingering && (
            <div className="space-y-0.5 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A869]">
                Fingering ({selectedHand})
              </span>
              <div className="font-mono text-sm font-bold">
                {currentFingering}
              </div>
            </div>
          )}
        </div>

        {/* Staff Notation View (Generated SVG) */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0B1736] border border-[#081F5C]/10 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold opacity-75 px-1">
            <span className="flex items-center gap-1 text-[#C5A869]">
              <Music2 className="w-3.5 h-3.5" />
              <span>Staff Notation</span>
            </span>
            <span className="font-mono">
              Clef: {selectedHand === 'Left Hand' ? 'Bass' : 'Treble'}
            </span>
          </div>

          <InteractiveStaffNotation
            type="chord"
            clef={selectedHand === 'Left Hand' ? 'bass' : 'treble'}
            chordNotes={currentInversionConfig?.notes || []}
            activeNoteMidi={activePlaybackMidi}
            displayMode={selectedMode}
            keySignatureName={selectedChord.name}
            timeSignature={selectedChord.timeSignature || '4/4'}
          />
        </div>

        {/* Piano Keyboard View */}
        <div className="p-4 rounded-3xl bg-white dark:bg-[#0B1736] border border-[#081F5C]/10 dark:border-white/10 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold opacity-75 px-1">
            <span>Piano Keyboard</span>
            <span className="text-[11px] font-mono text-[#C5A869]">
              Tap keys to play
            </span>
          </div>

          <InteractivePianoKeyboard
            startMidi={53} // F3
            endMidi={76}   // E5
            highlightedMidis={chordMidis}
            activeMidi={activePlaybackMidi}
            fingerMap={keyboardFingerMap}
            midiFeedback={
              midiEvaluation.status === 'correct' && midiEvaluation.lastMidi
                ? { midi: midiEvaluation.lastMidi, isCorrect: true }
                : midiEvaluation.status === 'wrong' && midiEvaluation.lastMidi
                ? { midi: midiEvaluation.lastMidi, isCorrect: false }
                : null
            }
            onKeyClick={(midi) => {
              audioEngine.playNoteTone(midi, 85);
              evaluateMidiChord(midi);
            }}
          />
        </div>

        {/* Hand & Mode Controls */}
        <div className="grid grid-cols-2 gap-3">
          {/* Hand Selection */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#0E1E45] border border-[#081F5C]/10 dark:border-white/10 space-y-1.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A869]">
              Hand Selection
            </span>
            <div className="flex gap-1">
              {(['Right Hand', 'Left Hand', 'Both Hands'] as const).map((hand) => (
                <button
                  key={hand}
                  onClick={() => {
                    setSelectedHand(hand);
                    saveChordProgress(student.studentId, selectedChord.id, {
                      lastSelectedHand: hand,
                    });
                  }}
                  className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer text-center ${
                    selectedHand === hand
                      ? 'bg-[#081F5C] text-white dark:bg-[#F7F2EB] dark:text-[#081F5C]'
                      : 'bg-black/5 dark:bg-white/5 opacity-75 hover:opacity-100'
                  }`}
                >
                  {hand === 'Right Hand' ? 'RH' : hand === 'Left Hand' ? 'LH' : 'Both'}
                </button>
              ))}
            </div>
          </div>

          {/* Block vs Arpeggio Mode */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#0E1E45] border border-[#081F5C]/10 dark:border-white/10 space-y-1.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A869]">
              Chord Arrangement
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => {
                  stopPlayback();
                  setSelectedMode('block');
                  saveChordProgress(student.studentId, selectedChord.id, {
                    lastSelectedMode: 'block',
                  });
                }}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer text-center ${
                  selectedMode === 'block'
                    ? 'bg-[#081F5C] text-white dark:bg-[#F7F2EB] dark:text-[#081F5C]'
                    : 'bg-black/5 dark:bg-white/5 opacity-75 hover:opacity-100'
                }`}
              >
                Block
              </button>
              <button
                onClick={() => {
                  stopPlayback();
                  setSelectedMode('arpeggio');
                  saveChordProgress(student.studentId, selectedChord.id, {
                    lastSelectedMode: 'arpeggio',
                  });
                }}
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-colors cursor-pointer text-center ${
                  selectedMode === 'arpeggio'
                    ? 'bg-[#081F5C] text-white dark:bg-[#F7F2EB] dark:text-[#081F5C]'
                    : 'bg-black/5 dark:bg-white/5 opacity-75 hover:opacity-100'
                }`}
              >
                Arpeggio
              </button>
            </div>
          </div>
        </div>

        {/* Playback Controls & Tempo Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1E45] border border-[#081F5C]/10 dark:border-white/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={isPlaying ? stopPlayback : handlePlayChord}
                className="w-11 h-11 rounded-full bg-[#081F5C] text-white dark:bg-[#F7F2EB] dark:text-[#081F5C] flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>
              <button
                onClick={handlePlayChord}
                className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer opacity-80"
                title="Replay"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Metronome Toggle */}
            <button
              onClick={() => setMetronomeActive(!metronomeActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                metronomeActive
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40'
                  : 'bg-black/5 dark:bg-white/5 border-transparent opacity-75'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Metronome: {metronomeActive ? 'On' : 'Off'}</span>
            </button>
          </div>

          {/* Real Tempo Slider (Active in arpeggio mode or metronome) */}
          <div className="space-y-1 pt-1 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold opacity-75">Tempo</span>
              <span className="font-mono font-bold text-[#C5A869]">{tempoBpm} BPM</span>
            </div>
            <input
              type="range"
              min="40"
              max="160"
              step="4"
              value={tempoBpm}
              onChange={(e) => setTempoBpm(parseInt(e.target.value, 10))}
              className="w-full accent-[#C5A869] cursor-pointer"
            />
          </div>
        </div>

        {/* MIDI Connection & Detection Status Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E1E45] border border-[#081F5C]/10 dark:border-white/10 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio
                className={`w-4 h-4 ${
                  midiConnected ? 'text-emerald-500 animate-pulse' : 'text-slate-400'
                }`}
              />
              <span className="text-xs font-bold">
                {midiConnected
                  ? `MIDI: ${midiDeviceName || 'Connected'}`
                  : 'MIDI: Not Connected (Screen taps enabled)'}
              </span>
            </div>

            {progress && (
              <span className="text-[11px] font-mono opacity-70">
                Attempts: {progress.attemptsCount}
              </span>
            )}
          </div>

          {/* MIDI Evaluation feedback box */}
          {midiEvaluation.message && (
            <div
              className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                midiEvaluation.status === 'correct'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : midiEvaluation.status === 'wrong'
                  ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
                  : 'bg-black/5 dark:bg-white/5 opacity-85'
              }`}
            >
              {midiEvaluation.status === 'correct' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : midiEvaluation.status === 'wrong' ? (
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#C5A869] flex-shrink-0" />
              )}
              <span>{midiEvaluation.message}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
