import { useState, useContext, useEffect, useRef } from 'react';
import { GrumbleContext } from '../../context/GrumbleContext';

const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

const GrumbleUpdate = () => {
    const { grumbles, addGrumble, updateGrumble, deleteGrumble, getFullImageUrl } = useContext(GrumbleContext);
    const [selectedGrumble, setSelectedGrumble] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        description: '',
        birthDate: '',
        profilePicture: null
    });
    const [previewUrls, setPreviewUrls] = useState({
        profilePicture: null
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const formRef = useRef(null);

    useEffect(() => {
        if (selectedGrumble) {
            setFormData({
                name: selectedGrumble.name,
                gender: selectedGrumble.gender,
                description: selectedGrumble.description,
                birthDate: formatDate(selectedGrumble.birthDate),
                profilePicture: null
            });
            setPreviewUrls({
                profilePicture: selectedGrumble.profilePicture ? getFullImageUrl(selectedGrumble.profilePicture) : null
            });
        }
    }, [selectedGrumble]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, profilePicture: file }));
            setPreviewUrls(prev => ({
                ...prev,
                profilePicture: URL.createObjectURL(file)
            }));
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, profilePicture: null }));
        setPreviewUrls(prev => ({ ...prev, profilePicture: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Validate date format
            if (!formData.birthDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                throw new Error('Invalid date format. Please use YYYY-MM-DD format.');
            }

            const formPayload = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    formPayload.append(key, formData[key]);
                }
            });

            if (selectedGrumble) {
                const updated = await updateGrumble(selectedGrumble._id, formPayload);
                if (updated) {
                    setSuccessMessage('Grumble member updated successfully!');
                    setShowSuccessModal(true);
                    setTimeout(() => {
                        setShowSuccessModal(false);
                        resetForm();
                    }, 2000);
                }
            } else {
                const added = await addGrumble(formPayload);
                if (added) {
                    setSuccessMessage('New grumble member added successfully!');
                    setShowSuccessModal(true);
                    setTimeout(() => {
                        setShowSuccessModal(false);
                        resetForm();
                    }, 2000);
                }
            }
        } catch (error) {
            setMessage({ text: error.message || 'An error occurred', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedGrumble) return;
        
        try {
            await deleteGrumble(selectedGrumble._id);
            setMessage({ text: 'Grumble member deleted successfully!', type: 'success' });
            setShowDeleteModal(false);
            resetForm();
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        }
    };

    const resetForm = () => {
        // Reset state
        setSelectedGrumble(null);
        setFormData({
            name: '',
            gender: '',
            description: '',
            birthDate: '',
            profilePicture: null
        });
        setPreviewUrls({
            profilePicture: null
        });
        
        // Scroll to form with offset
        if (formRef.current) {
            const yOffset = -250; // Adjust this value to scroll higher or lower
            const element = formRef.current;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            
            window.scrollTo({
                top: y,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="mx-0 sm:mx-4">
            <form 
                ref={formRef}
                onSubmit={handleSubmit} 
                className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-slate-800/50 shadow-xl"
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
                    Grumble Management
                </h2>

                {message.text && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                        {message.text}
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {selectedGrumble ? 'Currently Editing' : 'Select Member to Edit'}
                    </label>
                    <div className="relative">
                        <select
                            className="w-full p-4 text-base rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                            onChange={(e) => {
                                const selected = grumbles.find(g => g._id === e.target.value);
                                if (!selected) {
                                    resetForm();
                                } else {
                                    setSelectedGrumble(selected);
                                }
                            }}
                            value={selectedGrumble?._id || ''}
                        >
                            <option value="" className="bg-slate-800">Add New Grumble Member</option>
                            {grumbles.length > 0 && (
                                <optgroup label="Edit Existing Member" className="bg-slate-800">
                                    {grumbles.map(grumble => (
                                        <option key={grumble._id} value={grumble._id} className="py-2">
                                            {grumble.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className="form-group sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Birth Date</label>
                        <input
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="form-group sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={6}
                            required
                        />
                    </div>

                    <div className="form-group sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Profile Picture</label>
                        {previewUrls.profilePicture && (
                            <div className="mb-4 relative w-32 h-32">
                                <img
                                    src={previewUrls.profilePicture}
                                    alt="Preview"
                                    className="w-full h-full object-cover rounded-lg border border-slate-700"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage()}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            onChange={(e) => handleImageChange(e)}
                            className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                            accept="image/*"
                        />
                    </div>
                </div>

                <div className="flex justify-between mt-8">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                    >
                        Reset
                    </button>
                    
                    <div className="space-x-4">
                        {selectedGrumble && (
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(true)}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Saving...' : (selectedGrumble ? 'Update' : 'Add')}
                        </button>
                    </div>
                </div>
            </form>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-start justify-center p-4 z-[9999]">
                    <div className="mt-[15vh] bg-slate-900/90 backdrop-blur-sm rounded-xl p-8 max-w-md w-full border border-white/10">
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 mb-6">
                            Confirm Deletion
                        </h2>
                        <p className="text-slate-300 mb-6">
                            Are you sure you want to delete {selectedGrumble?.name}? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
                            >
                                Delete
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
                            Success!
                        </h2>
                        <p className="text-slate-300">
                            {successMessage}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GrumbleUpdate;
