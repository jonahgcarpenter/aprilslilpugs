import React from 'react';

const UnderConstruction = () => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-sm text-white px-8 py-6 rounded-xl shadow-xl border border-white/10 hover:border-white/20 font-medium flex items-center justify-center gap-4 transform transition-all duration-300">
      <span role="img" aria-label="construction" className="text-3xl animate-bounce">🚧</span>
      <span className="text-base sm:text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white">
        This page is currently under development - Check back soon for updates!
      </span>
      <span role="img" aria-label="construction" className="text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>🚧</span>
    </div>
  );
};

export default UnderConstruction;
