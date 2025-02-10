import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../utils/Auth";

const IMAGE_BASE_URL = "/api/images/uploads/gallery/";

const useGallery = () => {
  const queryClient = useQueryClient();

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token = getToken();
    if (!token) throw new Error("Unauthorized: No authentication token found");
    return { Authorization: `Bearer ${token}` };
  };

  // Internal helper to format image URLs
  const formatGalleryItem = (item) => ({
    ...item,
    filename: item.filename ? `${IMAGE_BASE_URL}${item.filename}` : null,
  });

  // Fetch gallery items (public route, no auth needed)
  const useGalleryItems = (params) => {
    return useQuery({
      queryKey: ["gallery", params],
      queryFn: async () => {
        const queryString = params
          ? Object.entries(params)
              .filter(([, value]) => value !== undefined)
              .map(([key, value]) => `${key}=${value}`)
              .join("&")
          : "";

        const { data } = await axios.get(
          `/api/gallery${queryString ? `?${queryString}` : ""}`,
        );

        // Format the response data
        return Array.isArray(data)
          ? data.map(formatGalleryItem)
          : formatGalleryItem(data);
      },
    });
  };

  // Upload gallery items (protected route)
  const uploadGalleryItems = useMutation({
    mutationFn: async ({
      images,
      entityType,
      grumbleId,
      litterId,
      puppyId,
      descriptions = [],
    }) => {
      const formData = new FormData();

      images.forEach((image) => {
        formData.append("images", image);
      });

      formData.append("entityType", entityType);
      if (grumbleId) formData.append("grumbleId", grumbleId);
      if (litterId) formData.append("litterId", litterId);
      if (puppyId) formData.append("puppyId", puppyId);
      formData.append("descriptions", JSON.stringify(descriptions));

      const { data } = await axios.post("/api/gallery", formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      // Format the response data
      return {
        ...data,
        items: data.items ? data.items.map(formatGalleryItem) : [],
      };
    },
    onSuccess: (_, variables) => {
      const { entityType, grumbleId, litterId, puppyId } = variables;
      queryClient.invalidateQueries({
        queryKey: [
          "gallery",
          {
            entityType,
            entityId: grumbleId || litterId,
            ...(puppyId && { puppyId }),
          },
        ],
      });
    },
  });

  // Delete gallery item (protected route)
  const deleteGalleryItem = useMutation({
    mutationFn: async (itemId) => {
      const { data } = await axios.delete(`/api/gallery/${itemId}`, {
        headers: getAuthHeaders(),
      });
      return formatGalleryItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });

  // Update gallery item (protected route)
  const updateGalleryItem = useMutation({
    mutationFn: async ({ itemId, description, newImage }) => {
      const formData = new FormData();
      if (description) formData.append("description", description);
      if (newImage) formData.append("image", newImage);

      const { data } = await axios.patch(`/api/gallery/${itemId}`, formData, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });
      return formatGalleryItem(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });

  // Add error handling for auth-related errors
  const handleAuthError = (error) => {
    if (error.response?.status === 401) {
      console.error("Authentication error:", error);
      throw new Error("You must be logged in to perform this action");
    }
    throw error;
  };

  // Wrap mutations with auth error handling
  return {
    useGalleryItems,
    uploadGalleryItems: {
      ...uploadGalleryItems,
      mutateAsync: async (...args) => {
        try {
          return await uploadGalleryItems.mutateAsync(...args);
        } catch (error) {
          handleAuthError(error);
        }
      },
    },
    deleteGalleryItem: {
      ...deleteGalleryItem,
      mutateAsync: async (...args) => {
        try {
          return await deleteGalleryItem.mutateAsync(...args);
        } catch (error) {
          handleAuthError(error);
        }
      },
    },
    updateGalleryItem: {
      ...updateGalleryItem,
      mutateAsync: async (...args) => {
        try {
          return await updateGalleryItem.mutateAsync(...args);
        } catch (error) {
          handleAuthError(error);
        }
      },
    },
  };
};

export default useGallery;
