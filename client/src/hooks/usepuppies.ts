import useSWR from "swr";
import axios from "axios";

interface Image {
  id: number;
  url: string;
  alt_text: string;
  description?: string;
}

interface PuppyResponse {
  id: number;
  litter_id: number;
  name: string;
  color: string;
  gender: string;
  status: string;
  description: string;
  profilePicture: Image | null;
  gallery: Image[];
}

export interface Puppy {
  id: string;
  litterId: string;
  name: string;
  color: string;
  gender: "Male" | "Female" | string;
  status: "Available" | "Reserved" | "Sold" | string;
  description: string;
  profilePicture: string;
  profilePictureObj?: Image | null;
  images: Image[];
}

export interface PuppyInput {
  litter_id: string;
  name: string;
  color: string;
  gender: string;
  status: string;
  description: string;
  profile_picture?: File;
  new_gallery_images?: { file: File; description: string }[];
  existing_gallery?: Image[];
}

const FALLBACK_PUPPY_IMAGE =
  "https://placehold.co/400x400/2563eb/white?text=Puppy";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const usePuppies = (litterId?: string) => {
  const url = litterId ? `/api/puppies?litter_id=${litterId}` : "/api/puppies";

  const {
    data: rawPuppies,
    error,
    isLoading,
    mutate: mutatePuppies,
  } = useSWR<PuppyResponse[]>(url, fetcher);

  let puppies: Puppy[] = [];

  if (rawPuppies && Array.isArray(rawPuppies)) {
    puppies = rawPuppies.map((raw) => {
      const profileUrl = raw.profilePicture
        ? raw.profilePicture.url
        : FALLBACK_PUPPY_IMAGE;

      return {
        id: raw.id.toString(),
        litterId: raw.litter_id.toString(),
        name: raw.name,
        color: raw.color,
        gender: raw.gender,
        status: raw.status,
        description: raw.description,
        profilePicture: profileUrl,
        profilePictureObj: raw.profilePicture,
        images: raw.gallery || [],
      };
    });
  } else if (rawPuppies) {
    console.error("Expected array of puppies, but got:", rawPuppies);
  }

  const buildFormData = (data: PuppyInput) => {
    const formData = new FormData();
    formData.append("litter_id", data.litter_id);
    formData.append("name", data.name);
    formData.append("color", data.color);
    formData.append("gender", data.gender);
    formData.append("status", data.status);
    formData.append("description", data.description);

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

  const createPuppy = async (data: PuppyInput) => {
    const formData = buildFormData(data);
    try {
      await axios.post("/api/puppies", formData);
      await mutatePuppies();
    } catch (err) {
      throw new Error("Failed to create puppy");
    }
  };

  const updatePuppy = async (id: string, data: PuppyInput) => {
    const formData = buildFormData(data);
    try {
      await axios.patch(`/api/puppies/${id}`, formData);
      await mutatePuppies();
    } catch (err) {
      throw new Error("Failed to update puppy");
    }
  };

  const deletePuppy = async (id: string) => {
    try {
      await axios.delete(`/api/puppies/${id}`);
      await mutatePuppies();
    } catch (err) {
      throw new Error("Failed to delete puppy");
    }
  };

  return {
    puppies,
    isLoading,
    error,
    createPuppy,
    updatePuppy,
    deletePuppy,
  };
};
