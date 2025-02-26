import React, { useState, useEffect, useRef } from "react";
import { useBreeder } from "../../hooks/useBreeder";
import LoadingAnimation from "../Misc/LoadingAnimation";

const UpdateBreeder = () => {
  const { breeder, isLoading, error, updateBreeder } = useBreeder();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [story, setStory] = useState("");

  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);

  const profilePictureInputRef = useRef(null);

  const [newGalleryImages, setNewGalleryImages] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const galleryPictureInputRef = useRef([]);

  useEffect(() => {
    if (breeder) {
      setFirstName(breeder.firstName || "");
      setLastName(breeder.lastName || "");
      setLocation(breeder.location || "");
      setEmail(breeder.email || "");
      setPhoneNumber(breeder.phoneNumber || "");
      setStory(breeder.story || "");

      setProfilePicturePreview(breeder.profilePicture || null);

      const images = breeder.images || [];
      setGalleryPreviews(images);
      setNewGalleryImages(new Array(images.length).fill(null));
    }
  }, [breeder]);

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
    setProfilePicturePreview(breeder ? breeder.profilePicture : null);
    if (profilePictureInputRef.current) {
      profilePictureInputRef.current.value = null;
    }
  };

  const handleGalleryImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setGalleryPreviews((prev) => {
        const newPreviews = [...prev];
        newPreviews[index] = previewUrl;
        return newPreviews;
      });
      setNewGalleryImages((prev) => {
        const newImages = [...prev];
        newImages[index] = file;
        return newImages;
      });
    }
  };

  const handleClearGalleryImage = (index) => {
    setNewGalleryImages((prev) => {
      const newImages = [...prev];
      newImages[index] = null;
      return newImages;
    });
    if (breeder && breeder.images && breeder.images[index]) {
      setGalleryPreviews((prev) => {
        const newPreviews = [...prev];
        newPreviews[index] = breeder.images[index];
        return newPreviews;
      });
    }

    if (
      galleryPictureInputRef.current &&
      galleryPictureInputRef.current[index]
    ) {
      galleryPictureInputRef.current[index].value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("location", location);
    formData.append("email", email);
    formData.append("phoneNumber", phoneNumber);
    formData.append("story", story);

    if (newProfilePicture) {
      formData.append("profilePicture", newProfilePicture);
    }

    newGalleryImages.forEach((file, index) => {
      if (file) {
        formData.append(`galleryImage${index}`, file);
      }
    });

    updateBreeder(formData);
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
        Update Profile
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Text Fields */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Name: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Name: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Location: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email: <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Story: <span className="text-red-500">*</span>
          </label>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            required
            rows="4"
            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500 resize-none"
          ></textarea>
        </div>

        {/* Profile Picture Section */}
        <div className="sm:col-span-2">
          <label className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-4">
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

        {/* Gallery Images Section */}
        <div className="form-group sm:col-span-2 mt-8">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-4">
            Gallery Images
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {galleryPreviews.map((preview, index) => (
              <div key={index} className="space-y-4">
                {preview ? (
                  <div className="mb-4 relative w-full h-64 sm:h-80 md:h-96">
                    <img
                      src={preview}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-slate-700"
                    />
                    {newGalleryImages[index] && (
                      <button
                        type="button"
                        onClick={() => handleClearGalleryImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        x
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-48 rounded-lg border-2 border-slate-700 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <span className="text-4xl text-white/20">
                      Photo {index + 1}
                    </span>
                  </div>
                )}
                <input
                  ref={(el) => (galleryPictureInputRef.current[index] = el)}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleGalleryImageChange(index, e)}
                  className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-all"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default UpdateBreeder;
