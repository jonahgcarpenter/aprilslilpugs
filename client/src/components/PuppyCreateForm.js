import { useState } from 'react';
import { useDogContext } from '../hooks/useDogContext';

const PuppyCreateForm = () => {
  const { dispatch, grownDogs, litters } = useDogContext();
  const [editingPuppy, setEditingPuppy] = useState(null);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const [replaceImage, setReplaceImage] = useState(false);

  const [litterInfo, setLitterInfo] = useState({
    mother: '',
    father: '',
    birthDate: ''
  });

  const [litterInfoSet, setLitterInfoSet] = useState(false);

  // Modify form data to only include puppy-specific fields
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    color: ''
  });

  const [expandedLitter, setExpandedLitter] = useState(null);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required';
      case 'gender':
        return ['male', 'female'].includes(value) ? '' : 'Please select a gender';
      case 'color':
        return ['black', 'fawn', 'apricot'].includes(value) ? '' : 'Please select a color';
      default:
        return '';
    }
  };

  const validateLitterInfo = () => {
    return litterInfo.mother && litterInfo.father && litterInfo.birthDate;
  };

  // Modify isValid logic to include image changes
  const updateFormValidity = (errors) => {
    if (editingPuppy) {
      // When editing, form is valid if there are no errors AND either data changed or new image
      const dataChanged = Object.keys(formData).some(key => 
        formData[key] !== editingPuppy[key]
      );
      setIsValid(!Object.values(errors).some(error => error) && (dataChanged || pendingImage || replaceImage));
    } else {
      // For new puppies, require all fields and follow normal validation
      setIsValid(!Object.values(errors).some(error => error));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    const fieldError = validateField(name, value);
    const newErrors = {
      ...formErrors,
      [name]: fieldError
    };
    setFormErrors(newErrors);

    updateFormValidity(newErrors);
  };

  const handleLitterInfoChange = (e) => {
    const { name, value } = e.target;
    setLitterInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSetLitterInfo = () => {
    if (validateLitterInfo()) {
      setLitterInfoSet(true);
    }
  };

  const handleChangeLitter = () => {
    setLitterInfoSet(false);
    resetForm();
  };

  // Update handleFileSelect to trigger form validity check
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File is larger than 5MB');
      return;
    }

    setPendingImage({
      file,
      preview: URL.createObjectURL(file)
    });
    setReplaceImage(true);
    updateFormValidity(formErrors); // Update validity when image is selected
  };

  const handleRemovePendingImage = () => {
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage.preview);
      setPendingImage(null);
    }
    setReplaceImage(false);
  };

  const resetForm = (keepLitterInfo = false) => {
    if (!keepLitterInfo) {
      setLitterInfo({
        mother: '',
        father: '',
        birthDate: ''
      });
      setLitterInfoSet(false);
    }
    
    setFormData({
      name: '',
      gender: '',
      color: ''
    });
    
    // Always cleanup image states
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage.preview);
    }
    setPendingImage(null);
    setReplaceImage(false);
    setEditingPuppy(null);
    setError(null);
    setFormErrors({});
  };

  const handleCancel = () => {
    resetForm();
  };

  const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      if (editingPuppy) {
        // Only include changed fields
        Object.keys(formData).forEach(key => {
          if (formData[key] !== editingPuppy[key]) {
            formDataToSend.append(key, formData[key]);
          }
        });
        
        // Always include image-related data
        formDataToSend.append('replaceImage', replaceImage);
        if (pendingImage) {
          formDataToSend.append('profilePicture', pendingImage.file);
        }
      } else {
        // For new puppies, include all data
        const fullPuppyData = {
          ...formData,
          mother: litterInfo.mother,
          father: litterInfo.father,
          birthDate: litterInfo.birthDate
        };
        Object.keys(fullPuppyData).forEach(key => {
          formDataToSend.append(key, fullPuppyData[key]);
        });
        if (pendingImage) {
          formDataToSend.append('profilePicture', pendingImage.file);
        }
      }

      const endpoint = editingPuppy 
        ? `/api/dogs/puppies/${editingPuppy._id}`
        : '/api/dogs/puppies';

      const method = editingPuppy ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method: method,
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingPuppy ? 'update' : 'create'} puppy`);
      }

      const puppy = await response.json();
      dispatch({ 
        type: editingPuppy ? 'UPDATE_PUPPY' : 'ADD_PUPPY', 
        payload: puppy 
      });

      // Only reset puppy-specific data if adding another to same litter
      if (addAnother) {
        setFormData({
          name: '',
          gender: '',
          color: ''
        });
        // Always cleanup image states even when adding another
        if (pendingImage) {
          URL.revokeObjectURL(pendingImage.preview);
        }
        setPendingImage(null);
        setReplaceImage(false);
      } else {
        resetForm();
      }

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

  const handleLitterExpand = (litterId) => {
    setExpandedLitter(expandedLitter === litterId ? null : litterId);
  };

  return (
    <div className="mx-2 sm:mx-4">
      <form onSubmit={handleSubmit} className="bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8 mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
          {editingPuppy ? 'Edit Puppy' : litterInfoSet ? 'Add Puppy to Litter' : 'Create New Litter'}
        </h2>

        {error && (
          <div className="text-red-500 mb-4 p-3 bg-red-500/10 rounded-lg">
            {error}
          </div>
        )}

        {/* Litter Information Section */}
        {!editingPuppy && (
          <div className={`${litterInfoSet ? 'opacity-70' : ''}`}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Mother <span className="text-red-500">*</span>
                </label>
                <select
                  name="mother"
                  value={litterInfo.mother}
                  onChange={handleLitterInfoChange}
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
                  value={litterInfo.father}
                  onChange={handleLitterInfoChange}
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

              <div className="form-group">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Birth Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={litterInfo.birthDate}
                  onChange={handleLitterInfoChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full p-4 rounded-lg bg-slate-800 text-white border border-slate-700"
                />
                {formErrors.birthDate && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.birthDate}</p>
                )}
              </div>
            </div>
            
            {!litterInfoSet ? (
              <button
                type="button"
                onClick={handleSetLitterInfo}
                disabled={!validateLitterInfo()}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg disabled:opacity-50"
              >
                Set Litter Info
              </button>
            ) : (
              <div className="flex items-center justify-between bg-slate-800 p-4 rounded-lg mb-6">
                <div className="text-white">
                  <p>Mother: {grownDogs?.find(d => d._id === litterInfo.mother)?.name}</p>
                  <p>Father: {grownDogs?.find(d => d._id === litterInfo.father)?.name}</p>
                  <p>Birth Date: {new Date(litterInfo.birthDate).toLocaleDateString()}</p>
                </div>
                <button
                  type="button"
                  onClick={handleChangeLitter}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Change Litter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Show puppy-specific fields only when litter info is set or editing */}
        {(litterInfoSet || editingPuppy) && (
          <>
            {/* Basic Puppy Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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

            {/* Profile Picture Section */}
            <div className="border-t border-slate-700 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Profile Picture</h3>
              
              {/* Current Profile Picture (only show in edit mode) */}
              {editingPuppy && editingPuppy.profilePicture && !replaceImage && (
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-medium text-gray-300 mb-2">Current Profile Picture</h4>
                    <button
                      type="button"
                      onClick={() => setReplaceImage(true)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Replace Image
                    </button>
                  </div>
                  <div className="max-w-xs">
                    <img 
                      src={editingPuppy.profilePicture}
                      alt="Puppy Profile" 
                      className="w-full aspect-square object-cover rounded-lg" 
                    />
                  </div>
                </div>
              )}

              {/* New Profile Picture Upload */}
              {(!editingPuppy || replaceImage) && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="flex-1 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer"
                  />
                  
                  {replaceImage && (
                    <button
                      type="button"
                      onClick={() => {
                        handleRemovePendingImage();
                        setReplaceImage(false);
                      }}
                      className="text-gray-400 hover:text-white text-sm mt-2 block"
                    >
                      Keep Current Image
                    </button>
                  )}
                </>
              )}
              
              {/* Pending Image Preview */}
              {pendingImage && (
                <div className="mt-4 max-w-xs relative">
                  <img
                    src={pendingImage.preview}
                    alt="Preview"
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePendingImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center space-x-4 mt-6">
              {editingPuppy ? (
                <>
                  <button
                    type="submit"
                    disabled={!isValid}
                    className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg disabled:opacity-50"
                  >
                    Update Puppy
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-white"
                  >
                    Cancel Edit
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={!isValid}
                    onClick={(e) => handleSubmit(e, false)}
                    className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg disabled:opacity-50"
                  >
                    Add Puppy & Finish
                  </button>
                  <button
                    type="submit"
                    disabled={!isValid}
                    onClick={(e) => handleSubmit(e, true)}
                    className="bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg disabled:opacity-50"
                  >
                    Add & Create Another Puppy
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </form>

      {/* Replace the existing management section with this new one */}
      <div className="bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8 mt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
          Manage Litters
        </h2>
        
        {litters?.map(litter => {
          const litterId = `${litter._id.mother}-${litter._id.birthDate}`;
          const isExpanded = expandedLitter === litterId;
          
          return (
            <div key={litterId} className="mb-8 bg-slate-800/50 rounded-xl p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => handleLitterExpand(litterId)}
              >
                <h3 className="text-xl font-semibold text-white">
                  {litter.mother.name} x {litter.father.name} - {new Date(litter.birthDate).toLocaleDateString()}
                </h3>
                <span className="text-blue-400">
                  {isExpanded ? '▼' : '▶'} {litter.puppies.length} Puppies
                </span>
              </div>

              {isExpanded && (
                <div className="mt-4">
                  <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
                    <h4 className="text-lg font-medium text-white mb-2">Litter Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Mother</p>
                        <p className="text-white">{litter.mother.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Father</p>
                        <p className="text-white">{litter.father.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Birth Date</p>
                        <p className="text-white">{new Date(litter.birthDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {litter.puppies.map(puppy => (
                      <div key={puppy._id} className="bg-slate-700/50 rounded-lg p-4 relative group">
                        <div className="relative">
                          {puppy.profilePicture && (
                            <img
                              src={puppy.profilePicture}
                              alt={puppy.name}
                              className="w-full aspect-square object-cover rounded-lg mb-4"
                            />
                          )}
                          <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPuppy(puppy);
                                setLitterInfoSet(true); // Add this line
                                setFormData({
                                  name: puppy.name,
                                  gender: puppy.gender,
                                  color: puppy.color,
                                });
                                setLitterInfo({
                                  mother: puppy.mother._id || puppy.mother,
                                  father: puppy.father._id || puppy.father,
                                  birthDate: new Date(puppy.birthDate).toISOString().split('T')[0]
                                });
                              }}
                              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(puppy._id);
                              }}
                              className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <h4 className="text-lg font-medium text-white">{puppy.name}</h4>
                        <p className="text-white/80">Color: {puppy.color}</p>
                        <p className="text-white/80">Gender: {puppy.gender}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PuppyCreateForm;
