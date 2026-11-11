import React, { useState, useMemo, useRef } from 'react';
import { 
  Globe, Search, Play, BookOpen, Bookmark, Filter, Film, X,
  ChevronLeft, ChevronRight, SlidersHorizontal, LayoutGrid
} from 'lucide-react';
import { MediaItem } from '../types';
import { extractYouTubeThumbnail } from '../data/defaultMedia';

interface CountriesViewProps {
  mediaItems: MediaItem[];
  categoriesMap: Record<string, MediaItem[]>;
  onOpenItem: (item: MediaItem) => void;
  favoriteItems: MediaItem[];
  onToggleFavorite: (item: MediaItem) => void;
  isLoading?: boolean;
}

// Sub-component for individual category horizontal slider row
const CountryCategorySliderRow: React.FC<{
  catName: string;
  items: MediaItem[];
  renderCard: (item: MediaItem, inSlider?: boolean) => React.ReactNode;
  onSelectCategory?: (category: string) => void;
}> = ({ catName, items, renderCard, onSelectCategory }) => {
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

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const scrollAmount = Math.max(container.clientWidth * 0.75, 300);
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="bg-white/[0.02] border border-[#d4af37]/20 rounded-3xl p-4 sm:p-6 space-y-4 shadow-xl hover:border-[#d4af37]/40 transition-all">
      {/* Category Header */}
      <div className="flex items-center justify-between border-l-4 border-emerald-400 pl-3.5 pr-1">
        <div 
          onClick={() => onSelectCategory && onSelectCategory(catName)}
          className="cursor-pointer group flex items-baseline gap-2.5"
          title="คลิกเพื่อกรองเฉพาะหมวดนี้"
        >
          <h2 className="text-base sm:text-lg font-bold text-white group-hover:text-[#d4af37] transition-colors font-cinzel">
            {catName}
          </h2>
          <span className="text-[11px] text-emerald-400/80 font-mono">
            ({items.length} รายการ)
          </span>
        </div>

        {/* Slide Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              canScrollLeft
                ? 'bg-black/60 text-[#d4af37] border-[#d4af37]/40 hover:bg-[#d4af37] hover:text-black shadow-md'
                : 'bg-black/20 text-gray-600 border-white/5 opacity-40 cursor-not-allowed'
            }`}
            title="สไลด์ซ้าย"
            aria-label="สไลด์ซ้าย"
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
            title="สไลด์ขวา"
            aria-label="สไลด์ขวา"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Sliding Row */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 pt-1 snap-x scroll-smooth no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item) => renderCard(item, true))}
      </div>
    </div>
  );
};

export const CountriesView: React.FC<CountriesViewProps> = ({
  mediaItems,
  categoriesMap,
  onOpenItem,
  favoriteItems,
  onToggleFavorite,
  isLoading = false,
}) => {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layoutMode, setLayoutMode] = useState<'slider' | 'grid'>('slider');

  // Categories from sheet
  const categoriesList = useMemo(() => Object.keys(categoriesMap), [categoriesMap]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let list = mediaItems;
    if (selectedCat) {
      list = list.filter(item => item.category === selectedCat);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(item => 
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [mediaItems, selectedCat, searchQuery]);

  // Group by category if "ทั้งหมด" is active and not searching
  const groupedDisplay = useMemo(() => {
    if (selectedCat || searchQuery.trim()) return null;
    return categoriesMap;
  }, [categoriesMap, selectedCat, searchQuery]);

  // Helper to determine cover and type:
  // - ถ้าเป็นวิดีโอ (YouTube) ดึงปกจากลิงค์วิดีโอ
  // - ถ้าเป็น html หรือไฟล์ ดึงปกจากคอลัม (ลิงก์ปก)
  const getItemDetails = (item: MediaItem) => {
    const isYoutube = item.url.includes('youtube.com') || item.url.includes('youtu.be') || item.sourceType === 'youtube';
    const isVideo = isYoutube || item.url.endsWith('.mp4') || item.url.includes('.mp4');
    const isHtml = !isVideo && (item.url.endsWith('.html') || item.url.includes('.html') || item.url.includes('tontakan.github.io') || item.sourceType === 'web' || item.sourceType === 'drive');
    
    let coverUrl = item.thumbnail;
    if (isYoutube) {
      const ytThumb = extractYouTubeThumbnail(item.url);
      coverUrl = ytThumb || item.thumbnail;
    }
    // Prevent rendering HTML files in <img> tags
    if (coverUrl && (coverUrl.toLowerCase().includes('.html') || coverUrl.toLowerCase().includes('.htm'))) {
      coverUrl = undefined;
    }

    return { isYoutube, isVideo, isHtml, coverUrl };
  };

  const renderCard = (item: MediaItem, inSlider: boolean = false) => {
    const { isYoutube, isHtml, coverUrl } = getItemDetails(item);
    const isFav = favoriteItems.some(f => f.url === item.url);

    return (
      <div
        key={item.id}
        onClick={() => onOpenItem(item)}
        className={`group flex flex-col justify-between rounded-2xl bg-[#18181f] border border-white/10 hover:border-[#d4af37] p-3 sm:p-3.5 transition-all shadow-lg hover:shadow-2xl cursor-pointer ${
          inSlider ? 'w-64 sm:w-72 md:w-80 shrink-0 snap-start' : ''
        }`}
      >
        <div className="space-y-3">
          {/* Cover Container */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 group-hover:border-[#d4af37]/60 shadow transition-all">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1a1714] to-[#121110] text-[#d4af37]">
                {isYoutube ? <Film className="w-8 h-8 opacity-60 mb-1" /> : <BookOpen className="w-8 h-8 opacity-60 mb-1" />}
                <span className="text-[10px] uppercase font-mono opacity-80">{item.category}</span>
              </div>
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* Type Badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white shadow">
              {isYoutube ? (
                <>
                  <Play className="w-3 h-3 text-red-400 fill-red-400" />
                  <span>วิดีโอ</span>
                </>
              ) : isHtml ? (
                <>
                  <BookOpen className="w-3 h-3 text-[#d4af37]" />
                  <span>HTML</span>
                </>
              ) : (
                <>
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>เนื้อหา</span>
                </>
              )}
            </div>

            {/* Favorite Button */}
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

            {/* Center Play/Read Hover Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <span className="px-3 py-1.5 rounded-full bg-[#d4af37] text-black text-xs font-bold shadow-lg flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform">
                {isYoutube ? <Play className="w-3.5 h-3.5 fill-black" /> : <BookOpen className="w-3.5 h-3.5" />}
                <span>{isYoutube ? 'เปิดดูวิดีโอ' : 'เปิดอ่าน'}</span>
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1 px-1">
            <span className="text-[10px] text-[#d4af37] font-medium block truncate">
              {item.category}
            </span>
            <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#d4af37] transition-colors line-clamp-2 leading-snug">
              {item.title}
            </h3>
            {item.description && (
              <p className="text-[11px] text-gray-400 line-clamp-2 leading-normal">
                {item.description}
              </p>
            )}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenItem(item);
          }}
          className={`w-full mt-3 py-1.5 px-3 rounded-xl text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow hover:brightness-110 active:scale-98 transition-all cursor-pointer ${
            isYoutube 
              ? 'bg-gradient-to-r from-amber-500 to-amber-700' 
              : 'bg-gradient-to-r from-[#d4af37] to-[#aa8010]'
          }`}
        >
          {isYoutube ? (
            <>
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>เปิดดูวิดีโอ</span>
            </>
          ) : (
            <>
              <BookOpen className="w-3.5 h-3.5" />
              <span>เปิดอ่าน</span>
            </>
          )}
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header Card matching image_973aa178.png */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#14161f] border border-[#d4af37]/35 space-y-3.5 shadow-2xl">
        {/* Title & Icon Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-black/70 border border-emerald-400/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-md shadow-emerald-500/10">
            <Globe className="w-6 h-6" />
          </div>
          <h1 className="text-lg sm:text-2xl font-bold font-cinzel text-white tracking-wide">
            ประวัติศาสตร์ประเทศ
          </h1>
        </div>

        {/* Layout Switcher (สไลด์ข้าง / ตาราง) */}
        <div>
          <div className="inline-flex items-center p-1 rounded-2xl bg-black/80 border border-white/10 shadow-inner">
            <button
              onClick={() => setLayoutMode('slider')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                layoutMode === 'slider'
                  ? 'bg-[#d4af37] text-black font-bold shadow'
                  : 'text-gray-300 hover:text-white'
              }`}
              title="สไลด์ข้างตามหมวด"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>สไลด์ข้าง</span>
            </button>
            <button
              onClick={() => setLayoutMode('grid')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                layoutMode === 'grid'
                  ? 'bg-[#d4af37] text-black font-bold shadow'
                  : 'text-gray-300 hover:text-white'
              }`}
              title="ตาราง"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>ตาราง</span>
            </button>
          </div>
        </div>

        {/* Local Search Input & Item Count Pill */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-[#d4af37]/80 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาในหน้านี้..."
              className="w-full bg-black/80 border border-[#d4af37]/40 rounded-xl py-1.5 pl-8 pr-7 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#d4af37] transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                title="ล้างคำค้นหา"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <span className="px-3.5 py-1.5 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] font-bold text-xs font-mono shadow-sm flex items-center shrink-0">
            {filteredItems.length} รายการ
          </span>
        </div>
      </div>

      {/* Category Filter Pills from Sheet */}
      {categoriesList.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCat(null)}
            className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
              !selectedCat 
                ? 'bg-[#d4af37] text-black font-bold shadow-lg shadow-amber-500/20' 
                : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
            }`}
          >
            ทั้งหมด ({mediaItems.length})
          </button>
          {categoriesList.map((catName) => (
            <button
              key={catName}
              onClick={() => setSelectedCat(selectedCat === catName ? null : catName)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCat === catName 
                  ? 'bg-[#d4af37] text-black font-bold shadow-lg shadow-amber-500/20' 
                  : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
              }`}
            >
              {catName} ({categoriesMap[catName]?.length || 0})
            </button>
          ))}
        </div>
      )}

      {/* Content Display: Grouped (สไลด์ข้าง หรือ ตาราง) หรือ Filtered Grid */}
      {groupedDisplay ? (
        <div className="space-y-8">
          {Object.keys(groupedDisplay).map((catName) => {
            const items = groupedDisplay[catName];
            if (!items || items.length === 0) return null;

            if (layoutMode === 'slider') {
              return (
                <CountryCategorySliderRow
                  key={catName}
                  catName={catName}
                  items={items}
                  renderCard={renderCard}
                  onSelectCategory={(cat) => setSelectedCat(cat)}
                />
              );
            }

            return (
              <div
                key={catName}
                className="bg-white/[0.02] border border-[#d4af37]/20 rounded-3xl p-4 sm:p-6 space-y-5 shadow-xl hover:border-[#d4af37]/40 transition-all"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between border-l-4 border-emerald-400 pl-3.5">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white font-cinzel">
                      {catName}
                    </h2>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                      {items.length} รายการ
                    </p>
                  </div>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                  {items.map((item) => renderCard(item, false))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {filteredItems.map((item) => renderCard(item, false))}
        </div>
      )}

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-xs">
          {isLoading ? 'กำลังโหลดข้อมูล...' : 'ไม่พบรายการที่ตรงกับการค้นหา'}
        </div>
      )}
    </div>
  );
};
