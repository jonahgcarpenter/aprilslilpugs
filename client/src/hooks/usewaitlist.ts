import useSWR from "swr";
import axios from "axios";

export interface WaitlistEntry {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  preferences: string;
  status: "New" | "Contacted" | "Complete" | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WaitlistInput {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  preferences: string;
}

export interface WaitlistUpdateInput extends WaitlistInput {
  status: string;
}

const API_URL = "/api/waitlist";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

const buildFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key] as string);
    }
  });
  return formData;
};

export const useWaitlist = () => {
  const {
    data: rawData,
    error,
    isLoading,
    mutate: mutateWaitlist,
  } = useSWR<WaitlistEntry[]>(API_URL, fetcher);

  const waitlist = rawData || [];

  const createWaitlist = async (data: WaitlistInput) => {
    const formData = buildFormData(data);
    try {
      await axios.post(API_URL, formData);
      await mutateWaitlist();
    } catch (err) {
      throw new Error("Failed to create waitlist entry");
    }
  };

  const updateWaitlist = async (
    id: number | string,
    data: Partial<WaitlistUpdateInput>,
  ) => {
    const formData = buildFormData(data);
    try {
      await axios.patch(`${API_URL}/${id}`, formData);
      await mutateWaitlist();
    } catch (err) {
      throw new Error("Failed to update waitlist entry");
    }
  };

  const deleteWaitlist = async (id: number | string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      await mutateWaitlist();
    } catch (err) {
      throw new Error("Failed to delete waitlist entry");
    }
  };

  return {
    waitlist,
    isLoading,
    error,
    createWaitlist,
    updateWaitlist,
    deleteWaitlist,
  };
};
