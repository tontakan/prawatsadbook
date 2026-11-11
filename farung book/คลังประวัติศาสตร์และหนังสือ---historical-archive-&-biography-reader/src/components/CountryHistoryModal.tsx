import React, { useState, useMemo } from 'react';
import { 
  X, Globe, MapPin, Users, Calendar, Award, 
  BookOpen, Bookmark, Sparkles, ChevronRight,
  ShieldCheck, History, Scroll, Loader2, ArrowRight
} from 'lucide-react';
import { CountryData, BiographyFigure } from '../types';
import { ROYAL_CHRONICLES_100, chronicleToBiographyFigure } from '../data/royalChroniclesData';
import { fetchWikiFullArticle, formatCountryInto50PageChronicleBook } from '../services/wikipediaService';

interface CountryHistoryModalProps {
  country: CountryData;
  onClose: () => void;
  onOpenArchivalDocument: (figureDoc: BiographyFigure) => void;
  isFavorite: boolean;
  onToggleFavorite: (country: CountryData) => void;
}

export const CountryHistoryModal: React.FC<CountryHistoryModalProps> = ({
  country,
  onClose,
  onOpenArchivalDocument,
  isFavorite,
  onToggleFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'leaders' | 'chronicles'>('overview');
  const [isLoadingWiki, setIsLoadingWiki] = useState<boolean>(false);

  // Filter royal chronicles connected to this specific country
  const relatedChronicles = useMemo(() => {
    const cName = country.nameTh.toLowerCase();
    const cCode = country.code.toLowerCase();

    const matches = ROYAL_CHRONICLES_100.filter(c => {
      // Thailand
      if (cCode === 'th' || cName.includes('ไทย')) {
        return c.category !== 'พงศาวดารสากล';
      }
      // Myanmar
      if (cCode === 'mm' || cName.includes('พม่า')) {
        return (
          c.title.includes('พม่า') || c.title.includes('หงสาวดี') || c.title.includes('บุเรงนอง') ||
          c.title.includes('ยุทธหัตถี') || c.title.includes('สงครามเก้าทัพ') || c.title.includes('เมืองแปร') ||
          c.summary.includes('พม่า') || c.summary.includes('หงสาวดี')
        );
      }
      // France
      if (cCode === 'fr' || cName.includes('ฝรั่งเศส')) {
        return (
          c.title.includes('แวร์ซายส์') || c.title.includes('โกษาปาน') || c.title.includes('ร.ศ. ๑๑๒') ||
          c.summary.includes('ฝรั่งเศส') || c.title.includes('นโปเลียน') || c.summary.includes('นโปเลียน')
        );
      }
      // UK
      if (cCode === 'gb' || cName.includes('อังกฤษ') || cName.includes('สหราชอาณาจักร')) {
        return (
          c.title.includes('เบาว์ริง') || c.summary.includes('อังกฤษ') || c.title.includes('วิกตอเรีย')
        );
      }
      // China
      if (cCode === 'cn' || cName.includes('จีน')) {
        return (
          c.title.includes('กรุงจีน') || c.title.includes('สามก๊ก') || c.title.includes('ซุนวู') ||
          c.summary.includes('จีน') || c.title.includes('ขงจื๊อ') || c.title.includes('เล่าจื๊อ')
        );
      }
      // Japan
      if (cCode === 'jp' || cName.includes('ญี่ปุ่น')) {
        return (
          c.title.includes('ญี่ปุ่น') || c.title.includes('ยามาดะ') || c.summary.includes('ญี่ปุ่น') ||
          c.title.includes('ซามูไร') || c.title.includes('เอโดะ')
        );
      }
      // Italy / Rome
      if (cCode === 'it' || cName.includes('อิตาลี')) {
        return (
          c.title.includes('โรมัน') || c.title.includes('ซีซาร์') || c.title.includes('เรเนซองส์') ||
          c.title.includes('ฟลอเรนซ์') || c.summary.includes('โรมัน')
        );
      }
      // Greece
      if (cCode === 'gr' || cName.includes('กรีซ')) {
        return (
          c.title.includes('อเล็กซานเดอร์') || c.title.includes('กรีก') || c.summary.includes('กรีก')
        );
      }
      // Egypt
      if (cCode === 'eg' || cName.includes('อียิปต์')) {
        return (
          c.title.includes('อียิปต์') || c.title.includes('ฟาโรห์') || c.title.includes('แรเมซีส') ||
          c.summary.includes('อียิปต์')
        );
      }
      // USA
      if (cCode === 'us' || cName.includes('อเมริกา')) {
        return (
          c.title.includes('อเมริก') || c.summary.includes('อเมริก') || c.title.includes('ลินคอล์น')
        );
      }
      // Generic match: title or summary mentions the country name
      return (
        c.title.toLowerCase().includes(cName) ||
        c.summary.toLowerCase().includes(cName) ||
        c.bannapanaek.toLowerCase().includes(cName)
      );
    });

    return matches;
  }, [country]);

  // Main action: Open complete 50-page chronicle & Wikipedia history book
  // Requirement: "ประวัติศาสตร์ชาติกดเปิดแสดง พงศาวดาร์ทั้งหมดเลย ดึงรูป ดึงข้อมูลมาจาก wikidiaมาเรียบเรียงใหม่ นำมาแสดงให้คบเลย ขั้นต่ำ 50 หน้า"
  const handleOpenFull50PageChronicleBook = async () => {
    setIsLoadingWiki(true);
    try {
      let wikiArticle = await fetchWikiFullArticle(country.wikiTitle || country.nameTh, 'th');
      if (!wikiArticle || wikiArticle.sections.length === 0) {
        wikiArticle = await fetchWikiFullArticle(country.nameEn, 'en');
      }

      // Provide all 100 Royal Chronicles ("พงศาวดาร์ทั้งหมดเลย")
      const allChronicles = ROYAL_CHRONICLES_100.map(c => ({
        storyNumber: c.storyNumber,
        title: c.title,
        era: c.era,
        summary: c.summary,
        paragraphs: c.pages ? c.pages.flatMap(p => p.paragraphs) : [c.summary]
      }));

      const bookDoc = formatCountryInto50PageChronicleBook(
        country.nameTh,
        country.nameEn,
        country.code,
        country.capital,
        country.continent,
        country.overview,
        country.famousLeaders,
        country.historicalHighlights,
        country.historyChapters,
        wikiArticle,
        allChronicles
      );

      onOpenArchivalDocument(bookDoc);
    } catch (err) {
      console.error('Failed to format 50-page chronicle book:', err);
      // Fallback
      handleFallbackDocument();
    } finally {
      setIsLoadingWiki(false);
    }
  };

  const handleFallbackDocument = () => {
    const allChronicles = ROYAL_CHRONICLES_100.map(c => ({
      storyNumber: c.storyNumber,
      title: c.title,
      era: c.era,
      summary: c.summary,
      paragraphs: c.pages ? c.pages.flatMap(p => p.paragraphs) : [c.summary]
    }));

    const bookDoc = formatCountryInto50PageChronicleBook(
      country.nameTh,
      country.nameEn,
      country.code,
      country.capital,
      country.continent,
      country.overview,
      country.famousLeaders,
      country.historicalHighlights,
      country.historyChapters,
      null,
      allChronicles
    );
    onOpenArchivalDocument(bookDoc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#18181a] border border-[#d4af37]/40 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Header with Country Flag & Basics */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-[#221c13] via-[#1a1815] to-[#121212] border-b border-[#d4af37]/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img 
              src={country.flagUrl || `https://flagcdn.com/w160/${country.code}.png`} 
              alt={country.nameEn}
              className="w-16 h-11 object-cover rounded shadow-md border border-[#d4af37]/40"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white flex items-center gap-2">
                {country.nameTh}
              </h2>
              <p className="text-xs text-[#d4af37] font-medium tracking-wide">
                {country.nameEn} • ทวีป{country.continent}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Action Button: Open Chronicles & Wikipedia */}
            <button
              onClick={handleOpenFull50PageChronicleBook}
              disabled={isLoadingWiki}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ebdcc4] text-black hover:brightness-110 active:scale-95 transition-all font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
              title="เปิดอ่านพงศาวดารทั้งหมดและประวัติศาสตร์ชาติฉบับเต็ม"
            >
              {isLoadingWiki ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังโหลดข้อมูล...</span>
                </>
              ) : (
                <>
                  <Scroll className="w-4 h-4" />
                  <span>เปิดอ่านพงศาวดารฉบับเต็ม</span>
                </>
              )}
            </button>

            {/* Favorite button */}
            <button
              onClick={() => onToggleFavorite(country)}
              className={`p-2 rounded-xl border transition-all ${isFavorite ? 'bg-amber-500/20 text-yellow-400 border-yellow-500' : 'bg-black/40 border-[#d4af37]/30 text-gray-400 hover:text-white'}`}
              title="บันทึกในรายการโปรด"
            >
              <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400' : ''}`} />
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all border border-white/10 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Facts Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4 bg-[#141416] border-b border-white/5 text-xs text-[#ebdcc4]">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/30 border border-white/5">
            <MapPin className="w-4 h-4 text-[#d4af37]" />
            <div>
              <span className="text-[10px] text-gray-400 block">เมืองหลวง</span>
              <span className="font-semibold">{country.capital}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/30 border border-white/5">
            <Users className="w-4 h-4 text-[#d4af37]" />
            <div>
              <span className="text-[10px] text-gray-400 block">ประชากร</span>
              <span className="font-semibold">{country.population}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/30 border border-white/5">
            <Calendar className="w-4 h-4 text-[#d4af37]" />
            <div>
              <span className="text-[10px] text-gray-400 block">ยุคก่อตั้ง/สถาปนา</span>
              <span className="font-semibold truncate max-w-[120px]">{country.era}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-black/30 border border-white/5">
            <Globe className="w-4 h-4 text-[#d4af37]" />
            <div>
              <span className="text-[10px] text-gray-400 block">รหัสประเทศ</span>
              <span className="font-semibold font-mono">{country.code.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-white/10 px-6 pt-3 gap-6 text-sm font-medium text-gray-400 bg-[#161618] overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${activeTab === 'overview' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent hover:text-white'}`}
          >
            <BookOpen className="w-4 h-4" />
            <span>ภาพรวมประวัติศาสตร์</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${activeTab === 'timeline' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent hover:text-white'}`}
          >
            <Calendar className="w-4 h-4" />
            <span>เส้นเวลา ๕ ยุคสำคัญ</span>
          </button>
          <button
            onClick={() => setActiveTab('leaders')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${activeTab === 'leaders' ? 'border-[#d4af37] text-[#d4af37]' : 'border-transparent hover:text-white'}`}
          >
            <Award className="w-4 h-4" />
            <span>บุคคลและผู้นำสำคัญ</span>
          </button>
          <button
            onClick={() => setActiveTab('chronicles')}
            className={`pb-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${activeTab === 'chronicles' ? 'border-[#d4af37] text-[#d4af37] font-bold' : 'border-transparent hover:text-white'}`}
          >
            <Scroll className="w-4 h-4" />
            <span>พระราชพงศาวดารหลวง ({relatedChronicles.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto custom-scroll flex-1 space-y-6 text-[#ebdcc4]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 50-Page Book Trigger Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#2a2215] via-[#1f1910] to-[#12110e] border border-[#d4af37]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#d4af37] font-mono font-bold">
                      สมุดไทยโบราณ ๕๐+ หน้า
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Wikipedia Open Archives
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    เปิดอ่านประวัติศาสตร์และพระราชพงศาวดารฉบับเต็ม ๕๐ หน้า
                  </h3>
                  <p className="text-xs text-gray-300">
                    ดึงข้อมูลและรูปภาพจริงจากวิกิพีเดีย เรียบเรียงใหม่เป็นสมุดข่อย ๕๐ หน้า (ขนาดตัวอักษร ๙px)
                  </p>
                </div>
                <button
                  onClick={handleOpenFull50PageChronicleBook}
                  disabled={isLoadingWiki}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ebdcc4] text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  {isLoadingWiki ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                  <span>เปิดอ่านฉบับเต็ม ๕๐ หน้า</span>
                </button>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#d4af37] font-mono mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>สาระสำคัญและบทนำประวัติศาสตร์ชาติ</span>
                </h3>
                <p className="text-sm leading-relaxed text-gray-200 bg-black/40 p-4 rounded-xl border border-white/5">
                  {country.overview}
                </p>
              </div>

              <div>
                <h3 className="text-xs uppercase tracking-widest text-[#d4af37] font-mono mb-3">
                  เหตุการณ์จุดเปลี่ยนทางประวัติศาสตร์ (Turning Points)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {country.historicalHighlights.map((highlight, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-xl bg-black/40 border border-white/5 hover:border-[#d4af37]/30 transition-all flex items-start gap-2.5"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 flex items-center justify-center text-xs font-mono font-bold mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {highlight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#d4af37]/40">
                {country.historyChapters.map((chapter) => (
                  <div key={chapter.chapterNumber} className="relative space-y-2">
                    <span className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-[#d4af37] border-2 border-black" />
                    
                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 hover:border-[#d4af37]/30 transition-all space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                        <span className="text-xs font-mono text-[#d4af37] font-bold">
                          บทที่ {chapter.chapterNumber} • {chapter.period}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white font-cinzel">
                        {chapter.title}
                      </h4>
                      <p className="text-xs leading-relaxed text-gray-300">
                        {chapter.content}
                      </p>
                      
                      {chapter.keyEvents && chapter.keyEvents.length > 0 && (
                        <div className="pt-2">
                          <span className="text-[10px] text-gray-400 font-mono block mb-1">เหตุการณ์สำคัญ:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {chapter.keyEvents.map((evt, eIdx) => (
                              <span key={eIdx} className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[#ebdcc4]">
                                • {evt}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LEADERS */}
          {activeTab === 'leaders' && (
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-widest text-[#d4af37] font-mono">
                บุคคลสำคัญและผู้นำที่สร้างชาติ
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {country.famousLeaders.map((leader, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3 hover:border-[#d4af37]/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] text-xs font-bold font-mono">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-xs sm:text-sm text-white">{leader}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ROYAL CHRONICLES (พงศาวดารทั้งหมด) */}
          {activeTab === 'chronicles' && (
            <div className="space-y-4">
              {/* 50-Page Chronicle Reader Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#201912] via-[#2a2016] to-[#14120e] border border-[#d4af37]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                    <Scroll className="w-4 h-4 text-[#d4af37]" />
                    <span>อ่านพงศาวดารและประวัติศาสตร์ฉบับเต็ม ๕๐+ หน้า (๙px)</span>
                  </h4>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    ประมวลข้อมูลจากวิกิพีเดียสากลและพระราชพงศาวดารทุกผูก นำมาเรียบเรียงใหม่อย่างสมบูรณ์
                  </p>
                </div>
                <button
                  onClick={handleOpenFull50PageChronicleBook}
                  disabled={isLoadingWiki}
                  className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  {isLoadingWiki ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <BookOpen className="w-4 h-4" />
                  )}
                  <span>เปิดอ่าน ๕๐ หน้า</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-[#d4af37]" />
                  <h3 className="text-xs sm:text-sm font-bold text-white font-cinzel">
                    พระราชพงศาวดารและจดหมายเหตุหลวงที่เชื่อมโยงกับ {country.nameTh}
                  </h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 self-start sm:self-auto">
                  {relatedChronicles.length} เรื่องราว
                </span>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                คัดสรรจากพระราชพงศาวดารและจดหมายเหตุหลวง ๑๐๐ เรื่องราว บันทึกเหตุการณ์ ปฐมกษัตริย์ สงคราม สนธิสัญญา และการสร้างชาติที่เกี่ยวข้องกับ {country.nameTh}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                {relatedChronicles.map((chronicle) => (
                  <div
                    key={chronicle.id}
                    onClick={() => onOpenArchivalDocument(chronicleToBiographyFigure(chronicle))}
                    className="p-4 rounded-xl bg-black/50 border border-[#d4af37]/30 hover:border-[#d4af37] transition-all cursor-pointer group flex flex-col justify-between space-y-2.5 shadow hover:shadow-lg"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1 text-[11px]">
                        <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-[10px]">
                          เรื่องที่ {chronicle.storyNumber}/๑๐๐
                        </span>
                        <span className="text-gray-400 font-mono text-[10px]">
                          {chronicle.era.split(' ')[0]}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#d4af37] transition-colors font-serif">
                        {chronicle.shortTitle}
                      </h4>

                      <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                        {chronicle.summary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-[#d4af37]">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 border border-[#d4af37]/30">
                        {chronicle.royalSeal}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-medium group-hover:translate-x-1 transition-transform">
                        <span>อ่านฉบับเต็ม</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#141416] border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>บันทึกประวัติศาสตร์รับรองโดยระบบจดหมายเหตุสากล (ขั้นต่ำ ๕๐ หน้า)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenFull50PageChronicleBook}
              disabled={isLoadingWiki}
              className="text-[#d4af37] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>เปิดอ่านประวัติศาสตร์ชาติ ๕๐ หน้า</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
