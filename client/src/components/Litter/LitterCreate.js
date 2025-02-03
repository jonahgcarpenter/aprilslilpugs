import { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LitterContext } from '../../context/LitterContext';
import LoadingAnimation from '../LoadingAnimation';
import SuccessModal from '../Modals/SuccessModal';
import ErrorModal from '../Modals/ErrorModal';

const LitterCreate = () => {
  const fileInputRef = useRef();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  
  const { createLitter, loading } = useContext(LitterContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    mother: '',
    father: '',
    birthDate: '',
    availableDate: '',
  });

  const handleFormChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
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
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    // Add form fields
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    // Handle file
    const file = fileInputRef.current.files[0];
    if (file) {
      formDataToSend.append('profilePicture', file);
    }

    try {
      await createLitter(formDataToSend);
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/breeder-dashboard');
      }, 1500);
    } catch (err) {
      setErrorModal({ show: true, message: err.message });
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
    <div className="mx-0 sm:mx-4">
      <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-slate-800/50 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
          Create New Litter
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Existing form fields */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">Litter Name</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Mother</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Father</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Birth Date</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Available Date</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Litter Image</label>
            {previewUrl && (
              <div className="mb-4 relative w-full">
                <div className="relative pb-[75%] sm:pb-[56.25%]"> {/* 4:3 on mobile, 16:9 on desktop */}
                  <img
                    src={previewUrl}
                    alt="Litter Preview"
                    className="absolute inset-0 w-full h-full object-cover rounded-lg border border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
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
            <p className="mt-1 text-sm text-slate-400">
              Recommended: Upload a clear image of the mother with her puppies
            </p>
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          Create Litter
        </button>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Litter created successfully!"
        delay={1500}
      />

      <ErrorModal
        isOpen={errorModal.show}
        onClose={() => setErrorModal({ show: false, message: '' })}
        message={errorModal.message}
      />
    </div>
  );
};

export default LitterCreate;
