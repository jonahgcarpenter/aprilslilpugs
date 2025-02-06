import { createContext, useContext, useState, useEffect } from "react";

export const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    waitlistEnabled: null, // Initialize as null
    liveEnabled: null, // Initialize as null
    isLoading: true,
    error: null,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const response = await fetch(`/api/settings?t=${Date.now()}`, {
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch settings");
        }

        if (isMounted) {
          setSettings({
            waitlistEnabled: data.waitlistEnabled,
            liveEnabled: data.liveEnabled,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        if (isMounted) {
          setSettings((prev) => ({
            ...prev,
            isLoading: false,
            error: error.message,
          }));
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleWaitlist = async () => {
    try {
      setSettings((prev) => ({ ...prev, isLoading: true }));
      const response = await fetch("/api/settings/toggle-waitlist", {
        method: "POST",
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to toggle waitlist");
      }

      setSettings((prev) => ({
        ...prev,
        waitlistEnabled: data.waitlistEnabled,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Error toggling waitlist:", error);
      setSettings((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  };

  const toggleLive = async () => {
    try {
      setSettings((prev) => ({ ...prev, isLoading: true }));
      const response = await fetch("/api/settings/toggle-live", {
        method: "POST",
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to toggle live status");
      }

      setSettings((prev) => ({
        ...prev,
        liveEnabled: data.liveEnabled,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error("Error toggling live status:", error);
      setSettings((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message,
      }));
    }
  };

  if (settings.isLoading) {
    return (
      <SettingsContext.Provider
        value={{
          waitlistEnabled: null,
          liveEnabled: null,
          isLoading: true,
          error: null,
          toggleWaitlist,
          toggleLive,
        }}
      >
        {children}
      </SettingsContext.Provider>
    );
  }

  return (
    <SettingsContext.Provider
      value={{
        waitlistEnabled: settings.waitlistEnabled,
        liveEnabled: settings.liveEnabled,
        isLoading: settings.isLoading,
        error: settings.error,
        toggleWaitlist,
        toggleLive,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
