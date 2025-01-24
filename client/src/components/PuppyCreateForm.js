import { useState, useRef, useContext } from 'react';
import { DogContext } from '../context/DogContext';

const PuppyCreateForm = () => {
  const { dispatch, grownDogs } = useContext(DogContext);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    mother: '',
    father: '',
    birthDate: '',
    gender: '',
    color: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      fileInputRef.current.value = '';
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setProfilePicture(file);
    setError(null);

    // Cleanup previous preview URL
    return () => URL.revokeObjectURL(objectUrl);
  };

  const resetFormKeepingLitter = () => {
    setFormData(prev => ({
      ...prev,
      name: '',
      gender: '',
      color: ''
      // Keeping mother, father, and birthDate unchanged
    }));
    setProfilePicture(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError(null);
  };

  const preventDefaultValidation = (e) => {
    e.preventDefault();
  };

  const validateForm = () => {
    const missingFields = [];
    if (!formData.name.trim()) missingFields.push('Name');
    if (!formData.mother) missingFields.push('Mother');
    if (!formData.father) missingFields.push('Father');
    if (!formData.birthDate) missingFields.push('Birth Date');
    if (!formData.gender) missingFields.push('Gender');
    if (!formData.color) missingFields.push('Color');
    
    if (missingFields.length > 0) {
      setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return false;
    }

    // Additional validation
    if (formData.mother === formData.father) {
      setError('Mother and Father cannot be the same dog');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e, keepLitter = false) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    if (profilePicture) {
      formDataToSend.append('profilePicture', profilePicture);
    }

    try {
      const response = await fetch('/api/dogs/puppies', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to create puppy');
      const puppy = await response.json();
      dispatch({ type: 'ADD_PUPPY', payload: puppy });
      
      // Reset form based on keepLitter flag
      if (keepLitter) {
        resetFormKeepingLitter();
      } else {
        setFormData({ name: '', mother: '', father: '', birthDate: '', gender: '', color: '' });
        setProfilePicture(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
      setError(null);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-2 sm:mx-4">
      <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
          Add New Puppy
        </h2>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">Mother</label>
            <select
              name="mother"
              value={formData.mother}
              onChange={handleChange}
              onInvalid={preventDefaultValidation}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Mother</option>
              {grownDogs?.filter(dog => dog.gender === 'female')
                .map(dog => (
                  <option key={dog._id} value={dog._id}>{dog.name}</option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">Father</label>
            <select
              name="father"
              value={formData.father}
              onChange={handleChange}
              onInvalid={preventDefaultValidation}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Father</option>
              {grownDogs?.filter(dog => dog.gender === 'male')
                .map(dog => (
                  <option key={dog._id} value={dog._id}>{dog.name}</option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onInvalid={preventDefaultValidation}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">Birth Date</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              onInvalid={preventDefaultValidation}
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              onInvalid={preventDefaultValidation}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="form-group">
            <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
            <select
              name="color"
              value={formData.color}
              onChange={handleChange}
              onInvalid={preventDefaultValidation}
              className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Color</option>
              <option value="black">Black</option>
              <option value="fawn">Fawn</option>
              <option value="apricot">Apricot</option>
            </select>
          </div>
        </div>

        <div className="form-group mb-8">
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

        <div className="flex flex-col sm:flex-row gap-4 items-stretch">
          <button 
            type="submit"
            onClick={(e) => handleSubmit(e, false)}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200"
          >
            Add Puppy
          </button>
          <button 
            type="submit"
            onClick={(e) => handleSubmit(e, true)}
            className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200"
          >
            Add to Same Litter
          </button>
        </div>
      </form>
    </div>
  );
};

export default PuppyCreateForm;
