import useSWR from "swr";
import { mockPugs } from "../data/pugs";
import { mockImages } from "../data/images";

interface RawPug {
  id: string;
  name: string;
  gender: "Male" | "Female";
  description?: string;
  profile_picture_id: string;
  image_ids?: string[];
  birth_date: string;
}

export interface Pug {
  id: string;
  name: string;
  gender: "Male" | "Female";
  description: string;
  birthDate: string;
  profilePicture: string;
  images: string[];
}

const FALLBACK_IMAGE = "https://placehold.co/400x400/2563eb/white?text=Pug";

const fetchPugs = async (): Promise<RawPug[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockPugs as RawPug[];
};

export const usePug = () => {
  const {
    data: rawPugs,
    error,
    isLoading,
  } = useSWR<RawPug[]>("/api/pugs", fetchPugs);

  let pugs: Pug[] = [];

  if (rawPugs) {
    pugs = rawPugs.map((raw) => {
      const profileImg = mockImages.find(
        (img) => img.id === raw.profile_picture_id,
      );
      const profileUrl = profileImg
        ? `/assets/images/${profileImg.filename}`
        : FALLBACK_IMAGE;

      let galleryUrls: string[] = [];
      if (raw.image_ids && Array.isArray(raw.image_ids)) {
        galleryUrls = raw.image_ids.map((id) => {
          const img = mockImages.find((i) => i.id === id);
          return img ? `/assets/images/${img.filename}` : FALLBACK_IMAGE;
        });
      }

      return {
        id: raw.id,
        name: raw.name,
        gender: raw.gender,
        description: raw.description || "",
        birthDate: raw.birth_date,
        profilePicture: profileUrl,
        images: galleryUrls,
      };
    });
  }

  return {
    pugs,
    isLoading,
    error,
  };
};
