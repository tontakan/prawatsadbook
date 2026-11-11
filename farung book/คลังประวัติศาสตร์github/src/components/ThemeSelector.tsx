import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Scroll, Palette, Check } from 'lucide-react';

export type AppTheme = 'light' | 'dark' | 'sepia';

interface ThemeSelectorProps {
  currentTheme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onChangeTheme,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes: { id: AppTheme; nameTh: string; nameEn: string; icon: React.ReactNode; desc: string; previewBg: string }[] = [
    {
      id: 'light',
      nameTh: 'โทนสว่าง (ราชสำนัก)',
      nameEn: 'Royal Ivory (Default)',
      icon: <Sun className="w-4 h-4 text-amber-600" />,
      desc: 'พื้นหลังสว่าง โทนงาช้าง สบายตา อ่านง่าย',
      previewBg: 'bg-[#fcfbf7] border-amber-300 text-stone-800'
    },
    {
      id: 'dark',
      nameTh: 'โทนมืด (มิดไนท์โกลด์)',
      nameEn: 'Midnight Obsidian',
      icon: <Moon className="w-4 h-4 text-amber-400" />,
      desc: 'พื้นหลังสีดำรัตติกาล ขลิบทองคำ สไตล์คลาสสิก',
      previewBg: 'bg-[#121215] border-amber-500/40 text-amber-200'
    },
    {
      id: 'sepia',
      nameTh: 'โทนกระดาษโบราณ (ซีเปีย)',
      nameEn: 'Ancient Parchment',
      icon: <Scroll className="w-4 h-4 text-amber-700" />,
      desc: 'กระดาษข่อยโบราณ นุ่มนวล เสมือนคัมภีร์เก่า',
      previewBg: 'bg-[#f4ecdb] border-amber-700/30 text-amber-950'
    }
  ];

  const currentThemeObj = themes.find(t => t.id === currentTheme) || themes[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-all cursor-pointer"
        title="เลือกธีมการแสดงผล (๓ ธีม)"
        aria-label="เลือกธีม ๓ ธีม"
      >
        {currentThemeObj.icon}
        <span className="hidden md:inline font-medium text-[11px]">
          {currentThemeObj.nameTh.split(' ')[0]}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#1c1c22] border border-[#d4af37]/40 shadow-2xl p-2 z-[110] animate-fadeIn text-xs space-y-1">
          <div className="px-2.5 py-1.5 border-b border-white/10 flex items-center justify-between text-[10px] font-mono text-[#d4af37]">
            <span>เลือกธีมสีการแสดงผล (๓ ธีม)</span>
            <Palette className="w-3.5 h-3.5" />
          </div>

          {themes.map((t) => {
            const isSelected = currentTheme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  onChangeTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between gap-2.5 cursor-pointer ${
                  isSelected 
                    ? 'bg-[#d4af37]/20 border border-[#d4af37] text-white' 
                    : 'hover:bg-white/5 text-gray-300'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className={`p-1.5 rounded-lg border shadow-sm mt-0.5 ${t.previewBg}`}>
                    {t.icon}
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>{t.nameTh}</span>
                      {t.id === 'light' && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/30">
                          เริ่มต้น
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{t.desc}</p>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-[#d4af37] shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
