import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  Music2,
  BookOpen,
  Sparkles,
  Play,
  Square,
  Clock,
  CheckCircle2,
  Filter,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  Volume2,
  ArrowLeft,
  Calendar,
  Award,
  Info,
  Compass,
  Check,
} from 'lucide-react';
import {
  SongItem,
  SongLevel,
  SongDifficulty,
  SongLearningStatus,
  SongProgressState,
  Language,
  Theme,
  StudentAccount,
  RecordedCourse,
  SheetMusicItem,
  InteractiveScore,
} from '../types';
import { SONG_LIBRARY_DATA } from '../data/songsData';
import {
  getAllSongProgress,
  saveSongLearningStatus,
  getRecentlyPracticedSongs,
} from '../utils/studentLearningService';
import { audioEngine } from '../utils/audioSynth';
import { SheetMusicViewerModal } from './SheetMusicViewerModal';
import { InteractiveSheetMusicModal } from './InteractiveSheetMusicModal';
import { PracticeTimerModal } from './PracticeTimerModal';
import { PracticeJournalModal } from './PracticeJournalModal';

interface SongLibraryScreenProps {
  student: StudentAccount;
  course: RecordedCourse;
  onBack: () => void;
  lang: Language;
  theme: Theme;
  onToggleTheme?: () => void;
  onToggleLang?: () => void;
}

export const SongLibraryScreen: React.FC<SongLibraryScreenProps> = ({
  student,
  course,
  onBack,
  lang,
  theme,
  onToggleTheme,
  onToggleLang,
}) => {
  const isDark = theme === 'dark';

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SongLevel | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<SongDifficulty | 'All'>('All');
  const [viewTab, setViewTab] = useState<'all' | 'my-songs' | 'recent'>('all');
  const [mySongsStatusFilter, setMySongsStatusFilter] = useState<SongLearningStatus | 'All'>('All');

  // Persistent song progress state
  const [progressMap, setProgressMap] = useState<Record<string, SongProgressState>>(() =>
    getAllSongProgress(student.studentId)
  );

  // Active Modals
  const [selectedSongDetails, setSelectedSongDetails] = useState<SongItem | null>(null);
  const [activeSheetMusicItem, setActiveSheetMusicItem] = useState<SheetMusicItem | null>(null);
  const [activeInteractiveScore, setActiveInteractiveScore] = useState<InteractiveScore | null>(null);
  const [timerSong, setTimerSong] = useState<SongItem | null>(null);
  const [showJournalModal, setShowJournalModal] = useState(false);

  // Audio preview state
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const audioTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

  // Refresh progress from storage
  const refreshProgress = () => {
    setProgressMap(getAllSongProgress(student.studentId));
  };

  // Stop any audio playback on unmount
  useEffect(() => {
    return () => {
      audioTimeoutsRef.current.forEach(clearTimeout);
      audioTimeoutsRef.current = [];
    };
  }, []);

  const handleStopAudio = () => {
    audioTimeoutsRef.current.forEach(clearTimeout);
    audioTimeoutsRef.current = [];
    setPlayingSongId(null);
  };

  const handlePlaySongAudio = (song: SongItem) => {
    if (playingSongId === song.id) {
      handleStopAudio();
      return;
    }

    handleStopAudio();
    if (!song.melodyAudio || song.melodyAudio.length === 0) return;

    setPlayingSongId(song.id);
    let cumulativeDelay = 0;

    song.melodyAudio.forEach((note) => {
      const t = setTimeout(() => {
        audioEngine.playNoteTone(note.midiNumber, 85, note.durationSeconds);
      }, cumulativeDelay * 1000);
      audioTimeoutsRef.current.push(t);
      cumulativeDelay += note.durationSeconds;
    });

    const endTimer = setTimeout(() => {
      setPlayingSongId(null);
    }, (cumulativeDelay + 0.5) * 1000);
    audioTimeoutsRef.current.push(endTimer);
  };

  // Handle status update
  const handleUpdateStatus = (songId: string, newStatus: SongLearningStatus) => {
    saveSongLearningStatus(student.studentId, songId, newStatus);
    refreshProgress();
    if (selectedSongDetails && selectedSongDetails.id === songId) {
      // update details modal state
      setSelectedSongDetails((prev) => (prev ? { ...prev } : null));
    }
  };

  // Filtered songs computation
  const filteredSongs = useMemo(() => {
    let list = SONG_LIBRARY_DATA;

    // View tab filtering
    if (viewTab === 'recent') {
      list = getRecentlyPracticedSongs(student.studentId, SONG_LIBRARY_DATA);
    } else if (viewTab === 'my-songs') {
      list = list.filter((s) => {
        const prog = progressMap[s.id];
        const status = prog?.status || 'Not Started';
        if (mySongsStatusFilter === 'All') {
          // Show anything with status !== 'Not Started' or explicitly tracked
          return status !== 'Not Started' || (prog && prog.totalPracticeSeconds > 0);
        }
        return status === mySongsStatusFilter;
      });
    }

    // Level filter
    if (selectedLevel !== 'All') {
      list = list.filter((s) => s.level === selectedLevel);
    }

    // Difficulty filter
    if (selectedDifficulty !== 'All') {
      list = list.filter((s) => s.difficulty === selectedDifficulty);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.titleHi && s.titleHi.toLowerCase().includes(q)) ||
          s.artistOrComposer.toLowerCase().includes(q) ||
          s.genre.toLowerCase().includes(q) ||
          s.keySignature.toLowerCase().includes(q)
      );
    }

    return list;
  }, [searchQuery, selectedLevel, selectedDifficulty, viewTab, mySongsStatusFilter, progressMap, student.studentId]);

  // Counts for summary badges
  const mySongsCount = useMemo(() => {
    return (Object.values(progressMap) as SongProgressState[]).filter(
      (p) => p.status !== 'Not Started' || p.totalPracticeSeconds > 0
    ).length;
  }, [progressMap]);

  const learningCount = useMemo(() => {
    return (Object.values(progressMap) as SongProgressState[]).filter((p) => p.status === 'Learning').length;
  }, [progressMap]);

  const practisingCount = useMemo(() => {
    return (Object.values(progressMap) as SongProgressState[]).filter((p) => p.status === 'Practising').length;
  }, [progressMap]);

  const completedCount = useMemo(() => {
    return (Object.values(progressMap) as SongProgressState[]).filter((p) => p.status === 'Completed').length;
  }, [progressMap]);

  // Helper for difficulty pill color
  const getDifficultyBadge = (diff: SongDifficulty) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Advanced':
        return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30';
    }
  };

  // Helper for level badge color
  const getLevelBadge = (level: SongLevel) => {
    switch (level) {
      case 'Bollywood':
        return 'bg-[#C5A869]/20 text-[#C5A869] border-[#C5A869]/40';
      case 'Bengali':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'Rabindra Sangeet':
        return 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30';
      case 'Western Classical':
        return 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      default:
        return 'bg-[#081F5C]/10 text-[#081F5C] dark:text-white border-[#081F5C]/20';
    }
  };

  // Helper for status badge
  const getStatusBadge = (status: SongLearningStatus) => {
    switch (status) {
      case 'Learning':
        return 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30';
      case 'Practising':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Completed':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div
      id="song-library-screen"
      className={`min-h-screen transition-colors ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      {/* ================================================== */}
      {/* 1. TOP NAVIGATION & HEADER */}
      {/* ================================================== */}
      <header className="sticky top-0 z-30 border-b border-[#081F5C]/10 dark:border-white/10 bg-white/95 dark:bg-[#071333]/95 backdrop-blur-md px-4 sm:px-8 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl border border-[#081F5C]/15 dark:border-white/15 hover:bg-[#081F5C]/5 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Back to Learn"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'en' ? 'Back' : 'Peeche'}</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight">
                  {lang === 'en' ? 'Song Library' : 'Song Library'}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C5A869]/20 text-[#C5A869] border border-[#C5A869]/40">
                  {SONG_LIBRARY_DATA.length} Repertoire Pieces
                </span>
              </div>
              <p className="text-xs opacity-75 hidden sm:block">
                {lang === 'en'
                  ? 'Master Bollywood, Bengali, Rabindra Sangeet & Western Classical repertoire.'
                  : 'Bollywood, Bengali, Rabindra Sangeet aur Western Classical sangeet ka sangrah.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setShowJournalModal(true)}
              className="px-3.5 py-1.5 rounded-full border border-[#081F5C]/15 dark:border-white/15 hover:border-[#C5A869] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#C5A869]" />
              <span>{lang === 'en' ? 'Practice Journal' : 'Riyaz Journal'}</span>
            </button>

            {onToggleLang && (
              <button
                onClick={onToggleLang}
                className="px-2.5 py-1.5 rounded-full border border-[#081F5C]/15 dark:border-white/15 text-xs font-bold hover:bg-[#081F5C]/5 dark:hover:bg-white/5 cursor-pointer"
              >
                {lang === 'en' ? 'हिंदी' : 'English'}
              </button>
            )}

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 rounded-full border border-[#081F5C]/15 dark:border-white/15 text-xs hover:bg-[#081F5C]/5 dark:hover:bg-white/5 cursor-pointer"
                title="Toggle Theme"
              >
                {theme === 'dark' ? '☀️' : '🌙'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ================================================== */}
      {/* 2. STATS & SUMMARY PILLS */}
      {/* ================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl border border-[#081F5C]/10 dark:border-white/10 bg-white dark:bg-[#071333] shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#081F5C]/10 dark:bg-white/10 text-[#081F5C] dark:text-white flex items-center justify-center flex-shrink-0">
              <Compass className="w-4 h-4 text-[#C5A869]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Total Songs</span>
              <p className="font-display font-bold text-base sm:text-lg">{SONG_LIBRARY_DATA.length}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-[#081F5C]/10 dark:border-white/10 bg-white dark:bg-[#071333] shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Learning</span>
              <p className="font-display font-bold text-base sm:text-lg text-sky-600 dark:text-sky-400">{learningCount}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-[#081F5C]/10 dark:border-white/10 bg-white dark:bg-[#071333] shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Practising</span>
              <p className="font-display font-bold text-base sm:text-lg text-amber-600 dark:text-amber-400">{practisingCount}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl border border-[#081F5C]/10 dark:border-white/10 bg-white dark:bg-[#071333] shadow-xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Completed</span>
              <p className="font-display font-bold text-base sm:text-lg text-emerald-600 dark:text-emerald-400">{completedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* 3. SEARCH & FILTERS CONTROL BAR */}
      {/* ================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'en'
                ? 'Search songs by title, artist, composer, genre (e.g. Kal Ho Naa Ho, Tagore, Beethoven)...'
                : 'Song ka naam, kalakar, composer ya genre khojein...'
            }
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-[#081F5C]/15 dark:border-white/15 bg-white dark:bg-[#071333] text-sm focus:outline-none focus:border-[#C5A869] shadow-xs transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg opacity-60 hover:opacity-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#081F5C]/5 dark:bg-white/5 border border-[#081F5C]/10 dark:border-white/10 text-xs font-bold">
            <button
              onClick={() => setViewTab('all')}
              className={`px-3.5 py-1.5 rounded-xl cursor-pointer transition-all ${
                viewTab === 'all'
                  ? 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              {lang === 'en' ? 'All Songs' : 'Sabhi Songs'} ({SONG_LIBRARY_DATA.length})
            </button>

            <button
              onClick={() => setViewTab('my-songs')}
              className={`px-3.5 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                viewTab === 'my-songs'
                  ? 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <span>{lang === 'en' ? 'My Songs' : 'Mere Songs'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#C5A869] text-[#081F5C] font-bold">
                {mySongsCount}
              </span>
            </button>

            <button
              onClick={() => setViewTab('recent')}
              className={`px-3.5 py-1.5 rounded-xl cursor-pointer transition-all flex items-center gap-1.5 ${
                viewTab === 'recent'
                  ? 'bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] shadow-xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Recently Practised' : 'Haal Ka Riyaz'}</span>
            </button>
          </div>

          {/* Subfilter for My Songs */}
          {viewTab === 'my-songs' && (
            <div className="flex items-center gap-1 text-xs">
              <span className="opacity-60 text-[11px] font-semibold mr-1">Status:</span>
              {(['All', 'Learning', 'Practising', 'Completed', 'Not Started'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setMySongsStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                    mySongsStatusFilter === st
                      ? 'bg-[#C5A869]/20 text-[#C5A869] border-[#C5A869]'
                      : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Level and Difficulty Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#081F5C]/10 dark:border-white/10">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A869] flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" />
            Level:
          </span>
          {(['All', 'Bollywood', 'Bengali', 'Rabindra Sangeet', 'Western Classical'] as const).map(
            (lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-[#081F5C] text-white dark:bg-white dark:text-[#081F5C] border-transparent shadow-xs'
                    : 'border-[#081F5C]/15 dark:border-white/15 opacity-75 hover:opacity-100'
                }`}
              >
                {lvl === 'All' ? 'All Repertoire' : lvl}
              </button>
            )
          )}

          <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1 hidden sm:block" />

          <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A869] flex items-center gap-1 mr-1">
            Difficulty:
          </span>
          {(['All', 'Easy', 'Medium', 'Advanced'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                selectedDifficulty === diff
                  ? 'bg-[#C5A869] text-[#081F5C] border-transparent font-bold shadow-xs'
                  : 'border-[#081F5C]/15 dark:border-white/15 opacity-75 hover:opacity-100'
              }`}
            >
              {diff === 'All' ? 'All Difficulties' : diff}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================== */}
      {/* 4. SONG CARDS GRID */}
      {/* ================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-4 pb-20">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-bold opacity-70">
            {lang === 'en'
              ? `Showing ${filteredSongs.length} ${filteredSongs.length === 1 ? 'song' : 'songs'}`
              : `${filteredSongs.length} songs upalabdh hain`}
          </span>

          {(selectedLevel !== 'All' || selectedDifficulty !== 'All' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedLevel('All');
                setSelectedDifficulty('All');
                setSearchQuery('');
              }}
              className="text-xs text-[#C5A869] hover:underline font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {filteredSongs.length === 0 ? (
          <div className="py-16 text-center rounded-3xl border border-dashed border-[#081F5C]/20 dark:border-white/20 p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#C5A869]/15 text-[#C5A869] mx-auto flex items-center justify-center">
              <Music2 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base">
              {lang === 'en' ? 'No songs match your filter' : 'Koi song match nahi hua'}
            </h3>
            <p className="text-xs opacity-75 max-w-sm mx-auto">
              {lang === 'en'
                ? 'Try adjusting your search keywords, clearing difficulty filters, or browsing all repertoire.'
                : 'Search terms badal kar ya filter hata kar dobara dekhein.'}
            </p>
            <button
              onClick={() => {
                setSelectedLevel('All');
                setSelectedDifficulty('All');
                setSearchQuery('');
                setViewTab('all');
              }}
              className="px-4 py-2 rounded-full bg-[#081F5C] text-white dark:bg-white dark:text-[#081F5C] text-xs font-bold cursor-pointer hover:opacity-90"
            >
              Show All Songs
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredSongs.map((song) => {
              const prog = progressMap[song.id];
              const status: SongLearningStatus = prog?.status || 'Not Started';
              const isAudioPlaying = playingSongId === song.id;
              const practiceMinutes = prog ? Math.round((prog.totalPracticeSeconds / 60) * 10) / 10 : 0;

              return (
                <div
                  key={song.id}
                  className="rounded-3xl border border-[#081F5C]/15 dark:border-white/10 bg-white dark:bg-[#071333] p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-[#C5A869]/60 transition-all group"
                >
                  <div className="space-y-3">
                    {/* Level & Difficulty Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getLevelBadge(
                            song.level
                          )}`}
                        >
                          {song.level}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getDifficultyBadge(
                            song.difficulty
                          )}`}
                        >
                          {song.difficulty}
                        </span>
                      </div>

                      {/* Status Dropdown / Pill */}
                      <div className="relative">
                        <select
                          value={status}
                          onChange={(e) =>
                            handleUpdateStatus(song.id, e.target.value as SongLearningStatus)
                          }
                          className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none appearance-none pr-5 ${getStatusBadge(
                            status
                          )}`}
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="Learning">Learning</option>
                          <option value="Practising">Practising</option>
                          <option value="Completed">Completed</option>
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] opacity-60">
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* Title & Artist */}
                    <div>
                      <h3 className="font-display font-bold text-base sm:text-lg group-hover:text-[#C5A869] transition-colors line-clamp-1">
                        {song.title}
                      </h3>
                      <p className="text-xs opacity-75 font-medium">{song.artistOrComposer}</p>
                    </div>

                    {/* Musical Characteristics */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] opacity-80 pt-0.5">
                      <span className="font-semibold text-[#C5A869]">{song.genre}</span>
                      <span>• Key: {song.keySignature}</span>
                      <span>• Meter: {song.timeSignature}</span>
                      <span>• {song.tempoBpm} BPM</span>
                    </div>

                    {/* Description snippet */}
                    <p className="text-xs opacity-75 line-clamp-2 leading-relaxed">
                      {lang === 'en' ? song.descriptionEn : song.descriptionHi}
                    </p>

                    {/* Practice stats if any */}
                    {practiceMinutes > 0 && (
                      <div className="p-2 rounded-xl bg-[#081F5C]/5 dark:bg-white/5 text-[11px] flex items-center justify-between font-medium">
                        <span className="flex items-center gap-1 text-[#C5A869]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Practised: {practiceMinutes} min</span>
                        </span>
                        <span className="text-[10px] opacity-60">
                          {prog?.sessionsCount || 0} sessions
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[#081F5C]/10 dark:border-white/10 space-y-2">
                    <div className="flex items-center gap-2">
                      {/* Audio Theme Listen Button */}
                      {song.melodyAudio && song.melodyAudio.length > 0 && (
                        <button
                          onClick={() => handlePlaySongAudio(song)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                            isAudioPlaying
                              ? 'bg-[#C5A869] text-[#081F5C] border-[#C5A869] animate-pulse'
                              : 'border-[#081F5C]/20 dark:border-white/20 hover:border-[#C5A869]'
                          }`}
                          title="Listen to melody audio theme"
                        >
                          {isAudioPlaying ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-current" />
                              <span>Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-[#C5A869]" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Song Details Button */}
                      <button
                        onClick={() => setSelectedSongDetails(song)}
                        className="flex-1 px-3 py-2 rounded-xl border border-[#081F5C]/20 dark:border-white/20 hover:border-[#C5A869] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Info className="w-3.5 h-3.5 text-[#C5A869]" />
                        <span>{lang === 'en' ? 'Song Details' : 'Details'}</span>
                      </button>

                      {/* Sheet Music Button */}
                      {song.sheetMusicItem && (
                        <button
                          onClick={() => setActiveSheetMusicItem(song.sheetMusicItem!)}
                          className="px-3 py-2 rounded-xl bg-[#081F5C]/5 dark:bg-white/5 border border-[#081F5C]/15 dark:border-white/15 hover:border-[#C5A869] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Open Engraved Sheet Music"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#C5A869]" />
                          <span>Score</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Interactive MIDI Practice Button */}
                      {song.interactiveScore ? (
                        <button
                          onClick={() => setActiveInteractiveScore(song.interactiveScore!)}
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#C5A869]/15 text-[#C5A869] border border-[#C5A869]/40 hover:bg-[#C5A869]/25 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{lang === 'en' ? 'Interactive MIDI' : 'Live MIDI'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (song.sheetMusicItem) {
                              setActiveSheetMusicItem(song.sheetMusicItem);
                            } else {
                              setSelectedSongDetails(song);
                            }
                          }}
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#081F5C]/5 dark:bg-white/5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer border border-[#081F5C]/15 dark:border-white/15 hover:border-[#C5A869]"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#C5A869]" />
                          <span>{lang === 'en' ? 'Sheet Music' : 'Notation'}</span>
                        </button>
                      )}

                      {/* Practice Timer Button */}
                      <button
                        onClick={() => {
                          setTimerSong(song);
                        }}
                        className="px-3.5 py-2.5 rounded-xl bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-90"
                        title="Practice with Timer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Timer</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ================================================== */}
      {/* 5. SONG DETAILS MODAL / DRAWER */}
      {/* ================================================== */}
      {selectedSongDetails && (
        <div
          id="song-details-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-xs animate-in fade-in"
        >
          <div
            className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
              isDark ? 'bg-[#081534] border-white/15 text-[#F7F2EB]' : 'bg-white border-[#081F5C]/15 text-[#081F5C]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#081F5C]/10 dark:border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getLevelBadge(
                    selectedSongDetails.level
                  )}`}
                >
                  {selectedSongDetails.level}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getDifficultyBadge(
                    selectedSongDetails.difficulty
                  )}`}
                >
                  {selectedSongDetails.difficulty}
                </span>
              </div>

              <button
                onClick={() => setSelectedSongDetails(null)}
                className="p-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Title & Composer */}
              <div className="space-y-1">
                <h2 className="font-display text-xl sm:text-2xl font-bold">
                  {selectedSongDetails.title}
                </h2>
                <p className="text-sm font-semibold opacity-80">
                  Composer / Artist: {selectedSongDetails.artistOrComposer}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs opacity-75">
                  <span className="font-bold text-[#C5A869]">{selectedSongDetails.genre}</span>
                  <span>• Key: {selectedSongDetails.keySignature}</span>
                  <span>• Meter: {selectedSongDetails.timeSignature}</span>
                  <span>• Tempo: {selectedSongDetails.tempoBpm} BPM</span>
                  <span>• Hand: {selectedSongDetails.handArrangement}</span>
                </div>
              </div>

              {/* Status Switcher Box */}
              <div className="p-4 rounded-2xl border border-[#081F5C]/10 dark:border-white/10 bg-[#081F5C]/5 dark:bg-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A869]">
                    My Learning Status
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                      progressMap[selectedSongDetails.id]?.status || 'Not Started'
                    )}`}
                  >
                    {progressMap[selectedSongDetails.id]?.status || 'Not Started'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {(['Not Started', 'Learning', 'Practising', 'Completed'] as const).map((st) => {
                    const active = (progressMap[selectedSongDetails.id]?.status || 'Not Started') === st;
                    return (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedSongDetails.id, st)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          active
                            ? 'bg-[#C5A869] text-[#081F5C] border-[#C5A869] shadow-xs'
                            : 'border-[#081F5C]/15 dark:border-white/15 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5" />}
                        <span>{st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audio Melody Player */}
              {selectedSongDetails.melodyAudio && selectedSongDetails.melodyAudio.length > 0 && (
                <div className="p-4 rounded-2xl border border-[#C5A869]/30 bg-[#C5A869]/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#C5A869] flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4" />
                      Audio Synthesizer Preview
                    </span>
                    <span className="text-[11px] opacity-70">
                      {selectedSongDetails.melodyAudio.length} notes
                    </span>
                  </div>

                  <p className="text-xs opacity-80 leading-relaxed">
                    Listen to the main musical phrase synthesized in real acoustic piano bell tone.
                  </p>

                  <div className="pt-1 flex items-center gap-3">
                    <button
                      onClick={() => handlePlaySongAudio(selectedSongDetails)}
                      className="px-4 py-2 rounded-xl bg-[#C5A869] text-[#081F5C] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs hover:opacity-95"
                    >
                      {playingSongId === selectedSongDetails.id ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop Preview</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play Melody Preview</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A869]">
                  About this Piece
                </h4>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                  {lang === 'en'
                    ? selectedSongDetails.descriptionEn
                    : selectedSongDetails.descriptionHi}
                </p>
              </div>

              {/* Amitava Sen's Teacher Notes / Guidance */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#C5A869] flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Teacher Notes — Amitava Sen
                </h4>
                <div className="space-y-2">
                  {(lang === 'en'
                    ? selectedSongDetails.learningNotesEn
                    : selectedSongDetails.learningNotesHi
                  ).map((note, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#081F5C]/5 dark:bg-white/5 border border-[#081F5C]/10 dark:border-white/10 text-xs flex items-start gap-2.5"
                    >
                      <span className="text-[#C5A869] font-bold mt-0.5">•</span>
                      <span className="opacity-90 leading-relaxed">{note}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice Stats if available */}
              {progressMap[selectedSongDetails.id] && (
                <div className="p-4 rounded-2xl border border-[#081F5C]/10 dark:border-white/10 bg-[#081F5C]/5 dark:bg-white/5 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A869]">
                    Practice Statistics
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#071333]">
                      <span className="text-[10px] opacity-60 uppercase block">Total Time</span>
                      <span className="font-display font-bold text-sm text-[#C5A869]">
                        {Math.round(
                          (progressMap[selectedSongDetails.id].totalPracticeSeconds / 60) * 10
                        ) / 10}{' '}
                        min
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#071333]">
                      <span className="text-[10px] opacity-60 uppercase block">Sessions</span>
                      <span className="font-display font-bold text-sm">
                        {progressMap[selectedSongDetails.id].sessionsCount}
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#071333]">
                      <span className="text-[10px] opacity-60 uppercase block">Last Practice</span>
                      <span className="font-bold text-[11px] opacity-80">
                        {progressMap[selectedSongDetails.id].lastPracticedAt
                          ? new Date(
                              progressMap[selectedSongDetails.id].lastPracticedAt!
                            ).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Big Action Buttons */}
            <div className="p-4 sm:p-5 border-t border-[#081F5C]/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex flex-wrap items-center justify-end gap-2.5 flex-shrink-0">
              {selectedSongDetails.sheetMusicItem && (
                <button
                  onClick={() => {
                    const sm = selectedSongDetails.sheetMusicItem!;
                    setSelectedSongDetails(null);
                    setActiveSheetMusicItem(sm);
                  }}
                  className="px-4 py-2.5 rounded-full border border-[#081F5C]/20 dark:border-white/20 hover:border-[#C5A869] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#C5A869]" />
                  <span>{lang === 'en' ? 'View Sheet Music' : 'Sheet Music'}</span>
                </button>
              )}

              {selectedSongDetails.interactiveScore && (
                <button
                  onClick={() => {
                    const sc = selectedSongDetails.interactiveScore!;
                    setSelectedSongDetails(null);
                    setActiveInteractiveScore(sc);
                  }}
                  className="px-4 py-2.5 rounded-full bg-[#C5A869]/20 text-[#C5A869] border border-[#C5A869]/50 hover:bg-[#C5A869]/30 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Interactive MIDI Practice' : 'Interactive MIDI'}</span>
                </button>
              )}

              <button
                onClick={() => {
                  const song = selectedSongDetails;
                  setSelectedSongDetails(null);
                  setTimerSong(song);
                }}
                className="px-5 py-2.5 rounded-full bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] text-xs font-bold flex items-center gap-1.5 shadow-sm hover:opacity-95 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'en' ? 'Launch Practice Timer' : 'Riyaz Timer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 6. GLOBAL CHILD MODALS */}
      {/* ================================================== */}

      {/* Sheet Music Viewer Modal */}
      {activeSheetMusicItem && (
        <SheetMusicViewerModal
          sheetMusic={activeSheetMusicItem}
          onClose={() => setActiveSheetMusicItem(null)}
          onStartPractice={(title) => {
            setActiveSheetMusicItem(null);
            const foundSong = SONG_LIBRARY_DATA.find((s) => s.title === title);
            if (foundSong) setTimerSong(foundSong);
          }}
          onOpenInteractive={() => {
            const found = SONG_LIBRARY_DATA.find(
              (s) => s.sheetMusicItem?.id === activeSheetMusicItem.id
            );
            if (found && found.interactiveScore) {
              setActiveSheetMusicItem(null);
              setActiveInteractiveScore(found.interactiveScore);
            }
          }}
          lang={lang}
          theme={theme}
        />
      )}

      {/* Interactive MIDI Practice Modal */}
      {activeInteractiveScore && (
        <InteractiveSheetMusicModal
          score={activeInteractiveScore}
          studentId={student.studentId}
          onClose={() => {
            setActiveInteractiveScore(null);
            refreshProgress();
          }}
          lang={lang}
          theme={theme}
        />
      )}

      {/* Practice Timer Modal */}
      {timerSong && (
        <PracticeTimerModal
          isOpen={true}
          studentId={student.studentId}
          courseId={course.id}
          songId={timerSong.id}
          initialContextTitle={timerSong.title}
          onClose={() => {
            setTimerSong(null);
            refreshProgress();
          }}
          onOpenJournal={() => {
            setTimerSong(null);
            setShowJournalModal(true);
          }}
          lang={lang}
          theme={theme}
        />
      )}

      {/* 30-Day Practice Journal Modal */}
      <PracticeJournalModal
        isOpen={showJournalModal}
        studentId={student.studentId}
        courseId={course.id}
        onClose={() => setShowJournalModal(false)}
        lang={lang}
        theme={theme}
      />
    </div>
  );
};
