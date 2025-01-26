import React, { useState, useContext, useEffect, useRef } from 'react';
import { LitterContext } from '../context/LitterContext';

const LitterCard = ({ litter, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: litter.name,
        mother: litter.mother,
        father: litter.father,
        birthDate: litter.rawBirthDate,
        availableDate: litter.rawAvailableDate,
    });
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(litter.image);

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

        await onUpdate(litter.id, updatedData);
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 shadow-xl">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-1/3">
                        <img 
                            src={litter.image} 
                            alt={litter.name}
                            className="w-full aspect-square object-cover rounded-lg"
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{litter.name}</h3>
                        <div className="space-y-1 text-gray-300">
                            <p>Mother: {litter.mother}</p>
                            <p>Father: {litter.father}</p>
                            <p>Birth Date: {litter.birthDate}</p>
                            <p>Available Date: {litter.availableDate}</p>
                        </div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="mt-4 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200"
                        >
                            Edit Litter
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 shadow-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Litter Name</label>
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Mother</label>
                    <input
                        type="text"
                        name="mother"
                        value={formData.mother}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Father</label>
                    <input
                        type="text"
                        name="father"
                        value={formData.father}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Birth Date</label>
                    <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Available Date</label>
                    <input
                        type="date"
                        name="availableDate"
                        value={formData.availableDate}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Litter Image</label>
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
                                    setPreviewUrl(litter.image);
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

            <div className="flex gap-4 mt-6">
                <button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200"
                >
                    Save Changes
                </button>
                <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gradient-to-r from-gray-600 to-gray-400 hover:from-gray-700 hover:to-gray-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg transition-all duration-200"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

const LitterUpdate = () => {
    const { litters, updateLitter, error, clearError } = useContext(LitterContext);

    return (
        <div className="mx-2 sm:mx-4 my-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
                Update Litters
            </h2>

            {error && (
                <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                    {error}
                    <button onClick={clearError} className="ml-2 text-sm">Dismiss</button>
                </div>
            )}

            <div className="space-y-6">
                {litters.map(litter => (
                    <LitterCard
                        key={litter.id}
                        litter={litter}
                        onUpdate={updateLitter}
                    />
                ))}
            </div>
        </div>
    );
};

export default LitterUpdate;
