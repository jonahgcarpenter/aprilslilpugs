import useSWR from "swr";
import axios from "axios";
import { useMemo } from "react";

export interface Image {
  id: number;
  url: string;
  alt_text?: string;
}

interface BreederResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  story: string;
  profilePicture: Image | null;
  gallery: Image[];
}

export interface Breeder {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  profilePicture: Image | null;
  gallery: Image[];
}

export interface UpdateBreederInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  location?: string;
  story?: string;
  profilePictureFile?: File;
  galleryFiles?: (File | null)[];
}

const API_URL = "/api/breeder";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

export const useBreeder = () => {
  const {
    data: rawData,
    error,
    isLoading,
    mutate,
  } = useSWR<BreederResponse>(API_URL, fetcher);

  const breeder = useMemo<Breeder | null>(() => {
    if (!rawData) return null;

    return {
      id: rawData.id.toString(),
      firstName: rawData.firstName,
      lastName: rawData.lastName,
      email: rawData.email,
      phone: rawData.phoneNumber,
      location: rawData.location,
      description: rawData.story,
      profilePicture: rawData.profilePicture || null,
      gallery: rawData.gallery || [],
    };
  }, [rawData]);

  const buildFormData = (data: UpdateBreederInput) => {
    const formData = new FormData();

    if (data.firstName) formData.append("firstName", data.firstName);
    if (data.lastName) formData.append("lastName", data.lastName);
    if (data.email) formData.append("email", data.email);
    if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
    if (data.location) formData.append("location", data.location);
    if (data.story) formData.append("story", data.story);

    if (data.profilePictureFile) {
      formData.append("profilePicture", data.profilePictureFile);
    }

    if (data.galleryFiles && data.galleryFiles.length > 0) {
      data.galleryFiles.forEach((file, index) => {
        if (file) {
          formData.append(`galleryImage${index}`, file);
        }
      });
    }

    return formData;
  };

  const updateBreeder = async (data: UpdateBreederInput) => {
    try {
      const formData = buildFormData(data);
      await axios.patch(API_URL, formData);
      await mutate();
      return true;
    } catch (e: any) {
      console.error("Update Breeder Error:", e);
      throw e;
    }
  };

  return {
    breeder,
    isLoading,
    error,
    updateBreeder,
  };
};
