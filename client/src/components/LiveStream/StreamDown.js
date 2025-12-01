import React, { useEffect } from "react";
import { useSettings } from "../../hooks/useSettings";

const StreamDown = () => {
  const { toggleStreamDown } = useSettings();

  useEffect(() => {
    const checkStreamInterval = setInterval(async () => {
      try {
        const response = await fetch("/hls/test.m3u8", { method: "HEAD" });
        if (response.status === 200) {
          toggleStreamDown();
        }
      } catch (error) {}
    }, 5000);

    return () => clearInterval(checkStreamInterval);
  }, [toggleStreamDown]);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl transform rotate-1 opacity-20"></div>
      <div className="relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
        <div
          className="aspect-video flex items-center justify-center bg-cover bg-center relative"
          style={{
            backgroundImage: 'url("offline-placeholder.jpg")',
          }}
        >
          <div className="absolute inset-0 backdrop-blur-[2px] bg-black/30"></div>
          <div className="bg-black/50 px-6 py-3 rounded-lg relative z-10">
            <p className="text-xl text-white">
              Stream is currently offline, we are aware of this issue and are
              working to resolve it! Once it is back online the stream will
              automatically reappear.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamDown;
