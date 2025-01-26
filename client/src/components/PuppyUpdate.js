import React, { useState, useContext, useEffect } from 'react';
import { LitterContext } from '../context/LitterContext';

const PuppyCard = ({ puppy, litterId, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = React.useRef(null);
    const [formData, setFormData] = useState({
        name: puppy.name,
        color: puppy.color,
        gender: puppy.gender,
        status: puppy.status,
    });
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(puppy.image);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            fileInputRef.current.value = '';
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setImage(file);

        return () => URL.revokeObjectURL(objectUrl);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedData = new FormData();
        Object.keys(formData).forEach(key => {
            updatedData.append(key, formData[key]);
        });
        if (image) {
            updatedData.append('image', image);
        }

        await onUpdate(litterId, puppy.id, updatedData);
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 shadow-xl">
                <div className="flex flex-col">
                    <div className="relative w-full aspect-square mb-4">
                        <img 
                            src={puppy.image} 
                            alt={puppy.name}
                            className="w-full h-full object-cover rounded-lg"
                        />
                        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium
                            ${puppy.status === 'Available' ? 'bg-green-500/80' : 
                              puppy.status === 'Reserved' ? 'bg-yellow-500/80' : 'bg-red-500/80'} 
                            text-white`}>
                            {puppy.status}
                        </div>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{puppy.name}</h3>
                    <div className="space-y-1 text-gray-300 mb-4">
                        <p>Color: {puppy.color}</p>
                        <p>Gender: {puppy.gender}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onDelete(litterId, puppy.id)}
                            className="bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 shadow-xl">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                    <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                        required
                    >
                        <option value="Available">Available</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Sold">Sold</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Image</label>
                    {previewUrl && (
                        <div className="relative w-full aspect-square mb-2">
                            <img
                                src={previewUrl}
                                alt={formData.name}
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setPreviewUrl(puppy.image);
                                    setImage(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600"
                            >
                                x
                            </button>
                        </div>
                    )}
                    <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                    />
                </div>
            </div>

            <div className="flex gap-2 mt-6">
                <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200"
                >
                    Save Changes
                </button>
                <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gradient-to-r from-gray-600 to-gray-400 hover:from-gray-700 hover:to-gray-500 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

const PuppyUpdate = () => {
    const { litters, updatePuppy, deletePuppy, error, clearError } = useContext(LitterContext);
    const [selectedLitter, setSelectedLitter] = useState('');

    const currentLitter = litters.find(litter => litter.id === selectedLitter);

    return (
        <div className="mx-2 sm:mx-4 my-8">
            <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Litter</label>
                <select
                    value={selectedLitter}
                    onChange={(e) => setSelectedLitter(e.target.value)}
                    className="w-full sm:w-64 p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">Select a litter...</option>
                    {litters.map(litter => (
                        <option key={litter.id} value={litter.id}>
                            {litter.name}
                        </option>
                    ))}
                </select>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                    {error}
                    <button onClick={clearError} className="ml-2 text-sm">Dismiss</button>
                </div>
            )}

            {selectedLitter && currentLitter ? (
                <>
                    <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
                        Update Puppies - {currentLitter.name}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentLitter.puppies.map(puppy => (
                            <PuppyCard
                                key={puppy.id}
                                puppy={puppy}
                                litterId={currentLitter.id}
                                onUpdate={updatePuppy}
                                onDelete={deletePuppy}
                            />
                        ))}
                    </div>
                </>
            ) : selectedLitter ? (
                <div className="text-center text-gray-300 mt-8">
                    No puppies found in this litter
                </div>
            ) : null}
        </div>
    );
};

export default PuppyUpdate;
