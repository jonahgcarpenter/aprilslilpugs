import useSWR from "swr";
import axios from "axios";

interface Image {
  id: number;
  url: string;
  alt_text: string;
  description?: string;
}

interface LitterResponse {
  id: number;
  name: string;
  mother_id?: number;
  mother_name: string;
  external_mother_name?: string;
  father_id?: number;
  father_name: string;
  external_father_name?: string;
  birth_date: string;
  available_date: string;
  profile_picture: Image | null;
  gallery: Image[];
  status: string;
}

export interface Litter {
  id: string;
  name: string;
  motherId?: string;
  motherName: string;
  externalMotherName?: string;
  fatherId?: string;
  fatherName: string;
  externalFatherName?: string;
  birthDate: string;
  availableDate: string;
  profilePicture: string;
  profilePictureObj?: Image | null;
  images: Image[];
  status: "Planned" | "Available" | "Sold" | string;
}

export interface LitterInput {
  name: string;
  status: string;
  mother_id?: string;
  father_id?: string;
  external_mother_name?: string;
  external_father_name?: string;
  birth_date: string;
  available_date: string;
  profile_picture?: File;
  new_gallery_images?: { file: File; description: string }[];
  existing_gallery?: Image[];
}

const FALLBACK_LITTER_IMAGE =
  "https://placehold.co/400x400/2563eb/white?text=Litter";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useLitters = () => {
  const {
    data: rawLitters,
    error,
    isLoading,
    mutate: mutateLitters,
  } = useSWR<LitterResponse[]>("/api/litters", fetcher);

  let litters: Litter[] = [];

  if (rawLitters) {
    litters = rawLitters.map((raw) => {
      const profileUrl = raw.profile_picture
        ? raw.profile_picture.url
        : FALLBACK_LITTER_IMAGE;

      return {
        id: raw.id.toString(),
        name: raw.name,
        motherId: raw.mother_id?.toString(),
        motherName: raw.mother_name || "Unknown Mother",
        externalMotherName: raw.external_mother_name,
        fatherId: raw.father_id?.toString(),
        fatherName: raw.father_name || "Unknown Father",
        externalFatherName: raw.external_father_name,
        birthDate: raw.birth_date,
        availableDate: raw.available_date,
        profilePicture: profileUrl,
        profilePictureObj: raw.profile_picture,
        images: raw.gallery || [],
        status: raw.status,
      };
    });
  }

  const currentLitters = litters.filter((l) => l.status !== "Sold");
  const pastLitters = litters.filter((l) => l.status === "Sold");

  const buildFormData = (data: LitterInput) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("status", data.status);
    formData.append("birth_date", data.birth_date);
    formData.append("available_date", data.available_date);

    if (data.mother_id) formData.append("mother_id", data.mother_id);
    if (data.father_id) formData.append("father_id", data.father_id);
    if (data.external_mother_name)
      formData.append("external_mother_name", data.external_mother_name);
    if (data.external_father_name)
      formData.append("external_father_name", data.external_father_name);

    if (data.profile_picture) {
      formData.append("profile_picture", data.profile_picture);
    }

    if (data.existing_gallery) {
      formData.append(
        "existing_gallery",
        JSON.stringify(data.existing_gallery),
      );
    }

    if (data.new_gallery_images) {
      data.new_gallery_images.forEach((item, index) => {
        formData.append(`gallery_image_${index}`, item.file);
        formData.append(`gallery_description_${index}`, item.description);
      });
    }

    return formData;
  };

  const createLitter = async (data: LitterInput) => {
    const formData = buildFormData(data);
    try {
      await axios.post("/api/litters", formData);
      await mutateLitters();
    } catch (err) {
      throw new Error("Failed to create litter");
    }
  };

  const updateLitter = async (id: string, data: LitterInput) => {
    const formData = buildFormData(data);
    try {
      await axios.patch(`/api/litters/${id}`, formData);
      await mutateLitters();
    } catch (err) {
      throw new Error("Failed to update litter");
    }
  };

  const deleteLitter = async (id: string) => {
    try {
      await axios.delete(`/api/litters/${id}`);
      await mutateLitters();
    } catch (err) {
      throw new Error("Failed to delete litter");
    }
  };

  return {
    litters,
    currentLitters,
    pastLitters,
    isLoading,
    error,
    createLitter,
    updateLitter,
    deleteLitter,
  };
};
