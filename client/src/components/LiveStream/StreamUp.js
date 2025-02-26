import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { useSettings } from "../../hooks/useSettings";

const StreamUp = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const isHandlingError = useRef(false);
  const { toggleStreamDown } = useSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (mounted && videoRef.current && !playerRef.current) {
      requestAnimationFrame(() => {
        if (!playerRef.current) {
          const player = videojs(videoRef.current, {
            controls: true,
            fluid: true,
            preload: "auto",
            width: 720,
            autoplay: true,
            sources: [
              {
                src: "/hls/test.m3u8",
                type: "application/x-mpegURL",
              },
            ],
          });

          const origWarn = videojs.log.warn;
          videojs.log.warn = function (msg) {
            if (
              msg?.includes("Problem encountered with playlist") &&
              !isHandlingError.current
            ) {
              isHandlingError.current = true;
              toggleStreamDown();
            }
            origWarn.apply(this, arguments);
          };

          player.on("error", () => {
            if (!isHandlingError.current) {
              isHandlingError.current = true;
              toggleStreamDown();
            }
          });

          playerRef.current = player;
        }
      });
    }

    return () => {
      if (playerRef.current) {
        if (videojs.log.warn.__original) {
          videojs.log.warn = videojs.log.warn.__original;
        }
        playerRef.current.dispose();
        playerRef.current = null;
      }
      isHandlingError.current = false;
    };
  }, [mounted, toggleStreamDown]);

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl transform rotate-1 opacity-20"></div>
      <div className="relative bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
        <div data-vjs-player className="aspect-video">
          <video
            ref={videoRef}
            className="video-js vjs-default-skin vjs-big-play-centered"
            playsInline
          />
        </div>
      </div>
    </div>
  );
};

export default StreamUp;
