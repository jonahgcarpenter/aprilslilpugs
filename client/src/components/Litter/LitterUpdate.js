import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LitterContext } from '../../context/LitterContext';
import LoadingAnimation from '../LoadingAnimation';
import DeleteModal from '../Modals/DeleteModal';
import SuccessModal from '../Modals/SuccessModal';
import ErrorModal from '../Modals/ErrorModal';

const LitterUpdate = () => {
  const { litterId } = useParams();
  const navigate = useNavigate();
  const { getLitter, updateLitter, deleteLitter, addPuppy, updatePuppy, deletePuppy, error, clearError } = useContext(LitterContext);
  
  // State management
  const [litter, setLitter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('litter'); // 'litter' or 'puppies'
  const [showPuppyModal, setShowPuppyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState({ show: false, type: '', id: null });
  const [selectedPuppy, setSelectedPuppy] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });

  // Form states
  const [litterForm, setLitterForm] = useState({
    name: '', mother: '', father: '', birthDate: '', availableDate: '', profilePicture: null
  });
  const [puppyForm, setPuppyForm] = useState({
    name: '', color: '', gender: '', price: '', status: 'available', profilePicture: null
  });

  // File preview states
  const [litterPreview, setLitterPreview] = useState(null);
  const [puppyPreview, setPuppyPreview] = useState(null);
  
  // File input refs
  const litterFileRef = useRef(null);
  const puppyFileRef = useRef(null);

  useEffect(() => {
    fetchLitterData();
  }, [litterId]);

  const fetchLitterData = async () => {
    try {
      const data = await getLitter(litterId);
      if (!data) {
        navigate('/breeder-dashboard');
        return;
      }
      setLitter(data);
      setLitterForm({
        name: data.name,
        mother: data.mother,
        father: data.father,
        birthDate: new Date(data.birthDate).toISOString().split('T')[0],
        availableDate: new Date(data.availableDate).toISOString().split('T')[0],
        profilePicture: null
      });
      setLitterPreview(data.profilePicture ? `/api/images${data.profilePicture}` : null);
    } catch (error) {
      showError('Error loading litter data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Image must be less than 5MB');
      e.target.value = '';
      return;
    }

    const preview = URL.createObjectURL(file);
    if (type === 'litter') {
      setLitterForm(prev => ({ ...prev, profilePicture: file }));
      setLitterPreview(preview);
    } else {
      setPuppyForm(prev => ({ ...prev, profilePicture: file }));
      setPuppyPreview(preview);
    }
  };

  const handleLitterSubmit = async (e) => {
    e.preventDefault();
    try {
      const success = await updateLitter(litterId, litterForm);
      if (success) {
        await fetchLitterData();
        showSuccessNotification('Litter updated successfully');
      }
    } catch (error) {
      showError('Failed to update litter');
    }
  };

  const handlePuppySubmit = async (e) => {
    e.preventDefault();
    try {
      const success = selectedPuppy
        ? await updatePuppy(litterId, selectedPuppy._id, puppyForm)
        : await addPuppy(litterId, puppyForm);
      
      if (success) {
        await fetchLitterData();
        setShowPuppyModal(false);
        showSuccessNotification(`Puppy ${selectedPuppy ? 'updated' : 'added'} successfully`);
        resetPuppyForm();
      }
    } catch (error) {
      showError(`Failed to ${selectedPuppy ? 'update' : 'add'} puppy`);
    }
  };

  const handleDelete = async () => {
    const { type, id } = showDeleteModal;
    try {
      const success = type === 'litter'
        ? await deleteLitter(litterId)
        : await deletePuppy(litterId, id);
      
      if (success) {
        if (type === 'litter') {
          navigate('/breeder-dashboard');
        } else {
          await fetchLitterData();
          showSuccessNotification('Puppy deleted successfully');
        }
      }
    } catch (error) {
      showError(`Failed to delete ${type}`);
    } finally {
      setShowDeleteModal({ show: false, type: '', id: null });
    }
  };

  const showError = (message) => {
    setErrorModal({ show: true, message });
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const showSuccessNotification = (message) => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  const resetPuppyForm = () => {
    setPuppyForm({
      name: '', color: '', gender: '', price: '', status: 'available', profilePicture: null
    });
    setPuppyPreview(null);
    setSelectedPuppy(null);
    if (puppyFileRef.current) puppyFileRef.current.value = '';
  };

  if (isLoading) return <LoadingAnimation />;

  return (
    <div className="container mx-auto p-4">
      {/* Tabs */}
      <div className="flex mb-6 bg-slate-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('litter')}
          className={`flex-1 py-2 px-4 rounded ${activeTab === 'litter' ? 'bg-blue-500' : ''}`}
        >
          Litter Details
        </button>
        <button
          onClick={() => setActiveTab('puppies')}
          className={`flex-1 py-2 px-4 rounded ${activeTab === 'puppies' ? 'bg-blue-500' : ''}`}
        >
          Puppies ({litter?.puppies?.length || 0})
        </button>
      </div>

      {/* Litter Form */}
      {activeTab === 'litter' && (
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 shadow-xl">
          <form onSubmit={handleLitterSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2">Litter Name</label>
                <input
                  type="text"
                  name="name"
                  value={litterForm.name}
                  onChange={(e) => setLitterForm(prev => ({ ...prev, name: e.target.value }))}
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
                  onChange={(e) => setLitterForm(prev => ({ ...prev, mother: e.target.value }))}
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
                  onChange={(e) => setLitterForm(prev => ({ ...prev, father: e.target.value }))}
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
                  onChange={(e) => setLitterForm(prev => ({ ...prev, birthDate: e.target.value }))}
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
                  onChange={(e) => setLitterForm(prev => ({ ...prev, availableDate: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-2">Litter Image</label>
                <div className="flex items-center space-x-4">
                  {litterPreview && (
                    <div className="relative w-24 h-24">
                      <img
                        src={litterPreview}
                        alt="Litter preview"
                        className="w-full h-full object-cover rounded-lg border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLitterPreview(null);
                          setLitterForm(prev => ({ ...prev, profilePicture: null }));
                          if (litterFileRef.current) litterFileRef.current.value = '';
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <input
                    ref={litterFileRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'litter')}
                    className="flex-1 text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowDeleteModal({ show: true, type: 'litter', id: litterId })}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Delete Litter
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Update Litter
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Puppies List */}
      {activeTab === 'puppies' && (
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 shadow-xl">
          <button
            onClick={() => {
              resetPuppyForm();
              setShowPuppyModal(true);
            }}
            className="mb-4 bg-blue-500 px-4 py-2 rounded hover:bg-blue-600 text-white"
          >
            Add New Puppy
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {litter?.puppies?.map(puppy => (
              <div key={puppy._id} className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/50">
                <div className="relative h-48 mb-4">
                  <img
                    src={puppy.profilePicture ? `/api/images${puppy.profilePicture}` : '/placeholder-puppy.jpg'}
                    alt={puppy.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 space-x-2">
                    <button
                      onClick={() => {
                        setSelectedPuppy(puppy);
                        setPuppyForm({
                          name: puppy.name,
                          color: puppy.color,
                          gender: puppy.gender,
                          price: puppy.price,
                          status: puppy.status,
                          profilePicture: null
                        });
                        setPuppyPreview(`/api/images${puppy.profilePicture}`);
                        setShowPuppyModal(true);
                      }}
                      className="bg-blue-500 p-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setShowDeleteModal({ show: true, type: 'puppy', id: puppy._id })}
                      className="bg-red-500 p-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">{puppy.name}</h3>
                  <div className="text-sm text-gray-400">
                    <p>Color: {puppy.color}</p>
                    <p>Gender: {puppy.gender}</p>
                    <p>Price: ${puppy.price}</p>
                    <p className="capitalize">Status: {puppy.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Puppy Modal */}
      {showPuppyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full border border-slate-800">
            <h3 className="text-xl font-bold mb-4">{selectedPuppy ? 'Edit Puppy' : 'Add New Puppy'}</h3>
            <form onSubmit={handlePuppySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                <input
                  type="text"
                  value={puppyForm.name}
                  onChange={(e) => setPuppyForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                <input
                  type="text"
                  value={puppyForm.color}
                  onChange={(e) => setPuppyForm(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <select
                  value={puppyForm.gender}
                  onChange={(e) => setPuppyForm(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Price</label>
                <input
                  type="number"
                  value={puppyForm.price}
                  onChange={(e) => setPuppyForm(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={puppyForm.status}
                  onChange={(e) => setPuppyForm(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700"
                  required
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div className="mt-4 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowPuppyModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  {selectedPuppy ? 'Update' : 'Add'} Puppy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteModal 
        isOpen={showDeleteModal.show}
        onClose={() => setShowDeleteModal({ show: false, type: '', id: null })}
        onDelete={handleDelete}
        itemName={showDeleteModal.type === 'litter' ? 'this litter' : 'this puppy'}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />

      <ErrorModal
        isOpen={errorModal.show}
        onClose={() => setErrorModal({ show: false, message: '' })}
        message={errorModal.message}
      />

      {/* Keep error notifications */}
      {notification.show && notification.type === 'error' && (
        <div className="fixed bottom-4 right-4 p-4 rounded bg-red-500">
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default LitterUpdate;