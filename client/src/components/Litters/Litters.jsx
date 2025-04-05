import { useNavigate } from "react-router-dom";
import {
  FaMars,
  FaVenus,
  FaBirthdayCake,
  FaCalendarCheck,
} from "react-icons/fa";

const Litters = ({ litters, title }) => {
  const navigate = useNavigate();

  // Function to format YYYY-MM-DD date string to "Month Day, Year" format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "2-digit",
      timeZone: "UTC",
    });
  };

  // Function that used for determining if it should say "Expected By" or "Born on"
  const isFutureDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date > today;
  };

  return (
    <div className="transition-all duration-500 ease-in-out">
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
            {title}
          </h1>
          <div className="space-y-8">
            {litters.map((litter) => (
              <div
                key={litter.id}
                className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={litter.profilePicture}
                      alt={litter.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
                      {litter.name}
                    </h2>
                    <div className="space-y-4 text-lg text-slate-300">
                      <p className="flex items-center gap-2">
                        <FaBirthdayCake className="w-5 h-5 text-green-400" />
                        <span>
                          {isFutureDate(litter.birthDate)
                            ? "Expected By:"
                            : "Born on:"}{" "}
                          {formatDate(litter.birthDate)}{" "}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <FaCalendarCheck className="w-5 h-5 text-blue-400" />
                        <span>
                          Available on: {formatDate(litter.availableDate)}
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <FaVenus className="w-5 h-5 text-pink-400" />
                        <span>Mother: {litter.mother}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <FaMars className="w-5 h-5 text-blue-400" />
                        <span>Father: {litter.father}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/nursery/${litter.id}`)}
                      className="mt-8 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600/20 to-blue-500/20 hover:from-blue-600/30 hover:to-blue-500/30 text-blue-400 rounded-xl border border-blue-500/20 transition-all duration-300 hover:scale-105"
                    >
                      View Litter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Litters;
