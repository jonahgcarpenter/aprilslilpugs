import React, { useState, useEffect, useRef } from "react";
import { useLitter } from "../../hooks/useLitter";
import LoadingAnimation from "../Misc/LoadingAnimation";

// TODO:
// USE DELETE MODAL

const UpdateLitter = () => {
  const [selectedLitterId, setSelectedLitterId] = useState("");
  const [litterName, setLitterName] = useState("");
  const [litterMother, setLitterMother] = useState("");
  const [litterFather, setLitterFather] = useState("");
  const [litterBirthDate, setLitterBirthDate] = useState("");
  const [litterAvailableDate, setLitterAvailableDate] = useState("");
  const [litterNewProfilePicture, setLitterNewProfilePicture] = useState(null);
  const [litterProfilePicturePreview, setLitterProfilePicturePreview] =
    useState(null);
  const litterProfilePictureInputRef = useRef(null);

  const [selectedPuppyId, setSelectedPuppyId] = useState("");
  const [puppyName, setPuppyName] = useState("");
  const [puppyColor, setPuppyColor] = useState("");
  const [puppyGender, setPuppyGender] = useState("");
  const [puppyStatus, setPuppyStatus] = useState("Available");
  const [puppyNewProfilePicture, setPuppyNewProfilePicture] = useState(null);
  const [puppyProfilePicturePreview, setPuppyProfilePicturePreview] =
    useState(null);
  const puppyProfilePictureInputRef = useRef(null);

  const {
    litters,
    litter,
    isLoading,
    littersError,
    litterError,
    createLitterMutation,
    updateLitterMutation,
    deleteLitterMutation,
    addPuppiesMutation,
    updatePuppyMutation,
    deletePuppyMutation,
  } = useLitter(selectedLitterId);

  const error = littersError || litterError;

  useEffect(() => {
    if (selectedLitterId && litters) {
      const found = litters.find((l) => l._id === selectedLitterId);
      if (found) {
        setLitterName(found.name || "");
        setLitterMother(found.mother || "");
        setLitterFather(found.father || "");
        setLitterBirthDate(
          found.birthDate
            ? new Date(found.birthDate).toISOString().split("T")[0]
            : "",
        );
        setLitterAvailableDate(
          found.availableDate
            ? new Date(found.availableDate).toISOString().split("T")[0]
            : "",
        );
        setLitterProfilePicturePreview(found.profilePicture || null);
        setLitterNewProfilePicture(null);
      }
    } else {
      setLitterName("");
      setLitterMother("");
      setLitterFather("");
      setLitterBirthDate("");
      setLitterAvailableDate("");
      setLitterProfilePicturePreview(null);
      setLitterNewProfilePicture(null);
    }
  }, [selectedLitterId, litters]);

  useEffect(() => {
    if (selectedPuppyId && litter && litter.puppies) {
      const found = litter.puppies.find((p) => p._id === selectedPuppyId);
      if (found) {
        setPuppyName(found.name || "");
        setPuppyColor(found.color || "");
        setPuppyGender(found.gender || "");
        setPuppyStatus(found.status || "Available");
        setPuppyProfilePicturePreview(found.profilePicture || null);
        setPuppyNewProfilePicture(null);
      }
    } else {
      setPuppyName("");
      setPuppyColor("");
      setPuppyGender("");
      setPuppyStatus("Available");
      setPuppyProfilePicturePreview(null);
      setPuppyNewProfilePicture(null);
    }
  }, [selectedPuppyId, litter]);

  const handleLitterProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLitterNewProfilePicture(file);
      setLitterProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleClearLitterProfilePicture = () => {
    setLitterNewProfilePicture(null);
    if (selectedLitterId && litters) {
      const found = litters.find((l) => l._id === selectedLitterId);
      setLitterProfilePicturePreview(found?.profilePicture || null);
    } else {
      setLitterProfilePicturePreview(null);
    }
    if (litterProfilePictureInputRef.current) {
      litterProfilePictureInputRef.current.value = null;
    }
  };

  const handlePuppyProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPuppyNewProfilePicture(file);
      setPuppyProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleClearPuppyProfilePicture = () => {
    setPuppyNewProfilePicture(null);
    if (selectedPuppyId && litter && litter.puppies) {
      const found = litter.puppies.find((p) => p._id === selectedPuppyId);
      setPuppyProfilePicturePreview(found?.profilePicture || null);
    } else {
      setPuppyProfilePicturePreview(null);
    }
    if (puppyProfilePictureInputRef.current) {
      puppyProfilePictureInputRef.current.value = null;
    }
  };

  const handleLitterSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", litterName);
    formData.append("mother", litterMother);
    formData.append("father", litterFather);
    formData.append("birthDate", litterBirthDate);
    formData.append("availableDate", litterAvailableDate);
    if (litterNewProfilePicture) {
      formData.append("profilePicture", litterNewProfilePicture);
    }
    if (selectedLitterId) {
      updateLitterMutation.mutate({ id: selectedLitterId, updates: formData });
    } else {
      createLitterMutation.mutate(formData);
    }
  };

  const handleLitterDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this litter? It will also delete all puppys within the litter! This action cannot be undone.",
      )
    ) {
      deleteLitterMutation.mutate(selectedLitterId);
      setSelectedLitterId("");
    }
  };

  const handlePuppySubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", puppyName);
    formData.append("color", puppyColor);
    formData.append("gender", puppyGender);
    formData.append("status", puppyStatus);
    if (puppyNewProfilePicture) {
      formData.append("profilePicture", puppyNewProfilePicture);
    }
    if (selectedPuppyId) {
      updatePuppyMutation.mutate({
        litterId: selectedLitterId,
        puppyId: selectedPuppyId,
        updates: formData,
      });
    } else {
      addPuppiesMutation.mutate({
        litterId: selectedLitterId,
        puppies: formData,
      });
    }
  };

  const handlePuppyDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this puppy? This action cannot be undone.",
      )
    ) {
      deletePuppyMutation.mutate({
        litterId: selectedLitterId,
        puppyId: selectedPuppyId,
      });
      setSelectedPuppyId("");
    }
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
        <p className="text-center text-red-500">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-xl">
      <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
        Litter Management
      </h2>

      {/* --- LITTER SELECTION --- */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select a Litter (or choose "New Litter"):
        </label>
        <select
          value={selectedLitterId}
          onChange={(e) => {
            setSelectedLitterId(e.target.value);
            setSelectedPuppyId("");
          }}
          className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">New Litter</option>
          {litters &&
            litters.map((litterItem) => (
              <option key={litterItem._id} value={litterItem._id}>
                {litterItem.name}
              </option>
            ))}
        </select>
      </div>

      {/* --- LITTER FORM --- */}
      <form onSubmit={handleLitterSubmit} className="space-y-6">
        {/* Litter Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Litter Name: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={litterName}
            onChange={(e) => setLitterName(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-4">
          {/* Mother */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mother: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={litterMother}
              onChange={(e) => setLitterMother(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Father */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Father: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={litterFather}
              onChange={(e) => setLitterFather(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Birth Date */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Birth Date: <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={litterBirthDate}
              onChange={(e) => setLitterBirthDate(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Available Date */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Available Date: <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={litterAvailableDate}
              onChange={(e) => setLitterAvailableDate(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Litter Profile Picture */}
        <div>
          <label className="block text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-4">
            Litter Profile Picture:
          </label>
          {litterProfilePicturePreview && (
            <div className="mt-4 mb-4 relative w-32 h-32 rounded-lg border border-slate-700 shadow-lg">
              <img
                src={litterProfilePicturePreview}
                alt="Litter Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              {litterNewProfilePicture && (
                <button
                  type="button"
                  onClick={handleClearLitterProfilePicture}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  &times;
                </button>
              )}
            </div>
          )}
          <input
            ref={litterProfilePictureInputRef}
            type="file"
            accept="image/*"
            onChange={handleLitterProfilePictureChange}
            className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
          />
        </div>

        <div className="flex gap-4">
          {selectedLitterId && (
            <button
              type="button"
              onClick={handleLitterDelete}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-all"
            >
              Delete Litter
            </button>
          )}
          <button
            type="submit"
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-all"
          >
            {selectedLitterId ? "Update Litter" : "Add Litter"}
          </button>
        </div>
      </form>

      {/* --- PUPPY MANAGEMENT (only shown when a litter is selected) --- */}
      {selectedLitterId && (
        <div className="border-t border-slate-700 pt-8">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
            Puppy Management
          </h3>

          {/* Puppy Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select a Puppy (or choose "New Puppy"):
            </label>
            <select
              value={selectedPuppyId}
              onChange={(e) => setSelectedPuppyId(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">New Puppy</option>
              {litter &&
                litter.puppies &&
                litter.puppies.map((puppy) => (
                  <option key={puppy._id} value={puppy._id}>
                    {puppy.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Puppy Form */}
          <form onSubmit={handlePuppySubmit} className="space-y-6">
            <div className="flex gap-4">
              {/* Puppy Name */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Puppy Name: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={puppyName}
                  onChange={(e) => setPuppyName(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Puppy Color */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Color: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={puppyColor}
                  onChange={(e) => setPuppyColor(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              {/* Puppy Gender */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Gender: <span className="text-red-500">*</span>
                </label>
                <select
                  value={puppyGender}
                  onChange={(e) => setPuppyGender(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Puppy Status */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status: <span className="text-red-500">*</span>
                </label>
                <select
                  value={puppyStatus}
                  onChange={(e) => setPuppyStatus(e.target.value)}
                  required
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            </div>

            {/* Puppy Profile Picture */}
            <div>
              <label className="block text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-4">
                Puppy Profile Picture:
              </label>
              {puppyProfilePicturePreview && (
                <div className="mt-4 mb-4 relative w-32 h-32 rounded-lg border border-slate-700 shadow-lg">
                  <img
                    src={puppyProfilePicturePreview}
                    alt="Puppy Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {puppyNewProfilePicture && (
                    <button
                      type="button"
                      onClick={handleClearPuppyProfilePicture}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      &times;
                    </button>
                  )}
                </div>
              )}
              <input
                ref={puppyProfilePictureInputRef}
                type="file"
                accept="image/*"
                onChange={handlePuppyProfilePictureChange}
                className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
            </div>

            <div className="flex gap-4">
              {selectedPuppyId && (
                <button
                  type="button"
                  onClick={handlePuppyDelete}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg transition-all"
                >
                  Delete Puppy
                </button>
              )}
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg transition-all"
              >
                {selectedPuppyId ? "Update Puppy" : "Add Puppy"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UpdateLitter;
