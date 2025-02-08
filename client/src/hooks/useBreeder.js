import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../utils/Auth";

const IMAGE_BASE_URL = "/api/images/uploads/breeder-profiles/";

// FETCH BREEDER
// GET /api/breeder/profile
export const fetchBreeder = async () => {
  const response = await axios.get("/api/breeder/profile");
  const breeder = response.data;

  // Format image URLs
  return {
    ...breeder,
    profilePicture: breeder.profilePicture
      ? `${IMAGE_BASE_URL}${breeder.profilePicture}`
      : null,
    images: breeder.images
      ? breeder.images.map((filename) =>
          filename ? `${IMAGE_BASE_URL}${filename}` : null,
        )
      : [],
  };
};

// UPDATE BREEDER
// PATCH /api/breeder/profile REQUIRES AUTH
export const updateBreeder = async (updates) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  const response = await axios.patch("/api/breeder/profile", updates, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// HOOK FOR BREEDER
export const useBreeder = () => {
  const queryClient = useQueryClient();

  // Fetch breeder profile (no auth required)
  const {
    data: breeder,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["breeder"],
    queryFn: fetchBreeder,
  });

  // Update breeder profile (requires auth)
  const mutation = useMutation({
    mutationFn: updateBreeder,
    onSuccess: () => {
      queryClient.invalidateQueries(["breeder"]); // Refetch breeder data after update
    },
  });

  return { breeder, isLoading, error, updateBreeder: mutation.mutate };
};
