import useSWR from "swr";
import axios from "axios";

export interface Image {
  id: number;
  url: string;
  alt_text?: string;
  description?: string;
}

interface DogResponse {
  id: number;
  name: string;
  gender: "Male" | "Female";
  description: string;
  birthDate: string;
  profilePicture: Image | null;
  gallery: Image[];
}

export interface Dog {
  id: string;
  name: string;
  gender: "Male" | "Female";
  description: string;
  birthDate: string;
  profilePicture: string;
  images: Image[];
}

export interface DogInput {
  name: string;
  gender: "Male" | "Female";
  description: string;
  birthDate: string;
  profilePictureFile?: File;
  galleryFiles?: File[];
  galleryDescriptions?: string[];
  existingGallery?: Image[];
}

const FALLBACK_IMAGE = "https://placehold.co/400x400/2563eb/white?text=Dog";
const API_URL = "/api/dogs";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useDogs = () => {
  const {
    data: rawDogs,
    error,
    isLoading,
    mutate,
  } = useSWR<DogResponse[]>(API_URL, fetcher);

  let dogs: Dog[] = [];

  if (rawDogs) {
    dogs = rawDogs.map((raw) => {
      const profileUrl = raw.profilePicture
        ? raw.profilePicture.url
        : FALLBACK_IMAGE;

      return {
        id: raw.id.toString(),
        name: raw.name,
        gender: raw.gender,
        description: raw.description,
        birthDate: raw.birthDate.split("T")[0],
        profilePicture: profileUrl,
        images: raw.gallery || [],
      };
    });
  }

  const buildFormData = (data: DogInput) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("gender", data.gender);
    formData.append("description", data.description);
    formData.append("birthDate", data.birthDate);

    if (data.profilePictureFile) {
      formData.append("profilePicture", data.profilePictureFile);
    }

    if (data.galleryFiles && data.galleryFiles.length > 0) {
      data.galleryFiles.forEach((file, index) => {
        formData.append(`galleryImage${index}`, file);

        if (data.galleryDescriptions && data.galleryDescriptions[index]) {
          formData.append(
            `galleryDescription${index}`,
            data.galleryDescriptions[index],
          );
        }
      });
    }

    if (data.existingGallery) {
      formData.append("existing_gallery", JSON.stringify(data.existingGallery));
    }

    return formData;
  };

  const createDog = async (data: DogInput) => {
    try {
      const formData = buildFormData(data);
      await axios.post(API_URL, formData);
      await mutate();
      return true;
    } catch (e) {
      console.error("Create Dog Error:", e);
      throw e;
    }
  };

  const updateDog = async (id: string, data: DogInput) => {
    try {
      const formData = buildFormData(data);
      await axios.patch(`${API_URL}/${id}`, formData);
      await mutate();
      return true;
    } catch (e) {
      console.error("Update Dog Error:", e);
      throw e;
    }
  };

  const deleteDog = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      await mutate();
      return true;
    } catch (e) {
      console.error("Delete Dog Error:", e);
      throw e;
    }
  };

  return {
    dogs,
    isLoading,
    error,
    createDog,
    updateDog,
    deleteDog,
  };
};
