import { useParams, useNavigate } from "react-router-dom";
import { useLitters } from "../hooks/uselitters";
import { usePug } from "../hooks/usepugs";
import PuppyParents from "../components/puppies/puppy-parents";
import PuppyGallery from "../components/puppies/puppy-gallery";
import PuppyHero from "../components/puppies/puppy-hero";

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
          className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors mt-4"
        >
          Go Back
        </button>
      </div>
    );
  }

  const mother = pugs.find((p) => p.id === litter.motherId);
  const father = pugs.find((p) => p.id === litter.fatherId);

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800/50 shadow-xl overflow-hidden">
      <PuppyHero litter={litter} />

      <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
        <div className="space-y-8">
          <PuppyParents
            mother={mother}
            father={father}
            motherNameFallback={litter.motherName}
            fatherNameFallback={litter.fatherName}
          />
        </div>

        <PuppyGallery images={litter.images} litterName={litter.name} />
      </div>
    </div>
  );
};

export default Litter;
