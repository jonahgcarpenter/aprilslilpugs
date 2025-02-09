import React, { useState, useEffect } from "react";
import { useSettings } from "../hooks/useSettings";

// COMPONENTS
import UnderConstruction from "../components/Misc/UnderConstruction";
import Stream from "../components/LiveStream/Stream";
import StreamDown from "../components/LiveStream/StreamDown";
import LoadingAnimation from "../components/Misc/LoadingAnimation";
import { FaInfoCircle, FaTimes } from "react-icons/fa";

const HLS_STREAM_URL = process.env.REACT_APP_HLS_STREAM_URL;

const Live = () => {
  const { isLoading } = useSettings();
  const [isStreamDown, setIsStreamDown] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const checkStreamStatus = async () => {
      try {
        const response = await fetch(HLS_STREAM_URL, { method: "HEAD" });
        setIsStreamDown(response.status === 404);
      } catch (error) {
        setIsStreamDown(true); // Handle network errors as "stream down"
      }
    };

    checkStreamStatus();
  }, []);

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

              {/* Info Button */}
              <div
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-4 cursor-pointer"
                onClick={() => setShowInfo(!showInfo)}
              >
                <FaInfoCircle className="text-blue-400" />
                <span className="text-white/90">Stream Info</span>
              </div>

              {/* Info Panel */}
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

            {/* Stream or StreamDown Component */}
            {isStreamDown ? (
              <StreamDown />
            ) : (
              <Stream streamUrl={HLS_STREAM_URL} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Live;
