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
  status: "P" | "B" | "A" | "S";
}

export interface Litter {
  id: string;
  name: string;
  motherName: string;
  motherPicture: string; // Added
  fatherName: string;
  fatherPicture: string; // Added
  birthDate: string;
  availableDate: string;
  profilePicture: string;
  images: string[];
  status: "Planned" | "Born" | "Available" | "Sold";
  statusLabel: string;
}

const FALLBACK_IMAGE = "https://placehold.co/400x400/2563eb/white?text=Pug";
const FALLBACK_LITTER_IMAGE =
  "https://placehold.co/400x400/2563eb/white?text=Litter";

const STATUS_MAP: Record<string, string> = {
  P: "Planned",
  B: "Born",
  A: "Available",
  S: "Sold",
};

const fetchLitters = async (): Promise<RawLitter[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return mockLitters;
};

const getPugImage = (pugId: string | undefined) => {
  if (!pugId) return FALLBACK_IMAGE;
  const pug = mockPugs.find((p) => p.id === pugId);
  if (!pug) return FALLBACK_IMAGE;

  const img = mockImages.find((i) => i.id === pug.profile_picture_id);
  return img ? `/assets/images/${img.filename}` : FALLBACK_IMAGE;
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
      const motherPicture = getPugImage(raw.mother_id);

      const fatherName =
        raw.father_name ||
        mockPugs.find((p) => p.id === raw.father_id)?.name ||
        "Unknown Father";
      const fatherPicture = getPugImage(raw.father_id);

      const statusLabel = STATUS_MAP[raw.status] || "Unknown";

      return {
        id: raw.id,
        name: raw.name,
        motherName,
        motherPicture,
        fatherName,
        fatherPicture,
        birthDate: raw.birth_date,
        availableDate: raw.available_date,
        profilePicture: profileUrl,
        images: galleryUrls,
        status: statusLabel as Litter["status"],
        statusLabel,
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
