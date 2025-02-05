import { FaInfoCircle, FaTimes } from "react-icons/fa";
import { useState } from "react";

const StreamDown = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
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
              <h2 className="text-xl font-bold text-white">Stream Info</h2>
              <FaTimes
                className="text-white cursor-pointer"
                onClick={() => setShowInfo(false)}
              />
            </div>
            <p className="text-white/80">
              The puppy cam is live! We stream when we have puppies to show, and
              we do not include audio due to the location of the camera. Enjoy
              the puppies!
            </p>
          </div>
        )}
      </div>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl transform rotate-1 opacity-20"></div>
        <div className="relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
          <div
            className="aspect-video flex items-center justify-center bg-cover bg-center relative"
            style={{
              backgroundImage: 'url("offline-placeholder.jpg")',
            }}
          >
            <div className="absolute inset-0 backdrop-blur-[2px] bg-black/30"></div>
            <div className="bg-black/50 px-6 py-3 rounded-lg relative z-10">
              <p className="text-xl text-white">
                Stream is currently offline, we are aware of this issue and are
                working to resolve it!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamDown;
