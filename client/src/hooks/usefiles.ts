import { useState, useEffect } from "react";
import axios from "axios";

export interface FileModel {
  id: number;
  name: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export const useFiles = () => {
  const [files, setFiles] = useState<FileModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFiles = async () => {
    try {
      const { data } = await axios.get("/api/files");
      setFiles(data || []);
    } catch (error) {
      console.error("Failed to fetch files", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("/api/files", formData);
      await fetchFiles();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const deleteFile = async (id: number) => {
    try {
      await axios.delete(`/api/files/${id}`);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return { files, createFile, deleteFile, isLoading };
};
