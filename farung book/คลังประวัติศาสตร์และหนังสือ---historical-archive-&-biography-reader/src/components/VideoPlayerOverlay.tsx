import React from 'react';
import { X, Youtube, Film } from 'lucide-react';
import { MediaItem } from '../types';

interface VideoPlayerOverlayProps {
  activeItem: MediaItem | null;
  playlist: MediaItem[];
  onClose: () => void;
}

export const VideoPlayerOverlay: React.FC<VideoPlayerOverlayProps> = ({
  activeItem,
  playlist,
  onClose,
}) => {
  if (!activeItem) return null;

  // Robust YouTube Video ID Extractor (supports watch?v=, youtu.be/, shorts/, embed/)
  const getYTId = (url: string): string | null => {
    if (!url) return null;
    const str = url.trim();
    if (str.includes('drive.google.com') || str.includes('docs.google.com')) return null;
    const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
    const match = str.match(regExp);
    return match && match[1] ? match[1] : null;
  };

  const currentVidId = getYTId(activeItem.url);

  // Convert Google Drive view URLs to preview URLs for seamless iframe playback
  let drivePreviewUrl: string | null = null;
  if (activeItem.url.includes('drive.google.com') || activeItem.url.includes('docs.google.com')) {
    const driveIdMatch = activeItem.url.match(/\/d\/([a-zA-Z0-9_-]+)/) || activeItem.url.match(/id=([a-zA-Z0-9_-]+)/);
    if (driveIdMatch && driveIdMatch[1]) {
      drivePreviewUrl = `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
    } else {
      drivePreviewUrl = activeItem.url;
    }
  }

  // YouTube embed URL pointing directly to the exact target video ID
  const youtubeEmbedUrl = currentVidId
    ? `https://www.youtube.com/embed/${currentVidId}?autoplay=1&rel=0&modestbranding=1`
    : null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/95 flex flex-col items-center justify-center p-3 sm:p-6 backdrop-blur-lg animate-in fade-in duration-200">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-white/10 hover:bg-[#d4af37] text-white hover:text-black transition-all cursor-pointer z-50 shadow-lg"
        title="ปิดวิดีโอ"
        aria-label="ปิดวิดีโอ"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Video Iframe Container */}
      <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-[#d4af37]/60 shadow-[0_0_50px_rgba(212,175,55,0.25)] relative">
        {youtubeEmbedUrl ? (
          <iframe
            key={currentVidId || activeItem.url}
            className="w-full h-full"
            src={youtubeEmbedUrl}
            title={activeItem.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        ) : drivePreviewUrl ? (
          <iframe
            key={drivePreviewUrl}
            className="w-full h-full bg-black"
            src={drivePreviewUrl}
            title={activeItem.title}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        ) : (activeItem.url.includes('.mp4') || activeItem.url.includes('.webm')) ? (
          <video
            key={activeItem.url}
            className="w-full h-full bg-black"
            src={activeItem.url}
            controls
            autoPlay
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center space-y-3">
            <Film className="w-16 h-16 text-[#d4af37] opacity-80 animate-pulse" />
            <div>
              <p className="text-base font-bold text-white font-cinzel">{activeItem.title}</p>
              <p className="text-xs text-[#d4af37] mt-1">{activeItem.category}</p>
            </div>
            <a
              href={activeItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#d4af37] text-black font-bold text-xs hover:bg-amber-400 transition-all shadow"
            >
              เปิดวิดีโอในแท็บใหม่
            </a>
          </div>
        )}
      </div>

      {/* Video Details */}
      <div className="mt-4 text-center max-w-2xl px-4 space-y-1.5">
        <h3 className="text-base sm:text-xl font-bold text-[#d4af37] font-cinzel line-clamp-2">
          {activeItem.title}
        </h3>
        <p className="text-xs text-gray-300">
          {activeItem.category}
        </p>
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 uppercase tracking-widest pt-1">
          <Youtube className="w-3.5 h-3.5 text-red-500" />
          <span>คลังวิดีโอประวัติศาสตร์</span>
        </div>
      </div>
    </div>
  );
};
