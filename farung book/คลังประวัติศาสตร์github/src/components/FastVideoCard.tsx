import React, { useState, memo } from 'react';
import { Play, Bookmark } from 'lucide-react';
import { MediaItem } from '../types';

interface FastVideoCardProps {
  item: MediaItem;
  items: MediaItem[];
  isFav: boolean;
  onOpen: () => void;
  onToggleFav: () => void;
  getYTId: (url: string) => string | null;
}

export const FastVideoCard: React.FC<FastVideoCardProps> = memo(({
  item,
  isFav,
  onOpen,
  onToggleFav,
  getYTId,
}) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(() => {
    const ytId = getYTId(item.url);
    if (ytId) {
      // mqdefault (320x180) is ~15KB, loads up to 4x faster than 120KB hqdefault
      return `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`;
    }
    return item.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=360&q=75';
  });

  const handleImgError = () => {
    const ytId = getYTId(item.url);
    if (ytId && !imgSrc.includes('hqdefault.jpg')) {
      // Fallback to hqdefault
      setImgSrc(`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`);
    } else {
      // Fallback to high-speed Unsplash
      setImgSrc('https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=360&q=70');
    }
  };

  return (
    <div
      onClick={onOpen}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '280px 220px' }}
      className="w-64 sm:w-72 shrink-0 snap-start group relative bg-[#1c1c1f] rounded-2xl border border-white/10 hover:border-[#d4af37] overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
    >
      {/* Thumbnail Aspect Box */}
      <div className="aspect-video relative bg-[#121214] overflow-hidden">
        {/* Placeholder Skeleton when loading */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
        )}

        <img
          src={imgSrc}
          alt={item.title}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={handleImgError}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
            imgLoaded ? 'opacity-85 group-hover:opacity-100' : 'opacity-0'
          }`}
        />

        {/* Play Icon Badge */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-black/60 border border-white/20 group-hover:border-[#d4af37] group-hover:bg-[#d4af37] text-white group-hover:text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-all">
            <Play className="w-4 h-4 ml-0.5 fill-current" />
          </div>
        </div>

        {/* Bookmark Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav();
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white hover:text-yellow-400 transition-all cursor-pointer shadow"
          title="บันทึกในรายการโปรด"
          aria-label="รายการโปรด"
        >
          <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </button>
      </div>

      {/* Details Box */}
      <div className="p-3.5 space-y-1">
        <span className="text-[10px] text-[#d4af37] block font-medium truncate">
          {item.category}
        </span>
        <h4 className="text-xs font-medium line-clamp-2 text-white group-hover:text-[#d4af37] transition-colors leading-snug">
          {item.title}
        </h4>
      </div>
    </div>
  );
});
