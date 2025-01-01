import { useState, useEffect, useRef } from 'react';
import { useDogContext } from '../hooks/useDogContext';

const DogUpdate = () => {
    const { dispatch, grownDogs } = useDogContext();
    const [selectedDog, setSelectedDog] = useState('');
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '',
        birthDate: '',
        gender: '',
        color: ''
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        // Fetch all grown dogs if not already in context
        const fetchDogs = async () => {
            try {
                const response = await fetch('/api/dogs/grown');
                const data = await response.json();
                if (response.ok) {
                    dispatch({ type: 'SET_GROWN_DOGS', payload: data });
                }
            } catch (err) {
                setError('Failed to fetch dogs');
            }
        };

        if (!grownDogs.length) {
            fetchDogs();
        }
    }, [dispatch, grownDogs.length]);

    // Load selected dog's data
    const handleDogSelect = async (e) => {
        const dogId = e.target.value;
        setSelectedDog(dogId);
        
        if (!dogId) {
            setFormData({
                name: '',
                birthDate: '',
                gender: '',
                color: ''
            });
            setPreviewUrl(null);
            return;
        }

        try {
            const response = await fetch(`/api/dogs/grown/${dogId}`);
            const data = await response.json();
            if (response.ok) {
                setFormData({
                    name: data.name,
                    birthDate: data.birthDate.split('T')[0],
                    gender: data.gender,
                    color: data.color
                });
                if (data.profilePicture) {
                    setPreviewUrl(`/api/images/uploads/profile-pictures/${data.profilePicture}`);
                }
            }
        } catch (err) {
            setError('Failed to fetch dog details');
        }
    };

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

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setProfilePicture(file);
        setError(null);
    };

    const validateForm = () => {
        const missingFields = [];
        if (!formData.name.trim()) missingFields.push('Name');
        if (!formData.birthDate) missingFields.push('Birth Date');
        if (!formData.gender) missingFields.push('Gender');
        if (!formData.color) missingFields.push('Color');
        
        if (missingFields.length > 0) {
            setError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            formDataToSend.append(key, formData[key]);
        });
        if (profilePicture) {
            formDataToSend.append('profilePicture', profilePicture);
        }

        try {
            const response = await fetch(`/api/dogs/grown/${selectedDog}`, {
                method: 'PUT',
                body: formDataToSend
            });

            if (!response.ok) throw new Error('Failed to update dog');
            const updatedDog = await response.json();
            dispatch({ type: 'UPDATE_DOG', payload: updatedDog });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`/api/dogs/grown/${selectedDog}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete dog');
            dispatch({ type: 'DELETE_DOG', payload: selectedDog });
            setShowDeleteConfirm(false);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="mx-2 sm:mx-4">
            <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
                    Update Dog
                </h2>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Dog to Update</label>
                    <select
                        value={selectedDog}
                        onChange={handleDogSelect}
                        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a Dog</option>
                        {grownDogs?.map(dog => (
                            <option key={dog._id} value={dog._id}>
                                {dog.name}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedDog && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Birth Date</label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                                <select
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
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

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                type="submit"
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200"
                            >
                                Update Dog
                            </button>
                            <button 
                                type="button"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200"
                            >
                                Delete Dog
                            </button>
                        </div>

                        {/* Delete Confirmation Popup */}
                        {showDeleteConfirm && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div className="bg-slate-900 rounded-xl p-6 max-w-sm w-full border border-slate-800">
                                    <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
                                    <p className="text-gray-300 mb-6">Are you sure you want to delete this dog? This action cannot be undone.</p>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleDelete}
                                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors"
                                        >
                                            Yes, Delete
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </form>
        </div>
    );
};

export default DogUpdate;
