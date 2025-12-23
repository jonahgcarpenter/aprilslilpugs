import { useParams, useNavigate } from "react-router-dom";
import { useLitters } from "../hooks/uselitters";
import { usePuppies } from "../hooks/usepuppies";
import { useDogs } from "../hooks/usedogs";
import LitterGallery, {
  type GalleryImage,
} from "../components/litters/litter-gallery";
import PuppyHero from "../components/puppies/puppy-hero";
import PuppyParents from "../components/puppies/puppy-parents";
import PuppyList from "../components/puppies/puppy-list";

const Litter = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    litters,
    isLoading: littersLoading,
    error: littersError,
  } = useLitters();

  const { dogs, isLoading: pugsLoading } = useDogs();

  const { puppies, isLoading: puppiesLoading } = usePuppies(id);

  const litter = litters.find((l) => l.id === id);

  if (littersLoading || pugsLoading || puppiesLoading) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-12 border border-slate-800/50 shadow-xl flex justify-center">
        <span className="text-blue-400 font-semibold animate-pulse">
          Loading Details...
        </span>
      </div>
    );
  }

  if (littersError || !litter) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-12 border border-slate-800/50 shadow-xl flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-slate-200 mb-2">
          Litter Not Found
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors mt-4 cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const mother = dogs.find((d) => d.id === litter.motherId);
  const father = dogs.find((d) => d.id === litter.fatherId);

  const galleryMap = new Map<string, GalleryImage>();

  if (litter.images) {
    litter.images.forEach((img) => {
      if (img.url === litter.profilePicture) return;

      galleryMap.set(img.url, {
        url: img.url,
        description: img.description,
        puppyName: undefined,
      });
    });
  }

  puppies.forEach((p) => {
    if (p.images) {
      p.images.forEach((img) => {
        if (img.url === p.profilePicture) return;

        galleryMap.set(img.url, {
          url: img.url,
          description: img.description,
          puppyName: p.name,
        });
      });
    }
  });

  const combinedGallery = Array.from(galleryMap.values());

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800/50 shadow-xl overflow-hidden mb-12">
      <PuppyHero litter={litter} />

      <div className="p-6 sm:p-8 space-y-12">
        <PuppyParents
          mother={mother}
          father={father}
          motherNameFallback={litter.motherName}
          fatherNameFallback={litter.fatherName}
        />

        <PuppyList puppies={puppies} />

        {combinedGallery.length > 0 && (
          <LitterGallery images={combinedGallery} litterName={litter.name} />
        )}
      </div>
    </div>
  );
};

export default Litter;
