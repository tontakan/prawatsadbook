import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, BookOpen, Star, Clock, Layers, Globe, Users, 
  Search, ExternalLink, ChevronRight, ChevronLeft, Bookmark, Sparkles,
  Info, ShieldCheck, RefreshCw, X, Filter, BookMarked, Film,
  Scroll, Award, ArrowRight, ArrowLeft, History, SlidersHorizontal, LayoutGrid
} from 'lucide-react';
import { MediaItem, CountryData, BiographyFigure, ViewMode } from './types';
import { 
  INITIAL_HISTORY_VIDEOS, 
  INITIAL_BOOKS, 
  INITIAL_COUNTRY_MEDIA,
  parseCSV, 
  normalizeSheetCsvUrl,
  extractYouTubeThumbnail,
  DEFAULT_CSV_HISTORY_URL,
  DEFAULT_CSV_BOOKS_URL,
  DEFAULT_CSV_COUNTRIES_URL
} from './data/defaultMedia';
import { COUNTRIES_DATA } from './data/countriesData';
import { CURATED_BIOGRAPHIES, NOTABLE_1000_DIRECTORY, FigureDirectoryItem } from './data/biographiesData';
import { ROYAL_CHRONICLES_100, chronicleToBiographyFigure } from './data/royalChroniclesData';
import { HISTORICAL_ERAS, HistoricalEra } from './data/historicalErasData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { VideoCategorySliderRow } from './components/VideoCategorySliderRow';
import { BookCategorySliderRow } from './components/BookCategorySliderRow';
import { VideoPlayerOverlay } from './components/VideoPlayerOverlay';
import { CountryHistoryModal } from './components/CountryHistoryModal';
import { BiographiesView } from './components/BiographiesView';
import { HomeChroniclesView } from './components/HomeChroniclesView';
import { ArchivalDocumentReader } from './components/ArchivalDocumentReader';
import { EraReaderModal } from './components/EraReaderModal';
import { UnifiedSearchResultsOverlay } from './components/UnifiedSearchResultsOverlay';
import { FavoritesModal } from './components/FavoritesModal';
import { FloatingAiAssistant } from './components/FloatingAiAssistant';
import { AppTheme } from './components/ThemeSelector';
import { FastVideoCard } from './components/FastVideoCard';
import { BookWebviewModal } from './components/BookWebviewModal';
import { WikiPdfReaderModal } from './components/WikiPdfReaderModal';
import { fetchWikiFullArticle, formatWikiInto10PageBook } from './services/wikipediaService';

export default function App() {
  // Theme state: Default is "light" (โทนสว่าง) as requested!
  const [theme, setTheme] = useState<AppTheme>(() => {
    return (localStorage.getItem('app_theme') as AppTheme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    document.body.className = `theme-${theme} font-kanit antialiased transition-colors duration-200`;
  }, [theme]);

  // Data states (Videos and Books)
  const [historyMedia, setHistoryMedia] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('hist_media_cache');
    return saved ? JSON.parse(saved) : INITIAL_HISTORY_VIDEOS;
  });

  const [booksMedia, setBooksMedia] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('books_media_cache');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].id?.startsWith('book-1')) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_BOOKS;
  });

  // Dedicated Country History Media loaded exclusively from its own Google Sheets CSV
  const [countriesMedia, setCountriesMedia] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('countries_media_cache');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 1) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_COUNTRY_MEDIA;
  });

  // Navigation states: Default is Books ('หนังสือ')
  const [currentView, setCurrentView] = useState<ViewMode>('หนังสือ');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [chronicleFilterCategory, setChronicleFilterCategory] = useState<string>('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isFavoritesModalOpen, setIsFavoritesModalOpen] = useState<boolean>(false);
  const [videoLayoutMode, setVideoLayoutMode] = useState<'slider' | 'grid'>('slider');
  
  // Local In-Page Search & Layout States
  const [booksSearchQuery, setBooksSearchQuery] = useState<string>('');
  const [booksLayoutMode, setBooksLayoutMode] = useState<'slider' | 'grid'>('slider');
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>('');

  // Overlay states
  const [activeVideo, setActiveVideo] = useState<MediaItem | null>(null);
  const [videoPlaylist, setVideoPlaylist] = useState<MediaItem[]>([]);
  const [activeCountry, setActiveCountry] = useState<CountryData | null>(null);
  const [activeArchivalDoc, setActiveArchivalDoc] = useState<BiographyFigure | null>(null);
  const [activeWikiPdfDoc, setActiveWikiPdfDoc] = useState<BiographyFigure | null>(null);
  const [activeEra, setActiveEra] = useState<HistoricalEra | null>(null);
  const [activeWebviewBook, setActiveWebviewBook] = useState<MediaItem | null>(null);

  // CSV Configuration URLs (ตั้งค่าบน Code เท่านั้น ใน src/data/defaultMedia.ts ตามคำสั่ง)
  const csvHistoryUrl = DEFAULT_CSV_HISTORY_URL;
  const csvBooksUrl = DEFAULT_CSV_BOOKS_URL;
  const csvCountriesUrl = DEFAULT_CSV_COUNTRIES_URL;
  const [isLoadingCsv, setIsLoadingCsv] = useState<boolean>(false);

  // Favorites (Videos, Books, Countries, Biographies, Eras)
  const [favoriteItems, setFavoriteItems] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem('fav_vids');
    return saved ? JSON.parse(saved) : [];
  });
  const [favoriteCountryIds, setFavoriteCountryIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('fav_countries');
    return saved ? JSON.parse(saved) : [];
  });
  const [favoriteDocIds, setFavoriteDocIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('fav_docs');
    return saved ? JSON.parse(saved) : [];
  });
  const [favoriteEraIds, setFavoriteEraIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('fav_eras');
    return saved ? JSON.parse(saved) : [];
  });

  // References & Effect for Browser History Back Button handling
  const activeVideoRef = React.useRef(activeVideo);
  const activeWebviewBookRef = React.useRef(activeWebviewBook);
  const activeWikiPdfDocRef = React.useRef(activeWikiPdfDoc);
  const activeArchivalDocRef = React.useRef(activeArchivalDoc);
  const activeEraRef = React.useRef(activeEra);
  const activeCountryRef = React.useRef(activeCountry);
  const isFavoritesModalOpenRef = React.useRef(isFavoritesModalOpen);
  const prevModalCountRef = React.useRef(0);

  useEffect(() => {
    activeVideoRef.current = activeVideo;
    activeWebviewBookRef.current = activeWebviewBook;
    activeWikiPdfDocRef.current = activeWikiPdfDoc;
    activeArchivalDocRef.current = activeArchivalDoc;
    activeEraRef.current = activeEra;
    activeCountryRef.current = activeCountry;
    isFavoritesModalOpenRef.current = isFavoritesModalOpen;

    const currentCount = (activeVideo ? 1 : 0) +
                         (activeWebviewBook ? 1 : 0) +
                         (activeWikiPdfDoc ? 1 : 0) +
                         (activeArchivalDoc ? 1 : 0) +
                         (activeEra ? 1 : 0) +
                         (activeCountry ? 1 : 0) +
                         (isFavoritesModalOpen ? 1 : 0);

    if (currentCount > prevModalCountRef.current) {
      window.history.pushState({ readerModalOpen: true, count: currentCount }, '');
    }
    prevModalCountRef.current = currentCount;
  }, [activeVideo, activeWebviewBook, activeWikiPdfDoc, activeArchivalDoc, activeEra, activeCountry, isFavoritesModalOpen]);

  useEffect(() => {
    const handlePopState = () => {
      // If any reader/modal is open, close the topmost active one instead of exiting app
      if (activeVideoRef.current) {
        setActiveVideo(null);
      } else if (activeWebviewBookRef.current) {
        setActiveWebviewBook(null);
      } else if (activeWikiPdfDocRef.current) {
        setActiveWikiPdfDoc(null);
      } else if (activeArchivalDocRef.current) {
        setActiveArchivalDoc(null);
      } else if (activeEraRef.current) {
        setActiveEra(null);
      } else if (activeCountryRef.current) {
        setActiveCountry(null);
      } else if (isFavoritesModalOpenRef.current) {
        setIsFavoritesModalOpen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Filtered History Media for In-Page Search
  const filteredHistoryMedia = useMemo(() => {
    let list = historyMedia;
    if (videoSearchQuery.trim()) {
      const q = videoSearchQuery.toLowerCase().trim();
      list = list.filter(item => 
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [historyMedia, videoSearchQuery]);

  // Group media into categories
  const categoriesHistory = useMemo(() => {
    const map: Record<string, MediaItem[]> = {};
    filteredHistoryMedia.forEach(item => {
      const cat = item.category || 'วิดีโอทั่วไป';
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    });
    return map;
  }, [filteredHistoryMedia]);

  // Filtered Books Media for In-Page Search
  const filteredBooksMedia = useMemo(() => {
    let list = booksMedia;
    if (booksSearchQuery.trim()) {
      const q = booksSearchQuery.toLowerCase().trim();
      list = list.filter(item => 
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
      );
    }
    return list;
  }, [booksMedia, booksSearchQuery]);

  const categoriesBooks = useMemo(() => {
    const map: Record<string, MediaItem[]> = {};
    filteredBooksMedia.forEach(item => {
      const cat = item.category || 'หนังสือทั่วไป';
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    });
    return map;
  }, [filteredBooksMedia]);

  // Categories for Countries (ประวัติศาสตร์ประเทศ) from dedicated sheet
  const categoriesCountry = useMemo(() => {
    const map: Record<string, MediaItem[]> = {};
    countriesMedia.forEach(item => {
      const cat = item.category || 'ประวัติศาสตร์ทั่วไป';
      if (!map[cat]) map[cat] = [];
      map[cat].push(item);
    });
    return map;
  }, [countriesMedia]);

  // Helper to compare if media list changed
  const isMediaListDifferent = (a: MediaItem[], b: MediaItem[]): boolean => {
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) {
      if (
        a[i].url !== b[i].url ||
        a[i].title !== b[i].title ||
        a[i].thumbnail !== b[i].thumbnail ||
        a[i].category !== b[i].category
      ) {
        return true;
      }
    }
    return false;
  };

  const isValidCsvContent = (txt: string): boolean => {
    if (!txt || txt.trim().length < 5) return false;
    const trimmed = txt.trim().toLowerCase();
    if (trimmed.startsWith('<!doctype') || trimmed.startsWith('<html') || trimmed.includes('errormessage') || trimmed.includes('找不到網頁')) {
      return false;
    }
    return true;
  };

  // Helper to safely fetch CSV with robust multi-proxy fallback and cache busting
  const fetchCsvText = async (targetUrl: string): Promise<string | null> => {
    if (!targetUrl || !targetUrl.trim()) return null;
    const normalized = normalizeSheetCsvUrl(targetUrl);
    const bustParam = `_t=${Date.now()}&_rnd=${Math.random().toString(36).substring(2, 7)}`;
    const cacheBustedUrl = normalized + (normalized.includes('?') ? '&' : '?') + bustParam;

    // 1. Direct fetch with cache-busting
    try {
      const res = await fetch(cacheBustedUrl, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (res.ok) {
        const text = await res.text();
        if (isValidCsvContent(text)) return text;
      }
    } catch (e) {
      // ignore & try proxies
    }

    // 2. AllOrigins raw proxy
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(cacheBustedUrl)}`;
      const res2 = await fetch(proxyUrl, { cache: 'no-store' });
      if (res2.ok) {
        const text = await res2.text();
        if (isValidCsvContent(text)) return text;
      }
    } catch (e2) {
      // ignore
    }

    // 3. Corsproxy.io
    try {
      const proxyUrl3 = `https://corsproxy.io/?url=${encodeURIComponent(cacheBustedUrl)}`;
      const res3 = await fetch(proxyUrl3, { cache: 'no-store' });
      if (res3.ok) {
        const text = await res3.text();
        if (isValidCsvContent(text)) return text;
      }
    } catch (e3) {
      // ignore
    }

    return null;
  };

  const loadCustomCsv = async (histUrl: string, bUrl: string, countrUrl?: string, isSilent: boolean = false) => {
    const cUrl = countrUrl !== undefined ? countrUrl : csvCountriesUrl;
    if (!isSilent) setIsLoadingCsv(true);
    try {
      if (cUrl) {
        const text = await fetchCsvText(cUrl);
        if (text) {
          const parsed = parseCSV(text, 'ประวัติศาสตร์');
          if (parsed.length > 0) {
            setCountriesMedia(prev => {
              if (isMediaListDifferent(prev, parsed)) {
                localStorage.setItem('countries_media_cache', JSON.stringify(parsed));
                return parsed;
              }
              return prev;
            });
          }
        }
      }
      if (bUrl) {
        const text = await fetchCsvText(bUrl);
        if (text) {
          const parsed = parseCSV(text, 'คลังหนังสือ');
          if (parsed.length > 0) {
            setBooksMedia(prev => {
              if (isMediaListDifferent(prev, parsed)) {
                localStorage.setItem('books_media_cache', JSON.stringify(parsed));
                return parsed;
              }
              return prev;
            });
          }
        }
      }
      if (histUrl) {
        const text = await fetchCsvText(histUrl);
        if (text) {
          const parsed = parseCSV(text, 'วิดีโอประวัติศาสตร์');
          if (parsed.length > 0) {
            setHistoryMedia(prev => {
              if (isMediaListDifferent(prev, parsed)) {
                localStorage.setItem('hist_media_cache', JSON.stringify(parsed));
                return parsed;
              }
              return prev;
            });
          }
        }
      }
    } catch (err) {
      console.warn('Could not sync CSV in real time:', err);
    } finally {
      if (!isSilent) setIsLoadingCsv(false);
    }
  };

  // Real-time synchronization: sync on mount, polling every 6s, and on focus / visibility change
  useEffect(() => {
    // 1. Initial load
    if (csvHistoryUrl || csvBooksUrl || csvCountriesUrl) {
      loadCustomCsv(csvHistoryUrl, csvBooksUrl, csvCountriesUrl, false);
    }

    // 2. Continuous real-time polling every 30 seconds
    const intervalId = setInterval(() => {
      loadCustomCsv(csvHistoryUrl, csvBooksUrl, csvCountriesUrl, true);
    }, 30000);

    // 3. Instant sync when user switches back to this tab
    const handleSyncOnVisible = () => {
      if (document.visibilityState === 'visible') {
        loadCustomCsv(csvHistoryUrl, csvBooksUrl, csvCountriesUrl, true);
      }
    };
    const handleSyncOnFocus = () => {
      loadCustomCsv(csvHistoryUrl, csvBooksUrl, csvCountriesUrl, true);
    };

    document.addEventListener('visibilitychange', handleSyncOnVisible);
    window.addEventListener('focus', handleSyncOnFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleSyncOnVisible);
      window.removeEventListener('focus', handleSyncOnFocus);
    };
  }, [csvHistoryUrl, csvBooksUrl, csvCountriesUrl]);

  // Helper to scroll video category row horizontally
  const scrollVideoCategoryRow = (catKey: string, direction: 'left' | 'right') => {
    const el = document.getElementById(`video-cat-row-${catKey}`);
    if (el) {
      el.scrollBy({ left: direction === 'left' ? -380 : 380, behavior: 'smooth' });
    }
  };

  // Helper for YouTube ID
  const getYTId = (url: string): string | null => {
    if (!url || url.includes('google.com')) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = match ? match[2] : null;
    return id && id.substring(0, 11).length === 11 ? id.substring(0, 11) : null;
  };

  // Helper for Drive Thumbnails
  const getDriveThumb = (url: string): string | null => {
    if (!url || !url.includes('google.com')) return null;
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w600`;
    }
    return null;
  };

  const handleOpenBook = (item: MediaItem) => {
    setActiveWebviewBook(item);
  };

  const handleOpenItem = (item: MediaItem, playlist: MediaItem[] = []) => {
    const isYoutube = item.url.includes('youtube.com') || item.url.includes('youtu.be') || item.sourceType === 'youtube';
    const isDriveVideo = item.url.includes('drive.google.com') || item.url.includes('docs.google.com') || item.sourceType === 'drive';
    const isDirectMedia = item.url.includes('.mp4') || item.url.includes('.webm');
    const isVideo = isYoutube || isDriveVideo || isDirectMedia;

    if (isVideo) {
      setActiveVideo(item);
      setVideoPlaylist(playlist && playlist.length > 0 ? playlist : [item]);
    } else {
      setActiveWebviewBook(item);
    }
  };

  // Toggle favorites
  const toggleMediaFavorite = (item: MediaItem) => {
    const idx = favoriteItems.findIndex(f => f.url === item.url);
    let updated = [];
    if (idx > -1) {
      updated = favoriteItems.filter(f => f.url !== item.url);
    } else {
      updated = [...favoriteItems, item];
    }
    setFavoriteItems(updated);
    localStorage.setItem('fav_vids', JSON.stringify(updated));
  };

  const toggleCountryFavorite = (country: CountryData) => {
    let updated = [];
    if (favoriteCountryIds.includes(country.id)) {
      updated = favoriteCountryIds.filter(id => id !== country.id);
    } else {
      updated = [...favoriteCountryIds, country.id];
    }
    setFavoriteCountryIds(updated);
    localStorage.setItem('fav_countries', JSON.stringify(updated));
  };

  const toggleDocFavorite = (figure: BiographyFigure) => {
    let updated = [];
    if (favoriteDocIds.includes(figure.id)) {
      updated = favoriteDocIds.filter(id => id !== figure.id);
    } else {
      updated = [...favoriteDocIds, figure.id];
    }
    setFavoriteDocIds(updated);
    localStorage.setItem('fav_docs', JSON.stringify(updated));
  };

  const toggleEraFavorite = (era: HistoricalEra) => {
    let updated = [];
    if (favoriteEraIds.includes(era.id)) {
      updated = favoriteEraIds.filter(id => id !== era.id);
    } else {
      updated = [...favoriteEraIds, era.id];
    }
    setFavoriteEraIds(updated);
    localStorage.setItem('fav_eras', JSON.stringify(updated));
  };

  // Page switcher (Optimized with startTransition for instant 0ms tab switching)
  const handleChangeView = (view: ViewMode) => {
    React.startTransition(() => {
      setCurrentView(view);
    });
    setSelectedCategory(null);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Total favorites count for header badge
  const totalFavoritesCount = favoriteItems.length + favoriteCountryIds.length + favoriteDocIds.length + favoriteEraIds.length;

  // Favorited figures list for modal
  const allChronicleFigures = useMemo(() => {
    return ROYAL_CHRONICLES_100.map(chronicleToBiographyFigure);
  }, []);

  const favoritedFiguresList = useMemo(() => {
    const combined = [...CURATED_BIOGRAPHIES, ...allChronicleFigures];
    return combined.filter(f => favoriteDocIds.includes(f.id));
  }, [favoriteDocIds, allChronicleFigures]);

  const favoritedCountriesList = useMemo(() => {
    return COUNTRIES_DATA.filter(c => favoriteCountryIds.includes(c.id));
  }, [favoriteCountryIds]);

  const favoritedErasList = useMemo(() => {
    return HISTORICAL_ERAS.filter(e => favoriteEraIds.includes(e.id));
  }, [favoriteEraIds]);

  // UNIFIED GLOBAL SEARCH AGGREGATION ("ค้นหารวมแต่แยก หัวเรื่อง")
  const unifiedSearchData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      return {
        figures: [],
        videos: [],
        booksAndChronicles: [],
        countries: [],
        eras: []
      };
    }

    // 1. Figures
    const matchingFigures = CURATED_BIOGRAPHIES.filter(f => 
      f.nameTh.toLowerCase().includes(q) ||
      f.nameEn.toLowerCase().includes(q) ||
      f.role.toLowerCase().includes(q) ||
      f.nationality.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    );

    // Also match notable 1000 directory figures
    const matchingDirectoryFigures = NOTABLE_1000_DIRECTORY.filter(item => 
      item.nameTh.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q) ||
      item.role.toLowerCase().includes(q) ||
      item.nationality.toLowerCase().includes(q)
    ).slice(0, 10).map(item => ({
      id: item.id,
      nameTh: item.nameTh,
      nameEn: item.nameEn,
      period: item.period,
      nationality: item.nationality,
      role: item.role,
      category: 'กษัตริย์และผู้นำไทย' as const,
      avatar: item.avatar,
      quote: `บุคคลสำคัญในประวัติศาสตร์: ${item.nameTh}`,
      keyAchievements: [item.role, item.period],
      summary: `${item.nameTh} (${item.nameEn}) - ${item.role} แห่ง${item.nationality}`,
      wikiTitle: item.wikiTitle,
      pages: []
    }));

    // 2. Videos (from Video sheet and Country sheet)
    const allVideos = [
      ...historyMedia,
      ...countriesMedia.filter(c => c.url.includes('youtube.com') || c.url.includes('youtu.be') || c.sourceType === 'youtube')
    ];
    const matchingVideos = allVideos.filter(v =>
      v.title.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q)
    );

    // 3. Books & Royal Chronicles
    const matchingChronicles = allChronicleFigures.filter(c =>
      c.nameTh.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.period.toLowerCase().includes(q)
    );
    const allBooks = [
      ...booksMedia,
      ...countriesMedia.filter(c => !c.url.includes('youtube.com') && !c.url.includes('youtu.be') && c.sourceType !== 'youtube')
    ];
    const matchingBooks = allBooks.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );

    // 4. Countries
    const matchingCountries = COUNTRIES_DATA.filter(c =>
      c.nameTh.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      c.continent.toLowerCase().includes(q) ||
      c.capital.toLowerCase().includes(q) ||
      c.overview.toLowerCase().includes(q) ||
      c.famousLeaders.some(l => l.toLowerCase().includes(q))
    );

    // 5. Eras
    const matchingEras = HISTORICAL_ERAS.filter(e =>
      e.nameTh.toLowerCase().includes(q) ||
      e.nameEn.toLowerCase().includes(q) ||
      e.periodTh.toLowerCase().includes(q) ||
      e.tagline.toLowerCase().includes(q) ||
      e.overviewStory.toLowerCase().includes(q)
    );

    return {
      figures: [...matchingFigures, ...matchingDirectoryFigures],
      videos: matchingVideos,
      booksAndChronicles: [...matchingChronicles, ...matchingBooks],
      countries: matchingCountries,
      eras: matchingEras
    };
  }, [searchQuery, historyMedia, booksMedia, allChronicleFigures]);

  // Quick helper to open any figure even if from directory (load 10-page wiki article)
  const handleOpenSearchFigure = async (fig: BiographyFigure) => {
    if (fig.pages && fig.pages.length > 0) {
      setActiveArchivalDoc(fig);
    } else {
      try {
        const article = await fetchWikiFullArticle(fig.wikiTitle || fig.nameTh, 'th');
        if (article) {
          const bookFigure = formatWikiInto10PageBook(
            article.title,
            article.sections,
            article.extract,
            article.thumbnail
          );
          setActiveArchivalDoc(bookFigure);
        } else {
          setActiveArchivalDoc(fig);
        }
      } catch (err) {
        setActiveArchivalDoc(fig);
      }
    }
  };

  return (
    <div id="root-archive" className={`min-h-screen theme-${theme} pb-24 md:pb-12 flex flex-col font-kanit transition-colors duration-200`}>
      
      {/* ============================================================== */}
      {/* TOP HEADER BAR (Single unified search bar, no bottom duplicates) */}
      {/* ============================================================== */}
      <Header
        onToggleSidebar={() => setIsSidebarOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentView={currentView}
        onChangeView={handleChangeView}
        onOpenFavorites={() => setIsFavoritesModalOpen(true)}
        favoritesCount={totalFavoritesCount}
        currentTheme={theme}
        onChangeTheme={setTheme}
      />

      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        categoriesHistory={Object.keys(categoriesHistory)}
        categoriesBooks={Object.keys(categoriesBooks)}
        categoriesCountries={Object.keys(categoriesCountry)}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        currentView={currentView}
        onChangeView={handleChangeView}
      />

      {/* ============================================================== */}
      {/* UNIFIED GLOBAL SEARCH OVERLAY ("ค้นหารวมแต่แยก หัวเรื่อง")       */}
      {/* ============================================================== */}
      {searchQuery.trim().length > 0 && (
        <UnifiedSearchResultsOverlay
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
          figures={unifiedSearchData.figures}
          videos={unifiedSearchData.videos}
          booksAndChronicles={unifiedSearchData.booksAndChronicles}
          countries={unifiedSearchData.countries}
          eras={unifiedSearchData.eras}
          onOpenFigure={handleOpenSearchFigure}
          onOpenVideo={(vid) => handleOpenItem(vid, historyMedia)}
          onOpenCountry={(c) => setActiveCountry(c)}
          onOpenEra={(era) => setActiveEra(era)}
        />
      )}

      {/* Main Content Area - Separated Distinct Pages */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Active Filter Banner (if filtering category) */}
        {selectedCategory && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-[#d4af37]/40 flex items-center justify-between gap-3 text-xs shadow-lg">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#d4af37]" />
              <span className="font-semibold text-[#d4af37]">
                กำลังกรองหมวดหมู่: "{selectedCategory}"
              </span>
            </div>
            <button
              onClick={() => setSelectedCategory(null)}
              className="p-1.5 rounded-lg bg-black/40 text-[#d4af37] hover:bg-[#d4af37] hover:text-black transition-all border border-[#d4af37]/30 cursor-pointer"
              title="ล้างตัวกรอง"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* หน้าหลัก: คลังหนังสืออิเล็กทรอนิกส์ (โหลดจากชีต Google Sheets CSV) */}
        {/* "ปรับหน้าหลัก เป็นหน้าหนังสือ หนังสือโหลด ลิงก์ปก จากชีต และเปิดอ่านแบบ webview ดึงจาก คอลัม ลิงก์ไฟล์ (Raw URL) หน้าหนังสือตัด พระราชพงศาวดาร ๑๐๐ เรื่องราว ออกทั้งหมดเหลือแต่หนังสือ ที่โหลดจาก csv ตามหมวดเท่านั้น ปรับหน้า ประวัติศาสตร์ประเทศ อย่างอื่นตัดออก" */}
        {/* ============================================================== */}
        {/* ============================================================== */}
        {/* หน้าหลัก: หน้าหนังสือ (Books) */}
        {/* ============================================================== */}
        {/* หน้าหลัก: หน้าหนังสือ (Books) */}
        {/* ============================================================== */}
        {/* ============================================================== */}
        {/* หน้าหลัก: หน้าหนังสือ (Books) */}
        {/* ============================================================== */}
        {currentView === 'หนังสือ' && (
          <div key="books-view" className="space-y-8">
            {/* Page Header Card matching image_973aa178.png */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#14161f] border border-[#d4af37]/35 space-y-3.5 shadow-2xl">
              {/* Title & Icon Header */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-black/70 border border-[#d4af37]/60 flex items-center justify-center text-[#d4af37] shrink-0 shadow-md shadow-amber-500/10">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold font-cinzel text-white tracking-wide">
                    คลังหนังสือ
                  </h1>
                  <p className="text-xs text-[#f4e4bc]/80 mt-0.5">
                    วรรณกรรมและเอกสารรวมเรื่องราว
                  </p>
                </div>
              </div>

              {/* Layout Switcher (สไลด์ข้าง / ตาราง) */}
              <div>
                <div className="inline-flex items-center p-1 rounded-2xl bg-black/80 border border-white/10 shadow-inner">
                  <button
                    onClick={() => setBooksLayoutMode('slider')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      booksLayoutMode === 'slider'
                        ? 'bg-[#d4af37] text-black font-bold shadow'
                        : 'text-gray-300 hover:text-white'
                    }`}
                    title="สไลด์ข้างตามหมวด"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>สไลด์ข้าง</span>
                  </button>
                  <button
                    onClick={() => setBooksLayoutMode('grid')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      booksLayoutMode === 'grid'
                        ? 'bg-[#d4af37] text-black font-bold shadow'
                        : 'text-gray-300 hover:text-white'
                    }`}
                    title="ตาราง"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>ตาราง</span>
                  </button>
                </div>
              </div>

              {/* Local Search Input & Item Count Pill */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <div className="relative flex-1 min-w-[160px] max-w-xs">
                  <Search className="w-3.5 h-3.5 text-[#d4af37]/80 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={booksSearchQuery}
                    onChange={(e) => setBooksSearchQuery(e.target.value)}
                    placeholder="ค้นหาในหน้านี้..."
                    className="w-full bg-black/80 border border-[#d4af37]/40 rounded-xl py-1.5 pl-8 pr-7 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#d4af37] transition-all shadow-inner"
                  />
                  {booksSearchQuery && (
                    <button
                      onClick={() => setBooksSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      title="ล้างคำค้นหา"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <span className="px-3.5 py-1.5 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] font-bold text-xs font-mono shadow-sm flex items-center shrink-0">
                  {filteredBooksMedia.length} เล่ม
                </span>
              </div>
            </div>

            {/* Category Filter Bar */}
            {Object.keys(categoriesBooks).length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    !selectedCategory 
                      ? 'bg-[#d4af37] text-black font-bold shadow-lg shadow-amber-500/20' 
                      : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
                  }`}
                >
                  ทั้งหมด ({booksMedia.length})
                </button>
                {Object.keys(categoriesBooks).map((catName) => (
                  <button
                    key={catName}
                    onClick={() => setSelectedCategory(selectedCategory === catName ? null : catName)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      selectedCategory === catName 
                        ? 'bg-[#d4af37] text-black font-bold shadow-lg shadow-amber-500/20' 
                        : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {catName} ({categoriesBooks[catName].length})
                  </button>
                ))}
              </div>
            )}

            {/* Books by Category from CSV */}
            <div className="space-y-8">
              {Object.keys(categoriesBooks).map((catName) => {
                const items = categoriesBooks[catName];
                if (selectedCategory && catName !== selectedCategory) return null;
                if (!items || items.length === 0) return null;

                if (booksLayoutMode === 'slider') {
                  return (
                    <BookCategorySliderRow
                      key={catName}
                      categoryName={catName}
                      items={items}
                      favoriteItems={favoriteItems}
                      onOpenBook={handleOpenBook}
                      onToggleFavorite={toggleMediaFavorite}
                      onSelectCategory={setSelectedCategory}
                    />
                  );
                }

                return (
                  <div
                    key={catName}
                    className="bg-white/[0.02] border border-[#d4af37]/20 rounded-3xl p-4 sm:p-6 space-y-5 shadow-xl hover:border-[#d4af37]/40 transition-all"
                  >
                    {/* Category Title Header (matching image_5e55a7a2.png) */}
                    <div className="flex items-center justify-between border-l-4 border-[#d4af37] pl-3.5">
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-[#d4af37] font-cinzel">
                          {catName}
                        </h2>
                        <span className="text-[11px] text-[#8b6508] dark:text-[#f4e4bc]/80 font-mono font-semibold">
                          ({items.length} เล่ม)
                        </span>
                      </div>
                    </div>

                    {/* Book Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
                      {items.map((item) => {
                        const isFav = favoriteItems.some(f => f.url === item.url);
                        const hasCover = !!item.thumbnail;

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleOpenBook(item)}
                            className="group flex flex-col justify-between rounded-2xl bg-[#18181f] border border-white/10 hover:border-[#d4af37] p-2.5 sm:p-3.5 transition-all shadow-lg hover:shadow-2xl cursor-pointer"
                          >
                            <div className="space-y-3">
                              {/* Book Cover (Portrait 3:4 aspect ratio with spine shadow) */}
                              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-stone-900 border-l-4 border-l-[#d4af37]/70 border border-white/10 shadow-md group-hover:shadow-xl transition-all">
                                {hasCover ? (
                                  <>
                                    <img
                                      src={item.thumbnail}
                                      alt={item.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                    {/* Spine shadow overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20 pointer-events-none" />
                                  </>
                                ) : (
                                  <div className="w-full h-full p-4 bg-gradient-to-br from-[#1e1a14] via-[#14120f] to-[#0e0c0a] flex flex-col justify-between border border-[#d4af37]/30">
                                    <div className="flex justify-between items-start">
                                      <span className="text-[9px] uppercase tracking-wider text-[#d4af37] font-mono">
                                        BOOK
                                      </span>
                                      <BookOpen className="w-4 h-4 text-[#d4af37]/60" />
                                    </div>
                                    <div className="space-y-1 text-center py-4">
                                      <div className="w-8 h-8 mx-auto rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
                                        <BookOpen className="w-4 h-4" />
                                      </div>
                                      <p className="text-[11px] font-bold text-white line-clamp-3 leading-tight mt-2">
                                        {item.title}
                                      </p>
                                    </div>
                                    <div className="text-[8px] text-[#d4af37]/80 text-center uppercase tracking-widest font-mono">
                                      {item.category}
                                    </div>
                                  </div>
                                )}

                                {/* Hover Reader Pill */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                                  <span className="px-3 py-1.5 rounded-full bg-[#d4af37] text-black text-[11px] font-bold shadow-lg flex items-center gap-1.5 transform scale-95 group-hover:scale-100 transition-transform">
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>เปิดอ่าน</span>
                                  </span>
                                </div>

                                {/* Bookmark Favorite button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMediaFavorite(item);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-gray-300 hover:text-yellow-400 transition-all cursor-pointer z-10 shadow"
                                  title={isFav ? 'นำออกจากรายการโปรด' : 'บันทึกเป็นรายการโปรด'}
                                  aria-label="รายการโปรด"
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                </button>
                              </div>

                              {/* Book Details */}
                              <div className="space-y-1 px-1">
                                <span className="text-[10px] text-[#d4af37] font-medium block truncate">
                                  {item.category}
                                </span>
                                <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#d4af37] transition-colors line-clamp-2 leading-snug">
                                  {item.title}
                                </h3>
                              </div>
                            </div>

                            {/* Direct Open Action Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenBook(item);
                              }}
                              className="w-full mt-3 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8010] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                              title="เปิดอ่าน"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>เปิดอ่าน</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* หน้าวิดีโอ (Videos: "หน้าวิดีโอ หายเอากลับมาด้วย") */}
        {/* ============================================================== */}
        {(currentView === 'ประวัติศาสตร์' || currentView === 'all') && (
          <div key="videos-view" className="space-y-8">
            {/* Page Header matching image_973aa178.png mockup */}
            <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#14161f] border border-[#d4af37]/35 flex flex-col gap-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-black/70 border border-amber-500/60 flex items-center justify-center text-amber-400 shadow-md shrink-0">
                  <Film className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                  วิดีโอประวัติศาสตร์
                </h1>
              </div>

              {/* Layout Switcher (สไลด์ข้าง / ตาราง) */}
              <div>
                <div className="inline-flex items-center p-1 rounded-2xl bg-black/80 border border-white/10 shadow-inner">
                  <button
                    onClick={() => setVideoLayoutMode('slider')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      videoLayoutMode === 'slider'
                        ? 'bg-[#d4af37] text-black font-bold shadow'
                        : 'text-gray-300 hover:text-white'
                    }`}
                    title="สไลด์ข้างตามหมวด"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>สไลด์ข้าง</span>
                  </button>
                  <button
                    onClick={() => setVideoLayoutMode('grid')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      videoLayoutMode === 'grid'
                        ? 'bg-[#d4af37] text-black font-bold shadow'
                        : 'text-gray-300 hover:text-white'
                    }`}
                    title="ตาราง"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>ตาราง</span>
                  </button>
                </div>
              </div>

              {/* Local Search Input & Item Count Pill */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <div className="relative flex-1 min-w-[160px] max-w-xs">
                  <Search className="w-3.5 h-3.5 text-[#d4af37]/80 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={videoSearchQuery}
                    onChange={(e) => setVideoSearchQuery(e.target.value)}
                    placeholder="ค้นหาในหน้านี้..."
                    className="w-full bg-black/80 border border-[#d4af37]/40 rounded-xl py-1.5 pl-8 pr-7 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#d4af37] transition-all shadow-inner"
                  />
                  {videoSearchQuery && (
                    <button
                      onClick={() => setVideoSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      title="ล้างคำค้นหา"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <span className="px-3.5 py-1.5 rounded-xl bg-[#d4af37]/15 border border-[#d4af37]/35 text-[#d4af37] font-bold text-xs font-mono shadow-sm flex items-center shrink-0">
                  {filteredHistoryMedia.length} วิดีโอ
                </span>
              </div>
            </div>

            {/* Video Categories Filter Bar */}
            {Object.keys(categoriesHistory).length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    !selectedCategory 
                      ? 'bg-[#d4af37] text-black font-bold shadow-lg shadow-amber-500/20' 
                      : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
                  }`}
                >
                  ทั้งหมด ({historyMedia.length})
                </button>
                {Object.keys(categoriesHistory).map((catName) => (
                  <button
                    key={catName}
                    onClick={() => setSelectedCategory(selectedCategory === catName ? null : catName)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      selectedCategory === catName 
                        ? 'bg-[#d4af37] text-black font-bold shadow-lg shadow-amber-500/20' 
                        : 'bg-black/50 text-gray-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {catName} ({categoriesHistory[catName].length})
                  </button>
                ))}
              </div>
            )}

            {/* Videos Display: สไลด์ข้างตามหมวด หรือ ตาราง */}
            <div className="space-y-8">
              {Object.keys(categoriesHistory).map((catName) => {
                const items = categoriesHistory[catName];
                if (selectedCategory && catName !== selectedCategory) return null;
                if (!items || items.length === 0) return null;

                // โหมดสไลด์ข้างตามหมวด (ค่าเริ่มต้นตามคำสั่ง: "ปรับวิดีโอหมวดสไลข้างแยกหมวดแสดงวิดีโอ")
                if (videoLayoutMode === 'slider') {
                  return (
                    <VideoCategorySliderRow
                      key={catName}
                      categoryName={catName}
                      items={items}
                      allMedia={historyMedia}
                      favoriteItems={favoriteItems}
                      onOpenVideo={(item, list) => handleOpenItem(item, list)}
                      onToggleFavorite={toggleMediaFavorite}
                      onSelectCategory={(cat) => setSelectedCategory(cat)}
                    />
                  );
                }

                // โหมดตาราง (Grid fallback)
                return (
                  <div
                    key={catName}
                    className="bg-white/[0.02] border border-[#d4af37]/20 rounded-3xl p-4 sm:p-6 space-y-5 shadow-xl hover:border-[#d4af37]/40 transition-all"
                  >
                    <div className="flex items-center justify-between border-l-4 border-amber-400 pl-3.5">
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-[#f4e4bc] font-cinzel">
                          {catName}
                        </h2>
                        <span className="text-[11px] text-[#8b6508] dark:text-[#d4af37]/90 font-mono font-semibold">
                          ({items.length} วิดีโอ)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
                      {items.map((item) => {
                        const isFav = favoriteItems.some(f => f.url === item.url);
                        const ytThumb = extractYouTubeThumbnail(item.url);
                        const thumb = item.thumbnail || ytThumb;

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleOpenItem(item, historyMedia)}
                            className="group flex flex-col justify-between rounded-2xl bg-[#18181f] border border-white/10 hover:border-[#d4af37] p-3 transition-all shadow-lg hover:shadow-2xl cursor-pointer"
                          >
                            <div className="space-y-3">
                              <div className="relative aspect-video rounded-xl overflow-hidden bg-black/60 border border-white/10 group-hover:border-[#d4af37]/60 shadow transition-all">
                                {thumb ? (
                                  <img
                                    src={thumb}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#141416] text-[#d4af37]">
                                    <Film className="w-8 h-8 opacity-60 mb-1" />
                                    <span className="text-[10px] font-mono">{item.category}</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white">
                                  <Play className="w-3 h-3 text-red-400 fill-red-400" />
                                  <span>วิดีโอ</span>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMediaFavorite(item);
                                  }}
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-gray-300 hover:text-yellow-400 transition-all cursor-pointer z-10 shadow"
                                  title={isFav ? 'นำออกจากรายการโปรด' : 'บันทึกเป็นรายการโปรด'}
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                </button>

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                  <span className="p-3 rounded-full bg-[#d4af37] text-black shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                    <Play className="w-5 h-5 fill-black translate-x-0.5" />
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1 px-1">
                                <span className="text-[10px] text-amber-400/90 font-medium block truncate">
                                  {item.category}
                                </span>
                                <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#d4af37] transition-colors line-clamp-2 leading-snug">
                                  {item.title}
                                </h3>
                                {item.description && (
                                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-normal">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenItem(item, historyMedia);
                              }}
                              className="w-full mt-3 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#aa8010] text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow hover:brightness-110 active:scale-98 transition-all cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-black" />
                              <span>รับชม</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAGE: หน้าบุคคล (ทำเนียบบุคคลสำคัญ ๑,๐๐0 ท่าน)                 */}
        {/* ============================================================== */}
        {currentView === 'biographies' && (
          <div key="biographies-view" className="space-y-6">
            <BiographiesView
              onOpenArchivalDocument={(figureDoc) => setActiveWikiPdfDoc(figureDoc)}
              favorites={favoriteDocIds}
              onToggleFavorite={toggleDocFavorite}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* FAVORITES VIEW FALLBACK (if navigated directly)               */}
        {/* ============================================================== */}
        {currentView === 'favorite' && (
          <div key="favorites-view" className="space-y-8">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#201d12] via-[#2a2416] to-[#14130e] border border-[#d4af37]/40 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-black/60 border border-[#d4af37]/40 flex items-center justify-center text-yellow-400 shadow">
                  <Star className="w-6 h-6 fill-yellow-400" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-cinzel text-white">
                    หน้ารายการโปรดและจดหมายเหตุที่คุณบันทึกไว้
                  </h1>
                  <p className="text-xs text-gray-400 mt-0.5">
                    คลังวิดีโอ หนังสือ และบุคคลสำคัญที่คุณบุ๊คมาร์กไว้
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFavoritesModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:brightness-[#110] cursor-pointer shadow"
              >
                เปิดคลังโปรดฉบับเต็ม ({totalFavoritesCount})
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-16 p-8 text-center text-gray-500 text-xs border-t border-black/10 dark:border-white/5 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-[#d4af37]/90">
          <button onClick={() => handleChangeView('หนังสือ')} className="hover:underline cursor-pointer">หน้าหลัก (คลังหนังสือ)</button>
          <span>•</span>
          <button onClick={() => handleChangeView('ประวัติศาสตร์')} className="hover:underline cursor-pointer">วิดีโอ</button>
          <button onClick={() => handleChangeView('biographies')} className="hover:underline cursor-pointer">ทำเนียบบุคคล</button>
          <span>•</span>
          <button onClick={() => handleChangeView('favorite')} className="hover:underline cursor-pointer">รายการโปรด</button>
        </div>
        <p className="flex items-center justify-center gap-1">
          <span>คลังหนังสือและประวัติศาสตร์สากล</span>
        </p>
        <p>&copy; {new Date().getFullYear()} E-Books & World History Archive. All rights reserved.</p>
      </footer>

      {/* ============================================================== */}
      {/* BOTTOM NAVIGATION */}
      {/* ============================================================== */}
      <BottomNav
        currentView={currentView}
        onChangeView={handleChangeView}
      />

      {/* ============================================================== */}
      {/* FLOATING AI ASSISTANT */}
      {/* ============================================================== */}
      {(currentView === 'หนังสือ' || currentView === 'all') && 
       !activeArchivalDoc && 
       !activeCountry && 
       !activeEra && 
       !activeWebviewBook && (
        <FloatingAiAssistant />
      )}

      {/* ============================================================== */}
      {/* FAVORITES MODAL */}
      {/* ============================================================== */}
      <FavoritesModal
        isOpen={isFavoritesModalOpen}
        onClose={() => setIsFavoritesModalOpen(false)}
        favoriteFigures={favoritedFiguresList}
        favoriteVideos={favoriteItems}
        favoriteCountries={favoritedCountriesList}
        favoriteEras={favoritedErasList}
        onRemoveFigure={toggleDocFavorite}
        onRemoveVideo={toggleMediaFavorite}
        onRemoveCountry={toggleCountryFavorite}
        onRemoveEra={toggleEraFavorite}
        onOpenFigure={(fig) => setActiveArchivalDoc(fig)}
        onOpenVideo={(vid) => handleOpenItem(vid, historyMedia)}
        onOpenCountry={(c) => setActiveCountry(c)}
        onOpenEra={(era) => setActiveEra(era)}
      />

      {/* Video Overlay */}
      <VideoPlayerOverlay
        activeItem={activeVideo}
        playlist={videoPlaylist}
        onClose={() => setActiveVideo(null)}
      />

      {/* Country Detail Modal */}
      {activeCountry && (
        <CountryHistoryModal
          country={activeCountry}
          onClose={() => setActiveCountry(null)}
          onOpenArchivalDocument={(figDoc) => {
            setActiveCountry(null);
            setActiveArchivalDoc(figDoc);
          }}
          isFavorite={favoriteCountryIds.includes(activeCountry.id)}
          onToggleFavorite={toggleCountryFavorite}
        />
      )}

      {/* 10-Page Archival Newspaper Document Reader */}
      {activeArchivalDoc && (
        <ArchivalDocumentReader
          figure={activeArchivalDoc}
          onClose={() => setActiveArchivalDoc(null)}
          isFavorite={favoriteDocIds.includes(activeArchivalDoc.id)}
          onToggleFavorite={toggleDocFavorite}
        />
      )}

      {/* Era Reader Modal */}
      {activeEra && (
        <EraReaderModal
          era={activeEra}
          onClose={() => setActiveEra(null)}
          isFavorite={favoriteEraIds.includes(activeEra.id)}
          onToggleFavorite={toggleEraFavorite}
          onOpenFigureByName={(name) => {
            const found = CURATED_BIOGRAPHIES.find(b => b.nameTh.includes(name) || b.nameEn.includes(name));
            if (found) setActiveArchivalDoc(found);
          }}
        />
      )}

      {/* Book Webview Modal */}
      {activeWebviewBook && (
        <BookWebviewModal
          book={activeWebviewBook}
          onClose={() => setActiveWebviewBook(null)}
          isFavorite={favoriteItems.some(f => f.url === activeWebviewBook.url)}
          onToggleFavorite={() => toggleMediaFavorite(activeWebviewBook)}
        />
      )}

      {/* Wikipedia PDF View Reader Modal */}
      {activeWikiPdfDoc && (
        <WikiPdfReaderModal
          figure={activeWikiPdfDoc}
          onClose={() => setActiveWikiPdfDoc(null)}
          isFavorite={favoriteDocIds.includes(activeWikiPdfDoc.id)}
          onToggleFavorite={() => toggleDocFavorite(activeWikiPdfDoc)}
        />
      )}

    </div>
  );
}
