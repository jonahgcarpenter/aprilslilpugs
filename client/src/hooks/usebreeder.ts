import useSWR, { mutate } from "swr";
import axios from "axios";
// import { getToken } from "../utils/Auth";

const BREEDER_API_URL = "/api/breeder/profile";
const IMAGE_BASE_URL = "/api/images/uploads/breeder-profiles/";

const fetchBreeder = async (url: string) => {
  const response = await axios.get(url);
  const breeder = response.data;

  return {
    ...breeder,
    profilePicture: breeder.profilePicture
      ? `${IMAGE_BASE_URL}${breeder.profilePicture}`
      : null,
    images: breeder.images
      ? breeder.images.map((filename: string) =>
          filename ? `${IMAGE_BASE_URL}${filename}` : null,
        )
      : [null, null],
  };
};

export const useBreeder = () => {
  const { data, error, isLoading, mutate } = useSWR(
    BREEDER_API_URL,
    fetchBreeder,
  );

  // const updateBreeder = async (updates: FormData) => {
  //   const token = getToken();
  //   if (!token) throw new Error("Unauthorized: No authentication token found");
  //
  //   const response = await axios.patch(BREEDER_API_URL, updates, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //
  //   mutate();
  //
  //   return response.data;
  // };

  return {
    breeder: data,
    isLoading,
    error,
    // updateBreeder,
  };
};
