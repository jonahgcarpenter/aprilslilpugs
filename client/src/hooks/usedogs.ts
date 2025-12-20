import useSWR from "swr";

interface Image {
  id: number;
  url: string;
  alt_text: string;
}

interface DogResponse {
  id: number;
  name: string;
  gender: "Male" | "Female";
  description: string;
  birthDate: string;
  profile_picture: Image | null;
  images: Image[];
}

export interface Dog {
  id: string;
  name: string;
  gender: "Male" | "Female";
  description: string;
  birthDate: string;
  profilePicture: string;
  images: string[];
}

const FALLBACK_IMAGE = "https://placehold.co/400x400/2563eb/white?text=Dog";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useDogs = () => {
  const {
    data: rawDogs,
    error,
    isLoading,
  } = useSWR<DogResponse[]>("/api/dogs", fetcher);

  let dogs: Dog[] = [];

  if (rawDogs) {
    dogs = rawDogs.map((raw) => {
      const profileUrl = raw.profile_picture
        ? raw.profile_picture.url
        : FALLBACK_IMAGE;

      const galleryUrls = raw.images ? raw.images.map((img) => img.url) : [];

      return {
        id: raw.id.toString(),
        name: raw.name,
        gender: raw.gender,
        description: raw.description,
        birthDate: raw.birthDate,
        profilePicture: profileUrl,
        images: galleryUrls,
      };
    });
  }

  return {
    dogs,
    isLoading,
    error,
  };
};
