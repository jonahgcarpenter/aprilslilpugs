import { createContext, useContext, useState } from 'react';

const LiveContext = createContext();

export const LiveProvider = ({ children }) => {
  const [isLive, setIsLive] = useState(false);

  const toggleLive = () => {
    setIsLive(!isLive);
  };

  return (
    <LiveContext.Provider value={{ isLive, toggleLive }}>
      {children}
    </LiveContext.Provider>
  );
};

export const useLive = () => useContext(LiveContext);
