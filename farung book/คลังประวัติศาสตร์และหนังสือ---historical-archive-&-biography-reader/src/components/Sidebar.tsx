import React, { useState } from 'react';
import { 
  X, ChevronDown, ChevronRight, ShieldCheck, 
  Globe, BookOpen, Film, Star, ExternalLink, BookMarked, Users
} from 'lucide-react';
import { ViewMode } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categoriesHistory?: string[];
  categoriesBooks: string[];
  categoriesCountries?: string[];
  selectedCategory: string | null;
  onSelectCategory: (cat: string) => void;
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  categoriesHistory = [],
  categoriesBooks,
  categoriesCountries = [],
  selectedCategory,
  onSelectCategory,
  currentView,
  onChangeView,
}) => {
  const [isBooksOpen, setIsBooksOpen] = useState<boolean>(true);
  const [isVideosOpen, setIsVideosOpen] = useState<boolean>(false);

  const isBookActive = currentView === 'หนังสือ';
  const isVideoActive = currentView === 'ประวัติศาสตร์' || currentView === 'all';
  const isBioActive = currentView === 'biographies';
  const isFavActive = currentView === 'favorite';

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[90] transition-opacity"
        ></div>
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 bg-[#141416] border-r border-[#d4af37]/30 z-[100] transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#d4af37]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-pulse"></span>
            <h2 className="text-base font-bold text-[#d4af37] font-cinzel tracking-wider uppercase">
              เมนูหลัก
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 flex-1 overflow-y-auto custom-scroll space-y-5">
          
          {/* Main Views Fast Switch */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 block mb-2">
              หน้าหลัก
            </span>

            {/* 1. Books (Main Page) */}
            <button
              onClick={() => {
                onChangeView('หนังสือ');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${isBookActive ? 'bg-[#d4af37] text-black font-bold shadow' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
            >
              <BookOpen className={`w-4 h-4 ${isBookActive ? 'text-black' : 'text-[#d4af37]'}`} />
              <span>หน้าหนังสือ (หน้าหลัก)</span>
            </button>

            {/* 2. Videos (หน้าวิดีโอ) */}
            <button
              onClick={() => {
                onChangeView('ประวัติศาสตร์');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${isVideoActive ? 'bg-[#d4af37] text-black font-bold shadow' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
            >
              <Film className={`w-4 h-4 ${isVideoActive ? 'text-black' : 'text-amber-400'}`} />
              <span>หน้าวิดีโอ</span>
            </button>

            {/* 3. Biographies (หน้าบุคคล) */}
            <button
              onClick={() => {
                onChangeView('biographies');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${isBioActive ? 'bg-[#d4af37] text-black font-bold shadow' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
            >
              <Users className={`w-4 h-4 ${isBioActive ? 'text-black' : 'text-sky-400'}`} />
              <span>หน้าบุคคล</span>
            </button>

            {/* 4. Favorites */}
            <button
              onClick={() => {
                onChangeView('favorite');
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${isFavActive ? 'bg-[#d4af37] text-black font-bold shadow' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
            >
              <Star className={`w-4 h-4 ${isFavActive ? 'text-black' : 'text-yellow-400'}`} />
              <span>รายการโปรด</span>
            </button>
          </div>

          {/* Categories: Books from CSV */}
          {categoriesBooks.length > 0 && (
            <div className="pt-2 border-t border-white/5">
              <button
                onClick={() => setIsBooksOpen(!isBooksOpen)}
                className="w-full flex justify-between items-center text-[#f4e4bc] font-bold text-xs mb-2 pb-1 border-b border-white/10 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookMarked className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>หมวดหมู่หนังสือ ({categoriesBooks.length})</span>
                </div>
                {isBooksOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
              </button>

              {isBooksOpen && (
                <div className="space-y-1 pl-2 text-xs">
                  {categoriesBooks.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        onChangeView('หนังสือ');
                        onSelectCategory(cat);
                        onClose();
                      }}
                      className={`w-full text-left py-1.5 px-3 rounded-lg transition-all text-xs border-l-2 cursor-pointer ${isBookActive && selectedCategory === cat ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37] font-semibold' : 'text-gray-400 hover:text-white border-transparent hover:border-[#d4af37]/40'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categories: Videos from CSV */}
          {categoriesHistory.length > 0 && (
            <div className="pt-2 border-t border-white/5">
              <button
                onClick={() => setIsVideosOpen(!isVideosOpen)}
                className="w-full flex justify-between items-center text-[#f4e4bc] font-bold text-xs mb-2 pb-1 border-b border-white/10 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Film className="w-3.5 h-3.5 text-amber-400" />
                  <span>หมวดหมู่วิดีโอ ({categoriesHistory.length})</span>
                </div>
                {isVideosOpen ? <ChevronDown className="w-3.5 h-3.5 text-[#d4af37]" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-500" />}
              </button>

              {isVideosOpen && (
                <div className="space-y-1 pl-2 text-xs">
                  {categoriesHistory.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        onChangeView('ประวัติศาสตร์');
                        onSelectCategory(cat);
                        onClose();
                      }}
                      className={`w-full text-left py-1.5 px-3 rounded-lg transition-all text-xs border-l-2 cursor-pointer ${isVideoActive && selectedCategory === cat ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37] font-semibold' : 'text-gray-400 hover:text-white border-transparent hover:border-[#d4af37]/40'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}



          {/* Privacy Policy */}
          <div className="pt-4 border-t border-white/10 space-y-1">
            <a
              href="https://sites.google.com/view/privacy-policy-pdpa-crow-studi/%E0%B8%AB%E0%B8%99%E0%B8%B2%E0%B9%81%E0%B8%A3%E0%B8%81"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-[#d4af37] hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                <span>นโยบายความเป็นส่วนตัว (PDPA)</span>
              </div>
              <ExternalLink className="w-3 h-3 text-gray-500" />
            </a>
          </div>

        </div>
      </aside>
    </>
  );
};
