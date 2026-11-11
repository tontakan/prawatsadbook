import React, { useRef, useState, useEffect, memo } from 'react';
import { ChevronLeft, ChevronRight, Play, Bookmark, Film } from 'lucide-react';
import { MediaItem } from '../types';
import { extractYouTubeThumbnail } from '../data/defaultMedia';

interface VideoCategorySliderRowProps {
  categoryName: string;
  items: MediaItem[];
  allMedia: MediaItem[];
  favoriteItems: MediaItem[];
  onOpenVideo: (item: MediaItem, playlist: MediaItem[]) => void;
  onToggleFavorite: (item: MediaItem) => void;
  onSelectCategory?: (category: string) => void;
}

export const VideoCategorySliderRow: React.FC<VideoCategorySliderRowProps> = memo(({
  categoryName,
  items,
  allMedia,
  favoriteItems,
  onOpenVideo,
  onToggleFavorite,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [items]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    // Scroll by roughly 2-3 cards
    const scrollAmount = Math.max(container.clientWidth * 0.75, 300);
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white/[0.02] border border-[#d4af37]/20 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl hover:border-[#d4af37]/40 transition-all">
      {/* Category Header with Title & Sideways Slide Navigation Buttons */}
      <div className="flex items-center justify-between border-l-4 border-amber-400 pl-3.5 pr-1">
        <div 
          onClick={() => onSelectCategory && onSelectCategory(categoryName)}
          className="cursor-pointer group flex items-baseline gap-2.5"
          title="คลิกเพื่อกรองเฉพาะหมวดนี้"
        >
          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-[#f4e4bc] group-hover:text-amber-600 dark:group-hover:text-[#d4af37] transition-colors font-cinzel">
            {categoryName}
          </h2>
          <span className="text-[11px] text-[#8b6508] dark:text-[#d4af37]/90 font-mono font-semibold">
            ({items.length} วิดีโอ)
          </span>
        </div>

        {/* Slide Controls (สไลด์ข้าง ซ้าย-ขวา) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              canScrollLeft
                ? 'bg-black/60 text-[#d4af37] border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-black shadow-md'
                : 'bg-black/20 text-gray-600 border-white/5 opacity-40 cursor-not-allowed'
            }`}
            title="เลื่อนซ้าย"
            aria-label="สไลด์ไปทางซ้าย"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              canScrollRight
                ? 'bg-black/60 text-[#d4af37] border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-black shadow-md'
                : 'bg-black/20 text-gray-600 border-white/5 opacity-40 cursor-not-allowed'
            }`}
            title="เลื่อนขวา"
            aria-label="สไลด์ไปทางขวา"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Sliding Row (สไลด์ข้าง แยกหมวดแสดงวิดีโอ) */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 pt-1 snap-x scroll-smooth no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item) => {
          const isFav = favoriteItems.some(f => f.url === item.url);
          const ytThumb = extractYouTubeThumbnail(item.url);
          const thumb = item.thumbnail || ytThumb;

          return (
            <div
              key={item.id}
              onClick={() => onOpenVideo(item, allMedia)}
              className="w-64 sm:w-72 md:w-80 shrink-0 snap-start group flex flex-col justify-between rounded-2xl bg-[#18181f] border border-white/10 hover:border-[#d4af37] p-3 transition-all shadow-lg hover:shadow-2xl cursor-pointer"
            >
              <div className="space-y-3">
                {/* Video Thumbnail Box */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 group-hover:border-[#d4af37]/60 shadow transition-all">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#141416] text-[#d4af37]">
                      <Film className="w-8 h-8 opacity-60 mb-1" />
                      <span className="text-[10px] font-mono">{item.category}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                  {/* Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white">
                    <Play className="w-3 h-3 text-red-400 fill-red-400" />
                    <span>วิดีโอ</span>
                  </div>

                  {/* Bookmark Favorite button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-gray-300 hover:text-yellow-400 transition-all cursor-pointer z-10 shadow"
                    title={isFav ? 'นำออกจากรายการโปรด' : 'บันทึกเป็นรายการโปรด'}
                    aria-label="รายการโปรด"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </button>

                  {/* Hover Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <span className="p-3 rounded-full bg-[#d4af37] text-black shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Play className="w-5 h-5 fill-black translate-x-0.5" />
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1 px-1">
                  <span className="text-[10px] text-amber-400/90 font-medium block truncate">
                    {item.category}
                  </span>
                  <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#d4af37] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenVideo(item, allMedia);
                }}
                className="w-full mt-3 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                title="เล่นวิดีโอ"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>เล่นวิดีโอ</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});
