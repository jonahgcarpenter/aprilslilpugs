import useSWR from "swr";

interface Image {
  id: number;
  url: string;
  alt_text: string;
}

interface UserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  location: string;
  story: string;
  profile_picture: Image | null;
  images: Image[];
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

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useBreeder = () => {
  const {
    data: rawData,
    error,
    isLoading,
  } = useSWR<UserResponse>("/api/users/1", fetcher);

  let breeder: Breeder | null = null;

  if (rawData) {
    const profileUrl = rawData.profile_picture
      ? rawData.profile_picture.url
      : FALLBACK_PROFILE;

    const galleryUrls = rawData.images
      ? rawData.images.map((img) => img.url)
      : [];

    breeder = {
      id: rawData.id.toString(),
      firstName: rawData.firstName,
      lastName: rawData.lastName,
      email: rawData.email,
      phone: rawData.phoneNumber,
      location: rawData.location,
      description: rawData.story,
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
