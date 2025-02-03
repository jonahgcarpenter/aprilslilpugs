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
  const [settings, setSettings] = useState({
    waitlistEnabled: true,
    liveEnabled: false,
    isLoading: true,
    error: null
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettings(prev => ({ ...prev, isLoading: true }));
        const token = localStorage.getItem('token');
        if (!token) {
          setSettings(prev => ({
            ...prev,
            isLoading: false,
            error: 'Authentication token not found'
          }));
          return;
        }

        const response = await fetch('/api/settings', {
          headers: getAuthHeaders()
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to fetch settings');
        }

        const data = await response.json();
        setSettings({
          waitlistEnabled: data.waitlistEnabled,
          liveEnabled: data.liveEnabled,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
        setSettings(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
      }
    };

    fetchSettings();
  }, []);

  const toggleWaitlist = async () => {
    try {
      const response = await fetch('/api/settings/toggle-waitlist', {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to toggle waitlist');
      }

      const data = await response.json();
      setSettings(prev => ({
        ...prev,
        waitlistEnabled: data.waitlistEnabled,
        error: null
      }));
    } catch (error) {
      console.error('Error toggling waitlist:', error);
      setSettings(prev => ({
        ...prev,
        error: error.message
      }));
    }
  };

  const toggleLive = async () => {
    try {
      const response = await fetch('/api/settings/toggle-live', {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to toggle live status');
      }

      const data = await response.json();
      setSettings(prev => ({
        ...prev,
        liveEnabled: data.liveEnabled,
        error: null
      }));
    } catch (error) {
      console.error('Error toggling live status:', error);
      setSettings(prev => ({
        ...prev,
        error: error.message
      }));
    }
  };

  return (
    <SettingsContext.Provider value={{ 
      waitlistEnabled: settings.waitlistEnabled,
      liveEnabled: settings.liveEnabled,
      isLoading: settings.isLoading,
      error: settings.error,
      toggleWaitlist,
      toggleLive
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
