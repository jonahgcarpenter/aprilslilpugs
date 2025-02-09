import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

const Stream = ({ streamUrl }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && videoRef.current) {
      if (!streamUrl) {
        return;
      }

      // Ensure Video.js is not re-initialized on re-renders
      if (!playerRef.current) {
        const player = videojs(videoRef.current, {
          controls: true,
          fluid: true,
          preload: "auto",
          width: 720,
          autoplay: true,
          sources: [{ src: streamUrl, type: "application/x-mpegURL" }],
        });

        playerRef.current = player;
      }
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [isMounted, streamUrl]);

  return (
    <div className="relative min-h-[300px]">
      {" "}
      {/* Ensures space for the player */}
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

export default Stream;
