import React, { useEffect, useRef } from "react";
import Hls from "hls.js"; // Import hls.js
import { useSettings } from "../../hooks/useSettings";

const StreamUp = () => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const isHandlingError = useRef(false);
  const { toggleStreamDown } = useSettings();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;

      hls.loadSource("/hls/test.m3u8");
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          console.log("Autoplay was prevented.");
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal && !isHandlingError.current) {
          console.error("HLS.js fatal error:", data);
          isHandlingError.current = true; // Prevent multiple triggers
          toggleStreamDown(); // Switch to the "StreamDown" component
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Fallback for native HLS support (like Safari)
      video.src = "/hls/test.m3u8";
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {
          console.log("Autoplay was prevented.");
        });
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      isHandlingError.current = false;
    };
  }, [toggleStreamDown]);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl transform rotate-1 opacity-20"></div>
      <div className="relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
        <div className="aspect-video">
          <video
            ref={videoRef}
            controls
            autoPlay
            muted
            playsInline
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default StreamUp;
