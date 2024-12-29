import React from 'react';

const UnderConstruction = () => {
  return (
    <div className="bg-slate-900 text-white px-8 py-4 rounded-xl shadow-xl border border-slate-800/30 font-medium flex items-center justify-center gap-3">
      <span role="img" aria-label="construction" className="text-2xl">🚧</span>
      <span className="text-base sm:text-lg">This page is currently under development - Check back soon for updates!</span>
      <span role="img" aria-label="construction" className="text-2xl">🚧</span>
    </div>
  );
};

export default UnderConstruction;
