import React from 'react';
import { Globe, BookOpen, Film, Star, Users } from 'lucide-react';
import { ViewMode } from '../types';

interface BottomNavProps {
  currentView: ViewMode;
  onChangeView: (view: ViewMode) => void;
}

export const BottomNav: React.FC<BottomNavProps> = React.memo(({
  currentView,
  onChangeView,
}) => {
  const isBookActive = currentView === 'หนังสือ';
  const isVideoActive = currentView === 'ประวัติศาสตร์' || currentView === 'all';
  const isBioActive = currentView === 'biographies';
  const isFavActive = currentView === 'favorite';

  return (
    <nav className="fixed bottom-0 left-0 w-full bottom-nav-theme border-t border-[#d4af37]/30 flex justify-around items-center z-40 backdrop-blur-xl py-1.5 px-2 md:hidden shadow-2xl transition-colors duration-200">
      
      {/* 1. หนังสือ */}
      <button
        onClick={() => onChangeView('หนังสือ')}
        className={`relative flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all cursor-pointer ${
          isBookActive 
            ? 'text-[#d4af37] font-bold scale-105' 
            : 'text-gray-400 hover:text-white active:scale-95'
        }`}
        title="หนังสือ"
        aria-label="หนังสือ"
      >
        <BookOpen className={`w-5 h-5 ${isBookActive ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] tracking-tight mt-0.5 font-medium">หนังสือ</span>
        {isBookActive && (
          <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#d4af37] shadow-sm shadow-[#d4af37]" />
        )}
      </button>

      {/* 2. วิดีโอ */}
      <button
        onClick={() => onChangeView('ประวัติศาสตร์')}
        className={`relative flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all cursor-pointer ${
          isVideoActive 
            ? 'text-[#d4af37] font-bold scale-105' 
            : 'text-gray-400 hover:text-white active:scale-95'
        }`}
        title="วิดีโอ"
        aria-label="วิดีโอ"
      >
        <Film className={`w-5 h-5 ${isVideoActive ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] tracking-tight mt-0.5 font-medium">วิดีโอ</span>
        {isVideoActive && (
          <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#d4af37] shadow-sm shadow-[#d4af37]" />
        )}
      </button>

      {/* 4. บุคคล */}
      <button
        onClick={() => onChangeView('biographies')}
        className={`relative flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all cursor-pointer ${
          isBioActive 
            ? 'text-[#d4af37] font-bold scale-105' 
            : 'text-gray-400 hover:text-white active:scale-95'
        }`}
        title="บุคคล"
        aria-label="บุคคล"
      >
        <Users className={`w-5 h-5 ${isBioActive ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] tracking-tight mt-0.5 font-medium">บุคคล</span>
        {isBioActive && (
          <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#d4af37] shadow-sm shadow-[#d4af37]" />
        )}
      </button>

      {/* 5. โปรด */}
      <button
        onClick={() => onChangeView('favorite')}
        className={`relative flex flex-col items-center justify-center px-2 py-1 rounded-xl transition-all cursor-pointer ${
          isFavActive 
            ? 'text-[#d4af37] font-bold scale-105' 
            : 'text-gray-400 hover:text-white active:scale-95'
        }`}
        title="รายการโปรด"
        aria-label="รายการโปรด"
      >
        <Star className={`w-5 h-5 ${isFavActive ? 'stroke-[2.5] fill-[#d4af37]' : ''}`} />
        <span className="text-[10px] tracking-tight mt-0.5 font-medium">โปรด</span>
        {isFavActive && (
          <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-[#d4af37] shadow-sm shadow-[#d4af37]" />
        )}
      </button>

    </nav>
  );
});
