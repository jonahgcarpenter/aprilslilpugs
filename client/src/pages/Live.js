import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";

// CONTEXT
import { useSettings } from "../context/SettingsContext";
import { useDownDetector } from "../context/DownDetector";

// COMPONENTS
import UnderConstruction from "../components/UnderConstruction";
import Stream from "../components/LiveStream/Stream";
import StreamDown from "../components/LiveStream/StreamDown";
import LoadingAnimation from "../components/LoadingAnimation";

const Live = () => {
  const { liveEnabled } = useSettings();
  const { isStreamAvailable, isLoading, checkStreamStatus } = useDownDetector();

  useEffect(() => {
    if (liveEnabled) {
      checkStreamStatus();
    }
  }, [liveEnabled, checkStreamStatus]);

  if (!liveEnabled) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <UnderConstruction />
        {isLoading ? (
          <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50">
            <LoadingAnimation />
          </div>
        ) : isStreamAvailable ? (
          <Stream />
        ) : (
          <StreamDown />
        )}
      </div>
    </div>
  );
};

export default Live;
