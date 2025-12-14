export interface GalleryItem {
  url: string;
  description?: string;
  puppyName?: string;
}

interface PuppyGalleryProps {
  images: GalleryItem[];
  litterName: string;
}

export const LitterGallery = ({ images, litterName }: PuppyGalleryProps) => {
  return (
    <div className="lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 flex items-center gap-2">
          Litter Gallery
        </h3>
        <span className="text-sm font-semibold text-blue-300 bg-blue-900/30 border border-blue-500/20 px-3 py-1 rounded-full">
          {images.length} Photos
        </span>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((item, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 shadow-sm cursor-pointer"
            >
              <img
                src={item.url}
                alt={item.description || `${litterName} gallery ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-transparent p-4 flex flex-col justify-end min-h-[40%]">
                {/* Puppy Name Badge */}
                {item.puppyName && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-blue-300 uppercase tracking-wide truncate">
                      {item.puppyName}
                    </span>
                  </div>
                )}

                {/* Description */}
                <p className="text-xs font-medium text-slate-200 line-clamp-2 leading-relaxed">
                  {item.description || "Litter Moment"}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-800/30 border border-slate-700/50 border-dashed rounded-2xl text-slate-500">
          <p>No photos uploaded yet.</p>
        </div>
      )}
    </div>
  );
};

export default LitterGallery;
