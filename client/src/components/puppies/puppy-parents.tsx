import type { Pug } from "../../hooks/usepugs";

interface PuppyParentsProps {
  mother?: Pug;
  father?: Pug;
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
    <section>
      <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        Parents
      </h3>

      <div className="space-y-4">
        {/* Mother Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 transition-colors shadow-sm">
          <img
            src={motherImage}
            alt={motherName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-600"
          />
          <div>
            <span className="text-xs font-bold text-pink-400 uppercase tracking-wide">
              Mother
            </span>
            <h4 className="text-lg font-bold text-white">{motherName}</h4>
          </div>
        </div>

        {/* Father Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 transition-colors shadow-sm">
          <img
            src={fatherImage}
            alt={fatherName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-600"
          />
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wide">
              Father
            </span>
            <h4 className="text-lg font-bold text-white">{fatherName}</h4>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PuppyParents;
