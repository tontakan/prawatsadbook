import React, { useState } from 'react';
import { 
  Star, Bookmark, X, BookOpen, Play, Globe, History, 
  Trash2, ExternalLink, ArrowRight
} from 'lucide-react';
import { MediaItem, CountryData, BiographyFigure } from '../types';
import { HistoricalEra } from '../data/historicalErasData';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Favorites lists
  favoriteFigures: BiographyFigure[];
  favoriteVideos: MediaItem[];
  favoriteCountries: CountryData[];
  favoriteEras: HistoricalEra[];
  // Removers
  onRemoveFigure: (fig: BiographyFigure) => void;
  onRemoveVideo: (vid: MediaItem) => void;
  onRemoveCountry: (country: CountryData) => void;
  onRemoveEra: (era: HistoricalEra) => void;
  // Openers ("แบบเปิดข้อมูลอ่าน")
  onOpenFigure: (fig: BiographyFigure) => void;
  onOpenVideo: (vid: MediaItem) => void;
  onOpenCountry: (country: CountryData) => void;
  onOpenEra: (era: HistoricalEra) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  favoriteFigures,
  favoriteVideos,
  favoriteCountries,
  favoriteEras,
  onRemoveFigure,
  onRemoveVideo,
  onRemoveCountry,
  onRemoveEra,
  onOpenFigure,
  onOpenVideo,
  onOpenCountry,
  onOpenEra,
}) => {
  const [tab, setTab] = useState<'all' | 'figures' | 'videos' | 'countries' | 'eras'>('all');

  if (!isOpen) return null;

  const totalCount = favoriteFigures.length + favoriteVideos.length + favoriteCountries.length + favoriteEras.length;

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-4xl max-h-[88vh] flex flex-col rounded-3xl bg-[#16161b] border border-[#d4af37]/40 shadow-2xl overflow-hidden text-[#f4e4bc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-[#221c10] via-[#1a1711] to-[#12110e] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400/20 border border-yellow-400/40 flex items-center justify-center text-yellow-400">
              <Star className="w-5 h-5 fill-yellow-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider font-mono text-[#d4af37] block">
                คลังรายการโปรดที่คุณบันทึกไว้ (Favorites)
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white font-cinzel">
                รายการโปรดและจดหมายเหตุที่บันทึก ({totalCount} รายการ)
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 p-3 sm:px-6 bg-black/40 border-b border-white/5 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setTab('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${tab === 'all' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            ทั้งหมด ({totalCount})
          </button>
          <button
            onClick={() => setTab('figures')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${tab === 'figures' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            บุคคลสำคัญ & พงศาวดาร ({favoriteFigures.length})
          </button>
          <button
            onClick={() => setTab('videos')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${tab === 'videos' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            วิดีโอ ({favoriteVideos.length})
          </button>
          <button
            onClick={() => setTab('countries')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${tab === 'countries' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            ประเทศ ({favoriteCountries.length})
          </button>
          <button
            onClick={() => setTab('eras')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${tab === 'eras' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
          >
            เรื่องราวยุคสมัย ({favoriteEras.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scroll space-y-6">
          {totalCount === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Bookmark className="w-12 h-12 mx-auto text-[#d4af37]/30" />
              <p className="text-base text-gray-300 font-medium">ยังไม่มีรายการโปรด</p>
              <p className="text-xs text-gray-500">
                คุณสามารถกดไอคอนบุ๊คมาร์ก ⭐ บนบุคคลสำคัญ วิดีโอ หนังสือ หรือเรื่องราวยุคสมัย เพื่อบันทึกไว้อ่านได้ตลอดเวลา
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Figures */}
              {(tab === 'all' || tab === 'figures') && favoriteFigures.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider">
                    👑 บุคคลสำคัญและพงศาวดาร ({favoriteFigures.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {favoriteFigures.map((fig) => (
                      <div
                        key={fig.id}
                        className="p-3 rounded-2xl bg-[#1e1e24] border border-white/10 hover:border-[#d4af37]/60 transition-all flex items-center justify-between gap-3 shadow"
                      >
                        <div 
                          onClick={() => {
                            onOpenFigure(fig);
                            onClose();
                          }}
                          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                        >
                          <img
                            src={fig.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&q=80'}
                            alt=""
                            className="w-11 h-11 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white hover:text-[#d4af37] truncate">{fig.nameTh}</h5>
                            <p className="text-[10px] text-gray-400 truncate">{fig.period}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onOpenFigure(fig);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-[#d4af37] text-black text-[10px] font-bold hover:brightness-110 cursor-pointer"
                          >
                            เปิดอ่าน
                          </button>
                          <button
                            onClick={() => onRemoveFigure(fig)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 cursor-pointer"
                            title="ลบออกจากรายการโปรด"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {(tab === 'all' || tab === 'videos') && favoriteVideos.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    🎥 วิดีโอประวัติศาสตร์ ({favoriteVideos.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {favoriteVideos.map((vid) => (
                      <div
                        key={vid.id}
                        className="p-3 rounded-2xl bg-[#1e1e24] border border-white/10 hover:border-amber-400/60 transition-all flex items-center justify-between gap-3 shadow"
                      >
                        <div 
                          onClick={() => {
                            onOpenVideo(vid);
                            onClose();
                          }}
                          className="min-w-0 cursor-pointer flex-1"
                        >
                          <span className="text-[10px] text-amber-400 block truncate">{vid.category}</span>
                          <h5 className="text-xs font-bold text-white hover:text-amber-300 truncate">{vid.title}</h5>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onOpenVideo(vid);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-400 text-black text-[10px] font-bold hover:brightness-110 cursor-pointer flex items-center gap-1"
                          >
                            <Play className="w-3 h-3 fill-black" />
                            <span>ดู</span>
                          </button>
                          <button
                            onClick={() => onRemoveVideo(vid)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 cursor-pointer"
                            title="ลบออกจากรายการโปรด"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Countries */}
              {(tab === 'all' || tab === 'countries') && favoriteCountries.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    🌍 ประเทศ ({favoriteCountries.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {favoriteCountries.map((c) => (
                      <div
                        key={c.id}
                        className="p-3 rounded-2xl bg-[#1e1e24] border border-white/10 hover:border-emerald-400/60 transition-all flex items-center justify-between gap-3 shadow"
                      >
                        <div 
                          onClick={() => {
                            onOpenCountry(c);
                            onClose();
                          }}
                          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                        >
                          <img
                            src={c.flagUrl || `https://flagcdn.com/w160/${c.code}.png`}
                            alt=""
                            className="w-10 h-7 rounded object-cover shadow shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white hover:text-emerald-300 truncate">{c.nameTh}</h5>
                            <p className="text-[10px] text-gray-400 truncate">{c.continent}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onOpenCountry(c);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-400 text-black text-[10px] font-bold hover:brightness-110 cursor-pointer"
                          >
                            เปิดอ่าน
                          </button>
                          <button
                            onClick={() => onRemoveCountry(c)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 cursor-pointer"
                            title="ลบออกจากรายการโปรด"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Eras */}
              {(tab === 'all' || tab === 'eras') && favoriteEras.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    🏛️ เรื่องราวยุคสมัย ({favoriteEras.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {favoriteEras.map((era) => (
                      <div
                        key={era.id}
                        className="p-3 rounded-2xl bg-[#1e1e24] border border-white/10 hover:border-purple-400/60 transition-all flex items-center justify-between gap-3 shadow"
                      >
                        <div 
                          onClick={() => {
                            onOpenEra(era);
                            onClose();
                          }}
                          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                        >
                          <img
                            src={era.coverImage}
                            alt=""
                            className="w-12 h-10 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-white hover:text-purple-300 truncate">{era.nameTh}</h5>
                            <p className="text-[10px] text-gray-400 truncate">{era.periodTh}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onOpenEra(era);
                              onClose();
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-400 text-black text-[10px] font-bold hover:brightness-110 cursor-pointer"
                          >
                            เปิดอ่าน
                          </button>
                          <button
                            onClick={() => onRemoveEra(era)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 cursor-pointer"
                            title="ลบออกจากรายการโปรด"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs text-gray-400">
          <span>คลังรายการโปรด</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
