import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import {
  FaImage,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

export interface GalleryImage {
  id?: number;
  url: string;
  alt_text?: string;
  description?: string;
  puppyName?: string;
}

interface LitterGalleryProps {
  images: GalleryImage[];
  litterName: string;
}

export const LitterGallery = ({ images, litterName }: LitterGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const thumbnailsRef = useRef<HTMLDivElement>(null);

  const closeLightbox = () => setSelectedIndex(null);

  const showNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : (prev + 1) % images.length,
    );
  }, [images.length]);

  const showPrev = useCallback(() => {
    setSelectedIndex((prev) =>
      prev === null ? null : (prev - 1 + images.length) % images.length,
    );
  }, [images.length]);

  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden"; // Prevent background scrolling

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedIndex, showNext, showPrev]);

  useEffect(() => {
    if (selectedIndex !== null && thumbnailsRef.current) {
      const selectedThumb = thumbnailsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedThumb) {
        selectedThumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [selectedIndex]);

  return (
    <div className="lg:col-span-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 flex items-center gap-2">
          Litter Gallery
        </h3>
        <span className="text-sm font-semibold text-blue-300 bg-blue-900/30 border border-blue-500/20 px-3 py-1 rounded-full">
          {images.length} Photos
        </span>
      </div>

      {/* Image Grid (In-Flow Content) */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((item, index) => (
            <div
              key={item.id || index}
              onClick={() => setSelectedIndex(index)}
              className="group relative aspect-square overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 shadow-sm cursor-pointer"
            >
              <img
                src={item.url}
                alt={item.alt_text || `Gallery image ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <FaImage className="text-white opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 drop-shadow-md text-3xl" />
              </div>
              {(item.description || item.puppyName) && (
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.puppyName && (
                    <p className="text-[10px] font-bold text-blue-300 uppercase">
                      {item.puppyName}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 border border-slate-700/50 border-dashed rounded-2xl text-slate-500">
          <FaImage className="w-8 h-8 mb-3 opacity-50" />
          <p>No photos uploaded yet.</p>
        </div>
      )}

      {/* Modal */}
      {selectedIndex !== null &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm animate-in fade-in duration-200 flex flex-col"
            onClick={closeLightbox}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
              <div className="text-white/80 text-sm font-medium">
                {selectedIndex + 1} / {images.length}
              </div>
              <button
                onClick={closeLightbox}
                className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-between px-2 sm:px-4 relative min-h-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showPrev();
                }}
                className="p-3 sm:p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer z-50 -ml-2 sm:ml-0"
              >
                <FaChevronLeft size={28} />
              </button>

              <div
                className="flex-1 h-full flex flex-col items-center justify-center px-2 sm:px-8 py-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={images[selectedIndex].url}
                  alt="Gallery View"
                  className="max-w-full max-h-full object-contain shadow-2xl"
                />

                {(images[selectedIndex].puppyName ||
                  images[selectedIndex].description) && (
                  <div className="mt-4 text-center max-w-2xl bg-black/60 p-4 rounded-xl backdrop-blur-md border border-white/10">
                    {images[selectedIndex].puppyName && (
                      <h4 className="text-lg font-bold text-blue-400 mb-1">
                        {images[selectedIndex].puppyName}
                      </h4>
                    )}
                    {images[selectedIndex].description && (
                      <p className="text-slate-200 text-sm">
                        {images[selectedIndex].description}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showNext();
                }}
                className="p-3 sm:p-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all cursor-pointer z-50 -mr-2 sm:mr-0"
              >
                <FaChevronRight size={28} />
              </button>
            </div>

            {/* Bottom Thumbnails */}
            <div
              className="h-20 sm:h-24 bg-black/80 border-t border-white/10 w-full flex-shrink-0 z-50 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={thumbnailsRef}
                className="h-full flex items-center gap-2 overflow-x-auto px-4 py-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
              >
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative flex-shrink-0 h-full aspect-square rounded-lg overflow-hidden transition-all duration-200 cursor-pointer ${
                      selectedIndex === idx
                        ? "ring-2 ring-blue-500 opacity-100 scale-100"
                        : "opacity-40 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <img
                      src={img.url}
                      className="w-full h-full object-cover"
                      alt={`Thumbnail ${idx}`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default LitterGallery;
