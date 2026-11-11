import React, { useState, useEffect } from 'react';
import { 
  X, RefreshCw, Maximize2, Minimize2, 
  ChevronLeft, Star, Smartphone, Monitor, Globe,
  BookOpen, Sparkles
} from 'lucide-react';
import { BiographyFigure } from '../types';

interface WikiPdfReaderModalProps {
  figure: BiographyFigure | null;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const WikiPdfReaderModal: React.FC<WikiPdfReaderModalProps> = ({
  figure,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);
  const [useMobileView, setUseMobileView] = useState<boolean>(true); // Mobile site embeds faster and cleaner
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);

  useEffect(() => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  }, [figure?.id, figure?.wikiTitle, figure?.nameTh, useMobileView]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  if (!figure) return null;

  const wikiTitle = figure.wikiTitle || figure.nameTh;
  const encodedTitle = encodeURIComponent(wikiTitle);
  
  // Real Wikipedia Live URLs
  const realMobileWikiUrl = `https://th.m.wikipedia.org/wiki/${encodedTitle}`;
  const realDesktopWikiUrl = `https://th.wikipedia.org/wiki/${encodedTitle}`;
  
  const currentEmbedUrl = useMobileView ? realMobileWikiUrl : realDesktopWikiUrl;

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn ${
      isFullscreen ? 'p-0' : 'p-2 sm:p-5'
    }`}>
      <div 
        className={`bg-[#121214] border border-[#d4af37]/40 flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen 
            ? 'w-full h-full rounded-none border-none' 
            : 'w-full max-w-7xl h-[95vh] rounded-2xl shadow-2xl'
        }`}
      >
        {/* ========================================================== */}
        {/* TOP WIKIPEDIA WEBVIEW TOOLBAR                             */}
        {/* ========================================================== */}
        <div className="px-3 sm:px-5 py-2.5 bg-gradient-to-r from-[#1a1a1e] via-[#161619] to-[#121215] border-b border-[#d4af37]/30 flex items-center justify-between gap-3 shrink-0">
          
          {/* Left: Brand & Page Info */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer shrink-0 border border-white/10"
              title="ย้อนกลับ / ปิด (Esc)"
              aria-label="ย้อนกลับ / ปิด"
            >
              <ChevronLeft className="w-5 h-5 text-[#d4af37]" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-300 text-black font-serif font-bold text-base flex items-center justify-center shrink-0 shadow-inner">
              W
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30 shrink-0 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>หน้าเว็บจริง WIKIPEDIA LIVE</span>
                </span>
                <span className="text-[10px] text-gray-400 font-mono hidden md:inline truncate">
                  {currentEmbedUrl}
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white truncate font-cinzel mt-0.5">
                {figure.nameTh} ({figure.nameEn})
              </h2>
            </div>
          </div>

          {/* Right: Controls & View Toggles */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* View Mode Toggle: Mobile vs Desktop */}
            <div className="hidden sm:flex items-center bg-black/60 border border-white/10 rounded-xl p-0.5">
              <button
                onClick={() => setUseMobileView(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  useMobileView 
                    ? 'bg-[#d4af37] text-black font-bold shadow' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="ฉบับมือถือ (โหลดเร็ว อ่านสบาย)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden md:inline">มือถือ</span>
              </button>
              
              <button
                onClick={() => setUseMobileView(false)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  !useMobileView 
                    ? 'bg-[#d4af37] text-black font-bold shadow' 
                    : 'text-gray-400 hover:text-white'
                }`}
                title="ฉบับเดสก์ท็อป"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden md:inline">เดสก์ท็อป</span>
              </button>
            </div>

            {/* Reload Webview */}
            <button
              onClick={handleReload}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
              title="โหลดหน้าเว็บใหม่"
              aria-label="โหลดหน้าใหม่"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#d4af37]' : ''}`} />
            </button>

            {/* Toggle Favorite */}
            {onToggleFavorite && (
              <button
                onClick={onToggleFavorite}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
                title={isFavorite ? 'นำออกจากรายการโปรด' : 'บันทึกลงรายการโปรด'}
                aria-label="รายการโปรด"
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
              </button>
            )}

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer hidden sm:block"
              title={isFullscreen ? 'ย่อหน้าจอ' : 'ขยายเต็มหน้าจอ'}
              aria-label="สลับเต็มหน้าจอ"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-all cursor-pointer ml-1"
              title="ปิดหน้าต่าง (Esc)"
              aria-label="ปิดหน้าต่าง"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* ========================================================== */}
        {/* MAIN REAL WIKIPEDIA WEBVIEW IFRAME CONTAINER              */}
        {/* ========================================================== */}
        <div className="relative flex-1 w-full h-full bg-[#0d0e12] overflow-hidden flex flex-col">
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d0e12]/90 space-y-3 backdrop-blur-xs">
              <div className="w-10 h-10 border-3 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin"></div>
              <p className="text-xs text-[#d4af37] font-medium animate-pulse">
                กำลังเชื่อมต่อและโหลดหน้าเว็บวิกิพีเดียจริง...
              </p>
              <p className="text-[11px] text-gray-400 font-mono max-w-sm text-center px-4 truncate">
                {currentEmbedUrl}
              </p>
            </div>
          )}

          {/* Real Live Wikipedia Iframe Webview */}
          <iframe
            key={iframeKey}
            src={currentEmbedUrl}
            title={`Wikipedia - ${figure.nameTh}`}
            className="w-full h-full border-0 bg-white"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
            onLoad={() => setIsLoading(false)}
          />
        </div>

      </div>
    </div>
  );
};
