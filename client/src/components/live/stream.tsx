import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import type { StreamStatus } from "../../hooks/usestreamstatus";
import { FaExpand, FaCompress } from "react-icons/fa";

const LOGO_URL = "/logo.jpg";
const OFFLINE_IMAGE_URL = "/stream-offline.jpg";

interface StreamProps {
  streamStatus?: StreamStatus;
}

const Stream = ({ streamStatus }: StreamProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const streamUrl = streamStatus?.playback_url;
  const isLive = streamStatus?.live ?? false;
  const isEnabled = streamStatus?.enabled ?? false;
  const hasPublisher = streamStatus?.publisher_connected ?? false;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    setError(null);

    if (!video || !isEnabled || !isLive || !streamUrl) {
      if (video) {
        video.removeAttribute("src");
        video.load();
      }
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => {
          console.warn("Stream autoplay prevented:", e);
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
      const handleLoadedMetadata = () => {
        video.play().catch((e) => {
          console.warn("Stream autoplay prevented:", e);
        });
      };

      const handleError = () => {
        console.warn("Native HLS playback failed for stream.");
        setError("Stream is currently offline.");
      };

      video.src = streamUrl;
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      video.addEventListener("error", handleError);

      return () => {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.removeEventListener("error", handleError);
        video.removeAttribute("src");
        video.load();
      };
    } else {
      setError("Your browser does not support HLS playback.");
    }
  }, [isEnabled, isLive, streamUrl]);

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    try {
      if (document.fullscreenElement === container) {
        await document.exitFullscreen();
      } else {
        await container.requestFullscreen();
      }
    } catch (fullscreenError) {
      console.warn("Fullscreen request failed:", fullscreenError);
    }
  };

  const statusMessage = error
    ? error
    : !isEnabled
      ? "Stream is disabled."
      : !hasPublisher
        ? "Waiting for camera to connect."
        : !isLive
          ? "Preparing live stream."
          : null;

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl transform rotate-1 opacity-20"></div>
      <div
        ref={containerRef}
        className="relative bg-slate-900/90 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 shadow-2xl"
      >
        <div className="aspect-video relative group">
          {statusMessage ? (
            <div className="w-full h-full bg-slate-950">
              <img
                src={OFFLINE_IMAGE_URL}
                alt="The live puppy cam is temporarily offline."
                className="h-full w-full object-cover"
              />
              <span className="sr-only">{statusMessage}</span>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
              autoPlay
            />
          )}

          {!statusMessage && (
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 pointer-events-none select-none">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 py-0.5 sm:px-3 sm:py-1 bg-red-600/90 backdrop-blur-sm rounded-full w-fit shadow-lg">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  Live
                </span>
              </div>

              <img
                src={LOGO_URL}
                alt="Channel Logo"
                className="w-10 sm:w-16 opacity-80 ml-1"
              />
            </div>
          )}

          {!statusMessage && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="absolute bottom-4 right-4 z-10 rounded-full bg-slate-950/70 p-3 text-white shadow-lg transition hover:bg-slate-900/90 cursor-pointer"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <FaCompress /> : <FaExpand />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stream;
