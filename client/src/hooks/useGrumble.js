import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../utils/Auth";

const API_BASE_URL = "/api/grumble";
const IMAGE_BASE_URL = "/api/images/uploads/grumble-images/";

// FETCH GRUMBLES
// GET /api/grumble
export const fetchGrumbles = async () => {
  const response = await axios.get(API_BASE_URL);
  const grumbles = response.data;

  // Format image URLs
  return grumbles.map((grumble) => ({
    ...grumble,
    profilePicture: grumble.profilePicture
      ? `${IMAGE_BASE_URL}${grumble.profilePicture}`
      : null,
  }));
};

// FETCH A GRUMBLE
// GET /api/grumble/:id
export const fetchGrumble = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/${id}`);
  const grumble = response.data;

  // Format image URLs
  return {
    ...grumble,
    profilePicture: grumble.profilePicture
      ? `${IMAGE_BASE_URL}${grumble.profilePicture}`
      : null,
  };
};

// CREATE GRUMBLE
// POST /api/grumble REQUIRES AUTH
export const createGrumble = async (grumbleData) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  const response = await axios.post(API_BASE_URL, grumbleData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// UPDATE GRUMBLE
// PATCH /api/grumble/:id REQUIRES AUTH
export const updateGrumble = async ({ id, updates }) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  const response = await axios.patch(`${API_BASE_URL}/${id}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// DELETE GRUMBLE
// DELETE /api/grumble/:id REQUIRES AUTH
export const deleteGrumble = async (id) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  await axios.delete(`${API_BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return id; // Return the deleted grumble's ID
};

// HOOK FOR GRUMBLES
export const useGrumble = () => {
  const queryClient = useQueryClient();

  // Queries
  const grumblesQuery = useQuery({
    queryKey: ["grumbles"],
    queryFn: fetchGrumbles,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createGrumble,
    onSuccess: () => queryClient.invalidateQueries(["grumbles"]),
  });

  const updateMutation = useMutation({
    mutationFn: updateGrumble,
    onSuccess: () => queryClient.invalidateQueries(["grumbles"]),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGrumble,
    onSuccess: () => queryClient.invalidateQueries(["grumbles"]),
  });

  return {
    grumbles: grumblesQuery.data,
    isLoading: grumblesQuery.isLoading,
    error: grumblesQuery.error,
    createGrumble: createMutation.mutate,
    updateGrumble: updateMutation.mutate,
    deleteGrumble: deleteMutation.mutate,
  };
};
