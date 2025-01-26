import { useState, useEffect, useRef, useContext } from 'react';
import { LitterContext } from '../context/LitterContext';

const LitterUpdate = () => {
    const { litters, loading, error, getLitter, updateLitter, deleteLitter, updatePuppy, deletePuppy } = useContext(LitterContext);
    const [selectedLitter, setSelectedLitter] = useState(null);
    const [editingPuppy, setEditingPuppy] = useState(null);
    const fileInputRef = useRef(null);
    
    const [litterForm, setLitterForm] = useState({
        name: '',
        mother: '',
        father: '',
        birthDate: '',
        availableDate: '',
    });

    const [puppyForm, setPuppyForm] = useState({
        name: '',
        color: '',
        gender: '',
        status: 'Available',
    });

    useEffect(() => {
        if (selectedLitter) {
            const fetchLitterDetails = async () => {
                try {
                    const data = await getLitter(selectedLitter);
                    if (data) {
                        setLitterForm({
                            name: data.name,
                            mother: data.mother,
                            father: data.father,
                            birthDate: new Date(data.birthDate).toISOString().split('T')[0],
                            availableDate: new Date(data.availableDate).toISOString().split('T')[0],
                        });
                    }
                } catch (err) {
                    console.error('Failed to fetch litter details:', err);
                }
            };
            fetchLitterDetails();
        }
    }, [selectedLitter, getLitter]);

    if (loading) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-red-500 p-8 text-center">{error}</div>;

    return (
        <>
            <div className={`transition-all duration-300 ${selectedLitter ? 'blur-sm' : ''}`}>
                <div className="mx-2 sm:mx-4 space-y-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                        Manage Litters
                    </h2>

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
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                                    >
                                        Update Litter
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {selectedLitter && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto">
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedLitter(null)}
                    />
                    <div className="relative z-[10000] bg-slate-900 rounded-xl p-6 max-w-4xl mx-4 border border-slate-800/50 shadow-xl my-8">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-semibold text-slate-100">
                                Update Litter Details
                            </h3>
                            <button
                                onClick={() => setSelectedLitter(null)}
                                className="text-slate-400 hover:text-slate-200 transition-colors"
                                aria-label="Close modal"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto space-y-6">
                            <form className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-slate-300 mb-2">
                                            Litter Name
                                        </label>
                                        <input
                                            type="text"
                                            value={litterForm.name}
                                            onChange={(e) => setLitterForm({...litterForm, name: e.target.value})}
                                            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-300 mb-2">
                                            Mother
                                        </label>
                                        <input
                                            type="text"
                                            value={litterForm.mother}
                                            onChange={(e) => setLitterForm({...litterForm, mother: e.target.value})}
                                            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-300 mb-2">
                                            Father
                                        </label>
                                        <input
                                            type="text"
                                            value={litterForm.father}
                                            onChange={(e) => setLitterForm({...litterForm, father: e.target.value})}
                                            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-300 mb-2">
                                            Birth Date
                                        </label>
                                        <input
                                            type="date"
                                            value={litterForm.birthDate}
                                            onChange={(e) => setLitterForm({...litterForm, birthDate: e.target.value})}
                                            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-300 mb-2">
                                            Available Date
                                        </label>
                                        <input
                                            type="date"
                                            value={litterForm.availableDate}
                                            onChange={(e) => setLitterForm({...litterForm, availableDate: e.target.value})}
                                            className="w-full px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-slate-300 mb-2">
                                            Litter Image
                                        </label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        type="submit"
                                        className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white font-semibold hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 transition-all duration-200"
                                    >
                                        Update Litter
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete this litter?')) {
                                                deleteLitter(selectedLitter).then(() => setSelectedLitter(null));
                                            }
                                        }}
                                        className="px-8 py-3 rounded-lg bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white font-semibold hover:from-red-500 hover:via-red-600 hover:to-red-700 transition-all duration-200"
                                    >
                                        Delete Litter
                                    </button>
                                </div>
                            </form>

                            <div className="border-t border-slate-800 pt-6">
                                <h4 className="text-lg font-semibold text-slate-100 mb-4">
                                    Puppies
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {litters.find(l => l._id === selectedLitter)?.puppies.map(puppy => (
                                        <div key={puppy._id} className="bg-slate-800/50 rounded-lg p-4">
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
                                                    onClick={() => setEditingPuppy(puppy._id)}
                                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Delete this puppy?')) {
                                                            deletePuppy(selectedLitter, puppy._id);
                                                        }
                                                    }}
                                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default LitterUpdate;
