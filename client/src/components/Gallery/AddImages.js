import React, { useState, useRef } from "react";
import { useGrumble } from "../../hooks/useGrumble";
import { useLitter } from "../../hooks/useLitter";
import useGallery from "../../hooks/useGallery";
import LoadingAnimation from "../Misc/LoadingAnimation";

// TODO: need to add a way to check each file size and reject if too large before uploading making it more user friendly

const AddImages = () => {
  const { grumbles } = useGrumble();
  const { litters } = useLitter();
  const { uploadGalleryItems } = useGallery();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [entityType, setEntityType] = useState("");
  const [selectedEntityId, setSelectedEntityId] = useState("");
  const [selectedPuppyId, setSelectedPuppyId] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 20) {
      alert("Maximum 20 images allowed");
      return;
    }

    setSelectedFiles(files);
    setDescriptions(new Array(files.length).fill(""));

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleDescriptionChange = (index, value) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = value;
    setDescriptions(newDescriptions);
  };

  const handleRemoveImage = (index) => {
    const newFiles = [...selectedFiles];
    const newDescriptions = [...descriptions];
    const newPreviews = [...previews];

    newFiles.splice(index, 1);
    newDescriptions.splice(index, 1);
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);

    setSelectedFiles(newFiles);
    setDescriptions(newDescriptions);
    setPreviews(newPreviews);

    if (newFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await uploadGalleryItems.mutateAsync({
        images: selectedFiles,
        entityType: entityType || "none",
        grumbleId: entityType === "grumble" ? selectedEntityId : undefined,
        litterId: entityType === "litter" ? selectedEntityId : undefined,
        puppyId: selectedPuppyId,
        descriptions,
      });

      setSelectedFiles([]);
      setDescriptions([]);
      setPreviews([]);
      setEntityType("");
      setSelectedEntityId("");
      setSelectedPuppyId("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      alert("Error uploading images: " + error.message);
    }
  };

  const getCurrentEntities = () => {
    switch (entityType) {
      case "grumble":
        return grumbles || [];
      case "litter":
        return litters || [];
      default:
        return [];
    }
  };

  const getCurrentPuppies = () => {
    if (entityType === "litter" && selectedEntityId) {
      const selectedLitter = litters?.find((l) => l._id === selectedEntityId);
      return selectedLitter?.puppies || [];
    }
    return [];
  };

  if (uploadGalleryItems.isPending) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-xl">
      <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
        Add Images
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Optional Entity Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Link Images To (Optional):
          </label>
          <select
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setSelectedEntityId("");
              setSelectedPuppyId("");
            }}
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No Link (General Gallery)</option>
            <option value="grumble">Grumble</option>
            <option value="litter">Litter</option>
          </select>
        </div>

        {/* Entity Selection (Only if type is selected) */}
        {entityType && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select {entityType === "grumble" ? "Grumble" : "Litter"}:{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedEntityId}
              onChange={(e) => {
                setSelectedEntityId(e.target.value);
                setSelectedPuppyId("");
              }}
              required
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                Select {entityType === "grumble" ? "Dog" : "Litter"}
              </option>
              {getCurrentEntities().map((entity) => (
                <option key={entity._id} value={entity._id}>
                  {entity.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Puppy Selection (only for litters with selected litter) */}
        {entityType === "litter" && selectedEntityId && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Puppy (Optional):
            </label>
            <select
              value={selectedPuppyId}
              onChange={(e) => setSelectedPuppyId(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Puppies</option>
              {getCurrentPuppies().map((puppy) => (
                <option key={puppy._id} value={puppy._id}>
                  {puppy.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Images (Max 20): <span className="text-red-500">*</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            required
            className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
        </div>

        {/* Image Previews and Descriptions */}
        {selectedFiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="space-y-2 bg-slate-800 p-4 rounded-lg"
              >
                <div className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    &times;
                  </button>
                </div>
                <textarea
                  value={descriptions[index]}
                  onChange={(e) =>
                    handleDescriptionChange(index, e.target.value)
                  }
                  placeholder="Image description (optional)"
                  className="w-full p-2 rounded-lg bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="2"
                />
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedFiles.length || (entityType && !selectedEntityId)}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white py-3 rounded-lg transition-all"
        >
          Upload Images
        </button>
      </form>
    </div>
  );
};

export default AddImages;
