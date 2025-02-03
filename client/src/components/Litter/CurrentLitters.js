import React, { useContext, useEffect, useState } from 'react';
import { LitterContext } from '../../context/LitterContext';
import LoadingAnimation from '../LoadingAnimation';

const CurrentLitters = () => {
  const { litters, loading, error } = useContext(LitterContext);
  const [selectedLitter, setSelectedLitter] = useState(null);
  const [availableLitters, setAvailableLitters] = useState([]);

  const preloadImages = async (images) => {
    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = `/api/images${src}`;
        img.onload = resolve;
        img.onerror = reject;
      });
    };

    try {
      await Promise.all(images.map(src => loadImage(src)));
    } catch (error) {
      console.error('Error preloading images:', error);
    }
  };

  useEffect(() => {
    if (litters.length > 0) {
      const filtered = litters.filter(litter => 
        litter.puppies && 
        litter.puppies.some(puppy => 
          puppy.status === 'Available' || puppy.status === 'Reserved'
        )
      );
      setAvailableLitters(filtered);

      // Preload all litter images
      const litterImages = filtered.map(litter => litter.profilePicture);
      const puppyImages = filtered.flatMap(litter => 
        litter.puppies.map(puppy => puppy.profilePicture)
      );
      preloadImages([...litterImages, ...puppyImages]);
    }
  }, [litters]);

  const handleLitterClick = async (litter) => {
    setSelectedLitter(litter);
  };

  return (
    <div className={`transition-all duration-500 ease-in-out`}>
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
            Current Litters
          </h1>
          
          {loading ? (
            <div className="h-20 flex items-center justify-center">
              <LoadingAnimation />
            </div>
          ) : error ? (
            <div className="p-4 sm:p-8">
              <p className="text-red-500 text-center">{error}</p>
            </div>
          ) : availableLitters.length === 0 ? (
            <div className="space-y-8">
              <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-square w-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <svg className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                        Coming Soon
                      </h3>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
                      No Active Litters
                    </h2>
                    <div className="space-y-6 text-lg text-slate-300">
                      <p>
                        We currently do not have any available puppies.
                        Stay connected for updates on upcoming litters!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <a 
                          href="https://www.facebook.com/AprilsLilPugs" 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600/20 to-blue-500/20 hover:from-blue-600/30 hover:to-blue-500/30 text-blue-400 rounded-xl border border-blue-500/20 transition-all duration-300 hover:scale-105"
                        >
                          <span>Follow on Facebook</span>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z"/>
                          </svg>
                        </a>
                        <a 
                          href="/past-litters" 
                          className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-slate-700/30 to-slate-600/30 hover:from-slate-700/40 hover:to-slate-600/40 text-slate-300 rounded-xl border border-slate-600/30 transition-all duration-300 hover:scale-105"
                        >
                          <span>View Past Litters</span>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {availableLitters.map((litter) => (
                <div 
                  key={litter.id} 
                  className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="aspect-[4/3] sm:aspect-[16/9] lg:aspect-square w-full overflow-hidden">
                      <img
                        src={`/api/images/uploads/litter-images/${litter.profilePicture}`}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {selectedLitter.puppies.map((puppy) => (
                <div 
                  key={puppy.id}
                  className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50"
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={`/api/images/uploads/puppy-images/${puppy.profilePicture}`}
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
                          : puppy.status === 'Reserved'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {puppy.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentLitters;
