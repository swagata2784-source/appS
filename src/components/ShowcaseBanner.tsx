import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, BookOpen, GraduationCap, MessageSquare } from 'lucide-react';
import { ShowcaseSlide, Language, Theme, Screen } from '../types';
import { INITIAL_SHOWCASE_SLIDES } from '../data/showcaseData';

interface ShowcaseBannerProps {
  slides?: ShowcaseSlide[];
  onNavigate: (destination: Screen | 'books' | 'contact') => void;
  lang: Language;
  theme: Theme;
}

export const ShowcaseBanner: React.FC<ShowcaseBannerProps> = ({
  slides = INITIAL_SHOWCASE_SLIDES,
  onNavigate,
  lang,
  theme,
}) => {
  const activeSlides = slides.filter((s) => s.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const isDark = theme === 'dark';

  // Auto-advance every 5 seconds unless paused by hover/touch
  useEffect(() => {
    if (isPaused || activeSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, activeSlides.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const threshold = 50;
    if (diff > threshold) {
      handleNext();
    } else if (diff < -threshold) {
      handlePrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];
  if (!currentSlide) return null;

  const getSlideIcon = (dest: string) => {
    switch (dest) {
      case 'books':
        return <BookOpen className="w-4 h-4 text-[#C5A869]" />;
      case 'contact':
        return <MessageSquare className="w-4 h-4 text-[#C5A869]" />;
      default:
        return <GraduationCap className="w-4 h-4 text-[#C5A869]" />;
    }
  };

  return (
    <section
      id="showcase-banner"
      className="relative w-full rounded-3xl overflow-hidden shadow-xl border transition-all duration-300 group"
      style={{
        borderColor: isDark ? 'rgba(14, 46, 128, 0.7)' : 'rgba(8, 31, 92, 0.12)',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Pianotastic Academy Showcase"
    >
      <div className="relative min-h-[300px] sm:min-h-[340px] md:min-h-[380px] w-full flex items-center">
        {/* Animated Slide Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full flex items-center px-6 sm:px-12 md:px-16 py-8"
            style={{ background: currentSlide.bgGradient }}
          >
            {/* Cinematic Editorial Piano Motif Overlay */}
            <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden select-none">
              <svg
                viewBox="0 0 1000 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full object-cover scale-105"
              >
                <path
                  d="M-50 180 C 200 80, 450 320, 700 160 C 900 60, 1000 240, 1100 180"
                  stroke="#C5A869"
                  strokeWidth="2"
                  strokeOpacity="0.6"
                />
                <path
                  d="M-50 220 C 180 120, 420 360, 720 200 C 920 80, 1020 270, 1120 210"
                  stroke="#F7F2EB"
                  strokeWidth="1.2"
                  strokeOpacity="0.4"
                />
                {/* Piano Keyboard Silhouette */}
                <g opacity="0.45">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <rect
                      key={i}
                      x={i * 38}
                      y="260"
                      width="34"
                      height="150"
                      rx="2"
                      fill="#F7F2EB"
                    />
                  ))}
                  {[1, 2, 4, 5, 6, 8, 9, 11, 12, 13, 15, 16, 18, 19, 20, 22, 23, 25, 26, 27].map(
                    (k) => (
                      <rect
                        key={`black-${k}`}
                        x={k * 38 + 24}
                        y="260"
                        width="22"
                        height="90"
                        rx="2"
                        fill="#05143D"
                      />
                    )
                  )}
                </g>
              </svg>
            </div>

            {/* Subtle warm lighting orb */}
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[#C5A869]/15 blur-3xl pointer-events-none" />

            {/* Slide Text Content */}
            <div className="relative z-10 max-w-2xl text-white">
              {/* Category Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase mb-3 sm:mb-4 bg-white/10 backdrop-blur-sm border border-white/15 text-[#EFE7D8]">
                {getSlideIcon(currentSlide.destination)}
                <span>
                  {lang === 'en'
                    ? currentSlide.accentTextEn
                    : currentSlide.accentTextHi}
                </span>
              </div>

              {/* Slide Title */}
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 sm:mb-3 leading-tight">
                {lang === 'en' ? currentSlide.titleEn : currentSlide.titleHi}
              </h2>

              {/* Supporting Copy */}
              <p className="text-[#DFD7C9] text-sm sm:text-base leading-relaxed mb-6 max-w-xl font-body">
                {lang === 'en'
                  ? currentSlide.subtitleEn
                  : currentSlide.subtitleHi}
              </p>

              {/* Slide CTA Button */}
              <div className="flex items-center gap-4">
                <button
                  id={`showcase-cta-${currentSlide.id}`}
                  onClick={() => onNavigate(currentSlide.destination)}
                  className="px-6 py-3 rounded-full text-sm sm:text-base font-semibold tracking-wide flex items-center gap-2.5 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg cursor-pointer bg-[#F7F2EB] text-[#081F5C] hover:bg-white"
                >
                  <span>
                    {lang === 'en' ? currentSlide.ctaEn : currentSlide.ctaHi}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Manual Arrow Controls (Visible on hover on desktop, always clear) */}
        <button
          onClick={handlePrev}
          className="absolute left-3 sm:left-4 z-20 p-2 sm:p-2.5 rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur-sm transition-all duration-200 opacity-80 hover:opacity-100 cursor-pointer"
          aria-label={lang === 'en' ? 'Previous slide' : 'Pichla slide'}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 sm:right-4 z-20 p-2 sm:p-2.5 rounded-full bg-black/35 hover:bg-black/55 text-white backdrop-blur-sm transition-all duration-200 opacity-80 hover:opacity-100 cursor-pointer"
          aria-label={lang === 'en' ? 'Next slide' : 'Agla slide'}
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dot Pagination Indicator */}
        <div
          className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2.5 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10"
          role="tablist"
          aria-label="Slide indicators"
        >
          {activeSlides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                index === currentIndex
                  ? 'w-6 h-2 bg-[#C5A869]'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Slide ${index + 1}`}
              aria-selected={index === currentIndex}
              role="tab"
            />
          ))}
        </div>
      </div>
    </section>
  );
};
