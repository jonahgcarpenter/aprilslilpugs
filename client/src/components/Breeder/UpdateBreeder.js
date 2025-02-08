import { useState, useRef } from "react";
import { useBreeder } from "../../hooks/useBreeder";
import LoadingAnimation from "../Misc/LoadingAnimation";
import SuccessModal from "../Modals/SuccessModal";
import ErrorModal from "../Modals/ErrorModal";

const UpdateBreeder = () => {
  const { breeder, updateBreeder, isLoading } = useBreeder();

  const [formData, setFormData] = useState(() => ({
    firstName: breeder?.firstName || "",
    lastName: breeder?.lastName || "",
    phoneNumber: breeder?.phoneNumber || "",
    email: breeder?.email || "",
    location: breeder?.location || "",
    story: breeder?.story || "",
  }));

  const [profilePicture, setProfilePicture] = useState(null);
  const [galleryImages, setGalleryImages] = useState([null, null]);
  const [previewUrl, setPreviewUrl] = useState(breeder?.profilePicture || null);
  const [galleryPreviews, setGalleryPreviews] = useState(
    breeder?.galleryImages || [null, null],
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });
  const [newlyUploadedImages, setNewlyUploadedImages] = useState({
    profile: false,
    gallery: {},
  });

  const fileInputRef = useRef(null);
  const galleryFileInputRefs = [useRef(null), useRef(null)];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
      setNewlyUploadedImages((prev) => ({
        ...prev,
        profile: true,
      }));
    }
  };

  const handleGalleryImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      setGalleryImages((prev) => {
        const newImages = [...prev];
        newImages[index] = file;
        return newImages;
      });
      setGalleryPreviews((prev) => {
        const newPreviews = [...prev];
        newPreviews[index] = URL.createObjectURL(file);
        return newPreviews;
      });
      setNewlyUploadedImages((prev) => ({
        ...prev,
        gallery: {
          ...prev.gallery,
          [index]: true,
        },
      }));
    }
  };

  const handleProfileImageRemoval = () => {
    setProfilePicture(null);
    setNewlyUploadedImages((prev) => ({
      ...prev,
      profile: false,
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPreviewUrl(null);
  };

  const handleGalleryImageRemoval = (index) => {
    setGalleryImages((prev) => {
      const newImages = [...prev];
      newImages[index] = null;
      return newImages;
    });
    setNewlyUploadedImages((prev) => ({
      ...prev,
      gallery: {
        ...prev.gallery,
        [index]: false,
      },
    }));
    if (galleryFileInputRefs[index].current) {
      galleryFileInputRefs[index].current.value = "";
    }
    setGalleryPreviews((prev) => {
      const newPreviews = [...prev];
      newPreviews[index] = null;
      return newPreviews;
    });
  };

  const showError = (message) => {
    setErrorModal({ show: true, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (profilePicture) {
        formDataToSend.append("profilePicture", profilePicture);
      }

      galleryImages.forEach((file, index) => {
        if (file) {
          formDataToSend.append(`galleryImage${index}`, file);
        }
      });

      const result = await updateBreeder(formDataToSend);

      if (!result.success) {
        throw new Error(result.error);
      }

      setShowSuccessModal(true);
      setSuccessMessage("Profile updated successfully!");

      setGalleryImages([null, null]);
      setProfilePicture(null);
      setNewlyUploadedImages({ profile: false, gallery: {} });
      if (fileInputRef.current) fileInputRef.current.value = "";
      galleryFileInputRefs.forEach((ref) => {
        if (ref.current) ref.current.value = "";
      });
    } catch (error) {
      showError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <LoadingAnimation />
      </div>
    );
  }

  return (
    <div className="mx-0 sm:mx-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-slate-800/50 shadow-xl"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
          Update Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
              placeholder="(XXX) XXX-XXXX"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Story
            </label>
            <textarea
              name="story"
              value={formData.story}
              onChange={handleChange}
              rows={6}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="form-group sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profile Picture
            </label>
            {previewUrl && (
              <div className="mb-4 relative w-32 h-32">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg border border-slate-700"
                />
                {newlyUploadedImages.profile && (
                  <button
                    type="button"
                    onClick={handleProfileImageRemoval}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    x
                  </button>
                )}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            />
          </div>

          <div className="form-group sm:col-span-2 mt-8">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-4">
              Gallery Images
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[0, 1].map((index) => (
                <div key={index} className="space-y-4">
                  {galleryPreviews[index] && (
                    <div className="mb-4 relative w-full h-48">
                      <img
                        src={galleryPreviews[index]}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-slate-700"
                      />
                      {newlyUploadedImages.gallery[index] && (
                        <button
                          type="button"
                          onClick={() => handleGalleryImageRemoval(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          x
                        </button>
                      )}
                    </div>
                  )}
                  <input
                    ref={galleryFileInputRefs[index]}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleGalleryImageChange(index, e)}
                    className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <LoadingAnimation containerClassName="h-6" />
          ) : (
            "Update Profile"
          )}
        </button>
      </form>

      <SuccessModal isOpen={showSuccessModal} message={successMessage} />

      <ErrorModal
        isOpen={errorModal.show}
        onClose={() => setErrorModal({ show: false, message: "" })}
        message={errorModal.message}
      />
    </div>
  );
};

export default UpdateBreeder;
