import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { useSettings } from "../../hooks/useSettings";

const HLS_STREAM_URL = process.env.REACT_APP_HLS_STREAM_URL;

const StreamUp = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const isHandlingError = useRef(false);
  const { toggleStreamDown } = useSettings();

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      setTimeout(() => {
        if (videoRef.current) {
          const player = videojs(videoRef.current, {
            controls: true,
            fluid: true,
            preload: "auto",
            width: 720,
            autoplay: true,
            sources: [{ src: HLS_STREAM_URL, type: "application/x-mpegURL" }],
          });

          // Add error handler for video.js player
          player.on("error", async () => {
            if (isHandlingError.current) return; // Prevent duplicate requests
            isHandlingError.current = true;

            try {
              const response = await fetch(HLS_STREAM_URL, { method: "HEAD" });
              if (response.status === 404) {
                toggleStreamDown();
              }
            } catch (error) {
              console.error("Error checking stream status:", error);
              toggleStreamDown();
            }
          });

          playerRef.current = player;
        }
      }, 100);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
      isHandlingError.current = false;
    };
  }, [toggleStreamDown]);

  return (
    <div className="relative min-h-[300px]">
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
