import React, { useState } from "react";
import useGallery from "../../hooks/useGallery";
import LoadingAnimation from "../Misc/LoadingAnimation";
import { createPortal } from "react-dom";

const MoreImages = ({ litters, isLoading, littersError }) => {
  const { useGalleryItems } = useGallery();

  const { data: galleryItems, isLoading: isGalleryLoading } = useGalleryItems({
    entityType: "litter",
    litterIds: litters?.map((litter) => litter._id) || [],
  });

  const filteredGalleryItems =
    galleryItems?.filter((item) =>
      litters.some((litter) => litter._id === item.litterId),
    ) || [];

  const [selectedImage, setSelectedImage] = useState(null);

  if (isLoading || isGalleryLoading) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
            More Images
          </h1>
          <LoadingAnimation />
        </div>
      </div>
    );
  }

  if (littersError) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
            More Images
          </h1>
          <div className="text-center text-red-400">
            <p>Error loading images. Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!litters?.length || !filteredGalleryItems.length) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
            More Images
          </h1>
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-100 mb-4">
              No Images Available
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
            More Images
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGalleryItems.map((item) => (
              <div
                key={item._id}
                className="relative group aspect-square overflow-hidden rounded-lg cursor-pointer"
                onClick={() => setSelectedImage(item)}
              >
                <img
                  src={item.filename}
                  alt={item.description || "Gallery image"}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
                />
                {item.description && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm">{item.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal for selected image */}
      {selectedImage &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative flex flex-col items-center">
              <img
                src={selectedImage.filename}
                alt={selectedImage.description || "Gallery image"}
                className="max-h-[90vh] max-w-[90vw] object-contain"
              />
              {selectedImage.description && (
                <div className="mt-4 text-white text-center">
                  <p>{selectedImage.description}</p>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default MoreImages;
