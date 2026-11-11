import React from 'react';
import { Menu, Search, Star, RefreshCw, X, Sparkles, BookOpen, Film, Globe, Users } from 'lucide-react';
import { ViewMode } from '../types';
import { ThemeSelector, AppTheme } from './ThemeSelector';

interface HeaderProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
  onOpenFavorites: () => void;
  favoritesCount: number;
  currentTheme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  currentView,
  onChangeView,
  onOpenFavorites,
  favoritesCount,
  currentTheme,
  onChangeTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 header-nav backdrop-blur-md border-b border-[#d4af37]/25 shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Menu Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-[#d4af37] hover:bg-white/5 border border-transparent hover:border-[#d4af37]/30 transition-all cursor-pointer"
            title="เปิดเมนูหมวดหมู่"
            aria-label="เปิดเมนูหมวดหมู่"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div 
            onClick={() => onChangeView('หนังสือ')}
            className="cursor-pointer select-none group hidden xs:block"
          >
            <span className="text-[9px] uppercase tracking-widest text-[#d4af37] block font-mono">
              E-BOOKS & ARCHIVE
            </span>
            <h1 className="text-sm sm:text-lg font-black font-cinzel gold-gradient tracking-wider">
              คลังหนังสือประวัติศาสตร์
            </h1>
          </div>
        </div>

        {/* Global Single Master Search Bar */}
        <div className="relative flex-1 max-w-xs sm:max-w-md md:max-w-lg">
          <Search className="w-4 h-4 text-[#d4af37]/80 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ค้นหาหนังสือ, วรรณกรรม, ประเทศ..."
            className="w-full search-input-theme border border-[#d4af37]/35 rounded-full py-1.5 sm:py-2 pl-9 pr-8 text-xs focus:outline-none focus:border-[#d4af37] transition-all shadow-inner placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white cursor-pointer p-1"
              title="ล้างคำค้นหา"
              aria-label="ล้างคำค้นหา"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Nav Tabs (หนังสือ, วิดีโอ, ประเทศ, บุคคล) */}
        <div className="hidden md:flex items-center gap-1 bg-black/40 border border-[#d4af37]/20 rounded-2xl p-1">
          <button
            onClick={() => onChangeView('หนังสือ')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentView === 'หนังสือ'
                ? 'bg-[#d4af37] text-black font-bold shadow'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>หนังสือ</span>
          </button>
          <button
            onClick={() => onChangeView('ประวัติศาสตร์')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentView === 'ประวัติศาสตร์' || currentView === 'all'
                ? 'bg-[#d4af37] text-black font-bold shadow'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>วิดีโอ</span>
          </button>
          <button
            onClick={() => onChangeView('biographies')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentView === 'biographies'
                ? 'bg-[#d4af37] text-black font-bold shadow'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>บุคคล</span>
          </button>
        </div>

        {/* Top Action Controls (รายการโปรด, ปุ่มเลือก ๓ ธีม) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* 1. รายการโปรดไปอยู่ด้านบน (Favorites Button with count badge) */}
          <button
            onClick={onOpenFavorites}
            className="relative flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-all cursor-pointer group"
            title={`รายการโปรดที่คุณบันทึกไว้ (${favoritesCount} รายการ)`}
            aria-label="เปิดรายการโปรด"
          >
            <Star className={`w-4 h-4 text-yellow-400 ${favoritesCount > 0 ? 'fill-yellow-400' : ''}`} />
            <span className="hidden sm:inline font-medium text-[11px]">รายการโปรด</span>
            {favoritesCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-yellow-400 text-black text-[10px] font-bold flex items-center justify-center font-mono">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* 2. ปุ่มเลือกธีม ๓ ธีม (Theme Selector: โทนสว่าง [เริ่มต้น], โทนมืด, โทนกระดาษโบราณ) */}
          <ThemeSelector
            currentTheme={currentTheme}
            onChangeTheme={onChangeTheme}
          />
        </div>

      </div>
    </header>
  );
});
