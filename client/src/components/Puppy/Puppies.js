import { useState, useContext, useRef } from 'react';
import { LitterContext } from '../../context/LitterContext';
import LoadingAnimation from '../LoadingAnimation';
import DeleteModal from '../Modals/DeleteModal';

const Puppies = ({ litterId, existingPuppies = [], readOnly = false }) => {
  const [puppies, setPuppies] = useState(existingPuppies);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPuppy, setSelectedPuppy] = useState(null);
  const fileInputRef = useRef();
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const { addPuppy, updatePuppy, deletePuppy, loading } = useContext(LitterContext);

  const [newPuppy, setNewPuppy] = useState({
    name: '',
    color: '',
    gender: '',
    price: '',
    description: '',
    status: 'Available', // Default status as defined in schema
  });

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

  const handlePuppySubmit = async (e) => {
    e.preventDefault();
    try {
      const puppyImage = fileInputRef.current?.files[0];
      const result = await addPuppy(litterId, newPuppy, puppyImage);
      setPuppies([...puppies, result]);
      setNewPuppy({
        name: '',
        color: '',
        gender: '',
        price: '',
        description: '',
        status: 'Available'
      });
      clearImage();
    } catch (err) {
      console.error('Error adding puppy:', err);
    }
  };

  const handlePuppyUpdate = async (puppyId, updatedData, puppyImage) => {
    try {
      const result = await updatePuppy(litterId, puppyId, updatedData, puppyImage);
      setPuppies(puppies.map(p => p._id === puppyId ? result : p));
    } catch (err) {
      console.error('Error updating puppy:', err);
    }
  };

  const handlePuppyDelete = async () => {
    if (!selectedPuppy) return;
    try {
      await deletePuppy(litterId, selectedPuppy._id);
      setPuppies(puppies.filter(p => p._id !== selectedPuppy._id));
      setShowDeleteModal(false);
      setSelectedPuppy(null);
    } catch (err) {
      console.error('Error deleting puppy:', err);
    }
  };

  if (loading) {
    return <LoadingAnimation containerClassName="scale-150" />;
  }

  return (
    <div className="mt-8">
      <form onSubmit={handlePuppySubmit} className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-slate-800/50 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
          Add New Puppy
        </h2>

        {!readOnly && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={newPuppy.name}
                onChange={(e) => setNewPuppy({...newPuppy, name: e.target.value})}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
              <input
                type="text"
                value={newPuppy.color}
                onChange={(e) => setNewPuppy({...newPuppy, color: e.target.value})}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
              <select
                value={newPuppy.gender}
                onChange={(e) => setNewPuppy({...newPuppy, gender: e.target.value})}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={newPuppy.status}
                onChange={(e) => setNewPuppy({...newPuppy, status: e.target.value})}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
              </select>
            </div>

            {/* Price field added to match schema */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-2">Price ($)</label>
              <input
                type="number"
                value={newPuppy.price}
                onChange={(e) => setNewPuppy({...newPuppy, price: e.target.value})}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Optional description field */}
            <div className="form-group sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={newPuppy.description}
                onChange={(e) => setNewPuppy({...newPuppy, description: e.target.value})}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                placeholder="Optional: Add any special notes about the puppy"
              />
            </div>

            {/* Profile picture upload */}
            <div className="form-group sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Puppy Image</label>
              {previewUrl && (
                <div className="mb-4 relative w-full">
                  <div className="relative pb-[75%] sm:pb-[56.25%]">
                    <img
                      src={previewUrl}
                      alt="Preview"
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
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png"
                className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-colors"
              />
              <p className="mt-1 text-sm text-slate-400">
                Maximum file size: 2MB. Accepted formats: JPG, PNG
              </p>
            </div>
          </div>
        )}

        {!readOnly && (
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200"
          >
            Add Puppy
          </button>
        )}
      </form>

      {puppies.length > 0 && (
        <div className="mt-8 bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-slate-800/50 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
            Current Puppies
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {puppies.map(puppy => (
              <div key={puppy._id} className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/30 transition-all hover:scale-[1.02] hover:shadow-xl">
                {puppy.profilePicture && (
                  <div className="relative pb-[75%]">
                    <img
                      src={`/api/images/uploads/puppy-images/${puppy.profilePicture}`}
                      alt={puppy.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="text-xl font-semibold text-white mb-2">{puppy.name}</h4>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-gray-400">Color:</span> {puppy.color}</p>
                    <p><span className="text-gray-400">Gender:</span> {puppy.gender}</p>
                    <p><span className="text-gray-400">Price:</span> ${puppy.price}</p>
                    <p>
                      <span className="text-gray-400">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-sm ${
                        puppy.status === 'Available' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                        puppy.status === 'Reserved' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {puppy.status}
                      </span>
                    </p>
                  </div>
                  {puppy.description && (
                    <p className="mt-3 text-sm text-gray-400">{puppy.description}</p>
                  )}
                  {!readOnly && (
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setSelectedPuppy(puppy);
                          setShowDeleteModal(true);
                        }}
                        className="w-full bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPuppy(null);
        }}
        onDelete={handlePuppyDelete}
        itemName={`puppy "${selectedPuppy?.name}"`}
      />
    </div>
  );
};

export default Puppies;