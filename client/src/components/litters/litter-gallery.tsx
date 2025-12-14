interface PuppyGalleryProps {
  images: string[];
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
          {images.map((imgUrl, index) => (
            <div
              key={index}
              className="group relative aspect-square overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-colors shadow-sm"
            >
              <img
                src={imgUrl}
                alt={`${litterName} puppy ${index + 1}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-3 pt-8 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="text-xs font-semibold text-white">
                  Photo {index + 1}
                </span>
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
