/**
 * Live Stream Context
 * Manages the state and functionality for live streaming features
 */
import { createContext, useContext, useState, useEffect } from 'react';

const LiveContext = createContext();

export const LiveProvider = ({ children }) => {
  // State Management
  const [isLive, setIsLive] = useState(false);

  // Initial fetch of live status
  useEffect(() => {
    // Fetch initial state
    const fetchLiveStatus = async () => {
      try {
        const response = await fetch('/api/live');
        const json = await response.json();
        setIsLive(json.isLive);
      } catch (error) {
        console.error('Error fetching live status:', error);
      }
    };
    fetchLiveStatus();
  }, []);

  // Toggle live stream status
  const toggleLive = async () => {
    try {
      const response = await fetch('/api/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLive: !isLive })
      });
      const json = await response.json();
      setIsLive(json.isLive);
    } catch (error) {
      console.error('Error updating live status:', error);
    }
  };

  // Context Provider
  return (
    <LiveContext.Provider value={{ isLive, toggleLive }}>
      {children}
    </LiveContext.Provider>
  );
};

export const useLive = () => useContext(LiveContext);
