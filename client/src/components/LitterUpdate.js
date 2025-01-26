import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LitterContext } from '../context/LitterContext';

const LitterUpdate = () => {
    const { litterId } = useParams();
    const navigate = useNavigate();
    const { getLitter, updateLitter, deleteLitter, addPuppy, updatePuppy, deletePuppy, error, clearError } = useContext(LitterContext);

    const [litter, setLitter] = useState(null);
    const [litterForm, setLitterForm] = useState({
        name: '',
        mother: '',
        father: '',
        birthDate: '',
        availableDate: '',
        image: null
    });
    const [puppyForm, setPuppyForm] = useState({
        name: '',
        color: '',
        gender: 'Male',
        status: 'Available',
        image: null
    });
    const [selectedPuppy, setSelectedPuppy] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch litter data on component mount
    useEffect(() => {
        const fetchLitterData = async () => {
            if (litterId) {
                const data = await getLitter(litterId);
                if (data) {
                    setLitter(data);
                    setLitterForm({
                        name: data.name,
                        mother: data.mother,
                        father: data.father,
                        birthDate: data.rawBirthDate,
                        availableDate: data.rawAvailableDate,
                        image: null
                    });
                }
            }
            setIsLoading(false);
        };
        fetchLitterData();
    }, [litterId, getLitter]);

    // Handle litter form changes
    const handleLitterChange = (e) => {
        const { name, value, files } = e.target;
        setLitterForm(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    // Handle puppy form changes
    const handlePuppyChange = (e) => {
        const { name, value, files } = e.target;
        setPuppyForm(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
    };

    // Handle litter update
    const handleLitterUpdate = async (e) => {
        e.preventDefault();
        const success = await updateLitter(litterId, litterForm);
        if (success) {
            const updatedLitter = await getLitter(litterId);
            setLitter(updatedLitter);
            alert('Litter updated successfully!');
        }
    };

    // Handle litter deletion
    const handleLitterDelete = async () => {
        if (window.confirm('Are you sure you want to delete this litter?')) {
            const success = await deleteLitter(litterId);
            if (success) {
                navigate('/admin/litters');
            }
        }
    };

    // Handle adding a new puppy
    const handleAddPuppy = async (e) => {
        e.preventDefault();
        const success = await addPuppy(litterId, puppyForm);
        if (success) {
            const updatedLitter = await getLitter(litterId);
            setLitter(updatedLitter);
            setPuppyForm({
                name: '',
                color: '',
                gender: 'Male',
                status: 'Available',
                image: null
            });
            alert('Puppy added successfully!');
        }
    };

    // Handle updating a puppy
    const handlePuppyUpdate = async (e) => {
        e.preventDefault();
        if (!selectedPuppy) return;
        
        const success = await updatePuppy(litterId, selectedPuppy.id, puppyForm);
        if (success) {
            const updatedLitter = await getLitter(litterId);
            setLitter(updatedLitter);
            setSelectedPuppy(null);
            setPuppyForm({
                name: '',
                color: '',
                gender: 'Male',
                status: 'Available',
                image: null
            });
            alert('Puppy updated successfully!');
        }
    };

    // Handle puppy deletion
    const handlePuppyDelete = async (puppyId) => {
        if (window.confirm('Are you sure you want to delete this puppy?')) {
            const success = await deletePuppy(litterId, puppyId);
            if (success) {
                const updatedLitter = await getLitter(litterId);
                setLitter(updatedLitter);
            }
        }
    };

    // Select puppy for editing
    const selectPuppyForEdit = (puppy) => {
        setSelectedPuppy(puppy);
        setPuppyForm({
            name: puppy.name,
            color: puppy.color,
            gender: puppy.gender,
            status: puppy.status,
            image: null
        });
    };

    if (isLoading) return <div>Loading...</div>;
    if (!litter && !isLoading) return <div>Litter not found</div>;

    return (
        <div className="litter-update container mx-auto p-4">
            {error && (
                <div className="error-message bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                    <button onClick={clearError} className="float-right">&times;</button>
                </div>
            )}

            {/* Litter Update Form */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">Update Litter</h2>
                <form onSubmit={handleLitterUpdate} className="space-y-4">
                    <div>
                        <label className="block mb-1">Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={litterForm.name}
                            onChange={handleLitterChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Mother:</label>
                        <input
                            type="text"
                            name="mother"
                            value={litterForm.mother}
                            onChange={handleLitterChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Father:</label>
                        <input
                            type="text"
                            name="father"
                            value={litterForm.father}
                            onChange={handleLitterChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Birth Date:</label>
                        <input
                            type="date"
                            name="birthDate"
                            value={litterForm.birthDate}
                            onChange={handleLitterChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Available Date:</label>
                        <input
                            type="date"
                            name="availableDate"
                            value={litterForm.availableDate}
                            onChange={handleLitterChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Litter Image:</label>
                        <input
                            type="file"
                            name="image"
                            onChange={handleLitterChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Update Litter
                        </button>
                        <button
                            type="button"
                            onClick={handleLitterDelete}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        >
                            Delete Litter
                        </button>
                    </div>
                </form>
            </div>

            {/* Puppies Section */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-bold mb-4">
                    {selectedPuppy ? 'Update Puppy' : 'Add New Puppy'}
                </h2>
                <form onSubmit={selectedPuppy ? handlePuppyUpdate : handleAddPuppy} className="space-y-4">
                    <div>
                        <label className="block mb-1">Name:</label>
                        <input
                            type="text"
                            name="name"
                            value={puppyForm.name}
                            onChange={handlePuppyChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Color:</label>
                        <input
                            type="text"
                            name="color"
                            value={puppyForm.color}
                            onChange={handlePuppyChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Gender:</label>
                        <select
                            name="gender"
                            value={puppyForm.gender}
                            onChange={handlePuppyChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1">Status:</label>
                        <select
                            name="status"
                            value={puppyForm.status}
                            onChange={handlePuppyChange}
                            className="w-full p-2 border rounded"
                        >
                            <option value="Available">Available</option>
                            <option value="Reserved">Reserved</option>
                            <option value="Sold">Sold</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1">Puppy Image:</label>
                        <input
                            type="file"
                            name="image"
                            onChange={handlePuppyChange}
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="flex space-x-4">
                        <button
                            type="submit"
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            {selectedPuppy ? 'Update Puppy' : 'Add Puppy'}
                        </button>
                        {selectedPuppy && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedPuppy(null);
                                    setPuppyForm({
                                        name: '',
                                        color: '',
                                        gender: 'Male',
                                        status: 'Available',
                                        image: null
                                    });
                                }}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>

                {/* Puppies List */}
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Current Puppies</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {litter.puppies.map((puppy) => (
                            <div key={puppy.id} className="border p-4 rounded">
                                <img
                                    src={puppy.image}
                                    alt={puppy.name}
                                    className="w-full h-48 object-cover rounded mb-2"
                                />
                                <h4 className="font-bold">{puppy.name}</h4>
                                <p>Color: {puppy.color}</p>
                                <p>Gender: {puppy.gender}</p>
                                <p>Status: {puppy.status}</p>
                                <div className="mt-2 flex space-x-2">
                                    <button
                                        onClick={() => selectPuppyForEdit(puppy)}
                                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handlePuppyDelete(puppy.id)}
                                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
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
    );
};

export default LitterUpdate;
