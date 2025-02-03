import React, { useContext, useEffect, useState } from 'react';
import { LitterContext } from '../context/LitterContext';
import LoadingAnimation from './LoadingAnimation';

const OldLitters = () => {
  const { litters, loading: fetchLoading, error, fetchLitters } = useContext(LitterContext);
  const [selectedLitter, setSelectedLitter] = useState(null);
  const [loadingPuppies, setLoadingPuppies] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pastLitters, setPastLitters] = useState([]);

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
      await Promise.all(litters.map(litter => loadImage(litter.profilePicture)));
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
    const filterPastLitters = () => {
      const filtered = litters.filter(litter => 
        litter.puppies && 
        litter.puppies.length > 0 && 
        litter.puppies.every(puppy => puppy.status === 'Sold')
      );
      setPastLitters(filtered);
    };

    const loadImages = async () => {
      if (litters.length > 0) {
        filterPastLitters();
        await preloadLitterImages(litters);
        setLoading(false);
      }
    };
    loadImages();
  }, [litters]);

  const isDateInFuture = (dateString) => {
    try {
      // Parse the date string into a Date object
      const inputDate = new Date(dateString);
      
      // Get current date in Central Time
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
      
      // Set both dates to start of day for accurate comparison
      inputDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      
      return inputDate > now;
    } catch (error) {
      console.error('Error comparing dates:', error);
      return false;
    }
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
      await Promise.all(puppies.map(puppy => loadImage(puppy.profilePicture)));
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
            Past Litters
          </h1>
          
          {loading || fetchLoading ? (
            <div className="h-20 flex items-center justify-center">
              <LoadingAnimation />
            </div>
          ) : error ? (
            <div className="p-4 sm:p-8">
              <p className="text-red-500 text-center">{error}</p>
            </div>
          ) : pastLitters.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-slate-300 text-lg">No past litters to display</p>
            </div>
          ) : (
            <div className="space-y-8">
              {pastLitters.map((litter) => (
                <div 
                  key={litter.id} 
                  className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-square w-full overflow-hidden">
                      <img
                        src={`/api/images${litter.profilePicture}`}
                        alt={litter.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
                        {litter.name}
                      </h2>
                      <div className="space-y-4 text-lg text-slate-300">
                        <p className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span>Born on: {litter.birthDate}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Available on: {litter.availableDate}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>Mother: {litter.mother}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          <span>Father: {litter.father}</span>
                        </p>
                      </div>
                      <button 
                        onClick={() => handleLitterClick(litter)}
                        className="mt-8 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600/20 to-blue-500/20 hover:from-blue-600/30 hover:to-blue-500/30 text-blue-400 rounded-xl border border-blue-500/20 transition-all duration-300 hover:scale-105"
                      >
                        View Puppies
                      </button>
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
                          src={`/api/images${puppy.profilePicture}`}
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

export default OldLitters;
