import axios from "axios";
import useSWR from "swr";

export interface StreamStatus {
  enabled: boolean;
  live: boolean;
  publisher_connected: boolean;
  playback_url: string;
  rtmp_url: string;
  rtmps_url: string;
  rtmps_available: boolean;
  stream_key: string;
  last_error: string;
}

const API_URL = "/api/settings/stream/status";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useStreamStatus = () => {
  const { data, error, isLoading } = useSWR<StreamStatus>(API_URL, fetcher, {
    refreshInterval: 5000,
  });

  return {
    streamStatus: data,
    error,
    isLoading,
  };
};
