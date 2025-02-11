import React, { useState, useEffect, useRef } from "react";
import { useGrumble } from "../../hooks/useGrumble";
import LoadingAnimation from "../Misc/LoadingAnimation";
import DeleteModal from "../Modals/DeleteModal";
import { createPortal } from "react-dom";

const UpdateGrumble = () => {
  const {
    grumbles,
    isLoading,
    error,
    createGrumble,
    updateGrumble,
    deleteGrumble,
  } = useGrumble();

  const [selectedGrumbleId, setSelectedGrumbleId] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");
  const [birthDate, setBirthDate] = useState("");

  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const profilePictureInputRef = useRef(null);

  useEffect(() => {
    if (selectedGrumbleId && grumbles) {
      const found = grumbles.find((g) => g._id === selectedGrumbleId);
      if (found) {
        setName(found.name || "");
        setGender(found.gender || "");
        setDescription(found.description || "");
        setBirthDate(found.birthDate || "");
        setProfilePicturePreview(found.profilePicture || null);
        setNewProfilePicture(null);
      }
    } else {
      setName("");
      setGender("");
      setDescription("");
      setBirthDate("");
      setProfilePicturePreview(null);
      setNewProfilePicture(null);
    }
  }, [selectedGrumbleId, grumbles]);

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePicture(file);
      const previewUrl = URL.createObjectURL(file);
      setProfilePicturePreview(previewUrl);
    }
  };

  const handleClearProfilePicture = () => {
    setNewProfilePicture(null);
    if (selectedGrumbleId && grumbles) {
      const found = grumbles.find((g) => g._id === selectedGrumbleId);
      setProfilePicturePreview(found?.profilePicture || null);
    } else {
      setProfilePicturePreview(null);
    }
    if (profilePictureInputRef.current) {
      profilePictureInputRef.current.value = null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("name", name);
    formData.append("gender", gender);
    formData.append("description", description);
    formData.append("birthDate", birthDate);

    if (newProfilePicture) {
      formData.append("profilePicture", newProfilePicture);
    }

    if (selectedGrumbleId) {
      updateGrumble({ id: selectedGrumbleId, updates: formData });
    } else {
      createGrumble(formData);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteGrumble(selectedGrumbleId);
    setSelectedGrumbleId("");
    setIsDeleteModalOpen(false);
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <LoadingAnimation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <p className="text-red-500 text-center">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-xl">
      <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
        Grumble Management
      </h2>

      {/* Dropdown for selecting an existing grumble or creating a new one */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select a Dog (or choose "New Dog"):
        </label>
        <select
          value={selectedGrumbleId}
          onChange={(e) => setSelectedGrumbleId(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">New Dog</option>
          {grumbles &&
            grumbles.map((grumble) => (
              <option key={grumble._id} value={grumble._id}>
                {grumble.name}
              </option>
            ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Name: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Gender Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Gender: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Birth Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Birth Date: <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description: <span className="text-red-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows="4"
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500 resize-none"
          ></textarea>
        </div>

        {/* Profile Picture Field */}
        <div>
          <label className="block text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-4">
            Profile Picture:
          </label>
          {profilePicturePreview && (
            <div className="mt-4 mb-4 relative w-32 h-32 rounded-lg border border-slate-700 shadow-lg">
              <img
                src={profilePicturePreview}
                alt="Profile Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              {newProfilePicture && (
                <button
                  type="button"
                  onClick={handleClearProfilePicture}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  &times;
                </button>
              )}
            </div>
          )}
          <input
            ref={profilePictureInputRef}
            type="file"
            accept="image/*"
            onChange={handleProfilePictureChange}
            className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
        </div>
        <div className="flex gap-4">
          {selectedGrumbleId && (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-all"
            >
              Delete Dog
            </button>
          )}
          <button
            type="submit"
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-all"
          >
            {selectedGrumbleId ? "Update Dog" : "Add Dog"}
          </button>
        </div>
      </form>
      {createPortal(
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onDelete={handleDeleteConfirm}
          title="Delete Dog"
          message="This action cannot be undone."
          itemName="this dog"
        />,
        document.body,
      )}
    </div>
  );
};

export default UpdateGrumble;
