import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LitterContext } from "../../context/LitterContext";
import LoadingAnimation from "../LoadingAnimation";
import SuccessModal from "../Modals/SuccessModal";
import ErrorModal from "../Modals/ErrorModal";

const LitterCreate = () => {
  const fileInputRef = useRef();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createLitter, loading } = useContext(LitterContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    mother: "",
    father: "",
    birthDate: "",
    availableDate: "",
  });

  const handleFormChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const formDataToSend = new FormData();

    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    const file = fileInputRef.current.files[0];
    if (file) {
      formDataToSend.append("profilePicture", file);
    }

    try {
      const newLitter = await createLitter(formDataToSend);
      setShowSuccessModal(true);

      setTimeout(() => {
        navigate(`/breeder/litter/update/${newLitter._id}`);
      }, 1500);
    } catch (err) {
      setErrorModal({ show: true, message: err.message });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingAnimation containerClassName="scale-150" />
      </div>
    );
  }

  return (
    <div className="mx-0 sm:mx-4 px-4 sm:px-0 py-8">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-slate-800/50 shadow-xl"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
          Create New Litter
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Existing form fields */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Litter Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mother
            </label>
            <input
              type="text"
              name="mother"
              value={formData.mother}
              onChange={handleFormChange}
              required
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Father
            </label>
            <input
              type="text"
              name="father"
              value={formData.father}
              onChange={handleFormChange}
              required
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Birth Date
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleFormChange}
              required
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Available Date
            </label>
            <input
              type="date"
              name="availableDate"
              value={formData.availableDate}
              onChange={handleFormChange}
              required
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group sm:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Litter Image
            </label>
            {previewUrl && (
              <div className="mb-4 relative w-32 h-32">
                <img
                  src={previewUrl}
                  alt="Litter Preview"
                  className="w-full h-full object-cover rounded-lg border border-slate-700"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  ×
                </button>
              </div>
            )}
            <input
              type="file"
              name="profilePicture"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg,image/png"
              className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50 relative"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <LoadingAnimation containerClassName="scale-75" />
              <span className="ml-2">Creating...</span>
            </span>
          ) : (
            "Create Litter"
          )}
        </button>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {}}
        message="Litter created successfully!"
        delay={1500}
      />

      <ErrorModal
        isOpen={errorModal.show}
        onClose={() => {
          setErrorModal({ show: false, message: "" });
          setIsSubmitting(false);
        }}
        message={errorModal.message}
      />
    </div>
  );
};

export default LitterCreate;
