import { createContext, useContext, useState, useEffect } from 'react';

const LiveContext = createContext();

export const LiveProvider = ({ children }) => {
  const [isLive, setIsLive] = useState(() => {
    const saved = localStorage.getItem('isLive');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleLive = () => {
    const newState = !isLive;
    setIsLive(newState);
    localStorage.setItem('isLive', JSON.stringify(newState));
  };

  return (
    <LiveContext.Provider value={{ isLive, toggleLive }}>
      {children}
    </LiveContext.Provider>
  );
};

export const useLive = () => useContext(LiveContext);
