import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LitterContext } from '../context/LitterContext';

/**
 * LitterUpdate Component
 * Handles creation, updating, and deletion of litters and their puppies
 */
const LitterUpdate = () => {
  // URL Parameters and Navigation
  const { litterId } = useParams();
  const navigate = useNavigate();
  
  // Context and Refs
  const { getLitter, createLitter, updateLitter, deleteLitter, addPuppy, updatePuppy, deletePuppy, error, clearError } = useContext(LitterContext);
  const litterFileInputRef = useRef(null);
  const puppyFileInputRef = useRef(null);

  // State Management
  const isNewLitter = !litterId;
  const [litter, setLitter] = useState(null);
  const [litterForm, setLitterForm] = useState({
    name: '',
    mother: '',
    father: '',
    birthDate: '',
    availableDate: '',
    image: null
  });
  const [puppyForm, setPuppyForm] = useState({
    name: '',
    color: '',
    gender: 'Male',
    status: 'Available',
    image: null
  });
  const [selectedPuppy, setSelectedPuppy] = useState(null);
  const [isLoading, setIsLoading] = useState(!isNewLitter);

  const [litterPreviewUrl, setLitterPreviewUrl] = useState(null);
  const [puppyPreviewUrl, setPuppyPreviewUrl] = useState(null);

  const [showDeleteLitterModal, setShowDeleteLitterModal] = useState(false);
  const [showDeletePuppyModal, setShowDeletePuppyModal] = useState(false);
  const [puppyToDelete, setPuppyToDelete] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Add new state for form submission loading
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch litter data on component mount
  useEffect(() => {
    const fetchLitterData = async () => {
      if (litterId) {
        const data = await getLitter(litterId);
        if (data) {
          setLitter(data);
          setLitterForm({
            name: data.name,
            mother: data.mother,
            father: data.father,
            birthDate: data.rawBirthDate,
            availableDate: data.rawAvailableDate,
            image: null
          });
          // Remove this section - don't set preview URL for existing image
        }
      }
      setIsLoading(false);
    };
    fetchLitterData();
  }, [litterId, getLitter]);

  // Handle litter form changes
  const handleLitterChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      if (!file) return;
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        litterFileInputRef.current.value = '';
        return;
      }

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setLitterPreviewUrl(objectUrl);
      setLitterForm(prev => ({ ...prev, image: file }));
      
      // Cleanup old preview URL
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setLitterForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle puppy form changes
  const handlePuppyChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const file = files[0];
      if (!file) return;
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image must be less than 5MB');
        puppyFileInputRef.current.value = '';
        return;
      }

      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPuppyPreviewUrl(objectUrl);
      setPuppyForm(prev => ({ ...prev, image: file }));
      
      // Cleanup old preview URL
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPuppyForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle litter submit (create or update)
  const handleLitterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let success;
      if (isNewLitter) {
        success = await createLitter(litterForm);
        if (success) {
          setSuccessMessage('Litter created successfully!');
          setShowSuccessModal(true);
          setTimeout(() => {
            setShowSuccessModal(false);
            navigate('/breeder-dashboard');
          }, 2000);
        }
      } else {
        success = await updateLitter(litterId, litterForm);
        if (success) {
          const updatedLitter = await getLitter(litterId);
          setLitter(updatedLitter);
          setSuccessMessage('Litter updated successfully!');
          setShowSuccessModal(true);
          setTimeout(() => setShowSuccessModal(false), 2000);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle litter deletion
  const handleLitterDelete = async () => {
    const success = await deleteLitter(litterId);
    if (success) {
      setShowDeleteLitterModal(false);
      navigate('/breeder-dashboard');
    }
  };

  // Add form reset function
  const resetPuppyForm = () => {
    setPuppyForm({
      name: '',
      color: '',
      gender: 'Male',
      status: 'Available',
      image: null
    });
    setPuppyPreviewUrl(null);
    if (puppyFileInputRef.current) {
      puppyFileInputRef.current.value = '';
    }
  };

  // Update handleAddPuppy to handle the response properly
  const handleAddPuppy = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const success = await addPuppy(litterId, puppyForm);
      if (success) {
        // Reset form and preview before fetching updated data
        resetPuppyForm();
        setPuppyPreviewUrl(null);
        
        // Fetch updated litter data to get new image URLs
        const updatedLitter = await getLitter(litterId);
        setLitter(updatedLitter);
        
        setSuccessMessage('Puppy added successfully!');
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update handlePuppyUpdate to handle the response properly
  const handlePuppyUpdate = async (e) => {
    e.preventDefault();
    if (!selectedPuppy) return;
    
    setIsSubmitting(true);
    try {
      const success = await updatePuppy(litterId, selectedPuppy.id, puppyForm);
      if (success) {
        // Reset form and preview before fetching updated data
        setSelectedPuppy(null);
        resetPuppyForm();
        setPuppyPreviewUrl(null);
        
        // Fetch updated litter data to get new image URLs
        const updatedLitter = await getLitter(litterId);
        setLitter(updatedLitter);
        
        setSuccessMessage('Puppy updated successfully!');
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle puppy deletion
  const handlePuppyDelete = async (puppyId) => {
    const success = await deletePuppy(litterId, puppyId);
    if (success) {
      setShowDeletePuppyModal(false);
      setPuppyToDelete(null);
      const updatedLitter = await getLitter(litterId);
      setLitter(updatedLitter);
    }
  };

  // Select puppy for editing
  const selectPuppyForEdit = (puppy) => {
    setSelectedPuppy(puppy);
    setPuppyForm({
      name: puppy.name,
      color: puppy.color,
      gender: puppy.gender,
      status: puppy.status,
      image: null
    });
  };

  useEffect(() => {
    return () => {
      if (litterPreviewUrl && !litterPreviewUrl.startsWith('http')) {
        URL.revokeObjectURL(litterPreviewUrl);
      }
      if (puppyPreviewUrl && !puppyPreviewUrl.startsWith('http')) {
        URL.revokeObjectURL(puppyPreviewUrl);
      }
    };
  }, [litterPreviewUrl, puppyPreviewUrl]);

  if (isLoading) return <div>Loading...</div>;
  if (!isNewLitter && !litter && !isLoading) return <div>Litter not found</div>;

  return (
    <div className="litter-update mx-2 sm:mx-4 py-8">
      {error && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
          {error}
          <button onClick={clearError} className="float-right">&times;</button>
        </div>
      )}

      {/* Litter Form */}
      <div className="mb-8 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
          {isNewLitter ? 'Create New Litter' : 'Update Litter'}
        </h2>
        <form onSubmit={handleLitterSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={litterForm.name}
                onChange={handleLitterChange}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Mother</label>
              <input
                type="text"
                name="mother"
                value={litterForm.mother}
                onChange={handleLitterChange}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Father</label>
              <input
                type="text"
                name="father"
                value={litterForm.father}
                onChange={handleLitterChange}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Birth Date</label>
              <input
                type="date"
                name="birthDate"
                value={litterForm.birthDate}
                onChange={handleLitterChange}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Available Date</label>
              <input
                type="date"
                name="availableDate"
                value={litterForm.availableDate}
                onChange={handleLitterChange}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="form-group sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Litter Image</label>
              {litterPreviewUrl && (
                <div className="mb-4 relative w-32 h-32">
                  <img
                    src={litterPreviewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border border-slate-700"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLitterPreviewUrl(null);
                      setLitterForm(prev => ({ ...prev, image: null }));
                      if (litterFileInputRef.current) litterFileInputRef.current.value = '';
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
              <input
                ref={litterFileInputRef}
                type="file"
                name="image"
                accept="image/*"
                onChange={handleLitterChange}
                className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : (isNewLitter ? 'Create Litter' : 'Update Litter')}
            </button>
            {!isNewLitter && (
              <button
                type="button"
                onClick={() => setShowDeleteLitterModal(true)}
                className="w-full sm:w-auto bg-red-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-red-600 transition-all duration-200"
              >
                Delete Litter
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Puppies Section - Only show if not a new litter */}
      {!isNewLitter && (
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
            {selectedPuppy ? 'Update Puppy' : 'Add New Puppy'}
          </h2>
          <form onSubmit={selectedPuppy ? handlePuppyUpdate : handleAddPuppy} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={puppyForm.name}
                  onChange={handlePuppyChange}
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <input
                  type="text"
                  name="color"
                  value={puppyForm.color}
                  onChange={handlePuppyChange}
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <select
                  name="gender"
                  value={puppyForm.gender}
                  onChange={handlePuppyChange}
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  name="status"
                  value={puppyForm.status}
                  onChange={handlePuppyChange}
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
              <div className="form-group sm:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Puppy Image</label>
                {puppyPreviewUrl && (
                  <div className="mb-4 relative w-32 h-32">
                    <img
                      src={puppyPreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPuppyPreviewUrl(null);
                        setPuppyForm(prev => ({ ...prev, image: null }));
                        if (puppyFileInputRef.current) puppyFileInputRef.current.value = '';
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                )}
                <input
                  ref={puppyFileInputRef}
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handlePuppyChange}
                  className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : (selectedPuppy ? 'Update Puppy' : 'Add Puppy')}
              </button>
              {selectedPuppy && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPuppy(null);
                    resetPuppyForm();
                  }}
                  className="w-full sm:w-auto bg-gray-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          {/* Puppies List */}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">Current Puppies</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {litter.puppies.map((puppy) => (
                <div key={puppy.id} className="border p-4 rounded-lg bg-slate-800 border-slate-700 hover:bg-slate-700 transition-all duration-200">
                  <img
                    src={`/api/images${puppy.image}`}
                    alt={puppy.name}
                    className="w-full aspect-square object-cover rounded-lg shadow-lg border-2 border-slate-600/50 transition-transform hover:scale-105"
                  />
                  <h4 className="font-bold text-white">{puppy.name}</h4>
                  <p className="text-gray-400">Color: {puppy.color}</p>
                  <p className="text-gray-400">Gender: {puppy.gender}</p>
                  <p className="text-gray-400">Status: {puppy.status}</p>
                  <div className="mt-2 flex space-x-2">
                    <button
                      onClick={() => selectPuppyForEdit(puppy)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 transition-all duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setPuppyToDelete(puppy.id);
                        setShowDeletePuppyModal(true);
                      }}
                      className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600 transition-all duration-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Litter Modal */}
      {showDeleteLitterModal && (
        <div 
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-start justify-center p-4 z-[9999]"
          onClick={(e) => e.target === e.currentTarget && setShowDeleteLitterModal(false)}
        >
          <div 
            className="mt-[15vh] bg-slate-900/90 backdrop-blur-sm rounded-xl p-8 max-w-md w-full border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 mb-6">
              Delete Litter
            </h2>
            
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this litter? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteLitterModal(false)}
                className="px-6 py-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLitterDelete}
                className="bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                Delete Litter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Puppy Modal */}
      {showDeletePuppyModal && (
        <div 
          className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-start justify-center p-4 z-[9999]"
          onClick={(e) => e.target === e.currentTarget && setShowDeletePuppyModal(false)}
        >
          <div 
            className="mt-[15vh] bg-slate-900/90 backdrop-blur-sm rounded-xl p-8 max-w-md w-full border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 mb-6">
              Delete Puppy
            </h2>
            
            <p className="text-slate-300 mb-6">
              Are you sure you want to delete this puppy? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeletePuppyModal(false);
                  setPuppyToDelete(null);
                }}
                className="px-6 py-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePuppyDelete(puppyToDelete)}
                className="bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200"
              >
                Delete Puppy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-start justify-center p-4 z-[9999]">
          <div className="mt-[15vh] bg-slate-900/90 backdrop-blur-sm rounded-xl p-8 max-w-md w-full border border-white/10">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-green-500 to-green-600 mb-6">
              Success
            </h2>
            <p className="text-slate-300 mb-6">
              {successMessage}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LitterUpdate;
