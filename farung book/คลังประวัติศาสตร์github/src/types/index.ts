export interface MediaItem {
  id: string;
  category: string;
  title: string;
  url: string;
  sourceType?: 'youtube' | 'drive' | 'pdf' | 'web';
  description?: string;
  thumbnail?: string;
  addedAt?: string;
}

export interface CountryHistoryChapter {
  chapterNumber: number;
  title: string;
  period: string;
  content: string;
  keyEvents: string[];
}

export interface CountryData {
  id: string;
  nameTh: string;
  nameEn: string;
  code: string; // ISO 2-letter code for flags (e.g. 'th', 'jp')
  continent: 'เอเชีย' | 'ยุโรป' | 'อเมริกาเหนือ' | 'อเมริกาใต้' | 'แอฟริกา' | 'โอเชียเนีย' | 'ตะวันออกกลาง';
  capital: string;
  population: string;
  era: string;
  overview: string;
  flagUrl?: string;
  wikiTitle: string;
  historyChapters: CountryHistoryChapter[];
  famousLeaders: string[];
  historicalHighlights: string[];
}

export interface BiographyPage {
  pageNumber: number;
  chapterTitle: string;
  subTitle?: string;
  periodOrEra?: string;
  paragraphs: string[];
  quote?: string;
  archivalNotes?: string;
}

export interface BiographyFigure {
  id: string;
  nameTh: string;
  nameEn: string;
  period: string;
  nationality: string;
  role: string;
  category: 
    | 'กษัตริย์และผู้นำไทย' 
    | 'รัฐบุรุษและนักคิดไทย' 
    | 'ผู้นำและจักรพรรดิโลก' 
    | 'นักวิทยาศาสตร์และนักประดิษฐ์' 
    | 'นักปรัชญาและผู้นำจิตวิญญาณ' 
    | 'ศิลปินและกวีเอกของโลก' 
    | 'วีรชนและผู้ต่อสู้เพื่อสันติภาพ';
  avatar?: string;
  quote: string;
  keyAchievements: string[];
  summary: string;
  wikiTitle?: string;
  pages: BiographyPage[]; // Guaranteed at least 10 pages for comprehensive document reading
}

export type ViewMode = 
  | 'all' 
  | 'ประวัติศาสตร์' 
  | 'หนังสือ' 
  | 'biographies' 
  | 'favorite'
  | 'eras';

export interface ReaderSettings {
  fontSize: 9 | 11 | 13 | 15; // 9px required by user
  theme: 'newspaper' | 'newspaper-dark' | 'sepia';
  columns: 1 | 2;
  speechRate: number;
}
