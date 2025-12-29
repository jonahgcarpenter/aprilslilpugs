import { useState, useRef } from "react";
import {
  FaFile,
  FaTrash,
  FaUpload,
  FaSpinner,
  FaFilePdf,
  FaFileImage,
  FaFileAlt,
  FaDownload,
} from "react-icons/fa";
import type { FileModel } from "../../../hooks/usefiles";

interface ManageFilesProps {
  files: FileModel[];
  onCreate: (file: File) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
  isLoading: boolean;
}

const ManageFiles = ({
  files,
  onCreate,
  onDelete,
  isLoading,
}: ManageFilesProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFiles = Array.from(e.target.files);

    setIsUploading(true);

    await Promise.all(selectedFiles.map((file) => onCreate(file)));

    setIsUploading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      await onDelete(id);
    }
  };

  const getFileIcon = (filename: string) => {
    const lower = filename.toLowerCase();
    if (lower.endsWith(".pdf"))
      return <FaFilePdf size={20} className="text-red-400" />;
    if (lower.match(/\.(jpg|jpeg|png|gif|webp)$/))
      return <FaFileImage size={20} className="text-blue-400" />;
    if (lower.match(/\.(txt|md|doc|docx)$/))
      return <FaFileAlt size={20} className="text-slate-400" />;
    return <FaFile size={20} className="text-slate-400" />;
  };

  if (isLoading)
    return (
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 shadow-xl flex justify-center">
        <FaSpinner className="animate-spin text-2xl text-blue-500" />
      </div>
    );

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 shadow-xl">
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 flex items-center gap-2">
            File Storage
          </h2>
          <p className="text-white/60 text-sm">
            Upload documents and other files
          </p>
        </div>

        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-lg shadow-blue-500/20"
          >
            {isUploading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaUpload />
            )}
            Upload Files
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {files.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl bg-slate-950/50">
            <FaFile className="mx-auto text-4xl text-slate-700 mb-3" />
            <p className="text-slate-500">No files uploaded yet.</p>
          </div>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-lg group hover:border-blue-500/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  {getFileIcon(file.name)}
                </div>
                <div>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-slate-200 hover:text-blue-400 transition-colors"
                    title="View File"
                  >
                    {file.name}
                  </a>
                  <div className="flex gap-4 mt-1">
                    <p className="text-xs text-slate-500">
                      Uploaded: {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Download Button */}
                <a
                  href={file.url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer p-2 bg-slate-900 text-slate-500 hover:bg-blue-500/10 hover:text-blue-500 rounded-lg transition-all"
                  title="Download File"
                >
                  <FaDownload />
                </a>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(file.id)}
                  className="cursor-pointer p-2 bg-slate-900 text-slate-500 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                  title="Delete File"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageFiles;
