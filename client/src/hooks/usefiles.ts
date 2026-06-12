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
      console.error("Create file error:", { fileName: file.name, error });
      return false;
    }
  };

  const deleteFile = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      await mutate();
      return true;
    } catch (error) {
      console.error("Delete file error:", { id, error });
      return false;
    }
  };

  const downloadFile = async (file: FileModel) => {
    try {
      const response = await axios.get(`${API_URL}/${file.id}/download`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      console.error("Download file error:", { id: file.id, error });
      return false;
    }
  };

  return { files, createFile, deleteFile, downloadFile, isLoading };
};
