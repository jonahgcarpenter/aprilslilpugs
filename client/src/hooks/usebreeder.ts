import useSWR from "swr";
import { mockBreeder } from "../data/breeder";
import { mockImages } from "../data/images";

interface RawBreederResponse {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  profile_picture_id: string;
  image_ids?: string;
}

export interface Breeder {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  description: string;
  profilePicture: string;
  images: string[];
}

const FALLBACK_PROFILE = "https://placehold.co/400x400/2563eb/white?text=April";
const FALLBACK_GALLERY =
  "https://placehold.co/600x400/1e293b/white?text=April-Image";

const fetchBreederData = async (): Promise<RawBreederResponse> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  return mockBreeder;
};

export const useBreeder = () => {
  const {
    data: rawData,
    error,
    isLoading,
  } = useSWR<RawBreederResponse>("/api/breeder", fetchBreederData);

  let breeder: Breeder | null = null;

  if (rawData) {
    const profileImgObj = mockImages.find(
      (img) => img.id === rawData.profile_picture_id,
    );
    const profileUrl = profileImgObj
      ? `/assets/images/${profileImgObj.filename}`
      : FALLBACK_PROFILE;

    let galleryUrls: string[] = [];
    if (rawData.image_ids) {
      galleryUrls = rawData.image_ids.split(",").map((id) => {
        const imgObj = mockImages.find((img) => img.id === id.trim());
        return imgObj ? `/assets/images/${imgObj.filename}` : FALLBACK_GALLERY;
      });
    }

    breeder = {
      id: rawData.id,
      firstName: rawData.firstname,
      lastName: rawData.lastname,
      email: rawData.email,
      phone: rawData.phone,
      location: rawData.location,
      description: rawData.description,
      profilePicture: profileUrl,
      images: galleryUrls,
    };
  }

  return {
    breeder,
    isLoading,
    error,
  };
};
