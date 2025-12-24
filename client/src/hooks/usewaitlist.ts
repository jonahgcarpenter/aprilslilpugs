import useSWR from "swr";
import axios from "axios";
import { useState, useCallback } from "react";

export interface WaitlistEntry {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  preferences: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWaitlistInput {
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  preferences: string;
}

export interface UpdateWaitlistInput {
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  preferences?: string;
  status?: string;
}

const API_URL = "/api/waitlist";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useWaitlist = (enabled = true) => {
  const {
    data: waitlist,
    error: fetchError,
    isLoading,
    mutate,
  } = useSWR<WaitlistEntry[]>(enabled ? API_URL : null, fetcher);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const toFormData = (data: Record<string, any>) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });
    return formData;
  };

  const createWaitlist = useCallback(
    async (data: CreateWaitlistInput) => {
      setIsSubmitting(true);
      setActionError(null);
      try {
        const formData = toFormData(data);
        await axios.post(API_URL, formData);
        if (enabled) {
          await mutate();
        }
        return true;
      } catch (e: any) {
        console.error("Create Error:", e);
        setActionError(e.response?.data?.error || "Failed to create entry.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [mutate, enabled],
  );

  const updateWaitlist = useCallback(
    async (id: number, data: UpdateWaitlistInput) => {
      setIsSubmitting(true);
      setActionError(null);
      try {
        const formData = toFormData(data);
        await axios.patch(`${API_URL}/${id}`, formData);
        await mutate();
        return true;
      } catch (e: any) {
        console.error("Update Error:", e);
        setActionError(e.response?.data?.error || "Failed to update entry.");
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [mutate],
  );

  const deleteWaitlist = useCallback(
    async (id: number) => {
      setIsSubmitting(true);
      setActionError(null);
      try {
        await axios.delete(`${API_URL}/${id}`);
        await mutate(
          (currentData) => currentData?.filter((item) => item.id !== id),
          false,
        );
        return true;
      } catch (e: any) {
        console.error("Delete Error:", e);
        setActionError(e.response?.data?.error || "Failed to delete entry.");
        await mutate();
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [mutate],
  );

  return {
    waitlist: waitlist || [],
    isLoading,
    error: fetchError,
    createWaitlist,
    updateWaitlist,
    deleteWaitlist,
    isSubmitting,
    actionError,
    resetError: () => setActionError(null),
  };
};
