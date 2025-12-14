import { useParams, useNavigate } from "react-router-dom";
import { useLitters } from "../hooks/uselitters";
import { usePug } from "../hooks/usepugs";
import { mockPuppies } from "../data/puppies";
import { mockImages } from "../data/images";
import PuppyParents from "../components/puppies/puppy-parents";
import LitterGallery from "../components/litters/litter-gallery";
import PuppyHero from "../components/puppies/puppy-hero";
import PuppyList from "../components/puppies/puppy-list";

const FALLBACK_PUPPY_IMAGE =
  "https://placehold.co/400x400/2563eb/white?text=Puppy";

const resolveImageIds = (ids: string[] = []) => {
  return ids
    .map((id) => {
      const img = mockImages.find((i) => i.id === id);
      return img ? `/assets/images/${img.filename}` : null;
    })
    .filter((url): url is string => url !== null);
};

const Litter = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    litters,
    isLoading: littersLoading,
    error: littersError,
  } = useLitters();

  const { pugs, isLoading: pugsLoading } = usePug();

  const litter = litters.find((l) => l.id === id);

  if (littersLoading || pugsLoading) {
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

  const mother = pugs.find((p) => p.id === litter.motherId);
  const father = pugs.find((p) => p.id === litter.fatherId);

  const puppies = mockPuppies
    .filter((p) => p.litter_id === litter.id)
    .map((p) => {
      const img = mockImages.find((i) => i.id === p.profile_picture);
      const profileUrl = img
        ? `/assets/images/${img.filename}`
        : FALLBACK_PUPPY_IMAGE;

      const galleryUrls = resolveImageIds(p.image_ids);

      return {
        ...p,
        profile_picture: profileUrl,
        images: galleryUrls,
      };
    });

  const filteredLitterImages = litter.images.filter(
    (url) => url !== litter.profilePicture,
  );

  const filteredPuppyImages = puppies.flatMap((p) =>
    p.images.filter((url) => url !== p.profile_picture),
  );

  const combinedGallery = Array.from(
    new Set([...filteredLitterImages, ...filteredPuppyImages]),
  );

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

        <LitterGallery images={combinedGallery} litterName={litter.name} />
      </div>
    </div>
  );
};

export default Litter;
