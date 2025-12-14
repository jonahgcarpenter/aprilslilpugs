import type { Litter } from "../../hooks/uselitters";
import { useNavigate } from "react-router-dom";

interface LitterProps {
  title: string;
  litters: Litter[];
  isLoading: boolean;
  error: any;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "2-digit",
    timeZone: "UTC",
  });
};

const isFutureDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  return date > today;
};

const DisplayLitters = ({ title, litters, isLoading, error }: LitterProps) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-12 border border-slate-800/50 shadow-xl flex justify-center">
        <span className="text-blue-400 font-semibold animate-pulse">
          Loading...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-8 text-center border border-slate-800/50 text-red-400">
        Failed to load litters. Please try again later.
      </div>
    );
  }

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
          {title}
        </h1>

        <div className="space-y-8">
          {litters.map((litter) => (
            <div
              key={litter.id}
              className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 transition-all hover:border-slate-600/50"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image Section */}
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={litter.profilePicture}
                    alt={litter.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                {/* Info Section */}
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                      {litter.name}
                    </h2>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide bg-blue-900/30 text-blue-300 border border-blue-500/20">
                      {litter.statusLabel}
                    </span>
                  </div>

                  <div className="space-y-4 text-lg text-slate-300">
                    <p className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {isFutureDate(litter.birthDate)
                          ? "Expected By: "
                          : "Born on: "}
                        {formatDate(litter.birthDate)}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        Available on: {formatDate(litter.availableDate)}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>Mother: {litter.motherName}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                      <span>Father: {litter.fatherName}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/litter/${litter.id}`)}
                    className="mt-8 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600/20 to-blue-500/20 hover:from-blue-600/30 hover:to-blue-500/30 text-blue-400 rounded-xl border border-blue-500/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    More Info
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DisplayLitters;
