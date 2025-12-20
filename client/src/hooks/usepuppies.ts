import useSWR from "swr";

interface Image {
  id: number;
  url: string;
  alt_text: string;
}

interface PuppyResponse {
  id: number;
  litter_id: number;
  name: string;
  color: string;
  gender: string;
  status: string;
  description: string;
  profile_picture: Image | null;
  images: Image[];
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
  images: string[];
}

const FALLBACK_PUPPY_IMAGE =
  "https://placehold.co/400x400/2563eb/white?text=Puppy";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const usePuppies = (litterId?: string) => {
  const url = litterId ? `/api/puppies?litter_id=${litterId}` : "/api/puppies";

  const {
    data: rawPuppies,
    error,
    isLoading,
  } = useSWR<PuppyResponse[]>(url, fetcher);

  let puppies: Puppy[] = [];

  if (rawPuppies) {
    puppies = rawPuppies.map((raw) => {
      const profileUrl = raw.profile_picture
        ? raw.profile_picture.url
        : FALLBACK_PUPPY_IMAGE;

      const galleryUrls = raw.images ? raw.images.map((img) => img.url) : [];

      return {
        id: raw.id.toString(),
        litterId: raw.litter_id.toString(),
        name: raw.name,
        color: raw.color,
        gender: raw.gender,
        status: raw.status,
        description: raw.description,
        profilePicture: profileUrl,
        images: galleryUrls,
      };
    });
  }

  return {
    puppies,
    isLoading,
    error,
  };
};
