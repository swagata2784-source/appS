import React, { useState } from 'react';
import { ArrowLeft, Moon, Sun, Globe, Menu, X, BookOpen, GraduationCap, Video, Home, MessageSquare, User } from 'lucide-react';
import { Language, Theme, Screen } from '../types';
import { Logo } from './Logo';

interface TopBarProps {
  currentScreen?: Screen;
  onNavigateScreen?: (screen: Screen) => void;
  onOpenBooks?: () => void;
  onOpenContact?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  lang: Language;
  onToggleLang: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  title?: string;
  showLogo?: boolean;
  onLogoClick?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentScreen = 'public-home',
  onNavigateScreen,
  onOpenBooks,
  onOpenContact,
  showBack = false,
  onBack,
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  title,
  showLogo = true,
  onLogoClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isDark = theme === 'dark';

  const isHomeActive = currentScreen === 'public-home' || currentScreen === 'welcome';
  const isFreeLearningActive =
    currentScreen === 'free-learning-home' ||
    currentScreen === 'category-list' ||
    currentScreen === 'video-player';
  const isCoursesActive =
    currentScreen === 'courses-home' ||
    currentScreen === 'recorded-catalogue' ||
    currentScreen === 'course-details' ||
    currentScreen === 'enrollment-initiation';

  const handleNav = (screen: Screen) => {
    setMobileMenuOpen(false);
    if (onNavigateScreen) onNavigateScreen(screen);
  };

  return (
    <>
      <header
        id="app-topbar"
        className={`sticky top-0 z-30 w-full transition-colors duration-300 backdrop-blur-md border-b ${
          isDark
            ? 'bg-[#040C24]/90 border-[#0E2E80]/80 text-[#F7F2EB]'
            : 'bg-[#F7F2EB]/95 border-[#081F5C]/10 text-[#081F5C]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Left side: Back Button or Exact Logo */}
          <div className="flex items-center gap-3 min-w-[44px]">
            {showBack && onBack ? (
              <div className="flex items-center gap-3">
                <button
                  id="topbar-back-btn"
                  onClick={onBack}
                  className={`p-2.5 rounded-full transition-colors flex items-center justify-center cursor-pointer ${
                    isDark
                      ? 'text-[#F7F2EB] hover:bg-white/10 active:bg-white/15'
                      : 'text-[#081F5C] hover:bg-[#081F5C]/5 active:bg-[#081F5C]/10'
                  }`}
                  aria-label={lang === 'en' ? 'Go back' : 'Peeche jayein'}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {title && (
                  <div className="hidden sm:flex flex-col">
                    <span
                      className={`text-[11px] uppercase tracking-widest font-semibold ${
                        isDark ? 'text-[#C5A869]' : 'text-[#081F5C]/60'
                      }`}
                    >
                      Pianotastic Academy
                    </span>
                    <span className="text-base sm:text-lg font-bold tracking-tight truncate max-w-[240px] md:max-w-xs">
                      {title}
                    </span>
                  </div>
                )}
              </div>
            ) : showLogo ? (
              <button
                id="topbar-logo-btn"
                onClick={onLogoClick || (() => onNavigateScreen && onNavigateScreen('public-home'))}
                className="text-left focus:outline-none cursor-pointer"
                aria-label="Pianotastic Academy Home"
              >
                <Logo size="sm" isDark={isDark} />
              </button>
            ) : null}
          </div>

          {/* Center Navigation Links (Visible on desktop/large screens) */}
          <nav className="hidden lg:flex items-center gap-1 md:gap-2">
            <button
              onClick={() => handleNav('public-home')}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                isHomeActive
                  ? isDark
                    ? 'bg-[#C5A869] text-[#040C24] shadow-sm'
                    : 'bg-[#081F5C] text-[#F7F2EB] shadow-sm'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              {lang === 'en' ? 'Home' : 'Home'}
            </button>

            <button
              onClick={() => handleNav('free-learning-home')}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                isFreeLearningActive
                  ? isDark
                    ? 'bg-[#C5A869] text-[#040C24] shadow-sm'
                    : 'bg-[#081F5C] text-[#F7F2EB] shadow-sm'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              {lang === 'en' ? 'Free Learning' : 'Free Learning'}
            </button>

            <button
              onClick={() => handleNav('courses-home')}
              className={`px-3.5 py-2 rounded-full text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                isCoursesActive
                  ? isDark
                    ? 'bg-[#C5A869] text-[#040C24] shadow-sm'
                    : 'bg-[#081F5C] text-[#F7F2EB] shadow-sm'
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100'
              }`}
            >
              {lang === 'en' ? 'Courses' : 'Courses'}
            </button>

            <button
              onClick={onOpenBooks}
              className="px-3.5 py-2 rounded-full text-sm font-semibold tracking-wide transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100"
            >
              {lang === 'en' ? 'Books' : 'Books'}
            </button>

            <button
              onClick={onOpenContact}
              className="px-3.5 py-2 rounded-full text-sm font-semibold tracking-wide transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100"
            >
              {lang === 'en' ? 'Contact' : 'Contact'}
            </button>

            <button
              onClick={() => handleNav('student-login')}
              className="px-3.5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border border-[#C5A869]/60 text-[#C5A869] hover:bg-[#C5A869]/10 flex items-center gap-1.5 ml-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Student Login' : 'Login'}</span>
            </button>
          </nav>

          {/* Center Mobile Title if on child screen */}
          {title && (
            <div className="flex-1 sm:hidden text-center truncate px-1">
              <h1 className="text-sm font-bold tracking-tight truncate">
                {title}
              </h1>
            </div>
          )}

          {/* Right side: Language, Theme, & Mobile Hamburger Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Language Toggle */}
            <button
              id="topbar-lang-toggle"
              onClick={onToggleLang}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-200 border cursor-pointer ${
                isDark
                  ? 'bg-[#081F5C]/60 hover:bg-[#081F5C] border-[#0E2E80] text-[#F7F2EB]'
                  : 'bg-white hover:bg-[#EBE2D5] border-[#081F5C]/15 text-[#081F5C] shadow-sm'
              }`}
              aria-label={
                lang === 'en'
                  ? 'Switch language to Hindi / Hinglish'
                  : 'Switch language to English'
              }
            >
              <Globe className="w-3.5 h-3.5 opacity-70" />
              <span>{lang === 'en' ? 'EN' : 'HIN'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              id="topbar-theme-toggle"
              onClick={onToggleTheme}
              className={`p-2 sm:p-2.5 rounded-full transition-colors duration-200 border cursor-pointer ${
                isDark
                  ? 'bg-[#081F5C]/60 hover:bg-[#081F5C] border-[#0E2E80] text-[#F7F2EB]'
                  : 'bg-white hover:bg-[#EBE2D5] border-[#081F5C]/15 text-[#081F5C] shadow-sm'
              }`}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-[#F7F2EB]" />
              ) : (
                <Moon className="w-4 h-4 text-[#081F5C]" />
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              id="topbar-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 sm:p-2.5 rounded-full transition-colors duration-200 border cursor-pointer ${
                isDark
                  ? 'bg-[#081F5C]/60 hover:bg-[#081F5C] border-[#0E2E80] text-[#F7F2EB]'
                  : 'bg-white hover:bg-[#EBE2D5] border-[#081F5C]/15 text-[#081F5C] shadow-sm'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer / Slide-over */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className={`absolute top-16 right-0 w-4/5 max-w-sm h-[calc(100vh-4rem)] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto border-l transition-all duration-300 ${
              isDark ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]' : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="pb-4 border-b border-[#081F5C]/10 dark:border-white/10">
                <Logo size="sm" isDark={isDark} />
                <span className="text-[11px] block mt-1 opacity-70">
                  {lang === 'en' ? 'Public Visitor Navigation' : 'Public Visitor Navigation'}
                </span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleNav('public-home')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-semibold text-sm transition-all cursor-pointer ${
                    isHomeActive
                      ? isDark
                        ? 'bg-[#C5A869] text-[#040C24]'
                        : 'bg-[#081F5C] text-[#F7F2EB]'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Home' : 'Home'}</span>
                </button>

                <button
                  onClick={() => handleNav('free-learning-home')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-semibold text-sm transition-all cursor-pointer ${
                    isFreeLearningActive
                      ? isDark
                        ? 'bg-[#C5A869] text-[#040C24]'
                        : 'bg-[#081F5C] text-[#F7F2EB]'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <Video className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Free Learning' : 'Free Learning'}</span>
                </button>

                <button
                  onClick={() => handleNav('courses-home')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-semibold text-sm transition-all cursor-pointer ${
                    isCoursesActive
                      ? isDark
                        ? 'bg-[#C5A869] text-[#040C24]'
                        : 'bg-[#081F5C] text-[#F7F2EB]'
                      : 'hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Courses' : 'Courses'}</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenBooks) onOpenBooks();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-semibold text-sm transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Books' : 'Books'}</span>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenContact) onOpenContact();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-semibold text-sm transition-all cursor-pointer hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Contact' : 'Contact'}</span>
                </button>

                <button
                  onClick={() => handleNav('student-login')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left font-semibold text-sm transition-all cursor-pointer border border-[#C5A869]/60 text-[#C5A869] hover:bg-[#C5A869]/10 mt-2"
                >
                  <User className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Student Login' : 'Student Login'}</span>
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-[#081F5C]/10 dark:border-white/10 text-xs opacity-60 text-center">
              Pianotastic Academy • Excellence in Piano Education
            </div>
          </div>
        </div>
      )}
    </>
  );
};

