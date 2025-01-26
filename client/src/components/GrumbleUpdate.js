import { useState, useContext, useEffect } from 'react';
import { GrumbleContext } from '../context/GrumbleContext';

// Replace date-fns format with native date formatting
const formatDate = (date) => {
    return new Date(date).toISOString().split('T')[0];
};

/**
 * GrumbleUpdate Component
 * Component for updating grumble information
 * TODO: Implement full functionality
 */
const GrumbleUpdate = () => {
    const { grumbles, addGrumble, updateGrumble, deleteGrumble } = useContext(GrumbleContext);
    const [selectedGrumble, setSelectedGrumble] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        description: '',
        birthDate: '',
        image: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    // Add new state for modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (selectedGrumble) {
            setFormData({
                name: selectedGrumble.name,
                gender: selectedGrumble.gender,
                description: selectedGrumble.description,
                birthDate: formatDate(selectedGrumble.birthDate),
                image: null
            });
            setPreviewUrl(`/api/images${selectedGrumble.image}`);
        }
    }, [selectedGrumble]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formPayload = new FormData();
            
            // Add all form fields to FormData
            Object.keys(formData).forEach(key => {
                // Only append if the value exists and isn't null
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
        setSelectedGrumble(null);
        setFormData({
            name: '',
            gender: '',
            description: '',
            birthDate: '',
            image: null
        });
        setPreviewUrl(null);
    };

    return (
        <div className="mx-2 sm:mx-4">
            <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
                    Grumble Management
                </h2>

                {message.text && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                        {message.text}
                    </div>
                )}

                <div className="mb-6">
                    <select
                        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                        onChange={(e) => setSelectedGrumble(grumbles.find(g => g._id === e.target.value) || null)}
                        value={selectedGrumble?._id || ''}
                    >
                        <option value="">Select a grumble member to edit or leave blank for new</option>
                        {grumbles.map(grumble => (
                            <option key={grumble._id} value={grumble._id}>{grumble.name}</option>
                        ))}
                    </select>
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
                        <label className="block text-sm font-medium text-gray-300 mb-2">Image</label>
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
                                        setFormData(prev => ({ ...prev, image: null }));
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                                >
                                    ×
                                </button>
                            </div>
                        )}
                        <input
                            type="file"
                            onChange={handleImageChange}
                            className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                            accept="image/*"
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200"
                    >
                        {selectedGrumble ? 'Update Member' : 'Add Member'}
                    </button>
                    {selectedGrumble && (
                        <button
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                            className="flex-1 bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200"
                        >
                            Delete Member
                        </button>
                    )}
                </div>
            </form>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div 
                    className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-start justify-center p-4 z-[9999]"
                    onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}
                >
                    <div 
                        className="mt-[15vh] bg-slate-900/90 backdrop-blur-sm rounded-xl p-8 max-w-md w-full border border-white/10"
                        onClick={e => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-red-500 to-red-600 mb-6">
                            Delete Grumble Member
                        </h2>
                        
                        <p className="text-slate-300 mb-6">
                            Are you sure you want to delete this grumble member? This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-6 py-2 text-sm text-white/70 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                            >
                                Delete Member
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

export default GrumbleUpdate;
