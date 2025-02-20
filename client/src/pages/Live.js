import React, { useState } from "react";
import { useSettings } from "../hooks/useSettings";

// COMPONENTS
import UnderConstruction from "../components/Misc/UnderConstruction";
import StreamUp from "../components/LiveStream/StreamUp";
import StreamDown from "../components/LiveStream/StreamDown";
import LoadingAnimation from "../components/Misc/LoadingAnimation";
import { FaInfoCircle, FaTimes } from "react-icons/fa";

const Live = () => {
  const { settings, isLoading } = useSettings();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <UnderConstruction />

        {isLoading ? (
          <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50">
            <LoadingAnimation />
          </div>
        ) : (
          <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
            {/* Shared Header */}
            <div className="flex flex-col items-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-4">
                Live Puppy Cam
              </h1>

              <div
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-4 cursor-pointer"
                onClick={() => setShowInfo(!showInfo)}
              >
                <FaInfoCircle className="text-blue-400" />
                <span className="text-white/90">Stream Info</span>
              </div>

              {showInfo && (
                <div className="bg-white/10 p-4 rounded-lg border border-white/20 transition-all duration-300 w-full">
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-bold text-white">
                      Stream Info
                    </h2>
                    <FaTimes
                      className="text-white cursor-pointer"
                      onClick={() => setShowInfo(false)}
                    />
                  </div>
                  <p className="text-white/80">
                    The puppy cam is live! We stream when we have puppies to
                    show, and we do not include audio due to the location of the
                    camera. Enjoy the puppies!
                  </p>
                </div>
              )}
            </div>

            {settings?.streamDown ? <StreamDown /> : <StreamUp />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Live;
