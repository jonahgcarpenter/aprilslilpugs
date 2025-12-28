import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const STREAM_URL = "/hls/test.m3u8";
const LOGO_URL = "/logo.jpg";

const Stream = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
      });

      hls.loadSource(STREAM_URL);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => {
          console.log("Autoplay prevented:", e);
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error("Network error encountered", data);
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("Media error encountered", data);
              hls.recoverMediaError();
              break;
            default:
              console.error("Fatal error, cannot recover", data);
              hls.destroy();
              setError("Stream is currently offline.");
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = STREAM_URL;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((e) => {
          console.log("Autoplay prevented:", e);
        });
      });

      video.addEventListener("error", () => {
        setError("Stream is currently offline.");
      });
    } else {
      setError("Your browser does not support HLS playback.");
    }
  }, []);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl transform rotate-1 opacity-20"></div>
      <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl">
        <div className="aspect-video relative group">
          {error ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900">
              <svg
                className="w-12 h-12 mb-4 text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              <p>{error}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              controls={true}
              muted
              playsInline
            />
          )}

          {!error && (
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 pointer-events-none select-none">
              {/* Live Badge */}
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-0.5 sm:px-3 sm:py-1 bg-red-600/90 backdrop-blur-sm rounded-full w-fit shadow-lg">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  Live
                </span>
              </div>

              {/* Watermark Logo */}
              <img
                src={LOGO_URL}
                alt="Channel Logo"
                className="w-10 sm:w-16 opacity-80 ml-1"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stream;
