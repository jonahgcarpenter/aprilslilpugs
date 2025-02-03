import { useState, useEffect, useRef, useContext } from "react"

// CONTEXT
import { BreederContext } from '../context/BreederContext'

// COMPONENTS
import LoadingAnimation from './LoadingAnimation';

const BreederUpdateForm = () => {
  const { breeder, dispatch, updateBreederProfile, updateBreederImage } = useContext(BreederContext);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    location: '',
    story: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [galleryPreviews, setGalleryPreviews] = useState([null, null]);
  const galleryFileInputRefs = [useRef(null), useRef(null)];
  const [pendingGalleryImages, setPendingGalleryImages] = useState([null, null]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const response = await fetch('/api/breeders/profile');
      const json = await response.json();
      if (response.ok) {
        dispatch({ type: 'SET_BREEDER', payload: json });
      }
    };
    loadData();
  }, [dispatch]);

  useEffect(() => {
    if (breeder) {
      setFormData({
        firstName: breeder.firstName || '',
        lastName: breeder.lastName || '',
        phoneNumber: breeder.phoneNumber || '',
        email: breeder.email || '',
        location: breeder.location || '',
        story: breeder.story || ''
      });
      if (breeder.profilePicture) {
        setPreviewUrl(`/api/images${breeder.profilePicture}`);
      }
    }
  }, [breeder]);

  useEffect(() => {
    if (breeder?.images) {
      setGalleryPreviews(
        breeder.images.map(image => image ? `/api/images${image}` : null)
      );
    }
  }, [breeder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const formatted = value.replace(/\D/g, '').slice(0, 10);
      if (formatted.length > 6) {
        setFormData(prev => ({
          ...prev,
          [name]: `(${formatted.slice(0,3)}) ${formatted.slice(3,6)}-${formatted.slice(6)}`
        }));
      } else if (formatted.length > 3) {
        setFormData(prev => ({
          ...prev,
          [name]: `(${formatted.slice(0,3)}) ${formatted.slice(3)}`
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      fileInputRef.current.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setProfilePicture(file);
    setError(null);

    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleGalleryImageChange = (index, e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      galleryFileInputRefs[index].current.value = '';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setGalleryPreviews(prev => {
      const newPreviews = [...prev];
      newPreviews[index] = objectUrl;
      return newPreviews;
    });

    setPendingGalleryImages(prev => {
      const newPending = [...prev];
      newPending[index] = file;
      return newPending;
    });

    setError(null);
  };

  const preventDefaultValidation = (e) => {
    e.preventDefault();
  };

  const validateForm = () => {
    const missingFields = [];
    if (!formData.firstName.trim()) missingFields.push('First Name');
    if (!formData.lastName.trim()) missingFields.push('Last Name');
    if (!formData.email.trim()) missingFields.push('Email');
    
    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }

    if (formData.phoneNumber && formData.phoneNumber.replace(/\D/g, '').length !== 10) {
      setError('Phone number must be 10 digits');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // First update the profile
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
      }

      await updateBreederProfile(formDataToSend);

      // Then update gallery images if there are any pending changes
      for (let i = 0; i < pendingGalleryImages.length; i++) {
        if (pendingGalleryImages[i]) {
          const imageFormData = new FormData();
          imageFormData.append('image', pendingGalleryImages[i]);
          await updateBreederImage(i, imageFormData);
        }
      }

      setError(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setProfilePicture(null);
      setPendingGalleryImages([null, null]);
      galleryFileInputRefs.forEach(ref => {
        if (ref.current) ref.current.value = '';
      });

      // Add success modal handling
      setSuccessMessage('Profile updated successfully!');
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-0 sm:mx-4">
      <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-slate-800/50 shadow-xl">
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
            <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Your Story</label>
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
            <label className="block text-sm font-medium text-gray-300 mb-2">Profile Picture</label>
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
                    if (fileInputRef.current) fileInputRef.current.value = '';
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
                      <img
                        src={galleryPreviews[index]}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setGalleryPreviews(prev => {
                            const newPreviews = [...prev];
                            newPreviews[index] = null;
                            return newPreviews;
                          });
                          if (galleryFileInputRefs[index].current) {
                            galleryFileInputRefs[index].current.value = '';
                          }
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        ×
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
            'Update Profile'
          )}
        </button>
      </form>

      {/* Add success modal at the end of the component */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-start justify-center p-4 z-[9999]">
          <div className="mt-[15vh] bg-slate-900/90 backdrop-blur-sm rounded-xl p-8 max-w-md w-full border border-white/10">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-500 to-green-600 mb-6">
              Success!
            </h2>
            <p className="text-slate-300 mb-6">
              {successMessage}
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreederUpdateForm;
