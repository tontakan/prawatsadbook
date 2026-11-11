import React, { useState } from 'react';
import { 
  Clock, BookMarked, Globe, History, BookOpen, ChevronRight, 
  Sparkles, Scroll, Award, Loader2, ArrowRight, Bookmark,
  Layers, Compass, Crown
} from 'lucide-react';
import { ViewMode, BiographyFigure, CountryData } from '../types';
import { COUNTRIES_DATA } from '../data/countriesData';
import { ROYAL_CHRONICLES_100 } from '../data/royalChroniclesData';
import { HISTORICAL_ERAS } from '../data/historicalErasData';
import { getJapan100ChroniclesDocument } from '../data/japanChroniclesData';
import { fetchWikiFullArticle, formatCountryInto50PageChronicleBook } from '../services/wikipediaService';

interface HomeChroniclesViewProps {
  onChangeView: (view: ViewMode) => void;
  onOpenArchivalDocument: (doc: BiographyFigure) => void;
  historyMediaCount: number;
  booksMediaCount: number;
}

export const HomeChroniclesView: React.FC<HomeChroniclesViewProps> = ({
  onChangeView,
  onOpenArchivalDocument,
  historyMediaCount,
  booksMediaCount,
}) => {
  const [loadingCountryId, setLoadingCountryId] = useState<string | null>(null);

  // Featured 50+ page countries
  const featuredCountryIds = ['japan', 'thailand', 'china', 'united-kingdom', 'united-states', 'france'];
  const featuredCountries = COUNTRIES_DATA.filter(c => featuredCountryIds.includes(c.id));

  // Handle direct opening of 50-page country chronicles
  const handleOpenCountry50Page = async (country: CountryData) => {
    setLoadingCountryId(country.id);
    try {
      if (country.id === 'japan' || country.code === 'jp') {
        const japanDoc = getJapan100ChroniclesDocument();
        onOpenArchivalDocument(japanDoc);
        return;
      }

      let article = null;
      try {
        article = await fetchWikiFullArticle(country.wikiTitle || country.nameTh, 'th');
      } catch (e) {
        article = await fetchWikiFullArticle(country.nameEn, 'en');
      }

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
        article,
        []
      );

      onOpenArchivalDocument(bookDoc);
    } catch (err) {
      console.error('Error generating country 50-page document:', err);
      const fallbackDoc = formatCountryInto50PageChronicleBook(
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
        []
      );
      onOpenArchivalDocument(fallbackDoc);
    } finally {
      setLoadingCountryId(null);
    }
  };

  return (
    <div className="space-y-10 fade-in">
      
      {/* ============================================================== */}
      {/* 1. HERO HEADER: หอพระราชพงศาวดารและจดหมายเหตุหลวง                 */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c1813] via-[#241f17] to-[#120f0b] border border-[#d4af37]/40 p-6 sm:p-8 lg:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] text-xs font-mono font-semibold tracking-wide">
            <Crown className="w-3.5 h-3.5" />
            <span>หอพระราชพงศาวดารและจดหมายเหตุหลวง • สมุดไทยฉบับหลวง</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-cinzel gold-gradient tracking-wide leading-tight">
              คลังประวัติศาสตร์ชาติและพงศาวดาร
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 max-w-3xl leading-relaxed">
              บันทึกประวัติศาสตร์ฉบับละเอียด ขั้นต่ำ ๕๐ ถึง ๑๐๐ หน้าบริบูรณ์ รวบรวมทุกประเทศทั่วโลกและเรื่องราวยุคสมัยตั้งแต่ยุคหิน ยุคก่อนประวัติศาสตร์ จนถึงปัจจุบัน เรียบเรียงใหม่จากคลังวิกิพีเดียสากลและจดหมายเหตุชั้นต้น
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => handleOpenCountry50Page(COUNTRIES_DATA.find(c => c.id === 'japan') || COUNTRIES_DATA[0])}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#d4af37] to-[#b38f2a] text-black font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              {loadingCountryId === 'japan' ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <BookOpen className="w-4 h-4" />
              )}
              <span>เปิดอ่านพงศาวดารญี่ปุ่น ๑๐๐ หน้าบริบูรณ์</span>
            </button>

            <button
              onClick={() => onChangeView('หนังสือ')}
              className="px-4 py-2.5 rounded-2xl bg-black/50 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4" />
              <span>ประวัติศาสตร์ชาติทุกประเทศทั่วโลก (๑๐๖+ ชาติ)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. THE 4 PORTAL CARDS (การ์ดตัวนี้ - จากรูปภาพที่ผู้ใช้แจ้ง)        */}
      {/* ============================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#d4af37]/20 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#d4af37]" />
            <h2 className="text-base sm:text-lg font-bold font-cinzel text-[#d4af37]">
              หมวดหมู่หลักในคลังประวัติศาสตร์
            </h2>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">๔ หน้าหลัก</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: วิดีโอประวัติศาสตร์ */}
          <div
            onClick={() => onChangeView('ประวัติศาสตร์')}
            className="group p-5 rounded-2xl bg-[#1a1714] border border-[#d4af37]/30 hover:border-[#d4af37] transition-all cursor-pointer shadow-lg space-y-2 text-white hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#d4af37] font-semibold">หน้าแยก ๑</span>
              <Clock className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
            </div>
            <h3 className="font-bold text-white group-hover:text-[#d4af37] transition-colors">
              วิดีโอประวัติศาสตร์
            </h3>
            <p className="text-xs text-gray-400 line-clamp-2">
              สารคดีและคลิปประวัติศาสตร์แบบเต็มหน้า แยกเฉพาะวิดีโอ {historyMediaCount} รายการ
            </p>
            <div className="flex items-center gap-1 text-xs text-[#d4af37] font-medium pt-1">
              <span>เข้าสู่หน้าวิดีโอ</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: หนังสือ & พงศาวดาร */}
          <div
            onClick={() => onChangeView('หนังสือ')}
            className="group p-5 rounded-2xl bg-[#14171a] border border-[#d4af37]/30 hover:border-[#d4af37] transition-all cursor-pointer shadow-lg space-y-2 text-white hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#d4af37] font-semibold">หน้าแยก ๒</span>
              <BookMarked className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-white group-hover:text-[#d4af37] transition-colors">
              หนังสือ & พงศาวดาร
            </h3>
            <p className="text-xs text-gray-400 line-clamp-2">
              พงศาวดาร ๑๐๐ เรื่องราว และหนังสือ PDF จาก Google Drive
            </p>
            <div className="flex items-center gap-1 text-xs text-[#d4af37] font-medium pt-1">
              <span>เข้าสู่หน้าหนังสือ</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: ประวัติศาสตร์ประเทศ */}
          <div
            onClick={() => onChangeView('หนังสือ')}
            className="group p-5 rounded-2xl bg-[#141a16] border border-[#d4af37]/30 hover:border-[#d4af37] transition-all cursor-pointer shadow-lg space-y-2 text-white hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#d4af37] font-semibold">หน้าแยก ๓</span>
              <Globe className="w-5 h-5 text-emerald-400 group-hover:rotate-45 transition-transform" />
            </div>
            <h3 className="font-bold text-white group-hover:text-[#d4af37] transition-colors">
              ประวัติศาสตร์ประเทศ
            </h3>
            <p className="text-xs text-gray-400 line-clamp-2">
              ปฐมรากฐาน ยุคทอง สงคราม และการสร้างชาติของทุกประเทศทั่วโลก (หน้าละ ๒๐ ประเทศ มีถัดไป/ย้อนกลับ ๕๐+ หน้า)
            </p>
            <div className="flex items-center gap-1 text-xs text-[#d4af37] font-medium pt-1">
              <span>เข้าสู่หน้าประเทศทั่วโลก</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: เรื่องราวยุคสมัย */}
          <div
            onClick={() => onChangeView('eras')}
            className="group p-5 rounded-2xl bg-[#1d1624] border border-[#d4af37]/30 hover:border-[#d4af37] transition-all cursor-pointer shadow-lg space-y-2 text-white hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#d4af37] font-semibold">หน้าแยก ๔ (ใหม่)</span>
              <History className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="font-bold text-white group-hover:text-[#d4af37] transition-colors">
              เรื่องราวยุคสมัย
            </h3>
            <p className="text-xs text-gray-400 line-clamp-2">
              ยุคหิน ยุคก่อนประวัติศาสตร์ สุโขทัย อยุธยา ธนบุรี รัตนโกสินทร์ กรีก โรมัน และสงครามโลก
            </p>
            <div className="flex items-center gap-1 text-xs text-[#d4af37] font-medium pt-1">
              <span>เข้าสู่หน้าเรื่องราวยุคสมัย</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. "ขอแบบละเอียด 50 หน้า" - FEATURED 50-PAGE NATIONAL CHRONICLES */}
      {/* ============================================================== */}
      <div className="space-y-5 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d4af37]/20 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Scroll className="w-5 h-5 text-[#d4af37]" />
              <h2 className="text-lg sm:text-xl font-bold font-cinzel text-[#d4af37]">
                พระราชพงศาวดารและประวัติศาสตร์ชาติ (ฉบับพิสดาร ๕๐+ ถึง ๑๐๐ หน้า)
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              เปิดอ่านสมุดไทยประวัติศาสตร์ฉบับละเอียด ขั้นต่ำ ๕๐ หน้า เรียบเรียงจากสารานุกรมและคลังจดหมายเหตุสากล
            </p>
          </div>

          <button
            onClick={() => onChangeView('หนังสือ')}
            className="text-xs text-[#d4af37] hover:underline flex items-center gap-1 font-medium cursor-pointer self-start sm:self-auto"
          >
            <span>ดูครบทุกประเทศทั่วโลก ({COUNTRIES_DATA.length} ประเทศ)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Featured Country Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featuredCountries.map((country) => {
            const isLoading = loadingCountryId === country.id;
            const isJapan = country.id === 'japan';

            return (
              <div
                key={country.id}
                className="group rounded-2xl bg-[#171512] border border-[#d4af37]/30 hover:border-[#d4af37] p-5 flex flex-col justify-between space-y-4 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="space-y-3">
                  {/* Top Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
                        alt={country.nameEn}
                        className="w-7 h-5 object-cover rounded shadow border border-white/10"
                        loading="lazy"
                      />
                      <div>
                        <h3 className="font-bold text-white group-hover:text-[#d4af37] transition-colors text-sm sm:text-base">
                          {country.nameTh}
                        </h3>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {country.nameEn} • {country.capital}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4af37]/15 text-[#d4af37] font-semibold border border-[#d4af37]/30">
                      {isJapan ? '๑๐๐ หน้าบริบูรณ์' : '๕๐+ หน้า'}
                    </span>
                  </div>

                  {/* Overview excerpt */}
                  <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">
                    {country.overview}
                  </p>

                  {/* Leaders */}
                  <div className="text-[11px] text-gray-400">
                    <span className="text-[#d4af37] font-medium">บุคคล/ผู้นำสำคัญ: </span>
                    <span>{country.famousLeaders.slice(0, 3).join(', ')}</span>
                  </div>
                </div>

                {/* 1-Click Action to Open 50+ Page Book */}
                <button
                  onClick={() => handleOpenCountry50Page(country)}
                  disabled={isLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#d4af37]/20 via-[#d4af37]/30 to-[#d4af37]/20 hover:from-[#d4af37] hover:to-[#b38f2a] text-[#d4af37] hover:text-black border border-[#d4af37]/50 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-95 disabled:opacity-50"
                  title={`เปิดอ่านประวัติศาสตร์ชาติ ${country.nameTh} ฉบับละเอียด ๕๐+ หน้า`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>กำลังจัดเตรียมสมุดไทย ๕๐+ หน้า...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>
                        {isJapan ? 'เปิดอ่านพงศาวดารญี่ปุ่น ๑๐๐ หน้า' : `เปิดอ่านสมุดไทย ๕๐+ หน้า (${country.nameTh})`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Global Navigation CTA */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-black/60 via-[#1c1813] to-black/60 border border-[#d4af37]/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
          <div className="space-y-1">
            <h4 className="font-bold text-sm sm:text-base text-white">
              ต้องการอ่านประวัติศาสตร์ชาติของประเทศอื่นเพิ่มเติม?
            </h4>
            <p className="text-xs text-gray-400">
              ระบบรวบรวมไว้กว่า ๑๐๖+ ประเทศทั่วทุกทวีป จัดแสดงหน้าละ ๒๐ ประเทศ มีระบบถัดไปและย้อนกลับ พร้อมดึงข้อมูลจากวิกิพีเดียสากล
            </p>
          </div>

          <button
            onClick={() => onChangeView('หนังสือ')}
            className="px-4 py-2 rounded-xl bg-[#d4af37] hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0"
          >
            <Globe className="w-4 h-4" />
            <span>ไปที่หน้าประวัติศาสตร์ประเทศ</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
