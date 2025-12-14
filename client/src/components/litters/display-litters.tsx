import type { Litter } from "../../hooks/uselitters";
import { useNavigate } from "react-router-dom";
import {
  FaVenus,
  FaMars,
  FaBirthdayCake,
  FaCalendarCheck,
} from "react-icons/fa";

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

const getStatusColor = (status: string) => {
  switch (status) {
    case "Planned":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "Available":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "Sold":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  }
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
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${getStatusColor(
                        litter.status,
                      )}`}
                    >
                      {litter.status}
                    </span>
                  </div>

                  <div className="space-y-4 text-lg text-slate-300">
                    <p className="flex items-center gap-2">
                      <FaBirthdayCake className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span>
                        {isFutureDate(litter.birthDate)
                          ? "Expected By: "
                          : "Born on: "}
                        {formatDate(litter.birthDate)}
                      </span>
                    </p>

                    <p className="flex items-center gap-2">
                      <FaCalendarCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span>
                        Available on: {formatDate(litter.availableDate)}
                      </span>
                    </p>

                    <p className="flex items-center gap-2">
                      <FaVenus className="w-5 h-5 text-pink-400 flex-shrink-0" />
                      <span>Mother: {litter.motherName}</span>
                    </p>

                    <p className="flex items-center gap-2">
                      <FaMars className="w-5 h-5 text-blue-400 flex-shrink-0" />
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
