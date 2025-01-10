import React, { useState, useEffect } from 'react';

// COMPONENTES
import UnderConstruction from '../components/UnderConstruction';
import Stream from '../components/Stream';

const Live = () => {
  const [isStreamAvailable, setIsStreamAvailable] = useState(true);

  useEffect(() => {
    checkStreamAvailability();
  }, []);

  const checkStreamAvailability = async () => {
    try {
      const response = await fetch(process.env.REACT_APP_HLS_STREAM_URL);
      setIsStreamAvailable(response.ok);
    } catch (error) {
      console.error('Stream check failed:', error);
      setIsStreamAvailable(false);
    }
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <UnderConstruction />
        {isStreamAvailable ? (
          <Stream />
        ) : (
          <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
            <div className="aspect-video relative">
              <img 
                src="placeholder-live.png" 
                alt="Stream offline" 
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                <p className="text-white text-lg mb-2">Stream is currently offline.</p>
                <p className="text-white text-lg">We are aware of this and are working on a fix.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Live;
