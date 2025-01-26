import React, { useContext, useEffect, useState } from 'react';
import { LitterContext } from '../context/LitterContext';

/**
 * Litters Component
 * Displays all litters with their details and puppies
 */
const Litters = () => {
  // Context and State
  const { litters, loading, error, fetchLitters } = useContext(LitterContext);
  const [selectedLitter, setSelectedLitter] = useState(null);

  // Load litters on mount
  useEffect(() => {
    fetchLitters();
  }, []);

  // Utility Functions
  const isDateInFuture = (dateString) => {
    return new Date(dateString) > new Date();
  };

  // Loading and Error States
  if (loading) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <>
      <div className={`transition-all duration-300 ${selectedLitter ? 'blur-sm' : ''}`}>
        <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
              Litters
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {litters.map((litter) => (
                <div 
                  key={litter.id} 
                  className="bg-slate-800/50 rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 border border-slate-700/50 cursor-pointer"
                  onClick={() => setSelectedLitter(litter)}
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
          </div>
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
          </div>
        </div>
      )}
    </>
  );
};

export default Litters;
