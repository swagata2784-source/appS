import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  RotateCcw,
  Clock,
  ArrowLeft,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { FREE_CATEGORIES, FREE_LESSONS } from '../data/content';
import { Language, Theme, VideoLesson } from '../types';

interface VideoPlayerScreenProps {
  lesson: VideoLesson;
  onBack: () => void;
  onSelectRelatedLesson: (lesson: VideoLesson) => void;
  lang: Language;
  theme: Theme;
  sessionPlaybackTimes: Record<string, number>;
  onUpdatePlaybackTime: (lessonId: string, time: number) => void;
}

export const VideoPlayerScreen: React.FC<VideoPlayerScreenProps> = ({
  lesson,
  onBack,
  onSelectRelatedLesson,
  lang,
  theme,
  sessionPlaybackTimes,
  onUpdatePlaybackTime,
}) => {
  const isDark = theme === 'dark';

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const category = FREE_CATEGORIES.find((c) => c.id === lesson.categoryId);
  const relatedLessons = FREE_LESSONS.filter(
    (l) => l.categoryId === lesson.categoryId && l.id !== lesson.id
  );

  const title = lang === 'en' ? lesson.titleEn : lesson.titleHi;
  const desc = lang === 'en' ? lesson.descEn : lesson.descHi;
  const categoryName = category
    ? lang === 'en'
      ? category.nameEn
      : category.nameHi
    : '';

  // Resume playback position from current browsing session if saved
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const savedTime = sessionPlaybackTimes[lesson.id] || 0;
    if (savedTime > 0) {
      video.currentTime = savedTime;
      setCurrentTime(savedTime);
    }
  }, [lesson.id, sessionPlaybackTimes]);

  // Track time updates & sync to session playback memory
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onUpdatePlaybackTime(lesson.id, time);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.volume = volume || 0.7;
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setCurrentTime(0);
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      id="video-player-screen"
      className={`min-h-[calc(100vh-5rem)] py-6 px-4 sm:px-8 max-w-7xl mx-auto w-full transition-colors duration-300 ${
        isDark ? 'text-[#F7F2EB]' : 'text-[#081F5C]'
      }`}
    >
      {/* Top Header / Breadcrumb */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            id="player-back-btn"
            type="button"
            onClick={onBack}
            className={`p-2 sm:p-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer ${
              isDark
                ? 'bg-[#081F5C]/60 hover:bg-[#081F5C] text-[#F7F2EB] border border-[#0E2E80]'
                : 'bg-white hover:bg-[#EBE2D5] text-[#081F5C] border border-[#081F5C]/15 shadow-sm'
            }`}
            aria-label={lang === 'en' ? `Back to ${categoryName}` : `${categoryName} par wapas`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span
              className={`text-xs uppercase tracking-widest font-semibold ${
                isDark ? 'text-[#C5A869]' : 'text-[#081F5C]/60'
              }`}
            >
              {categoryName}
            </span>
            <span className="text-base sm:text-lg font-bold tracking-tight">
              {lang === 'en' ? `Lesson 0${lesson.order}: Video Player` : `Lesson 0${lesson.order}: Video Path`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Share Action */}
          <button
            type="button"
            onClick={handleShare}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#081F5C]/80 border-[#0E2E80] text-[#D8CFBC] hover:text-white'
                : 'bg-white border-[#081F5C]/15 text-[#081F5C] hover:bg-[#EBE2D5] shadow-sm'
            }`}
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>{lang === 'en' ? 'Link Copied' : 'Copy Ho Gaya'}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'en' ? 'Share' : 'Share'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Bento Grid Main Layout */}
      <main className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column (flex-[2]): Video Stage + Video Details Bento Card */}
        <div className="lg:flex-[2] w-full flex flex-col gap-6">
          {/* Video Player Stage (rounded-3xl, shadow-2xl, border) */}
          <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl group border border-black/30"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            <video
              ref={videoRef}
              src={lesson.videoUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onClick={togglePlay}
              playsInline
              className="w-full h-full object-contain cursor-pointer"
            />

            {/* Large Center Play Button Overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <button
                  id="player-center-play-btn"
                  type="button"
                  onClick={togglePlay}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-white/95 rounded-full flex items-center justify-center pl-1.5 shadow-2xl hover:scale-105 active:scale-95 transition-transform pointer-events-auto cursor-pointer text-[#081F5C] border border-white/40"
                  aria-label="Play Video"
                >
                  <Play className="w-9 h-9 sm:w-10 sm:h-10 fill-[#081F5C]" />
                </button>
              </div>
            )}

            {/* Session Resume Notice */}
            {(sessionPlaybackTimes[lesson.id] || 0) > 5 && currentTime < 2 && (
              <div className="absolute top-4 left-4 z-20 bg-black/80 backdrop-blur-md text-[#F7F2EB] text-xs px-3 py-1.5 rounded-lg border border-white/20">
                {lang === 'en' ? 'Resuming where you left off' : 'Jahan chhoda tha wahi se continue'}
              </div>
            )}

            {/* Video Control Bar Overlay */}
            <div
              className={`absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6 bg-gradient-to-t from-black/85 via-black/50 to-transparent transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="flex flex-col gap-3">
                {/* Scrub bar */}
                <div className="relative flex items-center">
                  <input
                    id="player-seek-slider"
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-white/25 rounded-full appearance-none cursor-pointer accent-[#F7F2EB]"
                    aria-label="Seek time"
                  />
                </div>

                {/* Bottom Controls Row */}
                <div className="flex items-center justify-between text-white text-xs sm:text-sm font-medium">
                  {/* Left: Play/Pause, Restart, Time */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button
                      id="player-play-pause-btn"
                      type="button"
                      onClick={togglePlay}
                      className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-white" />
                      ) : (
                        <Play className="w-5 h-5 fill-white" />
                      )}
                    </button>

                    <button
                      id="player-restart-btn"
                      type="button"
                      onClick={restartVideo}
                      className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer hidden xs:inline-flex"
                      title="Restart from beginning"
                      aria-label="Restart"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    <div className="font-mono text-xs opacity-90">
                      {formatTime(currentTime)} / {formatTime(duration || lesson.durationSec)}
                    </div>
                  </div>

                  {/* Right: Volume & Fullscreen */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        id="player-mute-btn"
                        type="button"
                        onClick={toggleMute}
                        className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                        aria-label={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        id="player-volume-slider"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-14 sm:w-20 h-1 bg-white/25 rounded-full appearance-none cursor-pointer accent-[#F7F2EB]"
                        aria-label="Volume slider"
                      />
                    </div>

                    <button
                      id="player-fullscreen-btn"
                      type="button"
                      onClick={toggleFullscreen}
                      className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer"
                      aria-label="Toggle Fullscreen"
                      title="Fullscreen"
                    >
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Details Card */}
          <div
            className={`rounded-3xl p-6 sm:p-8 border shadow-sm transition-colors flex flex-col gap-4 ${
              isDark
                ? 'bg-[#081F5C]/40 border-[#0E2E80]'
                : 'bg-white border-[#081F5C]/10'
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${
                  isDark
                    ? 'bg-[#0E2E80]/80 text-[#C5A869]'
                    : 'bg-[#081F5C]/8 text-[#081F5C]'
                }`}
              >
                {categoryName}
              </span>
              <span className="text-xs opacity-40">•</span>
              <span className="text-xs font-medium flex items-center gap-1 opacity-75">
                <Clock className="w-3.5 h-3.5" />
                <span>{lesson.duration}</span>
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight leading-tight">
              {title}
            </h1>

            <p
              className={`text-base sm:text-lg leading-relaxed max-w-3xl ${
                isDark ? 'text-[#D8CFBC]' : 'text-[#081F5C]/80'
              }`}
            >
              {desc}
            </p>

            {/* Key Takeaways Chips */}
            <div className="pt-4 border-t border-current/10">
              <h2 className="text-xs uppercase tracking-widest font-bold opacity-60 mb-2.5">
                {lang === 'en' ? 'Key Concepts Covered' : 'Is Lesson ke Pramukh Points'}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(lang === 'en' ? lesson.keyTopicsEn : lesson.keyTopicsHi).map(
                  (topic, i) => (
                    <span
                      key={i}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-medium ${
                        isDark
                          ? 'bg-[#0E2E80]/40 border-[#0E2E80] text-[#E2D8C9]'
                          : 'bg-[#081F5C]/5 border-[#081F5C]/10 text-[#081F5C]'
                      }`}
                    >
                      ✓ {topic}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (flex-1): Bento "More from Category" List + Bento Academy Box */}
        <div className="lg:flex-1 w-full flex flex-col gap-4 self-stretch">
          <h2 className="text-xs uppercase tracking-widest font-bold opacity-60 px-1">
            {lang === 'en'
              ? `More from ${categoryName}`
              : `${categoryName} ke Anya Lessons`}
          </h2>

          <div className="flex flex-col gap-3">
            {relatedLessons.map((rel) => {
              const relTitle = lang === 'en' ? rel.titleEn : rel.titleHi;
              const relDesc = lang === 'en' ? rel.descEn : rel.descHi;

              return (
                <div
                  key={rel.id}
                  id={`related-video-${rel.id}`}
                  onClick={() => onSelectRelatedLesson(rel)}
                  className={`flex gap-4 p-3.5 rounded-2xl border shadow-sm group cursor-pointer transition-all ${
                    isDark
                      ? 'bg-[#081F5C]/35 border-[#0E2E80] hover:border-[#C5A869]/50 hover:bg-[#081F5C]/55 hover:shadow-md'
                      : 'bg-white border-[#081F5C]/10 hover:border-[#081F5C]/30 hover:shadow-md'
                  }`}
                >
                  {/* Aspect-video Thumbnail */}
                  <div
                    className="w-28 sm:w-32 aspect-video rounded-xl flex-shrink-0 relative overflow-hidden shadow-sm flex items-center justify-center"
                    style={{ background: rel.posterGradient }}
                  >
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                    </div>
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {rel.duration}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-center gap-1 min-w-0 flex-1">
                    <span className="text-xs font-semibold opacity-60">
                      Lesson 0{rel.order}
                    </span>
                    <span className="text-sm font-bold leading-snug line-clamp-1 group-hover:text-[#C5A869] transition-colors">
                      {relTitle}
                    </span>
                    <span className="text-xs opacity-65 line-clamp-1">
                      {relDesc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Bento Academy Card */}
          <div
            className={`mt-4 lg:mt-auto p-6 rounded-3xl flex flex-col gap-3 shadow-xl transition-colors ${
              isDark
                ? 'bg-[#0E2E80] text-[#F7F2EB] border border-[#C5A869]/30'
                : 'bg-[#081F5C] text-[#F7F2EB]'
            }`}
          >
            <span className="text-sm font-medium opacity-90">
              {lang === 'en' ? 'Enjoying this module?' : 'Yeh module pasand aa raha hai?'}
            </span>
            <p className="text-xs font-light leading-relaxed opacity-85">
              {lang === 'en'
                ? 'Explore our other free video series in Foundation Piano, Reading Sheet Music, and Basic Theory.'
                : 'Foundation Piano, Sheet Music Reading, aur Basic Theory ke baki free video series bhi dekhein.'}
            </p>
            <button
              type="button"
              onClick={onBack}
              className={`py-2.5 px-4 rounded-xl text-sm font-bold mt-1 transition-colors cursor-pointer text-center ${
                isDark
                  ? 'bg-[#F7F2EB] text-[#081F5C] hover:bg-white'
                  : 'bg-[#F7F2EB] text-[#081F5C] hover:bg-white'
              }`}
            >
              {lang === 'en' ? 'All Free Categories' : 'Sabhi Categories Dekhein'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
