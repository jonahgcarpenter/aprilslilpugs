import { useState, useContext } from 'react';
import { LitterContext } from '../context/LitterContext';

// Sub-component for the litter form
const LitterForm = ({ litter, onSubmit, onDelete }) => {
    const [formData, setFormData] = useState({
        name: litter?.name || '',
        mother: litter?.mother || '',
        father: litter?.father || '',
        birthDate: litter?.birthDate ? new Date(litter.birthDate).toISOString().split('T')[0] : '',
        availableDate: litter?.availableDate ? new Date(litter.availableDate).toISOString().split('T')[0] : '',
    });
    const [image, setImage] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        if (image) data.append('image', image);
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                    <label className="block text-slate-300 mb-2">Litter Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-slate-300 mb-2">Mother</label>
                    <input
                        type="text"
                        value={formData.mother}
                        onChange={(e) => setFormData({...formData, mother: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-slate-300 mb-2">Father</label>
                    <input
                        type="text"
                        value={formData.father}
                        onChange={(e) => setFormData({...formData, father: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-slate-300 mb-2">Birth Date</label>
                    <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-slate-300 mb-2">Available Date</label>
                    <input
                        type="date"
                        value={formData.availableDate}
                        onChange={(e) => setFormData({...formData, availableDate: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                        required
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-slate-300 mb-2">Litter Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImage(e.target.files[0])}
                        className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                    />
                </div>
            </div>
            <div className="flex gap-4">
                <button 
                    type="submit"
                    className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-semibold hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 transition-all"
                >
                    Save Changes
                </button>
                {litter && (
                    <button 
                        type="button"
                        onClick={onDelete}
                        className="px-8 py-3 rounded-lg bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white font-semibold hover:from-red-500 hover:via-red-600 hover:to-red-700 transition-all"
                    >
                        Delete Litter
                    </button>
                )}
            </div>
        </form>
    );
};

// Sub-component for puppy card
const PuppyCard = ({ puppy, onEdit, onDelete }) => {
    return (
        <div className="bg-slate-800/50 rounded-lg p-4">
            <img 
                src={puppy.image} 
                alt={puppy.name} 
                className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h5 className="font-semibold text-white mb-2">{puppy.name}</h5>
            <p className="text-slate-300">Color: {puppy.color}</p>
            <p className="text-slate-300">Gender: {puppy.gender}</p>
            <p className="text-slate-300">Status: {puppy.status}</p>
            
            <div className="flex gap-2 mt-4">
                <button
                    onClick={() => onEdit(puppy)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Edit
                </button>
                <button
                    onClick={() => onDelete(puppy._id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

// Sub-component for puppy form
const PuppyForm = ({ puppy, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: puppy?.name || '',
        color: puppy?.color || '',
        gender: puppy?.gender || 'Male',
        status: puppy?.status || 'Available',
        image: null
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'image' || formData[key]) {
                data.append(key, formData[key]);
            }
        });
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-slate-800/50 rounded-lg p-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-slate-300 mb-2">Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-slate-300 mb-2">Color</label>
                    <input
                        type="text"
                        value={formData.color}
                        onChange={(e) => setFormData({...formData, color: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-slate-300 mb-2">Gender</label>
                    <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                        required
                    >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div>
                    <label className="block text-slate-300 mb-2">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg bg-slate-700/50 border border-slate-600/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white"
                        required
                    >
                        <option value="Available">Available</option>
                        <option value="Reserved">Reserved</option>
                        <option value="Sold">Sold</option>
                    </select>
                </div>
                <div>
                    <label className="block text-slate-300 mb-2">Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                        className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                    />
                </div>
            </div>
            <div className="flex gap-4 mt-6">
                <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Save
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

// Main LitterUpdate component
const LitterUpdate = () => {
    const { 
        litters,
        loading,
        error,
        updateLitter,
        deleteLitter,
        updatePuppy,
        deletePuppy,
        addPuppy
    } = useContext(LitterContext);

    const [selectedLitter, setSelectedLitter] = useState(null);
    const [editingPuppy, setEditingPuppy] = useState(null);
    const [showAddPuppy, setShowAddPuppy] = useState(false);

    const handleLitterUpdate = async (formData) => {
        if (!selectedLitter) return;
        
        const success = await updateLitter(selectedLitter, formData);
        if (success) {
            // Show success message
            setSelectedLitter(null);
        }
    };

    const handleLitterDelete = async () => {
        if (!selectedLitter || !window.confirm('Are you sure you want to delete this litter?')) return;
        
        const success = await deleteLitter(selectedLitter);
        if (success) {
            setSelectedLitter(null);
        }
    };

    const handlePuppySubmit = async (formData) => {
        if (!selectedLitter) return;
        
        let success;
        if (editingPuppy) {
            success = await updatePuppy(selectedLitter, editingPuppy, formData);
        } else {
            success = await addPuppy(selectedLitter, formData);
        }
        
        if (success) {
            setEditingPuppy(null);
            setShowAddPuppy(false);
        }
    };

    const handlePuppyDelete = async (puppyId) => {
        if (!selectedLitter || !window.confirm('Are you sure you want to delete this puppy?')) return;
        
        await deletePuppy(selectedLitter, puppyId);
    };

    if (loading) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-red-500 p-8 text-center">{error}</div>;

    return (
        <div className="mx-2 sm:mx-4 space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                Manage Litters
            </h2>

            {selectedLitter ? (
                <div className="space-y-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-white">
                            Edit Litter
                        </h3>
                        <button
                            onClick={() => setSelectedLitter(null)}
                            className="text-slate-400 hover:text-slate-200"
                        >
                             Back to Litters
                        </button>
                    </div>

                    <LitterForm
                        litter={litters.find(l => l._id === selectedLitter)}
                        onSubmit={handleLitterUpdate}
                        onDelete={handleLitterDelete}
                    />

                    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800/50 shadow-xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-semibold text-white">Puppies</h3>
                            {!showAddPuppy && !editingPuppy && (
                                <button
                                    onClick={() => setShowAddPuppy(true)}
                                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-400 hover:from-green-700 hover:to-green-500 text-white rounded-lg font-semibold transition-all"
                                >
                                    Add Puppy
                                </button>
                            )}
                        </div>

                        {(showAddPuppy || editingPuppy) && (
                            <div className="mb-6">
                                <PuppyForm
                                    puppy={editingPuppy ? 
                                        litters.find(l => l._id === selectedLitter)
                                            ?.puppies.find(p => p._id === editingPuppy) 
                                        : null}
                                    onSubmit={handlePuppySubmit}
                                    onCancel={() => {
                                        setEditingPuppy(null);
                                        setShowAddPuppy(false);
                                    }}
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {litters.find(l => l._id === selectedLitter)?.puppies.map(puppy => (
                                <PuppyCard
                                    key={puppy._id}
                                    puppy={puppy}
                                    onEdit={() => {
                                        setShowAddPuppy(false);
                                        setEditingPuppy(puppy._id);
                                    }}
                                    onDelete={() => handlePuppyDelete(puppy._id)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {litters.map(litter => (
                        <div 
                            key={litter._id}
                            className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800/50 shadow-xl overflow-hidden"
                        >
                            <div className="relative h-48">
                                <img 
                                    src={litter.image} 
                                    alt={litter.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                    <h3 className="text-xl font-semibold text-white">
                                        {litter.name}
                                    </h3>
                                </div>
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-400 text-sm">Parents</p>
                                        <p className="text-white">{litter.mother} & {litter.father}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-400 text-sm">Birth Date</p>
                                        <p className="text-white">{litter.birthDate}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(
                                        litter.puppies.reduce((acc, puppy) => {
                                            acc[puppy.status] = (acc[puppy.status] || 0) + 1;
                                            return acc;
                                        }, {})
                                    ).map(([status, count]) => (
                                        <span 
                                            key={status}
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                status === 'Available' ? 'bg-green-500/20 text-green-400' :
                                                status === 'Reserved' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}
                                        >
                                            {status}: {count}
                                        </span>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setSelectedLitter(litter._id)}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-all"
                                >
                                    Manage Litter
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LitterUpdate;
