import React, { useState } from 'react';
import { 
  Search, Users, Clock, BookMarked, Globe, History, 
  ArrowRight, BookOpen, Play, X, ExternalLink, Sparkles, Filter
} from 'lucide-react';
import { MediaItem, CountryData, BiographyFigure } from '../types';
import { HistoricalEra } from '../data/historicalErasData';

interface UnifiedSearchResultsOverlayProps {
  searchQuery: string;
  onClearSearch: () => void;
  // Results separated by topic headlines
  figures: BiographyFigure[];
  videos: MediaItem[];
  booksAndChronicles: (BiographyFigure | MediaItem)[];
  countries: CountryData[];
  eras: HistoricalEra[];
  // Action Handlers ("แบบเปิดข้อมูลอ่าน")
  onOpenFigure: (figure: BiographyFigure) => void;
  onOpenVideo: (video: MediaItem) => void;
  onOpenCountry: (country: CountryData) => void;
  onOpenEra: (era: HistoricalEra) => void;
}

export const UnifiedSearchResultsOverlay: React.FC<UnifiedSearchResultsOverlayProps> = ({
  searchQuery,
  onClearSearch,
  figures,
  videos,
  booksAndChronicles,
  countries,
  eras,
  onOpenFigure,
  onOpenVideo,
  onOpenCountry,
  onOpenEra,
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'figures' | 'videos' | 'chronicles' | 'countries' | 'eras'>('all');

  const totalResults = figures.length + videos.length + booksAndChronicles.length + countries.length + eras.length;

  if (!searchQuery.trim()) return null;

  return (
    <div className="fixed inset-0 top-[60px] z-50 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn p-3 sm:p-6 lg:p-8 custom-scroll">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Results Header Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1b1915] border border-[#d4af37]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-mono text-[#d4af37]">
                  ผลการค้นหา
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                คำค้น: <span className="text-[#d4af37]">"{searchQuery}"</span>
                <span className="text-xs text-gray-400 font-normal ml-2 font-mono">
                  (พบทั้งหมด {totalResults} รายการ)
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={onClearSearch}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>ปิดผลค้นหา</span>
            </button>
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveSection('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
              activeSection === 'all'
                ? 'bg-[#d4af37] text-black font-bold shadow'
                : 'bg-[#1e1e24] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            ทั้งหมด ({totalResults})
          </button>
          <button
            onClick={() => setActiveSection('figures')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'figures'
                ? 'bg-[#d4af37] text-black font-bold shadow'
                : 'bg-[#1e1e24] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>บุคคลสำคัญ ({figures.length})</span>
          </button>
          <button
            onClick={() => setActiveSection('videos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'videos'
                ? 'bg-[#d4af37] text-black font-bold shadow'
                : 'bg-[#1e1e24] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>วิดีโอ ({videos.length})</span>
          </button>
          <button
            onClick={() => setActiveSection('chronicles')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'chronicles'
                ? 'bg-[#d4af37] text-black font-bold shadow'
                : 'bg-[#1e1e24] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>พงศาวดาร & หนังสือ ({booksAndChronicles.length})</span>
          </button>
          <button
            onClick={() => setActiveSection('countries')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'countries'
                ? 'bg-[#d4af37] text-black font-bold shadow'
                : 'bg-[#1e1e24] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>ข้อมูลประเทศ ({countries.length})</span>
          </button>
          <button
            onClick={() => setActiveSection('eras')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'eras'
                ? 'bg-[#d4af37] text-black font-bold shadow'
                : 'bg-[#1e1e24] text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>เรื่องราวยุคสมัย ({eras.length})</span>
          </button>
        </div>

        {totalResults === 0 && (
          <div className="py-20 text-center bg-[#18181d] rounded-2xl border border-white/10 space-y-3">
            <Search className="w-10 h-10 mx-auto text-[#d4af37]/40" />
            <p className="text-base font-medium text-white">ไม่พบข้อมูลที่ตรงกับ "{searchQuery}"</p>
            <p className="text-xs text-gray-400">
              ลองพิมพ์คำค้นสั้นๆ เช่น "นเรศวร", "อยุธยา", "ไทย", "สงครามโลก", "ศิลาจารึก"
            </p>
          </div>
        )}

        {/* ============================================================== */}
        {/* หัวเรื่อง ๑: หมวดบุคคลสำคัญในประวัติศาสตร์                       */}
        {/* ============================================================== */}
        {(activeSection === 'all' || activeSection === 'figures') && figures.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#d4af37]" />
                <h3 className="text-sm font-bold text-[#d4af37] uppercase tracking-wider font-cinzel">
                  หมวด: บุคคลสำคัญในประวัติศาสตร์ (พบ {figures.length} ท่าน)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {figures.slice(0, 12).map((fig) => (
                <div
                  key={fig.id}
                  onClick={() => {
                    onOpenFigure(fig);
                    onClearSearch();
                  }}
                  className="group p-3 rounded-2xl bg-[#1a1a20] border border-white/10 hover:border-[#d4af37] transition-all cursor-pointer flex items-center justify-between gap-3 shadow hover:shadow-amber-500/10"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={fig.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&q=80'}
                      alt={fig.nameTh}
                      className="w-12 h-12 rounded-xl object-cover border border-[#d4af37]/30 group-hover:scale-105 transition-transform shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] text-[#d4af37] font-mono block truncate">
                        {fig.period}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-[#d4af37] transition-colors truncate">
                        {fig.nameTh}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate">{fig.role}</p>
                    </div>
                  </div>

                  <button
                    className="px-2.5 py-1 rounded-lg bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 text-[10px] font-bold group-hover:bg-[#d4af37] group-hover:text-black transition-all shrink-0 flex items-center gap-1"
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>เปิดอ่าน</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* หัวเรื่อง ๒: หมวดวิดีโอประวัติศาสตร์                             */}
        {/* ============================================================== */}
        {(activeSection === 'all' || activeSection === 'videos') && videos.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-cinzel">
                  หมวด: วิดีโอและสารคดีประวัติศาสตร์ (พบ {videos.length} รายการ)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {videos.slice(0, 8).map((vid) => {
                const getYTId = (url: string) => {
                  const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
                  return m && m[2].length === 11 ? m[2] : null;
                };
                const ytId = getYTId(vid.url);
                const thumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : (vid.thumbnail || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80');

                return (
                  <div
                    key={vid.id}
                    onClick={() => {
                      onOpenVideo(vid);
                      onClearSearch();
                    }}
                    className="group rounded-2xl bg-[#1a1a20] border border-white/10 hover:border-[#d4af37] overflow-hidden cursor-pointer shadow transition-all flex flex-col justify-between"
                  >
                    <div className="aspect-video relative bg-black">
                      <img src={thumb} alt={vid.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10">
                        <Play className="w-7 h-7 text-white drop-shadow group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div className="p-3">
                      <span className="text-[10px] text-amber-400 block truncate font-medium">{vid.category}</span>
                      <h4 className="text-xs font-semibold text-white group-hover:text-[#d4af37] line-clamp-2 mt-0.5">{vid.title}</h4>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* หัวเรื่อง ๓: หมวดพระราชพงศาวดารและหนังสือ                     */}
        {/* ============================================================== */}
        {(activeSection === 'all' || activeSection === 'chronicles') && booksAndChronicles.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider font-cinzel">
                  หมวด: พระราชพงศาวดาร ๑๐๐ เรื่องราว & หนังสือเอกสาร (พบ {booksAndChronicles.length} เรื่อง)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {booksAndChronicles.slice(0, 9).map((doc, idx) => {
                const isFig = 'pages' in doc;
                const title = isFig ? (doc as BiographyFigure).nameTh : (doc as MediaItem).title;
                const sub = isFig ? (doc as BiographyFigure).period : (doc as MediaItem).category;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isFig) onOpenFigure(doc as BiographyFigure);
                      else onOpenVideo(doc as MediaItem);
                      onClearSearch();
                    }}
                    className="group p-3 rounded-2xl bg-[#171a22] border border-white/10 hover:border-sky-400/60 transition-all cursor-pointer flex items-center justify-between gap-3 shadow"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] text-sky-400 font-mono block truncate">{sub}</span>
                        <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors truncate">
                          {title}
                        </h4>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 rounded-lg bg-sky-400/15 text-sky-300 border border-sky-400/30 text-[10px] font-bold group-hover:bg-sky-400 group-hover:text-black transition-all shrink-0 flex items-center gap-1">
                      <span>เปิดอ่าน</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* หัวเรื่อง ๔: หมวดข้อมูลประเทศและประวัติศาสตร์                   */}
        {/* ============================================================== */}
        {(activeSection === 'all' || activeSection === 'countries') && countries.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider font-cinzel">
                  หมวด: ข้อมูลประเทศและประวัติศาสตร์ชาติ (พบ {countries.length} ประเทศ)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {countries.slice(0, 9).map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onOpenCountry(c);
                    onClearSearch();
                  }}
                  className="group p-3 rounded-2xl bg-[#161f1a] border border-white/10 hover:border-emerald-400/60 transition-all cursor-pointer flex items-center justify-between gap-3 shadow"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={c.flagUrl || `https://flagcdn.com/w160/${c.code}.png`}
                      alt={c.nameTh}
                      className="w-10 h-7 rounded object-cover shadow shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {c.nameTh} ({c.nameEn})
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate">{c.continent} • {c.era}</p>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold group-hover:bg-emerald-400 group-hover:text-black transition-all shrink-0 flex items-center gap-1">
                    <span>เปิดอ่าน</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* หัวเรื่อง ๕: หมวดเรื่องราวยุคสมัยประวัติศาสตร์                    */}
        {/* ============================================================== */}
        {(activeSection === 'all' || activeSection === 'eras') && eras.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#d4af37]/30 pb-2">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider font-cinzel">
                  หมวด: เรื่องราวยุคสมัยประวัติศาสตร์ (พบ {eras.length} ยุค)
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {eras.slice(0, 6).map((era) => (
                <div
                  key={era.id}
                  onClick={() => {
                    onOpenEra(era);
                    onClearSearch();
                  }}
                  className="group p-3 rounded-2xl bg-[#1e1724] border border-white/10 hover:border-purple-400/60 transition-all cursor-pointer flex items-center justify-between gap-3 shadow"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={era.coverImage}
                      alt={era.nameTh}
                      className="w-14 h-12 rounded-xl object-cover border border-purple-400/30 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] text-purple-300 font-mono block truncate">
                        {era.periodTh}
                      </span>
                      <h4 className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                        {era.nameTh}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate italic">"{era.tagline}"</p>
                    </div>
                  </div>
                  <button className="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-bold group-hover:bg-purple-400 group-hover:text-black transition-all shrink-0 flex items-center gap-1">
                    <span>เปิดอ่าน</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
