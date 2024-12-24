import React from 'react';

const Construction: React.FC = () => {
  return (
    <div className="bg-blue-900/30 rounded-lg p-6 mb-8 mx-auto max-w-4xl">
      <div className="flex items-center justify-center space-x-4">
        <span className="text-3xl">🚧</span>
        <p className="text-slate-300 text-lg">
          This website is under active development. Content may be placeholder material until finalized by April.
        </p>
        <span className="text-3xl">🚧</span>
      </div>
    </div>
  );
};

export default Construction;
