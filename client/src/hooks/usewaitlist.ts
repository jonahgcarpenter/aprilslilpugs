import useSWR, { mutate } from "swr";
import axios from "axios";
import { getToken } from "../utils/auth";

const API_BASE_URL = "/api/waitlist";

export interface WaitlistEntry {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  position: number;
  status: "waiting" | "contacted" | "completed";
  notes: string;
  createdAt: string;
}

const fetchWaitlist = async (url: string) => {
  const token = getToken();
  if (!token) throw new Error("Unauthorized: No authentication token found");

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const useWaitlist = () => {
  const token = getToken();
  const shouldFetch = !!token;

  const { data, error, isLoading, mutate } = useSWR<WaitlistEntry[]>(
    shouldFetch ? API_BASE_URL : null,
    fetchWaitlist,
  );

  const createEntry = async (entryData: Partial<WaitlistEntry>) => {
    const response = await axios.post(API_BASE_URL, entryData);
    if (shouldFetch) mutate();
    return response.data;
  };

  const updateWaitlist = async ({
    id,
    data,
  }: {
    id: string;
    data: Partial<WaitlistEntry>;
  }) => {
    const token = getToken();
    if (!token) throw new Error("Unauthorized");

    const response = await axios.patch(`${API_BASE_URL}/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    mutate();
    return response.data;
  };

  const deleteWaitlist = async ({ id }: { id: string }) => {
    const token = getToken();
    if (!token) throw new Error("Unauthorized");

    const response = await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    mutate();
    return response.data;
  };

  return {
    entries: data,
    isLoading,
    error,
    createEntry,
    updateWaitlist,
    deleteWaitlist,
  };
};
