import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Bookmark, 
  Volume2, VolumeX, Maximize2, Minimize2, 
  BookOpen, Search,
  Scroll, ChevronDown
} from 'lucide-react';
import { BiographyFigure, ReaderSettings } from '../types';
import { ROYAL_CHRONICLES_100, ChronicleStory, chronicleToBiographyFigure } from '../data/royalChroniclesData';

interface ArchivalDocumentReaderProps {
  figure: BiographyFigure;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (figure: BiographyFigure) => void;
}

export const ArchivalDocumentReader: React.FC<ArchivalDocumentReaderProps> = ({
  figure,
  onClose,
  isFavorite,
  onToggleFavorite,
}) => {
  // Current active document figure (can be switched among the 100 chronicles)
  const [currentFigure, setCurrentFigure] = useState<BiographyFigure>(figure);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'none'>('none');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // 100 Chronicles index modal/drawer state
  const [showChronicleIndex, setShowChronicleIndex] = useState<boolean>(false);
  const [chronicleSearch, setChronicleSearch] = useState<string>('');
  const [selectedChronicleCat, setSelectedChronicleCat] = useState<string>('ทั้งหมด');

  // Find if current figure matches one of the 100 chronicles
  const currentStoryIdx = ROYAL_CHRONICLES_100.findIndex(c => c.id === currentFigure.id);
  const currentStoryNumber = currentStoryIdx >= 0 ? ROYAL_CHRONICLES_100[currentStoryIdx].storyNumber : 1;

  // Reader Settings: Authentic Chronicle Themes
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 9, // Exactly 9px by default as requested
    theme: 'newspaper', // 'newspaper' = สมุดไทยใบลานโบราณ (Parchment), 'newspaper-dark' = สมุดข่อยทองหลวง (Royal Lacquer Gold)
    columns: 2,
    speechRate: 1.0,
  });

  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Touch Swipe Gesture State (สำหรับสไลด์เปลี่ยนหน้าแบบมือถือ)
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const totalPages = Math.max(1, currentFigure.pages.length);
  const activePageData = currentFigure.pages[currentPage - 1] || currentFigure.pages[0];

  // Sync if prop figure changes
  useEffect(() => {
    setCurrentFigure(figure);
    setCurrentPage(1);
  }, [figure]);

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showChronicleIndex) {
        if (e.key === 'Escape') setShowChronicleIndex(false);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        goToNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        goToPrevPage();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, isFullscreen, showChronicleIndex]);

  // Touch event handlers for mobile side slide / swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    touchStartYRef.current = e.targetTouches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const deltaX = touchStartXRef.current - touchEndXRef.current;
    const deltaY = touchStartYRef.current ? Math.abs(e.changedTouches[0].clientY - touchStartYRef.current) : 0;

    // Must be predominantly horizontal swipe and exceed 45px threshold
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > deltaY * 1.3) {
      if (deltaX > 0) {
        // Swiped Left -> Go to Next Page
        goToNextPage();
      } else {
        // Swiped Right -> Go to Prev Page
        goToPrevPage();
      }
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
    touchEndXRef.current = null;
  };

  // Turn to Next Page with slide transition
  const goToNextPage = () => {
    if (currentPage < totalPages && !isAnimating) {
      setIsAnimating(true);
      setSlideDirection('left');
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setSlideDirection('none');
        setIsAnimating(false);
        const docEl = document.getElementById('chronicle-doc-body');
        if (docEl) docEl.scrollTo({ top: 0, behavior: 'smooth' });
      }, 160);
    }
  };

  // Turn to Prev Page with slide transition
  const goToPrevPage = () => {
    if (currentPage > 1 && !isAnimating) {
      setIsAnimating(true);
      setSlideDirection('right');
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setSlideDirection('none');
        setIsAnimating(false);
        const docEl = document.getElementById('chronicle-doc-body');
        if (docEl) docEl.scrollTo({ top: 0, behavior: 'smooth' });
      }, 160);
    }
  };

  // Switch to another chronicle story among 100
  const handleSelectChronicle = (chronicle: ChronicleStory) => {
    const fig = chronicleToBiographyFigure(chronicle);
    setCurrentFigure(fig);
    setCurrentPage(1);
    setShowChronicleIndex(false);
    const docEl = document.getElementById('chronicle-doc-body');
    if (docEl) docEl.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStory = () => {
    if (currentStoryIdx >= 0 && currentStoryIdx < ROYAL_CHRONICLES_100.length - 1) {
      handleSelectChronicle(ROYAL_CHRONICLES_100[currentStoryIdx + 1]);
    } else if (currentStoryIdx < 0) {
      handleSelectChronicle(ROYAL_CHRONICLES_100[0]);
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIdx > 0) {
      handleSelectChronicle(ROYAL_CHRONICLES_100[currentStoryIdx - 1]);
    }
  };

  // Handle Speech Synthesis
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `${activePageData.chapterTitle}. ${activePageData.paragraphs.join(' ')}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'th-TH';
      utterance.rate = settings.speechRate;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Filter 100 Chronicles
  const filteredChronicles = ROYAL_CHRONICLES_100.filter(c => {
    const matchCat = selectedChronicleCat === 'ทั้งหมด' || c.category === selectedChronicleCat;
    const matchSearch = 
      c.title.toLowerCase().includes(chronicleSearch.toLowerCase()) ||
      c.shortTitle.toLowerCase().includes(chronicleSearch.toLowerCase()) ||
      c.summary.toLowerCase().includes(chronicleSearch.toLowerCase()) ||
      c.storyNumber.toString() === chronicleSearch.trim();
    return matchCat && matchSearch;
  });

  // Font size class mapping
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 9:
        return 'text-newsprint-9px';
      case 11:
        return 'text-newsprint-11px';
      case 13:
        return 'text-newsprint-13px';
      case 15:
        return 'text-newsprint-15px';
      default:
        return 'text-newsprint-9px';
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/92 backdrop-blur-md p-1.5 sm:p-4 overflow-hidden transition-all ${isFullscreen ? 'p-0' : ''}`}>
      
      {/* ============================================================== */}
      {/* TOP COMPACT ICON-ONLY TOOLBAR (พอดีจอมือถือ ไม่ทับซ้อน)        */}
      {/* ============================================================== */}
      <header className="w-full max-w-5xl bg-[#14120f] border-t-2 border-x border-b border-[#d4af37]/50 rounded-t-xl px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between gap-1 sm:gap-2 text-[#f4e4bc] shadow-2xl z-20 overflow-x-auto no-scrollbar">
        
        {/* Left: Chronicle Identity & 100 Stories Switcher */}
        <div className="flex items-center gap-2 min-w-0">
          {/* 100 Chronicles Modal Open Button */}
          <button
            onClick={() => setShowChronicleIndex(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#d4af37]/20 border border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-black transition-all cursor-pointer text-[#d4af37] shrink-0"
            title="เปิดสารบัญ ๑๐๐ เรื่อง"
            aria-label="สารบัญพระราชพงศาวดาร ๑๐๐ เรื่อง"
          >
            <Scroll className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono font-bold whitespace-nowrap">
              {currentStoryIdx >= 0 ? `เรื่องที่ ${currentStoryNumber}/๑๐๐` : 'สารบัญ ๑๐๐ เรื่อง'}
            </span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {/* Title (hidden on mobile, visible on tablet/desktop) */}
          <h2 className="hidden md:inline-block font-semibold text-xs truncate max-w-[200px] text-amber-200/90 font-serif">
            {currentFigure.nameTh}
          </h2>
        </div>

        {/* Right: Sleek Controls (เมนูเลือกแบบยุบเลือก พอดีจอมือถือ) */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* Font Size Collapsible Select Dropdown (เมนูเลือกอักษร แบบยุบเลือก) */}
          <div className="relative flex items-center shrink-0">
            <select
              value={settings.fontSize}
              onChange={(e) => setSettings(s => ({ ...s, fontSize: Number(e.target.value) as (9 | 11 | 13 | 15) }))}
              className="bg-black/70 border border-[#d4af37]/40 text-[#d4af37] text-[11px] font-mono font-bold rounded-lg pl-2 pr-6 py-1 focus:outline-none focus:border-[#d4af37] cursor-pointer appearance-none hover:bg-black/90 transition-all shadow-sm"
              title="เลือกขนาดตัวหนังสือ"
              aria-label="เลือกขนาดตัวหนังสือ"
            >
              <option value={9} className="bg-[#1a1714] text-[#f4e4bc]">9px (เล็กสุด)</option>
              <option value={11} className="bg-[#1a1714] text-[#f4e4bc]">11px (มาตรฐาน)</option>
              <option value={13} className="bg-[#1a1714] text-[#f4e4bc]">13px (ขยาย)</option>
              <option value={15} className="bg-[#1a1714] text-[#f4e4bc]">15px (ใหญ่)</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#d4af37] absolute right-1.5 pointer-events-none opacity-80" />
          </div>

          {/* Speech Read Aloud */}
          <button
            onClick={handleToggleSpeech}
            className={`p-1 sm:p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${isSpeaking ? 'bg-amber-500 text-black animate-pulse border-amber-400' : 'bg-black/50 border-[#d4af37]/30 hover:border-[#d4af37] text-gray-300'}`}
            title={isSpeaking ? 'หยุดอ่านออกเสียง' : 'อ่านออกเสียง'}
            aria-label="อ่านออกเสียง"
          >
            {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Favorite */}
          <button
            onClick={() => onToggleFavorite(currentFigure)}
            className={`p-1 sm:p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${isFavorite ? 'bg-amber-500/20 text-yellow-400 border-yellow-500' : 'bg-black/50 border-[#d4af37]/30 hover:border-[#d4af37] text-gray-400 hover:text-white'}`}
            title={isFavorite ? 'ลบออกจากรายการโปรด' : 'บันทึกในรายการโปรด'}
            aria-label="รายการโปรด"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? 'fill-yellow-400' : ''}`} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 sm:p-1.5 rounded-lg bg-black/50 border border-[#d4af37]/30 hover:border-[#d4af37] text-gray-400 hover:text-white transition-all hidden sm:block cursor-pointer shrink-0"
            title={isFullscreen ? 'ออกจากโหมดเต็มจอ' : 'เปิดโหมดเต็มจอ'}
            aria-label="เต็มจอ"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close Window */}
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-lg bg-red-950/70 hover:bg-red-800 border border-red-500/50 text-red-200 hover:text-white transition-all cursor-pointer shrink-0"
            title="ปิด"
            aria-label="ปิด"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </header>

      {/* ============================================================== */}
      {/* MAIN ROYAL CHRONICLE BODY WITH MOBILE HORIZONTAL SWIPE GESTURE  */}
      {/* ============================================================== */}
      <main 
        id="chronicle-doc-body"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`w-full max-w-5xl flex-1 overflow-y-auto custom-scroll relative p-4 sm:p-8 md:p-12 transition-all shadow-2xl select-text touch-pan-y ${
          settings.theme === 'newspaper' 
            ? 'bg-[#f7efe0] text-[#1c160c] border-x border-[#8c6f36]/40' 
            : 'bg-[#15120d] text-[#e8dec0] border-x border-[#d4af37]/40'
        }`}
      >
        {/* Animated Page Slide Wrapper (เปลี่ยนหน้าแบบสไลด์ข้างมือถือ) */}
        <div 
          className={`transition-all duration-200 ease-out transform ${
            slideDirection === 'left' 
              ? '-translate-x-8 opacity-40' 
              : slideDirection === 'right' 
                ? 'translate-x-8 opacity-40' 
                : 'translate-x-0 opacity-100'
          }`}
        >
          {/* ========================================================== */}
          {/* COMPACT DOCUMENT HEADER (ตัดข้อความซ้ำซ้อน ไม่กินพื้นที่เนื้อหา) */}
          {/* ========================================================== */}
          {currentPage === 1 ? (
            <div className="border-b-2 border-[#8c6f36]/40 pb-2 mb-3">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#8c6f36] dark:text-[#d4af37]">
                    ๏ จดหมายเหตุหลวง • {currentFigure.period || 'บันทึกประวัติศาสตร์'}
                  </span>
                  <h1 className="text-base sm:text-lg font-black font-cinzel text-[#2e2009] dark:text-[#f7e7c4] leading-tight">
                    {currentFigure.nameTh}
                    {currentFigure.nameEn && (
                      <span className="text-xs font-normal italic font-serif text-[#6e531e] dark:text-[#c4a968] ml-2">
                        ({currentFigure.nameEn})
                      </span>
                    )}
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#8c6f36] dark:text-[#d4af37] shrink-0 self-start sm:self-auto">
                  <span className="bg-[#8c6f36]/15 px-2 py-0.5 rounded border border-[#8c6f36]/30">
                    หน้า ๑ / {totalPages}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between border-b border-[#8c6f36]/25 pb-1.5 mb-3 text-xs text-[#6e531e] dark:text-[#c4a968] font-mono">
              <span className="truncate max-w-[70%] font-semibold text-[#8c6f36] dark:text-[#d4af37] text-[11px]">
                {currentFigure.nameTh}
              </span>
              <span className="font-bold bg-[#8c6f36]/15 px-2 py-0.5 rounded border border-[#8c6f36]/30 text-[11px]">
                หน้า {currentPage} / {totalPages}
              </span>
            </div>
          )}

          {/* Chapter Title & Preamble Drop Cap */}
          <div className="mb-6 space-y-1">
            <h2 className="text-base sm:text-2xl font-bold font-serif text-[#291b05] dark:text-[#faebd7] flex items-center gap-2">
              <span className="inline-block w-2.5 h-6 bg-[#8c6f36] rounded-sm"></span>
              {activePageData.chapterTitle}
            </h2>
            {activePageData.subTitle && (
              <p className="text-xs sm:text-sm italic font-serif text-[#6e531e] dark:text-[#d4af37]/80 pl-4">
                — {activePageData.subTitle}
              </p>
            )}
          </div>

          {/* ========================================================== */}
          {/* CHRONICLE PARAGRAPH TEXT (ขนาด 9px ตามสั่ง พร้อม ๒ สดมภ์)   */}
          {/* ========================================================== */}
          <div className={`font-newspaper text-justify leading-relaxed break-words [text-align-last:left] ${getFontSizeClass()} ${settings.columns === 2 ? 'newspaper-columns-2' : ''} text-[#1f180f] dark:text-[#e8dec0]`}>
            {activePageData.paragraphs.map((para, idx) => (
              <p 
                key={idx} 
                className={`mb-4 ${idx === 0 ? 'drop-cap' : ''}`}
              >
                {para}
              </p>
            ))}

            {/* In-page Quote Box if provided */}
            {activePageData.quote && (
              <blockquote className="my-5 p-3.5 border-l-4 border-[#8c6f36] bg-[#8c6f36]/15 rounded-r text-xs italic font-serif text-[#3d2a09] dark:text-[#f4e4bc]">
                {activePageData.quote}
              </blockquote>
            )}
          </div>

          {/* Traditional Chronicle End-Stamp (๏ ฟองมัน - ๛ โคมูตร) */}
          <div className="mt-8 pt-4 border-t border-[#8c6f36]/30 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-[#6e531e] dark:text-gray-400 font-serif">
            <div className="flex items-center gap-2">
              <span className="text-base text-[#8c6f36]">๛</span>
              <span>ตรวจชำระพระราชพงศาวดารโดย: กองจดหมายเหตุและพงศาวดารประวัติศาสตร์สากล</span>
            </div>
            <div className="flex items-center gap-3 font-mono">
              <span>แบบอักษร: {settings.fontSize}px</span>
              <span>•</span>
              <span className="font-bold">เรื่องที่ {currentStoryNumber}/๑๐๐ (หน้า {currentPage}/{totalPages})</span>
            </div>
          </div>

        </div>
      </main>

      {/* ============================================================== */}
      {/* BOTTOM COMPACT PAGINATION (ไอคอนปุ่ม ไร้ข้อความรกรุงรัง)         */}
      {/* ============================================================== */}
      <footer className="w-full max-w-5xl bg-[#14120f] border-b-2 border-x border-t border-[#d4af37]/50 rounded-b-xl px-3 py-2 flex items-center justify-between gap-2 text-[#f4e4bc] shadow-2xl z-20">
        
        {/* Previous Page: Pure Icon Button */}
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            currentPage === 1 
              ? 'opacity-30 cursor-not-allowed border-gray-800 text-gray-600' 
              : 'bg-[#221d15] border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-black text-[#f4e4bc]'
          }`}
          title="หน้าก่อนหน้า"
          aria-label="หน้าก่อนหน้า"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Slider Pills (Compact 1 to totalPages) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-md py-0.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => {
                setCurrentPage(num);
                const docEl = document.getElementById('chronicle-doc-body');
                if (docEl) docEl.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`w-7 h-7 shrink-0 rounded-md text-xs font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${
                currentPage === num 
                  ? 'bg-[#d4af37] text-black ring-2 ring-amber-300 shadow-md scale-105' 
                  : 'bg-black/50 text-gray-400 hover:text-white border border-[#d4af37]/20 hover:border-[#d4af37]'
              }`}
              title={`ไปยังหน้าที่ ${num}`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Next Page: Pure Icon Button */}
        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            currentPage === totalPages 
              ? 'opacity-30 cursor-not-allowed border-gray-800 text-gray-600' 
              : 'bg-[#221d15] border-[#d4af37]/50 hover:bg-[#d4af37] hover:text-black text-[#f4e4bc]'
          }`}
          title="หน้าถัดไป"
          aria-label="หน้าถัดไป"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* ============================================================== */}
      {/* 100 CHRONICLES SELECTION MODAL (สารบัญพระราชพงศาวดาร ๑๐๐ เรื่อง)  */}
      {/* ============================================================== */}
      {showChronicleIndex && (
        <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
          <div className="bg-[#181512] border-2 border-[#d4af37] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-[#d4af37]/30 flex items-center justify-between bg-[#120f0c]">
              <div className="flex items-center gap-2.5">
                <Scroll className="w-5 h-5 text-[#d4af37]" />
                <div>
                  <h3 className="font-bold text-base sm:text-lg font-cinzel text-white">
                    สารบัญพระราชพงศาวดาร ๑๐๐ เรื่องราว
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    เลือกลำดับเรื่องที่ ๑ ถึง ๑๐๐ เพื่อเปิดอ่านฉบับสมุดไทยโบราณ
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChronicleIndex(false)}
                className="p-1.5 rounded-lg bg-black/40 border border-white/10 hover:border-red-500 text-gray-400 hover:text-white transition-all cursor-pointer"
                title="ปิดสารบัญ"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Category Filter */}
            <div className="p-3 border-b border-white/5 space-y-2 bg-black/20">
              <div className="relative">
                <Search className="w-4 h-4 text-[#d4af37] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={chronicleSearch}
                  onChange={(e) => setChronicleSearch(e.target.value)}
                  placeholder="ค้นหาชื่อเรื่องพงศาวดาร, ยุคสมัย, หรือพิมพ์ตัวเลข 1-100..."
                  className="w-full bg-[#201d18] border border-[#d4af37]/30 rounded-xl py-2 pl-9 pr-4 text-xs text-[#f4e4bc] focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              {/* Categories */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
                {['ทั้งหมด', 'อยุธยา', 'ธนบุรี', 'รัตนโกสินทร์', 'สุโขทัย-ล้านนา', 'จดหมายเหตุสยาม', 'พงศาวดารสากล'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedChronicleCat(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                      selectedChronicleCat === cat 
                        ? 'bg-[#d4af37] text-black font-bold' 
                        : 'bg-black/40 text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Chronicle List (1 to 100) */}
            <div className="flex-1 overflow-y-auto custom-scroll p-3 space-y-2">
              <div className="text-[11px] text-gray-400 px-1 pb-1">
                พบ {filteredChronicles.length} เรื่องราว (จากทั้งหมด ๑๐๐ เรื่อง)
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredChronicles.map(c => {
                  const isCurrent = c.id === currentFigure.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectChronicle(c)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        isCurrent 
                          ? 'bg-[#d4af37]/20 border-[#d4af37] shadow-md' 
                          : 'bg-[#1e1a14] border-white/5 hover:border-[#d4af37]/50 hover:bg-[#252019]'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-black/60 border border-[#d4af37]/40 flex items-center justify-center shrink-0 text-[#d4af37] font-mono font-bold text-xs">
                        {c.storyNumber}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#d4af37]/15 text-[#d4af37] font-medium">
                            {c.category}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {c.era.split(' ')[0]}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-[#d4af37]">
                          {c.shortTitle}
                        </h4>
                        <p className="text-[11px] text-gray-400 line-clamp-2 leading-tight">
                          {c.summary}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
