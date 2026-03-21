import useSWR from "swr";
import axios from "axios";

export interface FileModel {
  id: number;
  name: string;
  url: string;
  created_at: string;
  updated_at: string;
}

const API_URL = "/api/files";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export const useFiles = () => {
  const {
    data,
    isLoading,
    mutate,
  } = useSWR<FileModel[]>(API_URL, fetcher);

  const files = data || [];

  const createFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(API_URL, formData);
      await mutate();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const deleteFile = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      await mutate();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return { files, createFile, deleteFile, isLoading };
};
