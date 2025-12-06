import useSWR, { mutate } from "swr";
import axios from "axios";
// import { getToken } from "../utils/Auth";

const GRUMBLE_API_URL = "/api/grumble";
const IMAGE_BASE_URL = "/api/images/uploads/grumble-images/";

export interface Pug {
  _id: string;
  name: string;
  gender: string;
  description: string;
  profilePicture: string | null;
  birthDate: string;
}

const fetchGrumbles = async (url: string) => {
  const response = await axios.get(url);
  const data = response.data;

  return data.map((pug: any) => ({
    ...pug,
    profilePicture: pug.profilePicture
      ? `${IMAGE_BASE_URL}${pug.profilePicture}`
      : null,
  }));
};

export const useGrumble = () => {
  const { data, error, isLoading, mutate } = useSWR<Pug[]>(
    GRUMBLE_API_URL,
    fetchGrumbles,
  );

  // const createGrumble = async (grumbleData: FormData) => {
  //   const token = getToken();
  //   if (!token) throw new Error("Unauthorized");
  //   await axios.post(GRUMBLE_API_URL, grumbleData, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   mutate(); // Refresh list
  // };
  //
  // const updateGrumble = async ({ id, updates }: { id: string; updates: FormData }) => {
  //   const token = getToken();
  //   if (!token) throw new Error("Unauthorized");
  //   await axios.patch(`${GRUMBLE_API_URL}/${id}`, updates, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   mutate();
  // };
  //
  // const deleteGrumble = async (id: string) => {
  //   const token = getToken();
  //   if (!token) throw new Error("Unauthorized");
  //   await axios.delete(`${GRUMBLE_API_URL}/${id}`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   mutate();
  // };

  return {
    grumbles: data,
    isLoading,
    error,
    // createGrumble,
    // updateGrumble,
    // deleteGrumble,
  };
};
