// hook for settings
import useSWR from "swr";
import axios from "axios";

export interface Settings {
  id: number;
  waitlist_enabled: boolean;
  stream_enabled: boolean;
}

const API_URL = "/api/settings";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useSettings = () => {
  const {
    data: settings,
    error,
    isLoading,
    mutate: mutateSettings,
  } = useSWR<Settings>(API_URL, fetcher);

  const toggleWaitlist = async (enabled: boolean) => {
    try {
      await mutateSettings(
        (current) =>
          current ? { ...current, waitlist_enabled: enabled } : undefined,
        false,
      );

      await axios.patch(`${API_URL}/waitlist`, {
        waitlist_enabled: enabled,
      });

      await mutateSettings();
    } catch (err) {
      console.error(err);
      await mutateSettings();
      throw new Error("Failed to update waitlist status");
    }
  };

  const toggleStream = async (enabled: boolean) => {
    try {
      await mutateSettings(
        (current) =>
          current ? { ...current, stream_enabled: enabled } : undefined,
        false,
      );

      await axios.patch(`${API_URL}/stream`, {
        stream_enabled: enabled,
      });

      await mutateSettings();
    } catch (err) {
      console.error(err);
      await mutateSettings();
      throw new Error("Failed to update stream status");
    }
  };

  return {
    settings,
    isLoading,
    error,
    toggleWaitlist,
    toggleStream,
  };
};
