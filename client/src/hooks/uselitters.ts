import useSWR from "swr";

interface Image {
  id: number;
  url: string;
  alt_text: string;
}

interface LitterResponse {
  id: number;
  name: string;
  mother_id?: number;
  mother_name: string;
  father_id?: number;
  father_name: string;
  birth_date: string;
  available_date: string;
  profile_picture: Image | null;
  images: Image[];
  status: string;
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
  status: "Planned" | "Available" | "Sold" | string;
}

const FALLBACK_LITTER_IMAGE =
  "https://placehold.co/400x400/2563eb/white?text=Litter";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useLitters = () => {
  const {
    data: rawLitters,
    error,
    isLoading,
  } = useSWR<LitterResponse[]>("/api/litters", fetcher);

  let litters: Litter[] = [];

  if (rawLitters) {
    litters = rawLitters.map((raw) => {
      const profileUrl = raw.profile_picture
        ? raw.profile_picture.url
        : FALLBACK_LITTER_IMAGE;

      const galleryUrls = raw.images ? raw.images.map((img) => img.url) : [];

      return {
        id: raw.id.toString(),
        name: raw.name,
        motherId: raw.mother_id?.toString(),
        motherName: raw.mother_name || "Unknown Mother",
        fatherId: raw.father_id?.toString(),
        fatherName: raw.father_name || "Unknown Father",
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
    litters,
    currentLitters,
    pastLitters,
    isLoading,
    error,
  };
};
