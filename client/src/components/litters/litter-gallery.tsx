import { ImageGallery, type GalleryImage } from "../gallery/image-gallery";

export type { GalleryImage };

interface LitterGalleryProps {
  images: GalleryImage[];
  litterName?: string;
}

export const LitterGallery = ({ images }: LitterGalleryProps) => {
  return (
    <div className="lg:col-span-2 pt-12 border-t border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 flex items-center gap-2">
          Litter Gallery
        </h3>
        <span className="text-sm font-semibold text-blue-300 bg-blue-900/30 border border-blue-500/20 px-3 py-1 rounded-full">
          {images.length} Photos
        </span>
      </div>

      <ImageGallery images={images} />
    </div>
  );
};

export default LitterGallery;
