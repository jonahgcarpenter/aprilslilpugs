import { useEffect } from "react";
import type { Litter } from "../../hooks/uselitters";

interface LitterModalProps {
  litter: Litter | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
};

const PuppiesModal = ({ litter, isOpen, onClose }: LitterModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !litter) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex-none flex items-center justify-between p-6 bg-slate-900/95 backdrop-blur border-b border-slate-800 z-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
              {litter.name}
            </h2>
            <div className="mt-2 flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-blue-900/30 text-blue-300 border border-blue-500/20">
                {litter.statusLabel}
              </span>
              <span className="text-sm text-slate-400">
                {litter.images.length} Photos Available
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-800">
              <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-4 font-semibold">
                Parents
              </h3>
              <div className="space-y-4">
                {/* Mother */}
                <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-lg border border-slate-700/30">
                  <img
                    src={litter.motherPicture}
                    alt={litter.motherName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-600"
                  />
                  <div>
                    <p className="text-xs text-blue-400 font-bold uppercase mb-0.5">
                      Mother
                    </p>
                    <p className="text-slate-200 font-medium">
                      {litter.motherName}
                    </p>
                  </div>
                </div>

                {/* Father */}
                <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-lg border border-slate-700/30">
                  <img
                    src={litter.fatherPicture}
                    alt={litter.fatherName}
                    className="w-12 h-12 rounded-full object-cover border border-slate-600"
                  />
                  <div>
                    <p className="text-xs text-blue-400 font-bold uppercase mb-0.5">
                      Father
                    </p>
                    <p className="text-slate-200 font-medium">
                      {litter.fatherName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates Section */}
            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-800 h-full flex flex-col justify-center">
              <h3 className="text-xs uppercase tracking-wider text-slate-500 mb-4 font-semibold">
                Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">Date of Birth</span>
                  <span className="text-slate-200 font-medium">
                    {formatDate(litter.birthDate)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-400">Go Home Date</span>
                  <span className="text-slate-200 font-medium">
                    {formatDate(litter.availableDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Gallery Section */}
          <div>
            <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Puppy Gallery
            </h3>
            {litter.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {litter.images.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square overflow-hidden rounded-lg bg-slate-800 border border-slate-700 shadow-md"
                  >
                    <img
                      src={imgUrl}
                      alt={`${litter.name} puppy ${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-800 border-dashed">
                <p className="text-slate-500">
                  No images uploaded for this litter yet.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-none p-6 border-t border-slate-800 bg-slate-900/95 backdrop-blur flex justify-end z-10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors font-medium text-sm border border-slate-700 hover:border-slate-600 shadow-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PuppiesModal;
