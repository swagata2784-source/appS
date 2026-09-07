import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Printer,
  Download,
  Play,
  Music2,
  Sparkles,
} from 'lucide-react';
import { SheetMusicItem, Language, Theme } from '../types';

interface SheetMusicViewerModalProps {
  sheetMusic: SheetMusicItem;
  onClose: () => void;
  onStartPractice?: (pieceTitle: string) => void;
  onOpenInteractive?: () => void;
  lang: Language;
  theme: Theme;
}

export const SheetMusicViewerModal: React.FC<SheetMusicViewerModalProps> = ({
  sheetMusic,
  onClose,
  onStartPractice,
  onOpenInteractive,
  lang,
  theme,
}) => {
  const isDark = theme === 'dark';
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState<100 | 125 | 150>(100);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const totalPages = sheetMusic.pageCount || 1;

  const handlePrintOrDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      window.print();
      setDownloadSuccess(false);
    }, 300);
  };

  return (
    <div
      id="sheet-music-viewer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-2 sm:p-4 backdrop-blur-xs"
    >
      <div
        className={`w-full max-w-4xl h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
          isDark ? 'bg-[#040C24] border-[#0E2E80] text-[#F7F2EB]' : 'bg-white border-[#081F5C]/15 text-[#081F5C]'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#081F5C]/10 dark:border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C5A869]/15 text-[#C5A869] flex items-center justify-center">
              <Music2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#C5A869]">
                Pianotastic Standard Sheet Music
              </div>
              <h2 className="font-display text-sm sm:text-base font-bold line-clamp-1">
                {sheetMusic.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-[#081F5C]/5 dark:bg-white/5 rounded-full p-1 border border-[#081F5C]/10 dark:border-white/10">
              <button
                onClick={() => setZoomLevel((prev) => (prev === 150 ? 125 : 100))}
                disabled={zoomLevel === 100}
                className="p-1.5 rounded-full hover:bg-gray-500/10 disabled:opacity-30 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 font-bold">{zoomLevel}%</span>
              <button
                onClick={() => setZoomLevel((prev) => (prev === 100 ? 125 : 150))}
                disabled={zoomLevel === 150}
                className="p-1.5 rounded-full hover:bg-gray-500/10 disabled:opacity-30 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print / Download Button */}
            <button
              onClick={handlePrintOrDownload}
              className="p-2 rounded-xl border border-[#081F5C]/15 dark:border-white/15 hover:border-[#C5A869] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Print / Save PDF"
            >
              <Download className="w-4 h-4 text-[#C5A869]" />
              <span className="hidden md:inline">
                {downloadSuccess ? (lang === 'en' ? 'Preparing...' : 'Tayar...') : (lang === 'en' ? 'Print / PDF' : 'PDF / Print')}
              </span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-500/10 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action strip: Context, Tempo, Key, and Practice launcher */}
        <div className="px-5 py-2.5 bg-[#081F5C]/5 dark:bg-white/5 border-b border-[#081F5C]/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            {sheetMusic.composer && (
              <span className="opacity-75">
                <strong className="opacity-90">{lang === 'en' ? 'Composer:' : 'Composer:'}</strong> {sheetMusic.composer}
              </span>
            )}
            {sheetMusic.tempo && (
              <span className="opacity-75">
                <strong className="opacity-90">{lang === 'en' ? 'Tempo:' : 'Tempo:'}</strong> {sheetMusic.tempo}
              </span>
            )}
            {sheetMusic.timeSignature && (
              <span className="opacity-75">
                <strong className="opacity-90">{lang === 'en' ? 'Meter:' : 'Meter:'}</strong> {sheetMusic.timeSignature}
              </span>
            )}
            {sheetMusic.keySignature && (
              <span className="opacity-75">
                <strong className="opacity-90">{lang === 'en' ? 'Key:' : 'Key:'}</strong> {sheetMusic.keySignature}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {sheetMusic.hasInteractiveVersion && (
              <button
                onClick={() => {
                  onClose();
                  if (onOpenInteractive) onOpenInteractive();
                }}
                className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#C5A869]/15 text-[#C5A869] border border-[#C5A869]/40 hover:bg-[#C5A869]/25 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Open Interactive Sheet Music' : 'Interactive Sheet Music'}</span>
              </button>
            )}

            {onStartPractice && (
              <button
                onClick={() => {
                  onClose();
                  onStartPractice(sheetMusic.title);
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#081F5C] text-[#F7F2EB] dark:bg-[#F7F2EB] dark:text-[#081F5C] flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{lang === 'en' ? 'Start Practice Timer' : 'Practice Start Kijiye'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Notation Reading Canvas (Scrollable, Zoomable, High contrast) */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4 sm:p-8 flex justify-center bg-[#EDE6D8]/30 dark:bg-black/40">
          <div
            className={`w-full max-w-3xl rounded-2xl shadow-lg border p-6 sm:p-10 transition-all ${
              isDark
                ? 'bg-[#0B1736] border-[#1C3672] text-[#F7F2EB]'
                : 'bg-[#FFFDF9] border-[#E8DFC8] text-[#081F5C]'
            }`}
            style={{
              transform: zoomLevel === 125 ? 'scale(1.1)' : zoomLevel === 150 ? 'scale(1.2)' : 'none',
              transformOrigin: 'top center',
            }}
          >
            {/* Sheet Title and Header inside Score */}
            <div className="text-center space-y-1 mb-8 border-b pb-4 border-current/15">
              <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">
                {sheetMusic.title}
              </h1>
              <div className="flex justify-between items-center text-xs opacity-75 pt-1">
                <span className="font-semibold">{sheetMusic.tempo || 'Moderato'}</span>
                <span>{sheetMusic.composer || 'Amitava Sen'}</span>
              </div>
            </div>

            {/* REAL WESTERN GRAND STAFF NOTATION RENDERER */}
            <div className="space-y-8 font-mono">
              {/* System 1: Measures 1 & 2 */}
              <div className="space-y-2">
                <div className="text-[10px] opacity-60 flex justify-between">
                  <span>Bars 1–2</span>
                  <span className="italic">mp cantabile</span>
                </div>

                {/* Grand Staff Container */}
                <div className="relative border-l-4 border-current pl-3 py-1">
                  {/* Treble Staff (5 lines) */}
                  <div className="relative h-20 mb-6">
                    <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-full h-[1px] bg-current opacity-40" />
                      ))}
                    </div>
                    {/* Treble Clef Symbol representation */}
                    <div className="absolute left-1 top-0 bottom-0 flex items-center font-display font-bold text-3xl opacity-85 select-none">
                      𝄞
                    </div>
                    {/* Time Signature 4/4 */}
                    <div className="absolute left-9 top-1 bottom-1 flex flex-col justify-center text-xs font-bold leading-none select-none">
                      <span>4</span>
                      <span>4</span>
                    </div>

                    {/* Notes in Treble Staff */}
                    <div className="absolute left-20 right-0 top-0 bottom-0 flex items-center justify-around pr-4">
                      {/* Note 1: Middle C (C4) with ledger line */}
                      <div className="flex flex-col items-center group relative">
                        <span className="text-[9px] font-bold text-[#C5A869] mb-1">1</span>
                        <div className="relative">
                          <div className="w-5 h-[1.5px] bg-current opacity-75 absolute top-1.5 -left-1" />
                          <div className="w-3.5 h-3 rounded-full border-2 border-current bg-current rotate-[-20deg]" />
                          <div className="w-[1.5px] h-7 bg-current absolute left-3 bottom-1.5" />
                        </div>
                        <span className="text-[9px] opacity-70 mt-1">C4</span>
                      </div>

                      {/* Note 2: D4 */}
                      <div className="flex flex-col items-center group relative">
                        <span className="text-[9px] font-bold text-[#C5A869] mb-1">2</span>
                        <div className="relative">
                          <div className="w-3.5 h-3 rounded-full border-2 border-current bg-current rotate-[-20deg]" />
                          <div className="w-[1.5px] h-7 bg-current absolute left-3 bottom-1.5" />
                        </div>
                        <span className="text-[9px] opacity-70 mt-1">D4</span>
                      </div>

                      {/* Bar line */}
                      <div className="w-[1.5px] h-14 bg-current opacity-50 mx-2" />

                      {/* Note 3: E4 */}
                      <div className="flex flex-col items-center group relative">
                        <span className="text-[9px] font-bold text-[#C5A869] mb-1">3</span>
                        <div className="relative">
                          <div className="w-3.5 h-3 rounded-full border-2 border-current bg-current rotate-[-20deg]" />
                          <div className="w-[1.5px] h-7 bg-current absolute left-3 bottom-1.5" />
                        </div>
                        <span className="text-[9px] opacity-70 mt-1">E4</span>
                      </div>

                      {/* Note 4: G4 (Whole note / Semibreve) */}
                      <div className="flex flex-col items-center group relative">
                        <span className="text-[9px] font-bold text-[#C5A869] mb-1">5</span>
                        <div className="relative">
                          <div className="w-4 h-3 rounded-full border-2 border-current rotate-[-20deg]" />
                        </div>
                        <span className="text-[9px] opacity-70 mt-2">G4 (4 beats)</span>
                      </div>
                    </div>
                  </div>

                  {/* Bass Staff (5 lines) */}
                  <div className="relative h-20">
                    <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-full h-[1px] bg-current opacity-40" />
                      ))}
                    </div>
                    {/* Bass Clef Symbol representation */}
                    <div className="absolute left-1 top-0 bottom-0 flex items-center font-display font-bold text-3xl opacity-85 select-none">
                      𝄢
                    </div>
                    {/* Time Signature */}
                    <div className="absolute left-9 top-1 bottom-1 flex flex-col justify-center text-xs font-bold leading-none select-none">
                      <span>4</span>
                      <span>4</span>
                    </div>

                    {/* Left Hand Notes */}
                    <div className="absolute left-20 right-0 top-0 bottom-0 flex items-center justify-around pr-4">
                      {/* Bar 1: Whole Rest */}
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-2 bg-current" />
                        <span className="text-[9px] opacity-60 mt-2">Whole Rest</span>
                      </div>

                      <div className="w-[1.5px] h-14 bg-current opacity-50 mx-2" />

                      {/* Bar 2: Low C3 Bass Note */}
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-[#C5A869] mb-1">5 (LH)</span>
                        <div className="relative">
                          <div className="w-4 h-3 rounded-full border-2 border-current rotate-[-20deg]" />
                        </div>
                        <span className="text-[9px] opacity-70 mt-2">C3 (Semibreve)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System 2: Measures 3 & 4 (With Repeat Sign & Musical Jump) */}
              <div className="space-y-2 pt-4">
                <div className="text-[10px] opacity-60 flex justify-between">
                  <span>Bars 3–4</span>
                  <span className="font-bold text-[#C5A869]">Fine & Repeat [:||]</span>
                </div>

                <div className="relative border-l-4 border-current pl-3 py-1">
                  {/* Treble Staff */}
                  <div className="relative h-20 mb-6">
                    <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-full h-[1px] bg-current opacity-40" />
                      ))}
                    </div>
                    <div className="absolute left-1 top-0 bottom-0 flex items-center font-display font-bold text-3xl opacity-85 select-none">
                      𝄞
                    </div>

                    <div className="absolute left-16 right-0 top-0 bottom-0 flex items-center justify-around pr-4">
                      {/* Descending Notes */}
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-[#C5A869] mb-1">4</span>
                        <div className="w-3.5 h-3 rounded-full border-2 border-current bg-current rotate-[-20deg]" />
                        <span className="text-[9px] opacity-70 mt-1">F4</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-[#C5A869] mb-1">3</span>
                        <div className="w-3.5 h-3 rounded-full border-2 border-current bg-current rotate-[-20deg]" />
                        <span className="text-[9px] opacity-70 mt-1">E4</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-[#C5A869] mb-1">2</span>
                        <div className="w-3.5 h-3 rounded-full border-2 border-current bg-current rotate-[-20deg]" />
                        <span className="text-[9px] opacity-70 mt-1">D4</span>
                      </div>

                      {/* Bar line */}
                      <div className="w-[1.5px] h-14 bg-current opacity-50 mx-2" />

                      {/* Final Middle C with Double Repeat Bar */}
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-[#C5A869] mb-1">1</span>
                        <div className="relative">
                          <div className="w-5 h-[1.5px] bg-current opacity-75 absolute top-1.5 -left-1" />
                          <div className="w-4 h-3 rounded-full border-2 border-current rotate-[-20deg]" />
                        </div>
                        <span className="text-[9px] opacity-70 mt-2">C4</span>
                      </div>

                      {/* Repeat Bar Line Sign [:||] */}
                      <div className="flex items-center gap-1 pl-2">
                        <div className="flex flex-col gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        </div>
                        <div className="w-[1.5px] h-14 bg-current opacity-80" />
                        <div className="w-1 h-14 bg-current" />
                      </div>
                    </div>
                  </div>

                  {/* Bass Staff */}
                  <div className="relative h-20">
                    <div className="absolute inset-0 flex flex-col justify-between py-1 pointer-events-none">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-full h-[1px] bg-current opacity-40" />
                      ))}
                    </div>
                    <div className="absolute left-1 top-0 bottom-0 flex items-center font-display font-bold text-3xl opacity-85 select-none">
                      𝄢
                    </div>

                    <div className="absolute left-16 right-0 top-0 bottom-0 flex items-center justify-around pr-4">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-[#C5A869] mb-1">1 (LH)</span>
                        <div className="w-4 h-3 rounded-full border-2 border-current rotate-[-20deg]" />
                        <span className="text-[9px] opacity-70 mt-2">G3</span>
                      </div>

                      <div className="w-[1.5px] h-14 bg-current opacity-50 mx-2" />

                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-bold text-[#C5A869] mb-1">5 (LH)</span>
                        <div className="w-4 h-3 rounded-full border-2 border-current rotate-[-20deg]" />
                        <span className="text-[9px] opacity-70 mt-2">C3</span>
                      </div>

                      <div className="flex items-center gap-1 pl-2">
                        <div className="flex flex-col gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                          <div className="w-1.5 h-1.5 rounded-full bg-current" />
                        </div>
                        <div className="w-[1.5px] h-14 bg-current opacity-80" />
                        <div className="w-1 h-14 bg-current" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Guidance Footer in Score */}
            <div className="mt-8 pt-4 border-t border-current/15 text-xs opacity-80 flex flex-col sm:flex-row justify-between gap-2">
              <div>
                <strong>Performance Note:</strong> Play with hands relaxed. Repeat bars 1–4 once before final ending.
              </div>
              <div className="text-[11px] font-mono opacity-60">
                Pianotastic Academy Edition • All Rights Reserved
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer: Page Navigation */}
        <div className="px-5 py-3 border-t border-[#081F5C]/10 dark:border-white/10 flex items-center justify-between flex-shrink-0 bg-transparent">
          <div className="text-xs font-semibold opacity-75">
            {lang === 'en' ? `Page ${currentPage} of ${totalPages}` : `Page ${currentPage} me se ${totalPages}`}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-full border border-[#081F5C]/15 dark:border-white/15 text-xs font-semibold disabled:opacity-30 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Previous' : 'Pichla'}</span>
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-full border border-[#081F5C]/15 dark:border-white/15 text-xs font-semibold disabled:opacity-30 flex items-center gap-1 cursor-pointer"
            >
              <span>{lang === 'en' ? 'Next' : 'Agla'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
