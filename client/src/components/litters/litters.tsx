import { useState } from "react";
import { createPortal } from "react-dom";
import type { Litter } from "../../hooks/uselitter";

interface LittersProps {
  litters?: Litter[];
  isLoading: boolean;
  littersError: any;
}

const Litters = ({ litters = [], isLoading, littersError }: LittersProps) => {
  const [selectedLitter, setSelectedLitter] = useState<Litter | null>(null);

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

  if (isLoading) {
    return (
      <div className="h-20 flex items-center justify-center">
        <span className="text-blue-400 font-semibold animate-pulse">
          Loading Litters...
        </span>
      </div>
    );
  }

  if (littersError) {
    return (
      <div className="p-4 sm:p-8">
        <p className="text-red-500 text-center">
          {littersError.message || "Failed to load litters"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
            Current Litters
          </h1>
          <div className="space-y-8">
            {litters.map((litter) => (
              <div
                key={litter._id}
                className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="aspect-square w-full overflow-hidden bg-slate-800">
                    {litter.profilePicture ? (
                      <img
                        src={litter.profilePicture}
                        alt={litter.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
                      {litter.name}
                    </h2>
                    <div className="space-y-4 text-lg text-slate-300">
                      <p className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-400"
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
                            ? "Expected By:"
                            : "Born on:"}{" "}
                          {formatDate(litter.birthDate)}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-400"
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
                          className="w-5 h-5 text-blue-400"
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
                        <span>Mother: {litter.mother}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5 text-blue-400"
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
                        <span>Father: {litter.father}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedLitter(litter)}
                      className="mt-8 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600/20 to-blue-500/20 hover:from-blue-600/30 hover:to-blue-500/30 text-blue-400 rounded-xl border border-blue-500/20 transition-all duration-300 hover:scale-105"
                    >
                      View Puppies
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Portal */}
      {selectedLitter &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedLitter(null)}
            />
            <div className="relative z-[10000] bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-800 shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                  {selectedLitter.name}
                </h3>
                <button
                  onClick={() => setSelectedLitter(null)}
                  className="text-slate-400 hover:text-slate-200 transition-colors text-2xl"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              {selectedLitter.puppies.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400">
                  <span className="text-4xl mb-4">🐶</span>
                  <h4 className="text-2xl font-bold text-slate-100 mb-2">
                    Puppies Coming Soon!
                  </h4>
                  <p>Check back later for updates.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {selectedLitter.puppies.map((puppy) => (
                    <div
                      key={puppy._id}
                      className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700"
                    >
                      <div className="aspect-square w-full overflow-hidden">
                        {puppy.profilePicture ? (
                          <img
                            src={puppy.profilePicture}
                            alt={puppy.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-700 text-slate-500">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-6 space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="text-xl font-semibold text-slate-100">
                            {puppy.name}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              puppy.status === "Available"
                                ? "bg-green-500/20 text-green-400"
                                : puppy.status === "Reserved"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {puppy.status}
                          </span>
                        </div>
                        <div className="text-slate-400 text-sm space-y-1">
                          <p>Color: {puppy.color}</p>
                          <p>Gender: {puppy.gender}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default Litters;
