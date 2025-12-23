import { useMemo } from "react";
import { useLitters } from "../hooks/uselitters";
import { usePuppies } from "../hooks/usepuppies";
import { useDogs } from "../hooks/usedogs";
import {
  ImageGallery,
  type GalleryImage,
} from "../components/gallery/image-gallery";

const Gallery = () => {
  const { litters, isLoading: littersLoading } = useLitters();
  const { puppies, isLoading: puppiesLoading } = usePuppies(undefined);
  const { dogs, isLoading: dogsLoading } = useDogs();

  const allImages = useMemo(() => {
    if (!litters || !puppies || !dogs) return [];

    const galleryMap = new Map<string, GalleryImage>();

    dogs.forEach((dog) => {
      if (dog.images) {
        dog.images.forEach((img) => {
          if (img.url === dog.profilePicture) return;

          galleryMap.set(img.url, {
            url: img.url,
            description: img.description,
            dogName: dog.name,
          });
        });
      }
    });

    litters.forEach((litter) => {
      if (litter.images) {
        litter.images.forEach((img) => {
          if (img.url === litter.profilePicture) return;

          galleryMap.set(img.url, {
            url: img.url,
            description: img.description,
            litterName: litter.name,
          });
        });
      }
    });

    puppies.forEach((puppy) => {
      const parentLitter = litters.find((l) => l.id === puppy.litterId);
      const litterName = parentLitter?.name || "Puppy";

      if (puppy.images) {
        puppy.images.forEach((img) => {
          if (img.url === puppy.profilePicture) return;

          galleryMap.set(img.url, {
            url: img.url,
            description: img.description,
            puppyName: puppy.name,
            litterName: litterName,
          });
        });
      }
    });

    return Array.from(galleryMap.values());
  }, [litters, puppies, dogs]);

  if (littersLoading || puppiesLoading || dogsLoading) {
    return (
      <div className="min-h-screen bg-slate-950 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-12 border border-slate-800/50 shadow-xl flex justify-center">
            <span className="text-blue-400 font-semibold animate-pulse">
              Loading Gallery...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
          Photo Gallery
        </h1>
        <p className="text-white/90 max-w-2xl text-lg mx-auto text-center">
          A collection of our past and present litters. Explore the journey of
          our puppies from birth to their forever homes.
        </p>

        <ImageGallery
          images={allImages}
          emptyMessage="Our gallery is currently being curated. Check back soon!"
        />
      </div>
    </div>
  );
};

export default Gallery;
