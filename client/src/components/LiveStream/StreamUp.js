import React, { useEffect, useRef } from "react";
import Hls from "hls.js";
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
      const hls = new Hls({
        manifestLoadingTimeOut: 10000,
        manifestLoadingMaxRetry: 3,
        levelLoadingTimeOut: 10000,
        levelLoadingMaxRetry: 3,
      });
      hlsRef.current = hls;

      hls.loadSource("/hls/test.m3u8");
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          console.log("Autoplay was prevented.");
        });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn(
                "Fatal network error encountered, trying to recover...",
              );
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn(
                "Fatal media error encountered, trying to recover...",
              );
              hls.recoverMediaError();
              break;
            default:
              if (!isHandlingError.current) {
                console.error("Unrecoverable HLS.js fatal error:", data);
                isHandlingError.current = true;
                hls.destroy();
                toggleStreamDown();
              }
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = "/hls/test.m3u8";
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(() => {
          console.log("Autoplay was prevented.");
        });
      });

      video.addEventListener("error", (e) => {
        console.error("Native Video Error", e);
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
