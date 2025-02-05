import React, { useEffect } from "react";

const SuccessModal = ({
  isOpen,
  message,
  title = "Success!",
  delay = 2000, // 2 seconds delay before refresh
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, delay]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-start justify-center p-4 z-[9999]">
      <div className="mt-[15vh] bg-slate-900/90 backdrop-blur-sm rounded-xl p-8 max-w-md w-full border border-white/10">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-500 to-green-600 mb-6">
          {title}
        </h2>
        <p className="text-slate-300 mb-6">{message}</p>
        <div className="flex justify-center">
          <div className="animate-pulse text-sm text-slate-400">
            Refreshing page...
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
