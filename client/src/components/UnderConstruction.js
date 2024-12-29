import React from 'react';

const UnderConstruction = () => {
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm text-white w-full px-6 py-3 text-center border-b border-slate-800/30 font-medium flex items-center justify-center gap-3 shadow-lg">
      <span role="img" aria-label="construction" className="text-2xl">🚧</span>
      <span className="text-base sm:text-lg">This page is currently under development - Check back soon for updates!</span>
      <span role="img" aria-label="construction" className="text-2xl">🚧</span>
    </div>
  );
};

export default UnderConstruction;
