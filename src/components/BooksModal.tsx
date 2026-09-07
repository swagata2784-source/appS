import React from 'react';
import { X, BookOpen, CheckCircle, Package } from 'lucide-react';
import { Language, Theme } from '../types';

interface BooksModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  theme: Theme;
}

export const BooksModal: React.FC<BooksModalProps> = ({
  isOpen,
  onClose,
  lang,
  theme,
}) => {
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const books = [
    {
      id: 'book-foundation-1',
      title: 'Pianotastic Foundation Piano Method — Vol 1',
      subtitleEn: 'Comprehensive Beginner Guide with Fingering & Repertoire',
      subtitleHi: 'Pehli Bar Seekhne Walon ke Liye Step-by-Step Guide',
      price: '₹499',
      featuresEn: [
        '88-key geography & posture diagrams',
        'Large-format notation reading exercises',
        'Accompanies Western Beginner Recorded Course',
      ],
      featuresHi: [
        '88-key geography aur posture diagrams',
        'Large-format notation exercises',
        'Western Beginner Course ke sath padhai',
      ],
      statusEn: 'Available with Course Enrollment',
      statusHi: 'Course Enrollment ke sath uplabdh',
      gradient: 'linear-gradient(135deg, #081F5C 0%, #17377D 100%)',
    },
    {
      id: 'book-reading-essentials',
      title: 'Sight-Reading & Rhythm Workbook',
      subtitleEn: 'Intervallic Reading, Grand Staff & Meter Fluency',
      subtitleHi: 'Sheet Music Padhne aur Rhythm ki Practice Book',
      price: '₹449',
      featuresEn: [
        'Daily 5-minute reading drills',
        'Treble and Bass clef flash patterns',
        'Syncopation & meter training',
      ],
      featuresHi: [
        'Daily 5-minute reading exercises',
        'Treble aur Bass clef recognition',
        'Rhythm aur syncopation practice',
      ],
      statusEn: 'Academy Publication',
      statusHi: 'Academy Publication',
      gradient: 'linear-gradient(135deg, #0E2E80 0%, #1F4596 100%)',
    },
    {
      id: 'book-bengali-anthology',
      title: 'Anthology of Rabindra Sangeet & Bengali Songs',
      subtitleEn: 'Acoustic Piano Sheet Music with Chord Symbols',
      subtitleHi: 'Piano par Tagore aur Bengali Gaano ki Sheet Music',
      price: '₹599',
      featuresEn: [
        '25 carefully engraved piano arrangements',
        'Authentic acoustic left-hand voicings',
        'Lyrics and emotional background context',
      ],
      featuresHi: [
        '25 sundar piano arrangements',
        'Acoustic chord voicings',
        'Lyrics aur background context',
      ],
      statusEn: 'Upcoming Edition',
      statusHi: 'Jald hi aane wali edition',
      gradient: 'linear-gradient(135deg, #05143D 0%, #102B73 100%)',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 border shadow-2xl transition-all duration-200 ${
          isDark
            ? 'bg-[#040C24] text-[#F7F2EB] border-[#0E2E80]'
            : 'bg-[#F7F2EB] text-[#081F5C] border-[#081F5C]/15'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#081F5C]/10 dark:bg-white/10 text-[#C5A869]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-semibold block text-[#C5A869]">
                {lang === 'en' ? 'Academy Publications' : 'Academy Publications'}
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-bold tracking-tight">
                {lang === 'en' ? 'Pianotastic Books & Workbooks' : 'Pianotastic Books aur Workbooks'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-[#D8CFBC]' : 'text-[#3E4F7D]'}`}>
          {lang === 'en'
            ? 'Original method books and practical workbooks authored specifically to accompany our structured curriculum and support your piano practice.'
            : 'Hamari academy dwara taiyaar ki gayi official books aur workbooks jo aapki piano practice ko aage badhati hain.'}
        </p>

        {/* Books List */}
        <div className="space-y-4 mb-6">
          {books.map((b) => (
            <div
              key={b.id}
              className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-[#081F5C]/40 border-[#0E2E80]' : 'bg-white border-[#081F5C]/10 shadow-sm'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h3 className="font-bold text-base">{b.title}</h3>
                <span className="text-base font-display font-bold text-[#C5A869]">{b.price}</span>
              </div>
              <p className={`text-xs sm:text-sm mb-3 ${isDark ? 'text-[#C7BDAB]' : 'text-[#4A5D8A]'}`}>
                {lang === 'en' ? b.subtitleEn : b.subtitleHi}
              </p>
              <div className="space-y-1.5 mb-3">
                {(lang === 'en' ? b.featuresEn : b.featuresHi).map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs opacity-85">
                    <CheckCircle className="w-3.5 h-3.5 text-[#C5A869] flex-shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs font-medium pt-2 border-t border-[#081F5C]/10 dark:border-white/10">
                <span className="flex items-center gap-1.5 opacity-70">
                  <Package className="w-3.5 h-3.5 text-[#C5A869]" />
                  <span>Physical Edition with Doorstep Delivery</span>
                </span>
                <span className="text-[#C5A869] font-semibold">{lang === 'en' ? b.statusEn : b.statusHi}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Notice */}
        <div className="p-4 rounded-xl bg-[#081F5C]/5 dark:bg-white/5 text-xs leading-relaxed opacity-80 mb-6">
          {lang === 'en'
            ? 'Note: Required books can also be ordered seamlessly as part of course enrollment.'
            : 'Dhyan dein: Course enrollment ke dauran required books sath me mangwai ja sakti hain.'}
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full text-sm font-semibold tracking-wide cursor-pointer transition-all bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C]"
          >
            {lang === 'en' ? 'Close' : 'Band Karein'}
          </button>
        </div>
      </div>
    </div>
  );
};
