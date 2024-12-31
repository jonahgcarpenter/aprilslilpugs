import { useState, useRef } from 'react';
import { useDogContext } from '../hooks/useDogContext';

const DogCreateForm = () => {
  const { dispatch, grownDogs } = useDogContext();
  const [error, setError] = useState(null);
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
  const fileInputRef = useRef(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [currentProfilePicture, setCurrentProfilePicture] = useState(null);

  const getImagePath = (profilePicture) => {
    if (!profilePicture) return '';
    // Use the path as-is since it's already complete from the model getter
    return profilePicture;
  };

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
    // If we're editing and have all required fields, or if we're only changing the profile picture
    if (editingDog) {
      const hasAllRequiredFields = !Object.values({
        name: validateField('name', formData.name),
        birthDate: validateField('birthDate', formData.birthDate),
        gender: validateField('gender', formData.gender),
        color: validateField('color', formData.color)
      }).some(error => error);

      // Allow update if all fields are valid or if we only changed the profile picture
      return hasAllRequiredFields;
    }

    // For new dogs, require all fields
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

    const fieldError = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: fieldError
    }));

    setIsValid(
      !validateField('name', name === 'name' ? value : formData.name) &&
      !validateField('birthDate', name === 'birthDate' ? value : formData.birthDate) &&
      !validateField('gender', name === 'gender' ? value : formData.gender) &&
      !validateField('color', name === 'color' ? value : formData.color)
    );
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image must be less than 5MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setProfilePicture(file);
    setError(null);
  };

  const handleRemoveImage = () => {
    setProfilePicture(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    setFormData({
      name: dog.name,
      birthDate: new Date(dog.birthDate).toISOString().split('T')[0],
      gender: dog.gender,
      color: dog.color
    });
    setIsValid(true); // Set form as valid when editing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setError(null);
    setSuccessMessage('');

    try {
      // Create a FormData instance to handle both text data and files
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('birthDate', formData.birthDate);
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('color', formData.color);
      formDataToSend.append('status', formData.status);
      if (profilePicture) {
        formDataToSend.append('profilePicture', profilePicture);
      }

      // Send all data in a single request
      const response = await fetch(
        editingDog ? `/api/dogs/grown/${editingDog._id}` : '/api/dogs/grown',
        {
          method: editingDog ? 'PUT' : 'POST',
          body: formDataToSend // Remove Content-Type header to let browser set it
        }
      );

      const dog = await response.json();

      if (!response.ok) {
        throw new Error(dog.error || 'Failed to save dog');
      }

      // Update the context with the new/updated dog data
      dispatch({ 
        type: editingDog ? 'UPDATE_DOG' : 'ADD_GROWN_DOG', 
        payload: dog 
      });

      // Reset form and show success message
      setFormData({
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
      setProfilePicture(null);
      setCurrentProfilePicture(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setEditingDog(null);
      setSuccessMessage(editingDog ? 'Dog updated successfully!' : 'Dog added successfully!');

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
          {successMessage && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500 rounded-lg">
              <p className="text-green-500 text-sm">{successMessage}</p>
            </div>
          )}

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
              </div>
            </div>

            <div className="form-group sm:col-span-2">
              <label className="block text-lg font-semibold mb-4 text-white">Profile Picture</label>
              <div className="flex flex-col gap-4">
                {(editingDog?.profilePicture || currentProfilePicture) && (
                  <div className="relative w-32 h-32">
                    <img
                      src={getImagePath(editingDog?.profilePicture || currentProfilePicture)}
                      alt="Current Profile"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="flex-1 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer"
                />
                <p className="text-sm text-slate-400">Upload a new image to replace the current picture</p>
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

      <div className="bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
          Manage Dogs
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grownDogs?.map(dog => (
            <div key={dog._id} className="bg-slate-800/50 rounded-lg p-4 relative group">
              {dog.profilePicture && (
                <img 
                  src={getImagePath(dog.profilePicture)}
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
