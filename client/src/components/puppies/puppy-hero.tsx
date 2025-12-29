import { useNavigate } from "react-router-dom";
import type { Litter } from "../../hooks/uselitters";
import { FaArrowLeft } from "react-icons/fa";

interface PuppyHeroProps {
  litter: Litter;
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "Planned":
      return "bg-yellow-950/70 text-yellow-300 border-yellow-500/50";
    case "Available":
      return "bg-green-950/70 text-green-300 border-green-500/50";
    case "Sold":
      return "bg-red-950/70 text-red-300 border-red-500/50";
    default:
      return "bg-slate-950/70 text-slate-300 border-slate-500/50";
  }
};

export const PuppyHero = ({ litter }: PuppyHeroProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative h-[300px] sm:h-[400px] w-full overflow-hidden">
      <img
        src={litter.profilePicture}
        alt={litter.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors gap-2 group cursor-pointer"
        >
          <FaArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              {litter.name}
            </h1>
          </div>

          <div className="flex gap-8 text-sm sm:text-base border-t sm:border-t-0 border-slate-700/50 pt-4 sm:pt-0">
            <div>
              <p className="text-slate-400 uppercase text-xs tracking-wider mb-1">
                Status
              </p>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${getStatusColor(
                  litter.status,
                )}`}
              >
                {litter.status}
              </span>
            </div>

            <div>
              <p className="text-slate-400 uppercase text-xs tracking-wider mb-1">
                Born
              </p>
              <p className="font-semibold text-white">
                {formatDate(litter.birthDate)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-xs tracking-wider mb-1">
                Go Home
              </p>
              <p className="font-semibold text-white">
                {formatDate(litter.availableDate)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PuppyHero;
