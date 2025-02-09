import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../utils/Auth";

const API_BASE_URL = "/api/litters";
const LITTER_IMAGE_BASE_URL = "/api/images/uploads/litter-images/";
const PUPPY_IMAGE_BASE_URL = "/api/images/uploads/puppy-images/";

// FETCH LITTERS
// GET /api/litters
export const fetchLitters = async () => {
  const response = await axios.get(API_BASE_URL);
  const litters = response.data;

  return litters.map((litter) => ({
    ...litter,
    profilePicture: litter.profilePicture
      ? `${LITTER_IMAGE_BASE_URL}${litter.profilePicture}`
      : null,
    puppies: litter.puppies.map((puppy) => ({
      ...puppy,
      profilePicture: puppy.profilePicture
        ? `${PUPPY_IMAGE_BASE_URL}${puppy.profilePicture}`
        : null,
    })),
  }));
};

// FETCH A LITTER
// GET /api/litters/:litterId
export const fetchLitter = async (litterId) => {
  const response = await axios.get(`${API_BASE_URL}/${litterId}`);
  const litter = response.data;

  return {
    ...litter,
    profilePicture: litter.profilePicture
      ? `${LITTER_IMAGE_BASE_URL}${litter.profilePicture}`
      : null,
    puppies: litter.puppies.map((puppy) => ({
      ...puppy,
      profilePicture: puppy.profilePicture
        ? `${PUPPY_IMAGE_BASE_URL}${puppy.profilePicture}`
        : null,
    })),
  };
};

// CREATE LITTER
// POST /api/litters REQUIRES AUTH
export const createLitter = async (litterData) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  const response = await axios.post(API_BASE_URL, litterData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// UPDATE LITTER
// PATCH /api/litters/:litterId REQUIRES AUTH
export const updateLitter = async ({ id, updates }) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  const response = await axios.patch(`${API_BASE_URL}/${id}`, updates, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// DELETE LITTER
// DELETE /api/litters/:litterId REQUIRES AUTH
export const deleteLitter = async (id) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  await axios.delete(`${API_BASE_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return id;
};

// ADD PUPPIES
// POST /api/litters/:litterId/puppies REQUIRES AUTH
export const addPuppies = async ({ litterId, puppies }) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  const response = await axios.post(
    `${API_BASE_URL}/${litterId}/puppies`,
    puppies,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return response.data;
};

// UPDATE PUPPY
// PATCH /api/litters/:litterId/puppies/:puppyId REQUIRES AUTH
export const updatePuppy = async ({ litterId, puppyId, updates }) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  const response = await axios.patch(
    `${API_BASE_URL}/${litterId}/puppies/${puppyId}`,
    updates,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return response.data;
};

// DELETE PUPPY
// DELETE /api/litters/:litterId/puppies/:puppyId REQUIRES AUTH
export const deletePuppy = async ({ litterId, puppyId }) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  await axios.delete(`${API_BASE_URL}/${litterId}/puppies/${puppyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return puppyId;
};

// HOOK FOR LITTERS
export const useLitter = (litterId) => {
  const queryClient = useQueryClient();

  // Fetch all litters
  const {
    data: litters,
    isLoading: isLoadingLitters,
    error: littersError,
  } = useQuery({
    queryKey: ["litters"],
    queryFn: fetchLitters,
  });

  // Fetch single litter details
  const {
    data: litter,
    isLoading: isLoadingLitter,
    error: litterError,
  } = useQuery({
    queryKey: ["litter", litterId],
    queryFn: () => fetchLitter(litterId),
    enabled: !!litterId,
  });

  // ? Mutations for Litter Management
  const createLitterMutation = useMutation({
    mutationFn: createLitter,
    onSuccess: () => queryClient.invalidateQueries(["litters"]),
  });

  const updateLitterMutation = useMutation({
    mutationFn: updateLitter,
    onSuccess: () => queryClient.invalidateQueries(["litters"]),
  });

  const deleteLitterMutation = useMutation({
    mutationFn: deleteLitter,
    onSuccess: () => queryClient.invalidateQueries(["litters"]),
  });

  // ? Mutations for Puppy Management
  const addPuppiesMutation = useMutation({
    mutationFn: addPuppies,
    onSuccess: () => queryClient.invalidateQueries(["litter", litterId]),
  });

  const updatePuppyMutation = useMutation({
    mutationFn: updatePuppy,
    onSuccess: () => queryClient.invalidateQueries(["litter", litterId]),
  });

  const deletePuppyMutation = useMutation({
    mutationFn: deletePuppy,
    onSuccess: () => queryClient.invalidateQueries(["litter", litterId]),
  });

  return {
    // Data
    litters,
    litter,

    // Loading states
    isLoadingLitters,
    isLoadingLitter,
    isLoading: isLoadingLitters || isLoadingLitter,

    // Error states
    littersError,
    litterError,

    // Mutation states and operations
    createLitterMutation: {
      mutate: createLitterMutation.mutate,
      isLoading: createLitterMutation.isLoading,
      error: createLitterMutation.error,
    },
    updateLitterMutation: {
      mutate: updateLitterMutation.mutate,
      isLoading: updateLitterMutation.isLoading,
      error: updateLitterMutation.error,
    },
    deleteLitterMutation: {
      mutate: deleteLitterMutation.mutate,
      isLoading: deleteLitterMutation.isLoading,
      error: deleteLitterMutation.error,
    },
    addPuppiesMutation: {
      mutate: addPuppiesMutation.mutate,
      isLoading: addPuppiesMutation.isLoading,
      error: addPuppiesMutation.error,
    },
    updatePuppyMutation: {
      mutate: updatePuppyMutation.mutate,
      isLoading: updatePuppyMutation.isLoading,
      error: updatePuppyMutation.error,
    },
    deletePuppyMutation: {
      mutate: deletePuppyMutation.mutate,
      isLoading: deletePuppyMutation.isLoading,
      error: deletePuppyMutation.error,
    },
  };
};
