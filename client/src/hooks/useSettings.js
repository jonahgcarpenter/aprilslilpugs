import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../utils/Auth";

// FETCH SETTINGS
// GET /api/settings
export const fetchSettings = async () => {
  const response = await axios.get("/api/settings");
  return response.data;
};

// TOGGLE WAITLIST
// POST /api/settings/toggle-waitlist REQUIRES AUTH
export const toggleWaitlist = async () => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  const response = await axios.post(
    "/api/settings/toggle-waitlist",
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return response.data;
};

// TOGGLE LIVE
// POST /api/settings/toggle-live REQUIRES AUTH
export const toggleLive = async () => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  const response = await axios.post(
    "/api/settings/toggle-live",
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return response.data;
};

// HOOK FOR SETTINGS
export const useSettings = () => {
  const queryClient = useQueryClient();

  // Fetch settings
  const {
    data: settings,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  // Toggle waitlist mutation
  const toggleWaitlistMutation = useMutation({
    mutationFn: toggleWaitlist,
    onSuccess: () => {
      queryClient.invalidateQueries(["settings"]);
    },
  });

  // Toggle live mutation
  const toggleLiveMutation = useMutation({
    mutationFn: toggleLive,
    onSuccess: () => {
      queryClient.invalidateQueries(["settings"]);
    },
  });

  return {
    settings,
    error,
    isLoading,
    toggleWaitlist: toggleWaitlistMutation.mutate,
    toggleWaitlistLoading: toggleWaitlistMutation.isLoading,
    toggleLive: toggleLiveMutation.mutate,
    toggleLiveLoading: toggleLiveMutation.isLoading,
  };
};
