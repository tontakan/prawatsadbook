import React, { useState } from 'react';
import { 
  X, Bookmark, Volume2, VolumeX, Sparkles, ChevronRight, 
  Calendar, Award, BookOpen, Scroll, History, Check, ExternalLink,
  ShieldCheck, Share2
} from 'lucide-react';
import { HistoricalEra } from '../data/historicalErasData';

interface EraReaderModalProps {
  era: HistoricalEra;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (era: HistoricalEra) => void;
  onOpenFigureByName?: (figureName: string) => void;
}

export const EraReaderModal: React.FC<EraReaderModalProps> = ({
  era,
  onClose,
  isFavorite,
  onToggleFavorite,
  onOpenFigureByName,
}) => {
  const [activeTab, setActiveTab] = useState<'narrative' | 'chapters' | 'milestones' | 'figures'>('narrative');
  const [fontSize, setFontSize] = useState<'9px' | '11px' | '13px' | '15px'>('11px');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Text to speech reader
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const currentNarrative = activeTab === 'chapters' 
      ? era.chapters[selectedChapterIdx]?.narrative || era.overviewStory
      : era.overviewStory;

    const utterance = new SpeechSynthesisUtterance(`${era.nameTh}. ยุคสมัย ${era.periodTh}. ${currentNarrative}`);
    utterance.lang = 'th-TH';
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${era.nameTh} (${era.periodTh}) - คลังประวัติศาสตร์และเรื่องราวยุคสมัย`);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl bg-[#16161a] border border-[#d4af37]/40 shadow-2xl overflow-hidden text-[#f4e4bc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-[#201d14] via-[#1a1712] to-[#14120e] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] shrink-0">
              <History className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 font-semibold font-mono">
                  {era.category === 'ไทย' ? 'ประวัติศาสตร์สยาม' : 'ประวัติศาสตร์สากล'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono hidden xs:inline">
                  {era.century}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold font-cinzel text-white truncate">
                {era.nameTh}
              </h2>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Font size toggle */}
            <div className="flex items-center bg-black/40 rounded-lg p-0.5 border border-white/10 text-[10px] font-mono">
              <button
                onClick={() => setFontSize('9px')}
                className={`px-1.5 py-0.5 rounded ${fontSize === '9px' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                title="ขนาดตัวอักษร 9px"
              >
                9px
              </button>
              <button
                onClick={() => setFontSize('11px')}
                className={`px-1.5 py-0.5 rounded ${fontSize === '11px' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                title="ขนาดตัวอักษร 11px"
              >
                11px
              </button>
              <button
                onClick={() => setFontSize('13px')}
                className={`px-1.5 py-0.5 rounded ${fontSize === '13px' ? 'bg-[#d4af37] text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                title="ขนาดตัวอักษร 13px"
              >
                13px
              </button>
            </div>

            {/* Audio Speech */}
            <button
              onClick={handleToggleSpeech}
              className={`p-2 rounded-xl transition-all cursor-pointer ${isSpeaking ? 'bg-amber-500 text-black animate-pulse' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
              title={isSpeaking ? 'หยุดอ่านออกเสียง' : 'อ่านออกเสียงเนื้อหา (Text-to-Speech)'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Favorite Bookmark */}
            <button
              onClick={() => onToggleFavorite(era)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${isFavorite ? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/40' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}
              title={isFavorite ? 'นำออกจากรายการโปรด' : 'บันทึกในรายการโปรด'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400' : ''}`} />
            </button>

            {/* Share / Copy */}
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all cursor-pointer relative"
              title="คัดลอกลิงก์เรื่องราว"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-all cursor-pointer"
              title="ปิดหน้าต่างอ่าน"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-white/10 bg-black/40 px-4 sm:px-6 overflow-x-auto no-scrollbar gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('narrative')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'narrative' ? 'border-[#d4af37] text-[#d4af37] font-bold' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>เรื่องราวยุคสมัย (ภาพรวม)</span>
          </button>
          <button
            onClick={() => setActiveTab('chapters')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'chapters' ? 'border-[#d4af37] text-[#d4af37] font-bold' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <Scroll className="w-3.5 h-3.5" />
            <span>บทบันทึกย่อย ({era.chapters.length} บท)</span>
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'milestones' ? 'border-[#d4af37] text-[#d4af37] font-bold' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>จุดเปลี่ยนสำคัญ ({era.turningPoints.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('figures')}
            className={`py-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${activeTab === 'figures' ? 'border-[#d4af37] text-[#d4af37] font-bold' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>บุคคลและโบราณวัตถุ</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scroll space-y-6">
          {/* TAB 1: Narrative Story */}
          {activeTab === 'narrative' && (
            <div className="space-y-6">
              {/* Hero Banner */}
              <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[21/9] sm:aspect-[24/8] bg-black">
                <img
                  src={era.coverImage}
                  alt={era.nameTh}
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-6">
                  <span className="text-[11px] text-[#d4af37] font-mono tracking-widest uppercase">
                    ศักราช: {era.periodTh}
                  </span>
                  <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-white">
                    {era.nameTh}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-300 mt-1 italic line-clamp-2">
                    "{era.tagline}"
                  </p>
                </div>
              </div>

              {/* Story Narrative in selected font size */}
              <div className="bg-[#1c1c22] rounded-2xl p-5 sm:p-6 border border-white/5 space-y-4 shadow-inner">
                <div className="flex items-center gap-2 text-[#d4af37] border-b border-white/10 pb-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">บันทึกประวัติศาสตร์ฉบับทางการ</span>
                </div>

                <div 
                  className={`leading-relaxed text-gray-200 text-justify ${
                    fontSize === '9px' ? 'text-newsprint-9px' : fontSize === '11px' ? 'text-newsprint-11px' : 'text-newsprint-13px'
                  }`}
                >
                  <p className="indent-6 first-letter:text-2xl first-letter:font-bold first-letter:text-[#d4af37] first-letter:mr-1">
                    {era.overviewStory}
                  </p>
                </div>
              </div>

              {/* Key Turning Points Preview */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>เหตุการณ์ประวัติศาสตร์ที่เปลี่ยนทิศทางมนุษยชาติ</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {era.turningPoints.map((tp, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-[#d4af37] font-mono font-bold">
                        <span>{tp.year}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white">{tp.title}</h5>
                      <p className="text-[11px] text-gray-400 leading-normal">{tp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Multi-chapter Story */}
          {activeTab === 'chapters' && (
            <div className="space-y-6">
              {/* Chapter selector badges */}
              <div className="flex flex-wrap gap-2">
                {era.chapters.map((ch, idx) => (
                  <button
                    key={ch.chapterNumber}
                    onClick={() => setSelectedChapterIdx(idx)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${selectedChapterIdx === idx ? 'bg-[#d4af37] text-black font-bold shadow' : 'bg-white/5 text-gray-300 hover:bg-white/10'}`}
                  >
                    <span className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[10px]">
                      {ch.chapterNumber}
                    </span>
                    <span className="truncate max-w-[200px]">{ch.title}</span>
                  </button>
                ))}
              </div>

              {/* Active Chapter Details */}
              {era.chapters[selectedChapterIdx] && (
                <div className="bg-[#1c1c22] rounded-2xl p-5 sm:p-7 border border-white/10 space-y-5 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs text-[#d4af37] font-mono font-bold block">
                        บทที่ {era.chapters[selectedChapterIdx].chapterNumber} • {era.chapters[selectedChapterIdx].periodYear}
                      </span>
                      <h3 className="text-lg font-bold text-white font-cinzel mt-1">
                        {era.chapters[selectedChapterIdx].title}
                      </h3>
                    </div>
                  </div>

                  <div 
                    className={`leading-relaxed text-gray-200 text-justify ${
                      fontSize === '9px' ? 'text-newsprint-9px' : fontSize === '11px' ? 'text-newsprint-11px' : 'text-newsprint-13px'
                    }`}
                  >
                    <p className="indent-6">
                      {era.chapters[selectedChapterIdx].narrative}
                    </p>
                  </div>

                  {/* Highlights list */}
                  <div className="p-4 rounded-xl bg-black/40 border border-[#d4af37]/20 space-y-2">
                    <span className="text-[11px] font-bold text-[#d4af37] block">เหตุการณ์สำคัญในบทนี้:</span>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {era.chapters[selectedChapterIdx].keyEvents.map((evt, eIdx) => (
                        <li key={eIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] mt-1.5 shrink-0" />
                          <span>{evt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Milestones & Turning Points */}
          {activeTab === 'milestones' && (
            <div className="space-y-4">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#d4af37]/40">
                {era.turningPoints.map((tp, idx) => (
                  <div key={idx} className="relative space-y-1.5">
                    <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#d4af37] border-2 border-black" />
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#d4af37]/40 transition-all">
                      <span className="text-xs font-mono font-bold text-[#d4af37] block">
                        ศักราช: {tp.year}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-0.5">
                        {tp.title}
                      </h4>
                      <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                        {tp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Prominent Figures & Artifacts */}
          {activeTab === 'figures' && (
            <div className="space-y-6">
              {/* Prominent Figures */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" />
                  <span>บุคคลสำคัญในยุคสมัยนี้</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {era.prominentFigures.map((fig, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-[#d4af37]/40 transition-all space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-white">{fig.name}</h5>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30">
                          {fig.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 leading-normal">{fig.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Artifacts and chronicles */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                <h4 className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
                  <Scroll className="w-3.5 h-3.5" />
                  <span>หลักฐานทางโบราณคดี & คัมภีร์พงศาวดาร</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {era.artifactsAndChronicles.map((art, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#1f1d19] border border-[#d4af37]/20 space-y-1">
                      <span className="text-[10px] text-amber-400 uppercase font-mono block">
                        {art.type}
                      </span>
                      <h5 className="text-xs font-bold text-white">{art.name}</h5>
                      <p className="text-[11px] text-gray-400">{art.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs text-gray-400">
          <span className="truncate">
            คลังเรื่องราวยุคสมัยประวัติศาสตร์ • {era.nameEn}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:brightness-110 transition-all cursor-pointer shrink-0"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
