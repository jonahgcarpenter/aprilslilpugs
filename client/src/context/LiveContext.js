import { createContext, useContext, useState, useEffect } from 'react';

const LiveContext = createContext();

export const LiveProvider = ({ children }) => {
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
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

  return (
    <LiveContext.Provider value={{ isLive, toggleLive }}>
      {children}
    </LiveContext.Provider>
  );
};

export const useLive = () => useContext(LiveContext);
