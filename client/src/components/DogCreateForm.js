import { useState } from 'react';
import { useDogContext } from '../hooks/useDogContext';

const DogCreateForm = () => {
  const { dispatch, grownDogs } = useDogContext();
  const [error, setError] = useState(null);
  const [pendingImages, setPendingImages] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: '',
    color: '',
    status: 'active',
    health: {
      vaccinations: [],
      medicalHistory: []
    }
  });
  const [editingDog, setEditingDog] = useState(null);
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
      default:
        return '';
    }
  };

  const validateForm = () => {
    const errors = {
      name: validateField('name', formData.name),
      birthDate: validateField('birthDate', formData.birthDate),
      gender: validateField('gender', formData.gender),
      color: validateField('color', formData.color)
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update errors for the changed field
    const fieldError = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));

    // Check overall form validity
    setIsValid(
      !validateField('name', name === 'name' ? value : formData.name) &&
      !validateField('birthDate', name === 'birthDate' ? value : formData.birthDate) &&
      !validateField('gender', name === 'gender' ? value : formData.gender) &&
      !validateField('color', name === 'color' ? value : formData.color)
    );
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
        caption: file.name,
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

  const handleDelete = async (dogId) => {
    if (!window.confirm('Are you sure you want to delete this dog?')) return;
    
    try {
      const response = await fetch(`/api/dogs/grown/${dogId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete dog');
      dispatch({ type: 'DELETE_DOG', payload: dogId });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (dog) => {
    setEditingDog(dog);
    setCurrentImages(dog.images || []); // Add this line
    setFormData({
      name: dog.name,
      birthDate: new Date(dog.birthDate).toISOString().split('T')[0],
      gender: dog.gender,
      color: dog.color
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingDog) {
        let updatedDog = editingDog;

        // Only submit form data if it has changed
        if (formData.name !== editingDog.name ||
            formData.birthDate !== new Date(editingDog.birthDate).toISOString().split('T')[0] ||
            formData.gender !== editingDog.gender ||
            formData.color !== editingDog.color) {
          
          const response = await fetch(`/api/dogs/grown/${editingDog._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.name,
              birthDate: formData.birthDate,
              gender: formData.gender,
              color: formData.color
            })
          });

          updatedDog = await response.json();
          if (!response.ok) throw new Error(updatedDog.error || 'Failed to update dog');
        }

        // Handle image updates separately
        if (pendingImages.length > 0) {
          const uploadForm = new FormData();
          pendingImages.forEach(img => {
            uploadForm.append('images', img.file);
          });

          const imageResponse = await fetch(`/api/dogs/grown/${editingDog._id}/images`, {
            method: 'POST',
            body: uploadForm
          });

          if (!imageResponse.ok) {
            throw new Error('Failed to upload images');
          }

          updatedDog = await imageResponse.json();
        }

        dispatch({ type: 'UPDATE_DOG', payload: updatedDog });
        setEditingDog(null);
        setCurrentImages([]);
        setPendingImages([]);
        setFormData({
          name: '',
          birthDate: '',
          gender: '',
          color: ''
        });
      } else {
        // First create the dog
        const response = await fetch('/api/dogs/grown', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            birthDate: formData.birthDate,
            gender: formData.gender,
            color: formData.color
          })
        });

        const newDog = await response.json();
        if (!response.ok) throw new Error(newDog.error || 'Failed to create dog');

        // Then upload images if any
        if (pendingImages.length > 0) {
          const uploadForm = new FormData();
          pendingImages.forEach(img => {
            uploadForm.append('images', img.file);
          });

          const imageResponse = await fetch(`/api/dogs/grown/${newDog._id}/images`, {
            method: 'POST',
            body: uploadForm
          });

          if (!imageResponse.ok) {
            throw new Error('Failed to upload images');
          }

          const updatedDog = await imageResponse.json();
          dispatch({ type: 'ADD_GROWN_DOG', payload: updatedDog });
        } else {
          dispatch({ type: 'ADD_GROWN_DOG', payload: newDog });
        }
      }

      // Reset form
      setFormData({
        name: '',
        birthDate: '',
        gender: '',
        color: ''
      });
      setPendingImages([]);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-2 sm:mx-4">
      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8 mb-8">
        <div className="max-w-[120ch] mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
            {editingDog ? 'Edit Dog' : 'Add New Dog'}
          </h2>
        
          {error && (
            <div className="text-white text-sm sm:text-base mt-4 p-3 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700">
              {error}
            </div>
          )}

          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="border-b border-slate-700 pb-4">
              <h3 className="text-lg font-semibold mb-4 text-white">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full p-4 rounded-lg bg-slate-800 text-white text-base border ${
                      formErrors.name ? 'border-red-500' : 'border-slate-700'
                    }`}
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
                    className={`w-full p-4 rounded-lg bg-slate-800 text-white text-base border ${
                      formErrors.birthDate ? 'border-red-500' : 'border-slate-700'
                    }`}
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
                    className={`w-full p-4 rounded-lg bg-slate-800 text-white text-base border ${
                      formErrors.gender ? 'border-red-500' : 'border-slate-700'
                    }`}
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
                    className={`w-full p-4 rounded-lg bg-slate-800 text-white text-base border ${
                      formErrors.color ? 'border-red-500' : 'border-slate-700'
                    }`}
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

                {/* Remove the registration input field */}
              </div>
            </div>

            {/* Images Section */}
            <div className="border-b border-slate-700 pb-4">
              <h3 className="text-lg font-semibold mb-4 text-white">Images</h3>
              
              {/* Current Images (only show in edit mode) */}
              {editingDog && currentImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-medium text-gray-300 mb-2">Current Images</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {currentImages.map((img) => (
                      <div key={img._id} className="relative border border-slate-700 p-2 rounded-lg bg-slate-800">
                        <img 
                          src={img.url} 
                          alt="Dog" 
                          className="w-full h-32 object-cover rounded" 
                        />
                      </div>
                    ))}
                  </div>
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
              <div className="grid grid-cols-2 gap-4 mt-4">
                {pendingImages.map((img, index) => (
                  <div key={index} className="relative border border-slate-700 p-2 rounded-lg bg-slate-800">
                    <img src={img.preview} alt={img.caption} className="w-full h-32 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => handleRemovePendingImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button 
                type="submit"
                disabled={!isValid}
                className="w-full sm:w-auto mt-6 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white text-base px-6 py-3 rounded-lg transition-all duration-200 font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingDog ? 'Update Dog' : 'Add Dog'}
              </button>
              {editingDog && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingDog(null);
                    setFormData({
                      name: '',
                      birthDate: '',
                      gender: '',
                      color: ''
                    });
                  }}
                  className="mt-6 text-gray-400 hover:text-white"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Dog Management Section */}
      <div className="bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
          Manage Dogs
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grownDogs?.map(dog => (
            <div key={dog._id} className="bg-slate-800/50 rounded-lg p-4 relative group">
              {dog.images && dog.images.length > 0 && (
                <img 
                  src={`/api/images/${dog.images.find(img => img.isProfile)?.url || dog.images[0].url}`}
                  alt={dog.name}
                  className="w-full aspect-square object-cover rounded-lg mb-4"
                />
              )}
              
              <h3 className="text-lg font-semibold text-white">{dog.name}</h3>
              <p className="text-gray-300">Color: {dog.color}</p>
              <p className="text-gray-300">Gender: {dog.gender}</p>
              <p className="text-gray-300">Born: {new Date(dog.birthDate).toLocaleDateString()}</p>

              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(dog)}
                  className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(dog._id)}
                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DogCreateForm;
