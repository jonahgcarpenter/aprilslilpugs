import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { FaInfoCircle, FaTimes } from 'react-icons/fa';
import LoadingAnimation from './LoadingAnimation';

const HLS_STREAM_URL = process.env.REACT_APP_HLS_STREAM_URL;

class StreamErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('Stream component error');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4">
          <p>Something went wrong with the stream. Please refresh the page.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

const Stream = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const streamInfo = {
    title: "Welcome to our Puppy Livestream!",
    description: "This livestream is locally maintained and hosted by us. It will only be available when we have puppies to show. We also do not include audio in the stream due to the location of the camera. Enjoy watching the puppies!"
  };

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!playerRef.current && mounted && videoRef.current) {
      const player = videojs(videoRef.current, {
        controls: true,
        fluid: true,
        preload: 'auto',
        width: 720,
        autoplay: true,
        sources: [{
          src: HLS_STREAM_URL,
          type: 'application/x-mpegURL'
        }]
      });

      playerRef.current = player;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-4">
          Live Puppy Cam
        </h1>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 mb-4 cursor-pointer" onClick={() => setShowInfo(!showInfo)}>
          <FaInfoCircle className="text-blue-400" />
          <span className="text-white/90">Info</span>
        </div>
        {showInfo && (
          <div className="bg-white/10 p-4 rounded-lg border border-white/20 transition-all duration-300">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-white">{streamInfo.title}</h2>
              <FaTimes className="text-white cursor-pointer" onClick={() => setShowInfo(false)} />
            </div>
            <p className="text-white/80">{streamInfo.description}</p>
          </div>
        )}
      </div>

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
    </div>
  );
};

export default function SafeStream() {
  return (
    <StreamErrorBoundary>
      <Stream />
    </StreamErrorBoundary>
  );
}
