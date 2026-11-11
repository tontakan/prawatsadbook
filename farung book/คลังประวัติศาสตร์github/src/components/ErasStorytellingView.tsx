import React, { useState, useMemo } from 'react';
import { 
  History, Search, BookOpen, Calendar, Award, Sparkles, 
  Bookmark, ChevronRight, Filter, Globe, Scroll, ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { HISTORICAL_ERAS, HistoricalEra } from '../data/historicalErasData';
import { EraReaderModal } from './EraReaderModal';

interface ErasStorytellingViewProps {
  onOpenFigureByName?: (figureName: string) => void;
  favorites: string[];
  onToggleFavorite: (era: HistoricalEra) => void;
}

export const ErasStorytellingView: React.FC<ErasStorytellingViewProps> = ({
  onOpenFigureByName,
  favorites,
  onToggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'ทั้งหมด' | 'ยุคก่อนประวัติศาสตร์' | 'ไทย' | 'สากล'>('ทั้งหมด');
  const [readingEra, setReadingEra] = useState<HistoricalEra | null>(null);

  // Filter eras based on search & category
  const filteredEras = useMemo(() => {
    return HISTORICAL_ERAS.filter((era) => {
      let matchCat = true;
      if (categoryFilter === 'ยุคก่อนประวัติศาสตร์') {
        matchCat = era.nameTh.includes('ยุคหิน') || 
                   era.nameTh.includes('ก่อนประวัติศาสตร์') || 
                   era.century.includes('ก่อนประวัติศาสตร์') || 
                   era.nameTh.includes('สำริด') || 
                   era.id.includes('paleolithic') || 
                   era.id.includes('mesolithic') || 
                   era.id.includes('neolithic');
      } else if (categoryFilter === 'ไทย') {
        matchCat = era.category === 'ไทย';
      } else if (categoryFilter === 'สากล') {
        matchCat = era.category === 'สากล';
      }

      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        era.nameTh.toLowerCase().includes(q) ||
        era.nameEn.toLowerCase().includes(q) ||
        era.periodTh.toLowerCase().includes(q) ||
        era.tagline.toLowerCase().includes(q) ||
        era.overviewStory.toLowerCase().includes(q) ||
        era.prominentFigures.some(f => f.name.toLowerCase().includes(q)) ||
        era.turningPoints.some(t => t.title.toLowerCase().includes(q));

      return matchCat && matchSearch;
    });
  }, [searchQuery, categoryFilter]);

  return (
    <div className="space-y-8 fade-in">
      {/* Hero Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1e1b15] via-[#2a241b] to-[#12110e] border border-[#d4af37]/40 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 text-xs text-[#d4af37] font-semibold">
              <History className="w-3.5 h-3.5" />
              <span>ลำดับเรื่องราวยุคสมัยประวัติศาสตร์ (Storytelling Timeline)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-cinzel gold-gradient tracking-wide">
              เรื่องราวยุคสมัยแห่งมนุษยชาติ
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              ท่องกาลเวลาผ่านบันทึกเรื่องราวประวัติศาสตร์สยามและสากล สัมผัสปฐมรากฐาน ยุคทอง 
              การศึกยุทธหัตถี การปฏิรูป และจุดเปลี่ยนสำคัญของอารยธรรมโลก พร้อมระบบเปิดอ่านข้อมูลเชิงลึก
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-black/50 border border-[#d4af37]/30 text-center min-w-[120px]">
              <span className="text-2xl font-black text-[#d4af37] font-cinzel block">
                {HISTORICAL_ERAS.length}
              </span>
              <span className="text-[11px] text-gray-400">ยุคสมัยเรื่องราว</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Search input with compact design */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#d4af37]/70 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาเรื่องราวยุคสมัย (เช่น สุโขทัย, อยุธยา, สงครามโลก, โรมัน)..."
              className="w-full bg-black/60 border border-[#d4af37]/30 rounded-full py-2 pl-10 pr-9 text-xs text-[#f4e4bc] focus:outline-none focus:border-[#d4af37] transition-all placeholder:text-gray-500 shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/10 self-start sm:self-auto overflow-x-auto no-scrollbar">
            {(['ทั้งหมด', 'ยุคก่อนประวัติศาสตร์', 'ไทย', 'สากล'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-[#d4af37] text-black font-bold shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat === 'ทั้งหมด' 
                  ? 'ทุกยุคสมัย' 
                  : cat === 'ยุคก่อนประวัติศาสตร์'
                  ? 'ยุคหิน & ก่อนประวัติศาสตร์'
                  : cat === 'ไทย' 
                  ? 'ประวัติศาสตร์สยาม' 
                  : 'ประวัติศาสตร์สากล'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Eras Story Cards Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span>แสดง {filteredEras.length} ยุคสมัย</span>
          <span className="text-[#d4af37] font-mono">เรียงลำดับตามเส้นเวลาศักราช</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEras.map((era, index) => {
            const isFav = favorites.includes(era.id);

            return (
              <div
                key={era.id}
                className="group rounded-3xl bg-[#18181d] border border-white/10 hover:border-[#d4af37]/50 transition-all duration-300 overflow-hidden shadow-xl flex flex-col justify-between"
              >
                {/* Image Banner & Overlay */}
                <div className="relative aspect-[16/9] bg-black overflow-hidden">
                  <img
                    src={era.coverImage}
                    alt={era.nameTh}
                    className="w-full h-full object-cover opacity-75 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#18181d] via-transparent to-black/50" />

                  {/* Badges on Top */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[#d4af37] border border-[#d4af37]/40 font-mono font-bold">
                        {era.category === 'ไทย' ? 'สยามประเทศ' : 'อารยธรรมสากล'}
                      </span>
                      <span className="text-[10px] px-2 py-1 rounded-full bg-black/60 text-gray-300 border border-white/10 font-mono hidden xs:inline">
                        {era.century}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleFavorite(era)}
                      className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-yellow-400 transition-colors border border-white/10 cursor-pointer"
                      title={isFav ? 'นำออกจากรายการโปรด' : 'บันทึกเรื่องราวยุคนี้'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </button>
                  </div>

                  {/* Era Title & Period on bottom of image */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[11px] text-[#d4af37] font-mono block font-semibold">
                      {era.periodTh}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold font-cinzel text-white group-hover:text-[#d4af37] transition-colors leading-tight drop-shadow">
                      {era.nameTh}
                    </h2>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <p className="text-xs text-amber-200/90 font-medium italic border-l-2 border-[#d4af37] pl-3 py-0.5">
                      "{era.tagline}"
                    </p>

                    <p className="text-xs text-gray-300 leading-relaxed line-clamp-3 text-justify">
                      {era.overviewStory}
                    </p>

                    {/* Key Highlights Chips */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {era.turningPoints.slice(0, 2).map((tp, pIdx) => (
                        <span 
                          key={pIdx}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-white/[0.04] text-gray-300 border border-white/5 flex items-center gap-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                          <span className="font-semibold text-white">{tp.year}:</span>
                          <span className="truncate max-w-[160px]">{tp.title}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Primary Action Button: "เปิดข้อมูลอ่าน" */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                    <div className="text-[11px] text-gray-400">
                      <span>{era.chapters.length} บทบันทึก • {era.prominentFigures.length} บุคคล</span>
                    </div>

                    <button
                      onClick={() => setReadingEra(era)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ebdcc4] text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                      title={`เปิดอ่านเรื่องราว ${era.nameTh}`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>เปิดข้อมูลอ่าน</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEras.length === 0 && (
          <div className="py-16 text-center bg-white/[0.02] rounded-3xl border border-white/5 space-y-3">
            <History className="w-10 h-10 mx-auto text-[#d4af37]/40" />
            <p className="text-sm font-medium text-gray-300">ไม่พบเรื่องราวยุคสมัยที่ตรงกับ "{searchQuery}"</p>
            <p className="text-xs text-gray-500">ลองค้นหาด้วยคำอื่น เช่น สุโขทัย, อยุธยา, ธนบุรี, รัตนโกสินทร์ หรือ กรีก</p>
          </div>
        )}
      </div>

      {/* Reader Modal */}
      {readingEra && (
        <EraReaderModal
          era={readingEra}
          onClose={() => setReadingEra(null)}
          isFavorite={favorites.includes(readingEra.id)}
          onToggleFavorite={onToggleFavorite}
          onOpenFigureByName={onOpenFigureByName}
        />
      )}
    </div>
  );
};
