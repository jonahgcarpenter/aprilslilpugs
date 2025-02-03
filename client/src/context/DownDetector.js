import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSettings } from './SettingsContext';

const DownDetectorContext = createContext();
const POLLING_INTERVAL = 30000; // 30 seconds

export const useDownDetector = () => {
  const context = useContext(DownDetectorContext);
  if (!context) {
    throw new Error('useDownDetector must be used within a DownDetectorProvider');
  }
  return context;
};

export const DownDetectorProvider = ({ children }) => {
  const [isStreamAvailable, setIsStreamAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(null);
  const { liveEnabled } = useSettings();

  const checkStreamStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(process.env.REACT_APP_HLS_STREAM_URL);
      const streamIsUp = response.status !== 404;
      setIsStreamAvailable(streamIsUp);
      
      // Only poll if the live page is enabled and stream is down
      if (!streamIsUp && liveEnabled && !pollingInterval) {
        const intervalId = setInterval(async () => {
          try {
            const pollResponse = await fetch(process.env.REACT_APP_HLS_STREAM_URL);
            if (pollResponse.status !== 404) {
              setIsStreamAvailable(true);
              clearInterval(intervalId);
              setPollingInterval(null);
            }
          } catch (error) {
            console.error('Polling error:', error);
          }
        }, POLLING_INTERVAL);
        setPollingInterval(intervalId);
      }
      
      // Clear polling if stream is up or live page is disabled
      if ((streamIsUp || !liveEnabled) && pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    } catch (error) {
      console.error('Stream check error:', error);
      setIsStreamAvailable(false);
    } finally {
      setIsLoading(false);
    }
  }, [pollingInterval, liveEnabled]);

  // Check stream status when live status changes
  useEffect(() => {
    if (liveEnabled) {
      checkStreamStatus();
    } else {
      // Clear polling when live page is disabled
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      setIsStreamAvailable(false);
    }
  }, [liveEnabled, checkStreamStatus]);

  const value = {
    isStreamAvailable,
    isLoading,
    checkStreamStatus,
  };

  return (
    <DownDetectorContext.Provider value={value}>
      {children}
    </DownDetectorContext.Provider>
  );
};
