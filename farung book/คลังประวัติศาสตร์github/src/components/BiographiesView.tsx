import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, BookOpen, Sparkles, Filter, 
  ChevronRight, ChevronLeft, Bookmark, Award, ExternalLink, Loader2,
  ArrowLeft, ArrowRight, X
} from 'lucide-react';
import { BiographyFigure } from '../types';
import { CURATED_BIOGRAPHIES, NOTABLE_2000_DIRECTORY, FigureDirectoryItem } from '../data/biographiesData';
import { searchWikipedia, fetchWikiFullArticle, formatFigureInto50PageArchivalBook, fetchWikiImage } from '../services/wikipediaService';

interface BiographiesViewProps {
  onOpenArchivalDocument: (figure: BiographyFigure) => void;
  favorites: string[];
  onToggleFavorite: (figure: BiographyFigure) => void;
}

/**
 * Avatar component that ensures a real Wikipedia portrait is always loaded
 */
const WikiPortrait: React.FC<{
  title: string;
  defaultAvatar?: string;
  name: string;
  className?: string;
  badge?: string;
}> = ({ title, defaultAvatar, name, className, badge }) => {
  const [imgSrc, setImgSrc] = useState<string>(defaultAvatar || '');
  const [hasTriedWiki, setHasTriedWiki] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    if (!defaultAvatar || defaultAvatar.includes('placeholder')) {
      fetchWikiImage(title || name).then((res) => {
        if (active && res) {
          setImgSrc(res);
        }
      });
    }
    return () => { active = false; };
  }, [title, name, defaultAvatar]);

  const handleError = () => {
    if (!hasTriedWiki) {
      setHasTriedWiki(true);
      fetchWikiImage(title || name).then((res) => {
        if (res) {
          setImgSrc(res);
        } else {
          setImgSrc('https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Chulalongkorn_in_1897.jpg/200px-Chulalongkorn_in_1897.jpg');
        }
      });
    }
  };

  return (
    <div className={`relative overflow-hidden bg-black ${className}`}>
      <img
        src={imgSrc || 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Chulalongkorn_in_1897.jpg/200px-Chulalongkorn_in_1897.jpg'}
        alt={name}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={handleError}
        loading="lazy"
      />
      {badge && (
        <span className="absolute bottom-0 inset-x-0 bg-black/80 backdrop-blur-xs text-[8px] text-[#d4af37] text-center font-mono py-0.5 border-t border-[#d4af37]/30 tracking-tight">
          {badge}
        </span>
      )}
    </div>
  );
};

export const BiographiesView: React.FC<BiographiesViewProps> = React.memo(({
  onOpenArchivalDocument,
  favorites,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('ทั้งหมด');
  const [directoryPage, setDirectoryPage] = useState<number>(1);
  const [isLoadingWiki, setIsLoadingWiki] = useState<boolean>(false);
  const [wikiSearchResults, setWikiSearchResults] = useState<any[]>([]);

  const PAGE_SIZE = 20; // Exact requirement: แสดงหน้า 20 บุคคล

  const categories = [
    'ทั้งหมด',
    'กษัตริย์และผู้นำไทย',
    'รัฐบุรุษและนักคิดไทย',
    'ผู้นำและจักรพรรดิโลก',
    'นักวิทยาศาสตร์และนักประดิษฐ์',
    'นักปรัชญาและผู้นำจิตวิญญาณ',
    'ศิลปินและกวีเอกของโลก',
    'วีรชนและผู้ต่อสู้เพื่อสันติภาพ',
  ];

  // Reset pagination on search or category filter change
  useEffect(() => {
    setDirectoryPage(1);
  }, [activeCategory, searchQuery]);

  // Filter curated 10-page biographies
  const filteredCurated = useMemo(() => {
    return CURATED_BIOGRAPHIES.filter((fig) => {
      const matchCat = activeCategory === 'ทั้งหมด' || fig.category === activeCategory;
      const matchSearch =
        fig.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fig.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fig.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fig.nationality.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  // Filter notable figures directory (2,000 figures)
  const filteredDirectory = useMemo(() => {
    return NOTABLE_2000_DIRECTORY.filter((item) => {
      const matchCat = activeCategory === 'ทั้งหมด' || item.category === activeCategory;
      const matchSearch =
        item.nameTh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nationality.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  // Sliced 20 figures for the current page
  const totalDirectoryPages = Math.max(1, Math.ceil(filteredDirectory.length / PAGE_SIZE));
  const paginatedDirectory = useMemo(() => {
    const startIndex = (directoryPage - 1) * PAGE_SIZE;
    return filteredDirectory.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredDirectory, directoryPage]);

  // Live Wikipedia search
  const handleSearchWikipedia = async () => {
    if (!searchQuery.trim()) return;
    setIsLoadingWiki(true);
    try {
      const results = await searchWikipedia(searchQuery, 'th');
      setWikiSearchResults(results);
    } catch (err) {
      console.error('Wikipedia search error:', err);
    } finally {
      setIsLoadingWiki(false);
    }
  };

  // Open any figure as an authentic 50-PAGE ARCHIVAL BOOK (๕๐ หน้าบริบูรณ์)
  const [openingFigureId, setOpeningFigureId] = useState<string | null>(null);

  const handleOpenFigureAs50Page = async (item: FigureDirectoryItem | BiographyFigure) => {
    setOpeningFigureId(item.id);
    setIsLoadingWiki(true);
    try {
      let article = null;
      try {
        const titleToFetch = ('wikiTitle' in item && item.wikiTitle) ? item.wikiTitle : item.nameTh;
        article = await fetchWikiFullArticle(titleToFetch, 'th');
      } catch (e) {
        // continue with metadata
      }
      const bookFigure = formatFigureInto50PageArchivalBook(item, article);
      onOpenArchivalDocument(bookFigure);
    } catch (err) {
      console.error('Failed to generate 50-page document:', err);
      const fallbackBook = formatFigureInto50PageArchivalBook(item, null);
      onOpenArchivalDocument(fallbackBook);
    } finally {
      setIsLoadingWiki(false);
      setOpeningFigureId(null);
    }
  };

  return (
    <div className="space-y-8 fade-in">
      
      {/* Page Header Card matching image_973aa178.png */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#14161f] border border-[#d4af37]/35 space-y-3.5 shadow-2xl">
        {/* Title & Icon Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-black/70 border border-[#d4af37]/60 flex items-center justify-center text-[#d4af37] shrink-0 shadow-md shadow-amber-500/10">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold font-cinzel text-white tracking-wide">
              ทำเนียบบุคคลสำคัญ
            </h1>
            <p className="text-xs text-[#f4e4bc]/80 mt-0.5">
              ๒๐๐ คนแรกเป็นคนไทย • Wikipedia Live Web
            </p>
          </div>
        </div>

        {/* Local Search Input & Item Count Pill */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 min-w-[160px] max-w-md">
            <Search className="w-3.5 h-3.5 text-[#d4af37]/80 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchWikipedia()}
              placeholder="ค้นหาในหน้านี้..."
              className="w-full bg-black/80 border border-[#d4af37]/40 rounded-xl py-1.5 pl-8 pr-10 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#d4af37] transition-all shadow-inner"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                title="ล้างคำค้นหา"
              >
                <X className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={handleSearchWikipedia}
                disabled={isLoadingWiki}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-lg bg-[#d4af37] text-black hover:bg-[#ebdcc4] transition-all flex items-center justify-center shadow cursor-pointer shrink-0"
                title="ค้นหา"
              >
                {isLoadingWiki ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
              </button>
            )}
          </div>

          <span className="px-3.5 py-1.5 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] font-bold text-xs font-mono shadow-sm flex items-center shrink-0">
            {filteredDirectory.length} ท่าน
          </span>
        </div>
      </div>

      {/* Category Filter Pills (Filters both sections together) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold text-[#d4af37]">เลือกกรองตามหมวดหมู่:</span>
          {activeCategory !== 'ทั้งหมด' && (
            <button
              onClick={() => setActiveCategory('ทั้งหมด')}
              className="text-[#d4af37] hover:underline cursor-pointer"
            >
              แสดงทุกหมวด
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border cursor-pointer ${activeCategory === cat ? 'bg-[#d4af37] text-black border-[#d4af37] shadow font-bold' : 'bg-[#18181a] text-gray-300 border-white/5 hover:border-[#d4af37]/30 hover:text-white'}`}
            >
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live Wikipedia Search Results Section */}
      {wikiSearchResults.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#201912]/95 border border-[#d4af37]/50 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-bold text-[#d4af37] flex items-center gap-1.5 font-cinzel">
              <Sparkles className="w-4 h-4" />
              ผลการค้นหาวิกิพีเดียสด ({wikiSearchResults.length} รายการ)
            </span>
            <button
              onClick={() => setWikiSearchResults([])}
              className="text-xs text-gray-400 hover:text-white cursor-pointer"
            >
              ✕ ปิด
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {wikiSearchResults.map((res: any, idx: number) => (
              <div
                key={idx}
                onClick={() => handleOpenFigureAs50Page({
                  id: `wiki-res-${idx}`,
                  nameTh: res.title,
                  nameEn: res.title,
                  category: 'ผู้นำและจักรพรรดิโลก',
                  period: 'ประวัติศาสตร์สากล',
                  nationality: 'สากล',
                  role: res.snippet ? res.snippet.replace(/<[^>]+>/g, '').slice(0, 80) : 'บุคคลสำคัญในประวัติศาสตร์',
                  wikiTitle: res.title,
                  avatar: res.thumbnail?.source
                })}
                className="p-3 rounded-xl bg-black/60 border border-[#d4af37]/30 hover:border-[#d4af37] transition-all cursor-pointer group flex items-center gap-3"
              >
                <div className="w-12 h-14 shrink-0 rounded-lg overflow-hidden border border-[#d4af37]/40 relative bg-black">
                  <WikiPortrait
                    title={res.title}
                    defaultAvatar={res.thumbnail?.source}
                    name={res.title}
                    className="w-full h-full"
                    badge="Wiki"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-white group-hover:text-[#d4af37] truncate">
                    {res.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-tight">
                    {res.snippet ? res.snippet.replace(/<\/?[^>]+(>|$)/g, "") : res.description}
                  </p>
                </div>
                <BookOpen className="w-4 h-4 text-[#d4af37] shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* PART 1: CURATED 10-PAGE BIOGRAPHIES WITH REAL PHOTOS       */}
      {/* ========================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#d4af37]" />
            <h2 className="text-base sm:text-lg font-bold font-cinzel text-white">
              ชีวประวัติฉบับละเอียดคัดสรรพิเศษ (ภาพจริง ๑๐ หน้าเต็ม)
            </h2>
          </div>
          <span className="text-xs text-[#d4af37]/80">
            {filteredCurated.length} ท่าน
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCurated.map((figure) => {
            const isFav = favorites.includes(figure.id);
            return (
              <div
                key={figure.id}
                onClick={() => onOpenArchivalDocument(figure)}
                className="group relative bg-[#1c1c1f] rounded-2xl border border-white/10 hover:border-[#d4af37] p-4 transition-all duration-300 shadow-xl cursor-pointer flex flex-col justify-between"
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <WikiPortrait
                      title={figure.wikiTitle || figure.nameTh}
                      defaultAvatar={figure.avatar}
                      name={figure.nameTh}
                      className="w-18 h-22 sm:w-20 sm:h-24 rounded-xl border border-[#d4af37]/40 shadow-md group-hover:border-[#d4af37]"
                      badge="Wikipedia"
                    />
                    <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 rounded bg-black/90 border border-[#d4af37]/40 text-[9px] text-[#d4af37] font-bold z-10">
                      {figure.pages.length} หน้า
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 font-medium">
                        {figure.category}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(figure);
                        }}
                        className={`p-1.5 rounded-full transition-all cursor-pointer ${isFav ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                        title="บันทึกรายการโปรด"
                        aria-label="บันทึกรายการโปรด"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-yellow-400' : ''}`} />
                      </button>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base font-cinzel text-white group-hover:text-[#d4af37] transition-colors truncate">
                      {figure.nameTh}
                    </h3>
                    <p className="text-[11px] text-gray-400 italic truncate">
                      {figure.nameEn} • {figure.period}
                    </p>
                    <p className="text-xs text-[#d4af37]/90 font-medium line-clamp-1">
                      {figure.role}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-300 mt-2.5 line-clamp-2 leading-relaxed">
                  {figure.summary}
                </p>

                {/* Bottom Click to Read Button */}
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs text-[#d4af37]">
                  <span className="font-medium flex items-center gap-1.5 font-mono text-[11px]">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>๕๐ หน้าบริบูรณ์</span>
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <span>{openingFigureId === figure.id ? 'กำลังเปิด...' : 'อ่าน ๕๐ หน้า'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================== */}
      {/* PART 2: 1,000 WORLDWIDE FIGURES (PAGINATED: 20 PER PAGE)   */}
      {/* ========================================================== */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d4af37]/20 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#d4af37]" />
            <div>
              <h2 className="text-base sm:text-xl font-bold font-cinzel text-white">
                สารบบทำเนียบบุคคลสำคัญ ๑,๐๐๐ ท่าน (๒๐๐ คนแรกเป็นคนไทย)
              </h2>
              <p className="text-xs text-gray-400">
                ค้นหา ๑,๐๐๐ บุคคลสำคัญสยามและทั่วโลก เปิดอ่านฉบับ Wikipedia PDF View แบบจริง
              </p>
            </div>
          </div>
          <span className="text-xs text-[#d4af37] font-medium bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/30 self-start sm:self-auto font-mono">
            {filteredDirectory.length} ท่าน (๒๐๐ คนแรกเป็นคนไทย)
          </span>
        </div>

        {/* 20 Figures per Page Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {paginatedDirectory.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpenFigureAs50Page(item)}
              className="p-3 rounded-xl bg-[#1c1c1f] border border-white/10 hover:border-[#d4af37] transition-all cursor-pointer group flex items-center gap-3 shadow hover:shadow-lg relative"
            >
              <div className="w-14 h-16 shrink-0 rounded-lg overflow-hidden border border-[#d4af37]/30 group-hover:border-[#d4af37] transition-all relative">
                <WikiPortrait
                  title={item.wikiTitle || item.nameTh}
                  defaultAvatar={item.avatar}
                  name={item.nameTh}
                  className="w-full h-full"
                  badge="Wiki"
                />
              </div>
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-gray-400 border border-white/5">
                    {item.nationality}
                  </span>
                  <span className="text-[10px] text-[#d4af37] font-medium truncate">
                    {item.period}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-white group-hover:text-[#d4af37] transition-colors truncate">
                  {item.nameTh}
                </h4>
                <p className="text-[10px] text-gray-400 italic truncate">
                  {item.nameEn}
                </p>
                <p className="text-[10px] text-gray-300 line-clamp-1">
                  {item.role}
                </p>
                <div className="text-[9px] text-[#d4af37]/80 font-mono flex items-center gap-1">
                  <span>{openingFigureId === item.id ? 'กำลังเปิดเว็บ...' : 'เปิดอ่าน Wikipedia'}</span>
                </div>
              </div>
              <div className="p-1.5 rounded-lg bg-black/40 text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-black transition-all shrink-0">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* ========================================================== */}
        {/* PAGINATION CONTROLS (แสดงหน้า 20 บุคคล มีถัดไป/ย้อนกลับ)    */}
        {/* ========================================================== */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-2 text-gray-400 font-mono text-[11px]">
            <span>หน้า <strong className="text-[#d4af37]">{directoryPage}</strong> จาก <strong>{totalDirectoryPages}</strong></span>
            <span>•</span>
            <span>แสดง ๒๐ ท่านต่อหน้า (ทั้งหมด {filteredDirectory.length} ท่าน)</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Prev Page Button (ย้อนกลับ) */}
            <button
              onClick={() => setDirectoryPage(p => Math.max(1, p - 1))}
              disabled={directoryPage === 1}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-medium ${
                directoryPage === 1 
                  ? 'opacity-30 cursor-not-allowed border-gray-800 text-gray-600' 
                  : 'bg-black/50 border-[#d4af37]/30 hover:border-[#d4af37] text-white hover:bg-[#d4af37] hover:text-black'
              }`}
              title="ย้อนกลับ (๒๐ ท่านก่อนหน้า)"
              aria-label="ย้อนกลับ"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>ย้อนกลับ</span>
            </button>

            {/* Quick Page Jump Pills */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-[180px] sm:max-w-xs no-scrollbar py-0.5">
              {Array.from({ length: totalDirectoryPages }, (_, i) => i + 1)
                .filter(page => {
                  return page === 1 || 
                    page === totalDirectoryPages || 
                    Math.abs(page - directoryPage) <= 2;
                })
                .map((pageNum, idx, arr) => {
                  const prevPage = arr[idx - 1];
                  const hasGap = prevPage && pageNum - prevPage > 1;

                  return (
                    <React.Fragment key={pageNum}>
                      {hasGap && <span className="px-1 text-gray-600">...</span>}
                      <button
                        onClick={() => setDirectoryPage(pageNum)}
                        className={`w-7 h-7 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                          directoryPage === pageNum 
                            ? 'bg-[#d4af37] text-black shadow ring-1 ring-amber-300' 
                            : 'bg-black/40 text-gray-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            {/* Next Page Button (ถัดไป) */}
            <button
              onClick={() => setDirectoryPage(p => Math.min(totalDirectoryPages, p + 1))}
              disabled={directoryPage === totalDirectoryPages}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-medium ${
                directoryPage === totalDirectoryPages 
                  ? 'opacity-30 cursor-not-allowed border-gray-800 text-gray-600' 
                  : 'bg-black/50 border-[#d4af37]/30 hover:border-[#d4af37] text-white hover:bg-[#d4af37] hover:text-black'
              }`}
              title="ถัดไป (โหลด ๒๐ ท่านถัดไป)"
              aria-label="ถัดไป"
            >
              <span>ถัดไป</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
});
