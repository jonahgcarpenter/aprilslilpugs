import React, { useState, useEffect, useRef } from "react";
import { useGrumble } from "../../hooks/useGrumble";
import LoadingAnimation from "../Misc/LoadingAnimation";

const UpdateGrumble = () => {
  const { grumbles, isLoading, error, updateGrumble } = useGrumble();

  const [selectedGrumbleId, setSelectedGrumbleId] = useState("");

  // TEXT FIELDS
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");
  const [birthDate, setBirthDate] = useState("");

  // IMAGE FIELDS
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const profilePictureInputRef = useRef(null);

  useEffect(() => {
    if (grumbles && selectedGrumbleId) {
      const found = grumbles.find((g) => g._id === selectedGrumbleId);
      if (found) {
        setName(found.name || "");
        setGender(found.gender || "");
        setDescription(found.description || "");
        setBirthDate(found.birthDate || "");
        setProfilePicturePreview(found.profilePicture || null);
        setNewProfilePicture(null); // Reset any new file selection
      }
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
    if (grumbles && selectedGrumbleId) {
      const found = grumbles.find((g) => g._id === selectedGrumbleId);
      setProfilePicturePreview(found?.profilePicture || null);
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

    updateGrumble({ id: selectedGrumbleId, updates: formData });
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
        Update Grumble
      </h2>

      {/* Dropdown for selecting a grumble */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Grumble:
        </label>
        <select
          value={selectedGrumbleId}
          onChange={(e) => setSelectedGrumbleId(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">-- Select a Grumble to Edit --</option>
          {grumbles &&
            grumbles.map((grumble) => (
              <option key={grumble._id} value={grumble._id}>
                {grumble.name}
              </option>
            ))}
        </select>
      </div>

      {selectedGrumbleId ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gender Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gender:
            </label>
            <input
              type="text"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Birth Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Birth Date:
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description:
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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

          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-all"
          >
            Update Grumble
          </button>
        </form>
      ) : (
        <p className="text-gray-300">Please select a grumble to edit.</p>
      )}
    </div>
  );
};

export default UpdateGrumble;
