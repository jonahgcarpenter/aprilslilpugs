import React, { useContext, useEffect, useState } from 'react';
import { LitterContext } from '../context/LitterContext';
import LoadingAnimation from './LoadingAnimation';

const Litters = () => {
  const { litters, loading: fetchLoading, error, fetchLitters } = useContext(LitterContext);
  const [selectedLitter, setSelectedLitter] = useState(null);
  const [loadingPuppies, setLoadingPuppies] = useState(false);
  const [loading, setLoading] = useState(true);

  const preloadLitterImages = async (litters) => {
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = `/api/images${src}`;
        img.onload = resolve;
        img.onerror = reject;
      });
    };

    try {
      await Promise.all(litters.map(litter => loadImage(litter.image)));
    } catch (error) {
      console.error('Error preloading litter images:', error);
    }
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      await fetchLitters();
    };
    loadAllData();
  }, []);

  useEffect(() => {
    const loadImages = async () => {
      if (litters.length > 0) {
        await preloadLitterImages(litters);
        setLoading(false);
      }
    };
    loadImages();
  }, [litters]);

  const isDateInFuture = (dateString) => {
    // Parse the ISO date string (YYYY-MM-DD)
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-based in Date constructor
    
    // Get current date in Central Time
    const now = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
    const currentDate = new Date(now);
    
    // Set both dates to start of day for accurate comparison
    date.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);
    
    return date > currentDate;
  };

  const preloadImages = async (puppies) => {
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = `/api/images${src}`;
        img.onload = resolve;
        img.onerror = reject;
      });
    };

    try {
      await Promise.all(puppies.map(puppy => loadImage(puppy.image)));
    } catch (error) {
      console.error('Error preloading images:', error);
    }
  };

  const handleLitterClick = async (litter) => {
    setSelectedLitter(litter);
    if (litter.puppies && litter.puppies.length > 0) {
      setLoadingPuppies(true);
      // Preload all puppy images
      await preloadImages(litter.puppies);
      setLoadingPuppies(false);
    }
  };

  return (
    <div className={`transition-all duration-500 ease-in-out`}>
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
            Litters
          </h1>
          
          {loading || fetchLoading ? (
            <div className="h-20 flex items-center justify-center">
              <LoadingAnimation />
            </div>
          ) : error ? (
            <div className="p-4 sm:p-8">
              <p className="text-red-500 text-center">{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {litters.map((litter) => (
                <div 
                  key={litter.id} 
                  className="bg-slate-800/50 rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 border border-slate-700/50 cursor-pointer"
                  onClick={() => handleLitterClick(litter)}
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={`/api/images${litter.image}`}
                      alt={litter.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 space-y-4">
                    <h2 className="text-2xl font-semibold text-slate-100">{litter.name}</h2>
                    <div className="space-y-2 text-slate-300">
                      <p>
                        {isDateInFuture(litter.birthDate) ? 'Expected' : 'Born'} on {litter.birthDate}
                      </p>
                      <p>Available on {litter.availableDate}</p>
                      <p>Mother: {litter.mother}</p>
                      <p>Father: {litter.father}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedLitter && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedLitter(null)}
          />
          <div className="relative z-[10000] bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl max-w-7xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                {selectedLitter.name}
              </h3>
              <button
                onClick={() => setSelectedLitter(null)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Close litter details"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {selectedLitter.puppies && selectedLitter.puppies.length > 0 ? (
              loadingPuppies ? (
                <LoadingAnimation containerClassName="p-12" />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {selectedLitter.puppies.map((puppy) => (
                    <div 
                      key={puppy.id}
                      className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50"
                    >
                      <div className="aspect-square w-full overflow-hidden">
                        <img
                          src={`/api/images${puppy.image}`}
                          alt={puppy.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 space-y-4">
                        <h4 className="text-2xl font-semibold text-slate-100">
                          {puppy.name}
                        </h4>
                        <div className="space-y-2 text-slate-300">
                          <p>Color: {puppy.color}</p>
                          <p>Gender: {puppy.gender}</p>
                          <p className={`inline-block px-3 py-1 rounded-full text-sm ${
                            puppy.status === 'Available' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {puppy.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <h4 className="text-3xl font-bold text-blue-400 mb-4">COMING SOON</h4>
                <p className="text-slate-400">Photos and details of the puppies will be available after they are born.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Litters;
