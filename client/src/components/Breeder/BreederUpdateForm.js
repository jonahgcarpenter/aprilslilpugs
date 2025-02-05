import { useState, useEffect, useRef } from "react";
import { useBreeder } from "../../context/BreederContext";
import LoadingAnimation from "../LoadingAnimation";
import SuccessModal from "../Modals/SuccessModal";
import ErrorModal from "../Modals/ErrorModal";

const BreederUpdateForm = () => {
  const { breeder, updateBreederProfile } = useBreeder();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    location: "",
    story: "",
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [galleryImages, setGalleryImages] = useState([null, null]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([null, null]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });

  const fileInputRef = useRef(null);
  const galleryFileInputRefs = [useRef(null), useRef(null)];
  const [galleryErrors, setGalleryErrors] = useState({});

  const handleGalleryImageError = (index) => {
    setGalleryErrors((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  useEffect(() => {
    if (breeder) {
      setFormData({
        firstName: breeder.firstName || "",
        lastName: breeder.lastName || "",
        phoneNumber: breeder.phoneNumber || "",
        email: breeder.email || "",
        location: breeder.location || "",
        story: breeder.story || "",
      });

      // Update preview URLs to include full path
      if (breeder.profilePicture) {
        setPreviewUrl(
          `/api/images/uploads/breeder-profiles/${breeder.profilePicture}`,
        );
      }
      if (breeder.images) {
        setGalleryPreviews(
          breeder.images.map((img) =>
            img ? `/api/images/uploads/breeder-profiles/${img}` : null,
          ),
        );
      }
    }
  }, [breeder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
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
      // Reset error state for this index when new image is selected
      setGalleryErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[index];
        return newErrors;
      });
    }
  };

  const preventDefaultValidation = (e) => {
    e.preventDefault();
  };

  const showError = (message) => {
    setErrorModal({ show: true, message });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

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

      const result = await updateBreederProfile(formDataToSend);

      if (!result.success) {
        throw new Error(result.error);
      }

      setShowSuccessModal(true);
      setSuccessMessage("Profile updated successfully!");

      // Clear file inputs
      setGalleryImages([null, null]);
      setProfilePicture(null);
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

  return (
    <div className="mx-0 sm:mx-4">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-slate-800/50 shadow-xl"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
          Update Profile
        </h2>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

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
              onInvalid={preventDefaultValidation}
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
              onInvalid={preventDefaultValidation}
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
              onInvalid={preventDefaultValidation}
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
              onInvalid={preventDefaultValidation}
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
              onInvalid={preventDefaultValidation}
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
              onInvalid={preventDefaultValidation}
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
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl(null);
                    setProfilePicture(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gallery Image {index + 1}
                  </label>
                  {galleryPreviews[index] && (
                    <div className="mb-4 relative w-full h-48">
                      {!galleryErrors[index] ? (
                        <img
                          src={galleryPreviews[index]}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-slate-700"
                          onError={() => handleGalleryImageError(index)}
                        />
                      ) : (
                        <div className="relative w-full h-full rounded-lg border-2 border-white/10 shadow-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                          <span className="text-4xl text-white/20">
                            Photo {index + 1}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setGalleryPreviews((prev) => {
                            const newPreviews = [...prev];
                            newPreviews[index] = null;
                            return newPreviews;
                          });
                          setGalleryErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors[index];
                            return newErrors;
                          });
                          if (galleryFileInputRefs[index].current) {
                            galleryFileInputRefs[index].current.value = "";
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        x
                      </button>
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
          className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50"
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

export default BreederUpdateForm;

