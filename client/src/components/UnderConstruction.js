import React from 'react';

/**
 * UnderConstruction Component
 * Displays a stylized construction notice banner
 */
const UnderConstruction = () => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-sm text-white 
      px-4 sm:px-8 py-4 sm:py-6 
      rounded-xl shadow-xl border border-white/10 hover:border-white/20 
      font-medium flex items-center justify-center 
      gap-2 sm:gap-4 
      transform transition-all duration-300">
      {/* Construction Emoji Left */}
      <span role="img" aria-label="construction" className="text-2xl sm:text-3xl animate-bounce">
        🚧
      </span>
      
      {/* Notice Text */}
      <span className="text-sm sm:text-base text-center sm:text-left
        bg-clip-text text-transparent bg-gradient-to-r 
        from-white via-white/90 to-white">
        This page is always under development - Check back soon for updates!
      </span>
      
      {/* Construction Emoji Right */}
      <span role="img" aria-label="construction" 
        className="text-2xl sm:text-3xl animate-bounce" 
        style={{ animationDelay: '0.2s' }}>
        🚧
      </span>
    </div>
  );
};

export default UnderConstruction;
