import { useState } from "react";
import useSWR, { mutate } from "swr";
import axios from "axios";
import { getToken } from "../utils/auth";

const API_BASE_URL = "/api/settings";

export interface Settings {
  waitlistEnabled: boolean;
  liveEnabled: boolean;
  streamDown: boolean;
}

const fetchSettings = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};

export const useSettings = () => {
  const { data, error, isLoading, mutate } = useSWR<Settings>(
    API_BASE_URL,
    fetchSettings,
  );

  const [toggleWaitlistLoading, setToggleWaitlistLoading] = useState(false);
  const [toggleLiveLoading, setToggleLiveLoading] = useState(false);
  const [toggleStreamLoading, setToggleStreamLoading] = useState(false);

  const toggleWaitlist = async () => {
    const token = getToken();
    if (!token) throw new Error("Unauthorized");

    try {
      setToggleWaitlistLoading(true);
      await axios.post(
        `${API_BASE_URL}/toggle-waitlist`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setToggleWaitlistLoading(false);
    }
  };

  const toggleLive = async () => {
    const token = getToken();
    if (!token) throw new Error("Unauthorized");

    try {
      setToggleLiveLoading(true);
      await axios.post(
        `${API_BASE_URL}/toggle-live`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setToggleLiveLoading(false);
    }
  };

  const toggleStreamDown = async () => {
    try {
      setToggleStreamLoading(true);
      await axios.post(`${API_BASE_URL}/stream-down`);
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setToggleStreamLoading(false);
    }
  };

  return {
    settings: data,
    isLoading,
    error,
    toggleWaitlist,
    toggleLive,
    toggleStreamDown,
    toggleWaitlistLoading,
    toggleLiveLoading,
    toggleStreamLoading,
  };
};
