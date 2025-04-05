import { useParams, useNavigate } from "react-router-dom";
import litters from "../tempdata/litters.js";
import {
  FaMars,
  FaVenus,
  FaBirthdayCake,
  FaCalendarCheck,
  FaPalette,
  FaLock,
  FaUnlock,
} from "react-icons/fa";

const ViewLitter = () => {
  const { litterId } = useParams();
  const navigate = useNavigate();
  const litter = litters.find((litter) => litter.id === parseInt(litterId));

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
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <button
          onClick={() => navigate("/nursery")}
          className="px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md transition-all duration-200 whitespace-nowrap bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white hover:shadow-lg"
        >
          &larr; Back to Nursery
        </button>
        <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
          <div className="mb-8 bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50">
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
              </div>
            </div>
          </div>
          {/* Grid for puppies */}
          {litter.puppies && litter.puppies.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {litter.puppies.map((puppy) => (
                <div
                  key={puppy.id}
                  className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50"
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={puppy.profilePicture}
                      alt={puppy.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
                      {puppy.name}
                    </h2>
                    <div className="space-y-4 text-lg text-slate-300">
                      <p className="flex items-center gap-2">
                        <FaPalette className="w-5 h-5 text-blue-400" />
                        <span>Color: {puppy.color}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        {puppy.gender === "Female" ? (
                          <FaVenus className="w-5 h-5 text-pink-400" />
                        ) : (
                          <FaMars className="w-5 h-5 text-blue-400" />
                        )}
                        <span>Gender: {puppy.gender}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        {puppy.status === "Sold" ? (
                          <>
                            <FaLock className="w-5 h-5 text-red-400" />
                            <span className="text-red-500 font-bold">Sold</span>
                          </>
                        ) : puppy.status === "Reserved" ? (
                          <>
                            <FaLock className="w-5 h-5 text-yellow-400" />
                            <span className="text-yellow-500 font-bold">
                              Reserved
                            </span>
                          </>
                        ) : (
                          <>
                            <FaUnlock className="w-5 h-5 text-green-400" />
                            <span className="text-green-500 font-bold">
                              Available
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <h1 className="text-red-500 font-bold">No Puppies Available</h1>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewLitter;
