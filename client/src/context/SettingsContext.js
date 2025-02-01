import { createContext, useContext, useState, useEffect } from 'react';

export const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [waitlistEnabled, setWaitlistEnabled] = useState(true);

  // Fetch initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        setWaitlistEnabled(data.waitlistEnabled);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const toggleWaitlist = async () => {
    try {
      const response = await fetch('/api/settings/toggle-waitlist', {
        method: 'POST'
      });
      const data = await response.json();
      setWaitlistEnabled(data.waitlistEnabled);
    } catch (error) {
      console.error('Error toggling waitlist:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ waitlistEnabled, toggleWaitlist }}>
      {children}
    </SettingsContext.Provider>
  );
};
