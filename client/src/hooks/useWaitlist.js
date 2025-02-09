import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../utils/Auth";

const API_BASE_URL = "/api/waitlist";

// POST WAITLIST
// POST /api/waitlist
export const postWaitlist = async (data) => {
  const response = await axios.post(API_BASE_URL, data);
  return response.data;
};

// GET WAITLIST
// GET /api/waitlist REQUIRES AUTH
export const fetchWaitlist = async () => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  const response = await axios.get(API_BASE_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// UPDATE WAITLIST
// PATCH /api/waitlist/:id REQUIRES AUTH
export const updateWaitlist = async ({ id, data }) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  const response = await axios.patch(`${API_BASE_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// DELETE WAITLIST
// DELETE /api/waitlist/:id REQUIRES AUTH
export const deleteWaitlist = async ({ id }) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  const response = await axios.delete(`${API_BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

// HOOK FOR WAITLIST
export const useWaitlist = () => {
  const queryClient = useQueryClient();

  // Use query to fetch the waitlist data
  const { data, error, isLoading } = useQuery({
    queryKey: ["waitlist"],
    queryFn: fetchWaitlist,
  });

  // Mutation for adding a new waitlist entry
  const { mutateAsync: createEntry } = useMutation({
    mutationFn: postWaitlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });

  // Mutation for updating a waitlist entry
  const { mutateAsync: updateWaitlistMutation } = useMutation({
    mutationFn: updateWaitlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });

  // Mutation for deleting a waitlist entry
  const { mutateAsync: deleteWaitlistMutation } = useMutation({
    mutationFn: deleteWaitlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["waitlist"] });
    },
  });

  return {
    entries: data,
    isLoading,
    error,
    createEntry,
    updateWaitlist: updateWaitlistMutation,
    deleteWaitlist: deleteWaitlistMutation,
  };
};
