import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowRight,
  Clock,
  BookOpen,
  Sparkles,
  X,
  GraduationCap,
  Layers,
} from 'lucide-react';
import { Language, Theme, RecordedCourse, MusicPathway, WesternLevel, IndianStyle } from '../types';
import { RECORDED_COURSES } from '../data/coursesData';

interface RecordedCatalogueScreenProps {
  initialCategory?: MusicPathway | 'all';
  initialLevel?: string;
  onSelectCourse: (course: RecordedCourse) => void;
  onBack: () => void;
  lang: Language;
  theme: Theme;
}

export const RecordedCatalogueScreen: React.FC<RecordedCatalogueScreenProps> = ({
  initialCategory = 'all',
  initialLevel = 'all',
  onSelectCourse,
  onBack,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPathway, setSelectedPathway] = useState<MusicPathway | 'all'>(initialCategory);
  const [selectedLevel, setSelectedLevel] = useState<WesternLevel | 'all'>(
    initialLevel as WesternLevel | 'all'
  );
  const [selectedStyle, setSelectedStyle] = useState<IndianStyle | 'all'>('all');

  // Filtered courses logic
  const filteredCourses = useMemo(() => {
    return RECORDED_COURSES.filter((course) => {
      // Pathway filter
      if (selectedPathway !== 'all' && course.category !== selectedPathway) {
        return false;
      }

      // Western Level filter
      if (
        selectedPathway === 'western' &&
        selectedLevel !== 'all' &&
        course.level !== selectedLevel
      ) {
        return false;
      }

      // Indian Style filter
      if (
        selectedPathway === 'indian' &&
        selectedStyle !== 'all' &&
        course.indianStyle !== selectedStyle
      ) {
        return false;
      }

      // Search Query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle =
          course.titleEn.toLowerCase().includes(query) ||
          course.titleHi.toLowerCase().includes(query);
        const matchesDesc =
          course.shortDescEn.toLowerCase().includes(query) ||
          course.shortDescHi.toLowerCase().includes(query);
        const matchesLevel = course.level && course.level.toLowerCase().includes(query);
        const matchesStyle = course.indianStyle && course.indianStyle.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesLevel || matchesStyle;
      }

      return true;
    });
  }, [selectedPathway, selectedLevel, selectedStyle, searchQuery]);

  const featuredCourse = RECORDED_COURSES.find((c) => c.featured && c.category === 'western');

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedPathway('all');
    setSelectedLevel('all');
    setSelectedStyle('all');
  };

  return (
    <div
      id="recorded-catalogue-screen"
      className={`w-full min-h-screen pb-20 transition-colors duration-300 ${
        isDark ? 'bg-[#040C24] text-[#F7F2EB]' : 'bg-[#F7F2EB] text-[#081F5C]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 sm:pt-8 space-y-8">
        {/* Header Area */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase font-bold tracking-wider text-[#C5A869]">
            <GraduationCap className="w-4 h-4" />
            <span>{lang === 'en' ? 'Self-Paced Learning' : 'Self-Paced Learning'}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {lang === 'en' ? 'Recorded Courses' : 'Recorded Courses'}
          </h1>

          <p
            className={`text-sm sm:text-base leading-relaxed max-w-2xl ${
              isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'
            }`}
          >
            {lang === 'en'
              ? 'Learn at your own pace with structured video-based courses. High-definition lessons, downloadable class notes, and progressive repertoire with one-time enrollment.'
              : 'Apni speed par seekhein: high-definition video lessons, class notes aur sheet music ke sath. One-time enrollment, koi monthly charges nahi.'}
          </p>
        </div>

        {/* FEATURED COURSE HIGHLIGHT (Western Beginner Mastery) */}
        {featuredCourse && !searchQuery && selectedPathway === 'all' && (
          <div
            onClick={() => onSelectCourse(featuredCourse)}
            className={`relative rounded-3xl p-6 sm:p-8 border shadow-lg cursor-pointer transition-all duration-300 hover:shadow-2xl overflow-hidden group ${
              isDark
                ? 'bg-gradient-to-br from-[#061742] via-[#081F5C] to-[#0A266E] border-[#C5A869]/30'
                : 'bg-gradient-to-br from-[#081F5C] via-[#0E2E80] to-[#1A429C] text-white border-[#081F5C]'
            }`}
          >
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#C5A869] text-[#081F5C]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Featured Academy Course' : 'Featured Course'}</span>
                </div>

                <h2 className="font-display text-2xl sm:text-3xl font-bold text-white leading-tight group-hover:text-[#C5A869] transition-colors">
                  {lang === 'en' ? featuredCourse.titleEn : featuredCourse.titleHi}
                </h2>

                <p className="text-sm sm:text-base text-[#DFD7C9] leading-relaxed">
                  {lang === 'en' ? featuredCourse.shortDescEn : featuredCourse.shortDescHi}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-[#F7F2EB] pt-1">
                  <span className="flex items-center gap-1.5 opacity-90">
                    <Clock className="w-3.5 h-3.5 text-[#C5A869]" />
                    <span>{featuredCourse.duration}</span>
                  </span>
                  <span>•</span>
                  <span>{featuredCourse.classesCount} Classes</span>
                  <span>•</span>
                  <span className="text-[#C5A869] font-bold">One-Time ₹{featuredCourse.price.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <button
                  id="featured-course-view-btn"
                  className="px-6 py-3.5 rounded-full text-sm sm:text-base font-bold tracking-wide flex items-center gap-2.5 transition-all duration-200 transform group-hover:scale-105 shadow-md bg-[#F7F2EB] text-[#081F5C]"
                >
                  <span>{lang === 'en' ? 'View Course' : 'Course Dekhein'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH & FILTERS BAR */}
        <div
          className={`p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 ${
            isDark ? 'bg-[#081F5C]/35 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10'
          }`}
        >
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              id="course-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Search courses by title, topic, or keyword...'
                  : 'Courses search karein title ya topic se...'
              }
              className={`w-full pl-11 pr-10 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C5A869] transition-colors ${
                isDark
                  ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]'
                  : 'bg-[#F7F2EB] border-[#081F5C]/15 text-[#081F5C]'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-60 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Music:' : 'Sangeet:'}</span>
            </span>

            {/* Pathway Selectors */}
            <button
              onClick={() => {
                setSelectedPathway('all');
                setSelectedLevel('all');
                setSelectedStyle('all');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                selectedPathway === 'all'
                  ? isDark
                    ? 'bg-[#C5A869] text-[#040C24]'
                    : 'bg-[#081F5C] text-[#F7F2EB]'
                  : 'border border-[#081F5C]/15 dark:border-white/15 opacity-75 hover:opacity-100'
              }`}
            >
              {lang === 'en' ? 'All Music' : 'Sabhi Sangeet'}
            </button>

            <button
              onClick={() => {
                setSelectedPathway('western');
                setSelectedStyle('all');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                selectedPathway === 'western'
                  ? isDark
                    ? 'bg-[#C5A869] text-[#040C24]'
                    : 'bg-[#081F5C] text-[#F7F2EB]'
                  : 'border border-[#081F5C]/15 dark:border-white/15 opacity-75 hover:opacity-100'
              }`}
            >
              Western Music
            </button>

            <button
              onClick={() => {
                setSelectedPathway('indian');
                setSelectedLevel('all');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                selectedPathway === 'indian'
                  ? isDark
                    ? 'bg-[#C5A869] text-[#040C24]'
                    : 'bg-[#081F5C] text-[#F7F2EB]'
                  : 'border border-[#081F5C]/15 dark:border-white/15 opacity-75 hover:opacity-100'
              }`}
            >
              Indian Music
            </button>

            {/* Sub-filters for Western Levels */}
            {(selectedPathway === 'western' || selectedPathway === 'all') && (
              <div className="flex flex-wrap items-center gap-1.5 pl-2 sm:pl-4 sm:border-l border-[#081F5C]/15 dark:border-white/15">
                <span className="text-xs opacity-60 mr-1">{lang === 'en' ? 'Level:' : 'Level:'}</span>
                {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => {
                      if (selectedPathway !== 'western' && lvl !== 'all') {
                        setSelectedPathway('western');
                      }
                      setSelectedLevel(lvl);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold capitalize transition-all cursor-pointer ${
                      selectedLevel === lvl
                        ? 'bg-[#081F5C]/15 dark:bg-white/20 text-[#C5A869] font-bold border border-[#C5A869]/40'
                        : 'opacity-65 hover:opacity-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            )}

            {/* Sub-filters for Indian Styles */}
            {selectedPathway === 'indian' && (
              <div className="flex flex-wrap items-center gap-1.5 pl-2 sm:pl-4 sm:border-l border-[#081F5C]/15 dark:border-white/15">
                <span className="text-xs opacity-60 mr-1">{lang === 'en' ? 'Style:' : 'Shaili:'}</span>
                {[
                  { id: 'all', label: 'All Styles' },
                  { id: 'bollywood', label: 'Bollywood' },
                  { id: 'rabindra-sangeet', label: 'Rabindra Sangeet' },
                  { id: 'bengali-modern', label: 'Bengali Modern' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStyle(st.id as IndianStyle | 'all')}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      selectedStyle === st.id
                        ? 'bg-[#081F5C]/15 dark:bg-white/20 text-[#C5A869] font-bold border border-[#C5A869]/40'
                        : 'opacity-65 hover:opacity-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RESULTS COUNT & STATUS */}
        <div className="flex items-center justify-between text-xs opacity-75 px-1">
          <span>
            {lang === 'en'
              ? `Showing ${filteredCourses.length} course${filteredCourses.length === 1 ? '' : 's'}`
              : `${filteredCourses.length} course${filteredCourses.length === 1 ? '' : 's'} uplabdh`}
          </span>

          {(searchQuery || selectedPathway !== 'all' || selectedLevel !== 'all' || selectedStyle !== 'all') && (
            <button
              onClick={handleClearFilters}
              className="text-[#C5A869] hover:underline font-semibold cursor-pointer"
            >
              {lang === 'en' ? 'Reset Filters' : 'Filters Hatayein'}
            </button>
          )}
        </div>

        {/* COURSE CARDS GRID (Prompt 10) */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course)}
                className={`group rounded-3xl p-6 border flex flex-col justify-between transition-all duration-300 hover:shadow-xl cursor-pointer transform hover:-translate-y-1 ${
                  isDark
                    ? 'bg-[#081F5C]/35 border-[#0E2E80] hover:border-[#C5A869]/50'
                    : 'bg-white border-[#081F5C]/10 hover:border-[#081F5C]/30 shadow-sm'
                }`}
              >
                <div>
                  {/* Visual Artwork Box */}
                  <div
                    className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-5 flex items-center justify-center p-4 text-white"
                    style={{ background: course.artworkGradient }}
                  >
                    <svg viewBox="0 0 100 100" className="w-14 h-14 opacity-75" fill="none">
                      <path
                        d="M20 70 C 40 30, 60 70, 80 30"
                        stroke="#C5A869"
                        strokeWidth="2.5"
                      />
                      <circle cx="50" cy="50" r="12" stroke="#F7F2EB" strokeWidth="1.5" />
                    </svg>

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {course.level && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[#F7F2EB]">
                          {course.level}
                        </span>
                      )}
                      {course.indianStyle && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[#F7F2EB]">
                          {course.indianStyle.replace('-', ' ')}
                        </span>
                      )}
                    </div>

                    <span className="absolute bottom-3 left-3 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md bg-black/40 text-[#DFD7C9]">
                      {course.format}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="font-display text-lg sm:text-xl font-bold tracking-tight mb-2 group-hover:text-[#C5A869] transition-colors">
                    {lang === 'en' ? course.titleEn : course.titleHi}
                  </h3>

                  {/* Short Description */}
                  <p
                    className={`text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3 ${
                      isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'
                    }`}
                  >
                    {lang === 'en' ? course.shortDescEn : course.shortDescHi}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-[#081F5C]/10 dark:border-white/10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="opacity-75 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#C5A869]" />
                      <span>{course.duration} • {course.classesCount} Classes</span>
                    </span>

                    <div className="text-right">
                      <span className="font-display text-base font-bold text-[#C5A869]">
                        ₹{course.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    id={`view-course-btn-${course.id}`}
                    className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer bg-[#081F5C]/10 hover:bg-[#081F5C] hover:text-[#F7F2EB] dark:bg-white/10 dark:hover:bg-[#F7F2EB] dark:hover:text-[#081F5C]"
                  >
                    <span>{lang === 'en' ? 'View Course' : 'Course Dekhein'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* EMPTY STATE */
          <div
            className={`p-12 text-center rounded-3xl border ${
              isDark ? 'bg-[#081F5C]/20 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
            }`}
          >
            <BookOpen className="w-12 h-12 mx-auto text-[#C5A869] opacity-70 mb-3" />
            <h3 className="font-display text-lg font-bold mb-1">
              {lang === 'en' ? 'No Courses Found' : 'Koi Course Nahi Mila'}
            </h3>
            <p className="text-xs sm:text-sm opacity-70 max-w-sm mx-auto mb-5 leading-relaxed">
              {lang === 'en'
                ? 'Try adjusting your search keyword or clearing the filters to view all available courses.'
                : 'Apna search keyword badalkar ya filters clear karke dobara try karein.'}
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 rounded-full text-xs font-semibold tracking-wide cursor-pointer bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C]"
            >
              {lang === 'en' ? 'Clear Filters' : 'Filters Clear Karein'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
