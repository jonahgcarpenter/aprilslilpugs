import React from 'react';

const LoadingAnimation = ({ containerClassName = "" }) => {
  return (
    <div className={`flex items-center justify-center space-x-2 ${containerClassName}`}>
      <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
      <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
    </div>
  );
};

export default LoadingAnimation;
