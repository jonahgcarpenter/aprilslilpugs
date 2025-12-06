import useSWR, { mutate } from "swr";
import axios from "axios";
import { getToken } from "../utils/auth";

const API_BASE_URL = "/api/litters";
const LITTER_IMAGE_BASE_URL = "/api/images/uploads/litter-images/";
const PUPPY_IMAGE_BASE_URL = "/api/images/uploads/puppy-images/";

export interface Puppy {
  _id: string;
  name: string;
  color: string;
  gender: "Male" | "Female";
  status: "Available" | "Reserved" | "Sold";
  profilePicture: string | null;
}

export interface Litter {
  _id: string;
  name: string;
  mother: string;
  father: string;
  birthDate: string;
  availableDate: string;
  profilePicture: string | null;
  puppies: Puppy[];
}

const fetchLitters = async (url: string) => {
  const response = await axios.get(url);
  const litters = response.data;

  return litters.map((litter: any) => ({
    ...litter,
    profilePicture: litter.profilePicture
      ? `${LITTER_IMAGE_BASE_URL}${litter.profilePicture}`
      : null,
    puppies: litter.puppies.map((puppy: any) => ({
      ...puppy,
      profilePicture: puppy.profilePicture
        ? `${PUPPY_IMAGE_BASE_URL}${puppy.profilePicture}`
        : null,
    })),
  }));
};

export const useLitter = () => {
  const { data, error, isLoading, mutate } = useSWR<Litter[]>(
    API_BASE_URL,
    fetchLitters,
  );

  // const createLitter = async (litterData: FormData) => {
  //   const token = getToken();
  //   if (!token) throw new Error("Unauthorized");
  //   await axios.post(API_BASE_URL, litterData, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   mutate();
  // };
  //
  // const deleteLitter = async (id: string) => {
  //   const token = getToken();
  //   if (!token) throw new Error("Unauthorized");
  //   await axios.delete(`${API_BASE_URL}/${id}`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   mutate();
  // };

  return {
    litters: data,
    isLoading,
    error,
    // createLitter,
    // deleteLitter,
  };
};
