import type { Litter } from "../../hooks/uselitters";
import { useNavigate } from "react-router-dom";
import {
  FaVenus,
  FaMars,
  FaBirthdayCake,
  FaCalendarCheck,
} from "react-icons/fa";

interface DisplayLittersProps {
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
    year: "numeric",
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
      return "bg-yellow-950/70 text-yellow-300 border-yellow-500/50";
    case "Available":
      return "bg-green-950/70 text-green-300 border-green-500/50";
    case "Sold":
      return "bg-red-950/70 text-red-300 border-red-500/50";
    default:
      return "bg-slate-950/70 text-slate-300 border-slate-500/50";
  }
};

const DisplayLitters = ({
  title,
  litters,
  isLoading,
  error,
}: DisplayLittersProps) => {
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

  if (litters.length === 0) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-8 text-center border border-slate-800/50 text-slate-400">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p>No litters currently listed.</p>
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
              className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 transition-all hover:border-slate-600/50 group"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Image Section */}
                <div className="aspect-square w-full overflow-hidden relative">
                  <img
                    src={litter.profilePicture}
                    alt={litter.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Mobile Status Badge Overlay */}
                  <div className="absolute top-4 right-4 lg:hidden">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border backdrop-blur-md ${getStatusColor(litter.status)}`}
                    >
                      {litter.status}
                    </span>
                  </div>
                </div>

                {/* Info Section */}
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                      {litter.name}
                    </h2>
                    <span
                      className={`hidden lg:block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border ${getStatusColor(
                        litter.status,
                      )}`}
                    >
                      {litter.status}
                    </span>
                  </div>

                  <div className="space-y-4 text-lg text-slate-300">
                    <p className="flex items-center gap-3">
                      <FaBirthdayCake className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span>
                        {isFutureDate(litter.birthDate)
                          ? "Due Date: "
                          : "Born: "}
                        <span className="text-slate-100 font-medium">
                          {formatDate(litter.birthDate)}
                        </span>
                      </span>
                    </p>

                    <p className="flex items-center gap-3">
                      <FaCalendarCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span>
                        Available:{" "}
                        <span className="text-slate-100 font-medium">
                          {formatDate(litter.availableDate)}
                        </span>
                      </span>
                    </p>

                    <p className="flex items-center gap-3">
                      <FaVenus className="w-5 h-5 text-pink-400 flex-shrink-0" />
                      <span>
                        Mother:{" "}
                        <span className="text-slate-100 font-medium">
                          {litter.motherName}
                        </span>
                      </span>
                    </p>

                    <p className="flex items-center gap-3">
                      <FaMars className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span>
                        Father:{" "}
                        <span className="text-slate-100 font-medium">
                          {litter.fatherName}
                        </span>
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/litter/${litter.id}`)}
                    className="mt-8 w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600/20 to-blue-500/20 hover:from-blue-600/30 hover:to-blue-500/30 text-blue-400 rounded-xl border border-blue-500/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer font-semibold tracking-wide"
                  >
                    View Litter Details
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
