import { useState } from 'react';
import { useDogContext } from '../hooks/useDogContext';

const PuppyCreateForm = () => {
  const { dispatch, grownDogs, litters } = useDogContext();
  const [editingPuppy, setEditingPuppy] = useState(null);
  const [error, setError] = useState(null);
  const [pendingImages, setPendingImages] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: '',
    color: '',
    mother: '',
    father: ''
  });
  const [currentImages, setCurrentImages] = useState([]); // Add this state

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'birthDate':
        return value ? '' : 'Birth date is required';
      case 'gender':
        return ['male', 'female'].includes(value) ? '' : 'Please select a gender';
      case 'color':
        return ['black', 'fawn', 'apricot'].includes(value) ? '' : 'Please select a color';
      case 'mother':
        return value ? '' : 'Mother is required';
      case 'father':
        return value ? '' : 'Father is required';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    const fieldError = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));

    // Update form validity
    const errors = {
      ...formErrors,
      [name]: fieldError
    };
    setIsValid(!Object.values(errors).some(error => error));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setError(`File ${file.name} is larger than 5MB`);
        return false;
      }
      return true;
    });

    setPendingImages(prev => [
      ...prev,
      ...validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }))
    ]);
  };

  const handleRemovePendingImage = (index) => {
    setPendingImages(prev => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // First create the puppy
      const puppyResponse = await fetch('/api/dogs/puppies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!puppyResponse.ok) {
        throw new Error('Failed to create puppy');
      }

      const newPuppy = await puppyResponse.json();

      // If there are images, upload them
      if (pendingImages.length > 0) {
        const imageFormData = new FormData();
        pendingImages.forEach(img => {
          imageFormData.append('images', img.file);
        });

        const imageResponse = await fetch(`/api/dogs/puppy/${newPuppy._id}/images`, {
          method: 'POST',
          body: imageFormData
        });

        if (!imageResponse.ok) {
          throw new Error('Failed to upload images');
        }

        const updatedPuppy = await imageResponse.json();
        dispatch({ type: 'UPDATE_PUPPY', payload: updatedPuppy });
      } else {
        dispatch({ type: 'ADD_PUPPY', payload: newPuppy });
      }

      // Reset form
      setFormData({
        name: '',
        birthDate: '',
        gender: '',
        color: '',
        mother: '',
        father: ''
      });
      setPendingImages([]);

    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (puppyId) => {
    if (!window.confirm('Are you sure you want to delete this puppy?')) return;
    
    try {
      const response = await fetch(`/api/dogs/puppies/${puppyId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete puppy');
      dispatch({ type: 'DELETE_PUPPY', payload: puppyId });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-2 sm:mx-4">
      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
          {editingPuppy ? 'Edit Puppy' : 'Add New Puppy'}
        </h2>

        {error && (
          <div className="text-red-500 mb-4 p-3 bg-red-500/10 rounded-lg">
            {error}
          </div>
        )}

        {/* Parent Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Mother <span className="text-red-500">*</span>
            </label>
            <select
              name="mother"
              value={formData.mother}
              onChange={handleChange}
              className="w-full p-4 rounded-lg bg-slate-800 text-white border border-slate-700"
            >
              <option value="">Select Mother</option>
              {grownDogs
                ?.filter(dog => dog.gender === 'female')
                .map(dog => (
                  <option key={dog._id} value={dog._id}>
                    {dog.name}
                  </option>
                ))}
            </select>
            {formErrors.mother && (
              <p className="text-red-500 text-sm mt-1">{formErrors.mother}</p>
            )}
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Father <span className="text-red-500">*</span>
            </label>
            <select
              name="father"
              value={formData.father}
              onChange={handleChange}
              className="w-full p-4 rounded-lg bg-slate-800 text-white border border-slate-700"
            >
              <option value="">Select Father</option>
              {grownDogs
                ?.filter(dog => dog.gender === 'male')
                .map(dog => (
                  <option key={dog._id} value={dog._id}>
                    {dog.name}
                  </option>
                ))}
            </select>
            {formErrors.father && (
              <p className="text-red-500 text-sm mt-1">{formErrors.father}</p>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-4 rounded-lg bg-slate-800 text-white border border-slate-700"
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
            )}
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Birth Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-4 rounded-lg bg-slate-800 text-white border border-slate-700"
            />
            {formErrors.birthDate && (
              <p className="text-red-500 text-sm mt-1">{formErrors.birthDate}</p>
            )}
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-4 rounded-lg bg-slate-800 text-white border border-slate-700"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {formErrors.gender && (
              <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>
            )}
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Color <span className="text-red-500">*</span>
            </label>
            <select
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full p-4 rounded-lg bg-slate-800 text-white border border-slate-700"
            >
              <option value="">Select Color</option>
              <option value="black">Black</option>
              <option value="fawn">Fawn</option>
              <option value="apricot">Apricot</option>
            </select>
            {formErrors.color && (
              <p className="text-red-500 text-sm mt-1">{formErrors.color}</p>
            )}
          </div>
        </div>

        {/* Images Section */}
        <div className="border-t border-slate-700 pt-6">
          <h3 className="text-lg font-medium text-white mb-4">Images</h3>
          
          {/* Current Images (only show in edit mode) */}
          {editingPuppy && currentImages.length > 0 && (
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-300 mb-2">Current Images</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {currentImages.map((img) => (
                  <div key={img._id} className="relative group">
                    <img 
                      src={img.url} 
                      alt="Puppy" 
                      className="w-full aspect-square object-cover rounded-lg" 
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Images Preview */}
          {editingPuppy && currentImages.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {currentImages.map((img) => (
                <div key={img.filename} className="relative group">
                  <img 
                    src={`/api/images/uploads/puppy-dogs/${img.filename}`}
                    alt="Puppy" 
                    className="w-full aspect-square object-cover rounded-lg" 
                  />
                </div>
              ))}
            </div>
          )}

          {/* New Images Upload */}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="flex-1 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer"
          />
          
          {/* Pending Images Preview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
            {pendingImages.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img.preview}
                  alt="Preview"
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePendingImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4 mt-6">
          <button
            type="submit"
            disabled={!isValid}
            className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg disabled:opacity-50"
          >
            {editingPuppy ? 'Update Puppy' : 'Add Puppy'}
          </button>
          
          {editingPuppy && (
            <button
              type="button"
              onClick={() => {
                setEditingPuppy(null);
                setFormData({
                  name: '',
                  birthDate: '',
                  gender: '',
                  color: '',
                  mother: '',
                  father: ''
                });
              }}
              className="text-gray-400 hover:text-white"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Add Puppy Management Section */}
      <div className="bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8 mt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
          Manage Puppies
        </h2>
        
        {litters?.map(litter => (
          <div key={`${litter._id.mother}-${litter._id.birthDate}`} className="mb-8 bg-slate-800/50 rounded-xl p-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              {litter.mother.name} x {litter.father.name} - {new Date(litter.birthDate).toLocaleDateString()}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {litter.puppies.map(puppy => (
                <div key={puppy._id} className="bg-slate-700/50 rounded-lg p-4 relative group">
                  {puppy.images && puppy.images.length > 0 && (
                    <img
                      src={`/api/images/${puppy.images.find(img => img.isProfile)?.url || puppy.images[0].url}`}
                      alt={puppy.name}
                      className="w-full aspect-square object-cover rounded-lg mb-4"
                    />
                  )}
                  <h4 className="text-lg font-medium text-white">{puppy.name}</h4>
                  <p className="text-white/80">Color: {puppy.color}</p>
                  <p className="text-white/80">Gender: {puppy.gender}</p>
                  
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingPuppy(puppy);
                        setCurrentImages(puppy.images || []); // Add this line
                        setFormData({
                          name: puppy.name,
                          birthDate: new Date(puppy.birthDate).toISOString().split('T')[0],
                          gender: puppy.gender,
                          color: puppy.color,
                          mother: puppy.mother._id,
                          father: puppy.father._id
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(puppy._id)}
                      className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PuppyCreateForm;
