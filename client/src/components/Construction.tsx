import React from 'react';

const Construction: React.FC = () => {
  return (
    <div className="bg-blue-900/30 rounded-lg p-4 mb-8 mx-auto max-w-7xl">
      <div className="flex flex-col sm:flex-row items-center justify-center text-center sm:text-left gap-2">
        <span className="text-2xl">🚧</span>
        <p className="text-slate-300">
          <span className="font-semibold">Site Updates:</span> We're continuously improving our website to serve you better. Check back regularly for new features and content!
        </p>
        <span className="text-2xl">🚧</span>
      </div>
    </div>
  );
};

export default Construction;
