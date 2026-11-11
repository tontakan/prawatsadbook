import React, { useState, useEffect } from 'react';
import { 
  X, RefreshCw, Maximize2, Minimize2, 
  BookOpen, Star, ShieldAlert, Sparkles, ChevronLeft
} from 'lucide-react';
import { MediaItem } from '../types';

interface BookWebviewModalProps {
  book: MediaItem | null;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const BookWebviewModal: React.FC<BookWebviewModalProps> = ({
  book,
  onClose,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setIframeKey((prev) => prev + 1);
  }, [book?.url]);

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

  if (!book) return null;

  // Transform URL for optimal iframe embedding
  const getEmbeddableUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    const trimmed = rawUrl.trim();

    // Google Drive file view -> preview
    if (trimmed.includes('drive.google.com/file/d/')) {
      const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }

    // Google Docs / Sheets
    if (trimmed.includes('docs.google.com/spreadsheets/d/')) {
      return trimmed.replace(/\/edit.*$/, '/preview');
    }
    if (trimmed.includes('docs.google.com/document/d/')) {
      return trimmed.replace(/\/edit.*$/, '/preview');
    }

    return trimmed;
  };

  const embedUrl = getEmbeddableUrl(book.url);

  const handleReload = () => {
    setIsLoading(true);
    setHasError(false);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn ${
      isFullscreen ? 'p-0' : 'p-1 sm:p-4'
    }`}>
      <div 
        className={`bg-[#14151a] border border-[#d4af37]/30 flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen 
            ? 'w-full h-full rounded-none border-none' 
            : 'w-full max-w-6xl h-[95vh] sm:h-[90vh] rounded-2xl shadow-2xl'
        }`}
      >
        {/* Top Header Toolbar */}
        <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-gradient-to-r from-[#1b1a1f] via-[#16161b] to-[#121215] border-b border-[#d4af37]/25 flex items-center justify-between gap-3 shrink-0">
          
          {/* Left: Book Title and Category */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer shrink-0"
              title="ย้อนกลับ / ปิด"
              aria-label="ปิดการอ่าน"
            >
              <ChevronLeft className="w-5 h-5 text-[#d4af37]" />
            </button>

            <div className="w-8 h-8 rounded-lg bg-[#d4af37]/15 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shrink-0 hidden xs:flex">
              <BookOpen className="w-4 h-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-medium border border-[#d4af37]/30 shrink-0">
                  {book.category || 'หนังสือ'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono hidden md:inline truncate">
                  อ่านเอกสาร
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-bold text-white truncate mt-0.5 font-cinzel">
                {book.title}
              </h2>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
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

            {/* Reload Iframe */}
            <button
              onClick={handleReload}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all cursor-pointer"
              title="โหลดหน้าใหม่"
              aria-label="โหลดหน้าใหม่"
            >
              <RefreshCw className={`w-4 h-4 text-gray-300 ${isLoading ? 'animate-spin text-[#d4af37]' : ''}`} />
            </button>

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

        {/* Content Area */}
        <div className="relative flex-1 w-full h-full bg-[#0d0e12] overflow-hidden flex flex-col">
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0d0e12] space-y-3">
              <div className="w-10 h-10 border-3 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin"></div>
              <p className="text-xs text-[#d4af37] font-medium animate-pulse">
                กำลังโหลดเนื้อหา...
              </p>
              <p className="text-[10px] text-gray-400 font-mono max-w-sm text-center px-4 truncate">
                {book.title}
              </p>
            </div>
          )}

          {/* Iframe Webview */}
          <iframe
            key={iframeKey}
            src={embedUrl}
            title={book.title}
            className="w-full h-full border-0 bg-white"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        </div>
      </div>
    </div>
  );
};
