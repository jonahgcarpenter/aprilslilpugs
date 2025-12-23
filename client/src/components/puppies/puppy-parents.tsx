import type { Dog } from "../../hooks/usedogs";

interface PuppyParentsProps {
  mother?: Dog;
  father?: Dog;
  motherNameFallback: string;
  fatherNameFallback: string;
}

const FALLBACK_PUG_IMAGE =
  "https://placehold.co/400x400/2563eb/white?text=Parent";

export const PuppyParents = ({
  mother,
  father,
  motherNameFallback,
  fatherNameFallback,
}: PuppyParentsProps) => {
  const motherImage = mother ? mother.profilePicture : FALLBACK_PUG_IMAGE;
  const fatherImage = father ? father.profilePicture : FALLBACK_PUG_IMAGE;
  const motherName = mother ? mother.name : motherNameFallback;
  const fatherName = father ? father.name : fatherNameFallback;

  return (
    <section className="w-full">
      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6 flex items-center gap-2">
        The Parents
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Father Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex items-center gap-6 transition-colors shadow-sm hover:border-blue-500/30 h-full">
          <img
            src={fatherImage}
            alt={fatherName}
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-600 shadow-lg shrink-0"
          />
          <div>
            <span className="text-sm font-bold text-blue-400 uppercase tracking-wider">
              Father
            </span>
            <h4 className="text-2xl font-bold text-white mt-1">{fatherName}</h4>
            {father && (
              <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                {father.description}
              </p>
            )}
          </div>
        </div>

        {/* Mother Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 flex items-center gap-6 transition-colors shadow-sm hover:border-pink-500/30 h-full">
          <img
            src={motherImage}
            alt={motherName}
            className="w-24 h-24 rounded-full object-cover border-4 border-slate-600 shadow-lg shrink-0"
          />
          <div>
            <span className="text-sm font-bold text-pink-400 uppercase tracking-wider">
              Mother
            </span>
            <h4 className="text-2xl font-bold text-white mt-1">{motherName}</h4>
            {mother && (
              <p className="text-slate-400 text-sm mt-2 line-clamp-2">
                {mother.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PuppyParents;
