import React, { useRef, useState, useEffect, memo } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Bookmark } from 'lucide-react';
import { MediaItem } from '../types';

interface BookCategorySliderRowProps {
  categoryName: string;
  items: MediaItem[];
  favoriteItems: MediaItem[];
  onOpenBook: (item: MediaItem) => void;
  onToggleFavorite: (item: MediaItem) => void;
  onSelectCategory?: (category: string) => void;
}

export const BookCategorySliderRow: React.FC<BookCategorySliderRowProps> = memo(({
  categoryName,
  items,
  favoriteItems,
  onOpenBook,
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
    const scrollAmount = Math.max(container.clientWidth * 0.75, 280);
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white/[0.02] border border-[#d4af37]/20 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl hover:border-[#d4af37]/40 transition-all">
      {/* Category Header with Title & Sideways Slide Controls (matching image_5e55a7a2.png) */}
      <div className="flex items-center justify-between border-l-4 border-[#d4af37] pl-3.5 pr-1">
        <div 
          onClick={() => onSelectCategory && onSelectCategory(categoryName)}
          className="cursor-pointer group flex items-baseline gap-2"
          title="คลิกเพื่อกรองเฉพาะหมวดนี้"
        >
          <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-[#d4af37] group-hover:text-amber-600 dark:group-hover:text-white transition-colors font-cinzel">
            {categoryName}
          </h2>
          <span className="text-[11px] text-[#8b6508] dark:text-[#f4e4bc]/80 font-mono font-semibold">
            ({items.length} เล่ม)
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

      {/* Horizontal Sliding Row */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 pt-1 snap-x scroll-smooth no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item) => {
          const isFav = favoriteItems.some(f => f.url === item.url);
          const hasCover = !!item.thumbnail;

          return (
            <div
              key={item.id}
              onClick={() => onOpenBook(item)}
              className="w-44 sm:w-52 md:w-56 shrink-0 snap-start group flex flex-col justify-between rounded-2xl bg-[#18181f] border border-white/10 hover:border-[#d4af37] p-3 transition-all shadow-lg hover:shadow-2xl cursor-pointer"
            >
              <div className="space-y-3">
                {/* Book Cover (Portrait 3:4 aspect ratio with spine shadow) */}
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-900 border-l-4 border-l-[#d4af37]/70 border border-white/10 shadow-md group-hover:shadow-xl transition-all">
                  {hasCover ? (
                    <>
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      {/* Spine shadow overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20 pointer-events-none" />
                    </>
                  ) : (
                    <div className="w-full h-full p-3 bg-gradient-to-br from-[#1e1a14] via-[#14120f] to-[#0e0c0a] flex flex-col justify-between border border-[#d4af37]/30">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] uppercase tracking-wider text-[#d4af37] font-mono">
                          BOOK
                        </span>
                        <BookOpen className="w-4 h-4 text-[#d4af37]/60" />
                      </div>
                      <div className="space-y-1 text-center py-3">
                        <div className="w-7 h-7 mx-auto rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-[10px] font-bold text-white line-clamp-3 leading-tight mt-1">
                          {item.title}
                        </p>
                      </div>
                      <div className="text-[8px] text-[#d4af37]/80 text-center uppercase tracking-widest font-mono truncate">
                        {item.category}
                      </div>
                    </div>
                  )}

                  {/* Hover Reader Pill */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <span className="px-3 py-1.5 rounded-full bg-[#d4af37] text-black text-[11px] font-bold shadow-lg flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>เปิดอ่าน</span>
                    </span>
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
                </div>

                {/* Details */}
                <div className="space-y-1 px-0.5">
                  <span className="text-[10px] text-[#d4af37]/90 font-medium block truncate">
                    {item.category}
                  </span>
                  <h3 className="text-xs font-semibold text-white group-hover:text-[#d4af37] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                </div>
              </div>

              {/* Read Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenBook(item);
                }}
                className="w-full mt-3 py-1.5 px-2.5 rounded-xl bg-[#d4af37] hover:bg-[#e2bd48] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow active:scale-98 transition-all cursor-pointer"
                title="เปิดอ่านเอกสาร"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>เปิดอ่าน</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
});
