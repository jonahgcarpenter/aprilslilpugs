import { useEffect, useState } from "react";
import { useLitter } from "../hooks/useLitter";

// COMPONENTS
import UnderConstruction from "../components/Misc/UnderConstruction";
import Litters from "../components/Litter/Litters";
import MoreImages from "../components/Gallery/MoreImages";
import NoLitters from "../components/Litter/NoLitters";

const Nursery = () => {
  const { litters, isLoading, littersError } = useLitter();
  const [currentLitters, setCurrentLitters] = useState([]);

  useEffect(() => {
    if (Array.isArray(litters) && litters.length > 0) {
      const filtered = litters.filter((litter) => {
        return (
          !litter.puppies ||
          litter.puppies.length === 0 ||
          (litter.puppies.length > 0 &&
            litter.puppies.some(
              (puppy) =>
                puppy.status === "Available" || puppy.status === "Reserved",
            ))
        );
      });
      setCurrentLitters(filtered);
    }
  }, [litters]);

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <div className="max-w-4xl mx-auto transform hover:scale-[1.01] transition-all duration-300">
          <UnderConstruction />
        </div>
        {/* <Waitlist /> */}
        <div className="transition-all duration-500 ease-in-out">
          <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
                Current Litters
              </h1>
              {currentLitters.length === 0 && !isLoading ? (
                <NoLitters />
              ) : (
                <Litters
                  litters={currentLitters}
                  isLoading={isLoading}
                  littersError={littersError}
                />
              )}
            </div>
          </div>
        </div>
        <MoreImages />
      </div>
    </div>
  );
};

export default Nursery;
