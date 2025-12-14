import useSWR from "swr";
import { mockLitters } from "../data/litters";
import { mockPugs } from "../data/pugs";
import { mockImages } from "../data/images";

interface RawLitter {
  id: string;
  name: string;
  mother_id?: string;
  mother_name?: string;
  father_id?: string;
  father_name?: string;
  birth_date: string;
  available_date: string;
  profile_picture_id: string;
  image_ids?: string;
  status: "Planned" | "Available" | "Sold";
}

export interface Litter {
  id: string;
  name: string;
  motherId?: string;
  motherName: string;
  fatherId?: string;
  fatherName: string;
  birthDate: string;
  availableDate: string;
  profilePicture: string;
  images: string[];
  status: "Planned" | "Available" | "Sold";
}

const FALLBACK_LITTER_IMAGE =
  "https://placehold.co/400x400/2563eb/white?text=Litter";

const fetchLitters = async (): Promise<RawLitter[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockLitters;
};

export const useLitters = () => {
  const {
    data: rawLitters,
    error,
    isLoading,
  } = useSWR<RawLitter[]>("/api/litters", fetchLitters);

  let litters: Litter[] = [];

  if (rawLitters) {
    litters = rawLitters.map((raw) => {
      const profileImg = mockImages.find(
        (img) => img.id === raw.profile_picture_id,
      );
      const profileUrl = profileImg
        ? `/assets/images/${profileImg.filename}`
        : FALLBACK_LITTER_IMAGE;

      let galleryUrls: string[] = [];
      if (raw.image_ids) {
        galleryUrls = raw.image_ids.split(",").map((id) => {
          const img = mockImages.find((i) => i.id === id.trim());
          return img ? `/assets/images/${img.filename}` : FALLBACK_LITTER_IMAGE;
        });
      }

      const motherName =
        raw.mother_name ||
        mockPugs.find((p) => p.id === raw.mother_id)?.name ||
        "Unknown Mother";

      const fatherName =
        raw.father_name ||
        mockPugs.find((p) => p.id === raw.father_id)?.name ||
        "Unknown Father";

      return {
        id: raw.id,
        name: raw.name,
        motherId: raw.mother_id,
        motherName,
        fatherId: raw.father_id,
        fatherName,
        birthDate: raw.birth_date,
        availableDate: raw.available_date,
        profilePicture: profileUrl,
        images: galleryUrls,
        status: raw.status,
      };
    });
  }

  const currentLitters = litters.filter((l) => l.status !== "Sold");
  const pastLitters = litters.filter((l) => l.status === "Sold");

  return {
    litters, // All litters
    currentLitters, // Planned, Born, Available
    pastLitters, // Sold
    isLoading,
    error,
  };
};
