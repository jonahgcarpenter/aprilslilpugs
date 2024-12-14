import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

interface Breeder {
  id: number;
  firstName: string;
  lastName: string;
}

interface Grumble {
  id: number;
  name: string;
  gender: 'male' | 'female';
}

interface Litter {
  id: number;
  breeder_id: number;
  mom_id: number;
  dad_id: number;
  birth_date: string;
}

interface Puppy {
  id: number;
  litter_id: number;
  breeder_id: number;
  name: string;
  gender: 'male' | 'female';
  color: string;
  status: 'available' | 'reserved';
}

type PuppyColor = 'black' | 'fawn' | 'apricot';

interface PuppyFormData {
  name: string;
  gender: 'male' | 'female';
  color: PuppyColor;
  status: 'available' | 'reserved';
}

interface UserSession {
  id: number;
  email: string;
}

const UpdateLitters: React.FC = () => {
  const [litters, setLitters] = useState<Litter[]>([]);
  const [breeders, setBreeders] = useState<Breeder[]>([]);
  const [grumbles, setGrumbles] = useState<Grumble[]>([]);
  const [puppies, setPuppies] = useState<Puppy[]>([]);
  const [selectedLitter, setSelectedLitter] = useState<Litter | null>(null);
  const [puppyCount, setPuppyCount] = useState<number>(0);
  const [currentPuppyIndex, setCurrentPuppyIndex] = useState<number>(0);
  const [puppyForms, setPuppyForms] = useState<PuppyFormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  const [litterFormData, setLitterFormData] = useState({
    breeder_id: 0,
    mom_id: 0,
    dad_id: 0,
    birth_date: format(new Date(), 'yyyy-MM-dd'),
    puppy_count: 0
  });

  useEffect(() => {
    Promise.all([
      axios.get(`${import.meta.env.VITE_API_URL}/litters`),
      axios.get(`${import.meta.env.VITE_API_URL}/breeders`),
      axios.get(`${import.meta.env.VITE_API_URL}/grumbles`),
      axios.get(`${import.meta.env.VITE_API_URL}/puppies`),
      axios.get(`${import.meta.env.VITE_API_URL}/auth/session`)
    ]).then(([littersRes, breedersRes, grumblesRes, puppiesRes, sessionRes]) => {
      // Ensure we're getting arrays from the responses
      setLitters(Array.isArray(littersRes.data) ? littersRes.data : []);
      setBreeders(Array.isArray(breedersRes.data) ? breedersRes.data : []);
      setGrumbles(Array.isArray(grumblesRes.data) ? grumblesRes.data : []);
      setPuppies(Array.isArray(puppiesRes.data) ? puppiesRes.data : []);
      setUserSession(sessionRes.data);
      // Initialize form with logged-in breeder's ID
      setLitterFormData(prev => ({
        ...prev,
        breeder_id: sessionRes.data.id
      }));
      setIsLoading(false);
    }).catch(err => {
      setError("Failed to fetch data");
      console.error("Error fetching data:", err);
      // Initialize with empty arrays on error
      setLitters([]);
      setBreeders([]);
      setGrumbles([]);
      setPuppies([]);
      setIsLoading(false);
    });
  }, []);

  const handleLitterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/litters`, {
        ...litterFormData,
        breeder_id: userSession?.id // Use the session ID
      });
      
      const newLitter = response.data;
      setPuppyCount(litterFormData.puppy_count);
      setSelectedLitter(newLitter);
      setPuppyForms(Array(litterFormData.puppy_count).fill({
        name: '',
        gender: 'male',
        color: '',
        status: 'available'
      }));
      setCurrentPuppyIndex(0);
    } catch (err) {
      setError("Failed to create litter");
    }
  };

  const handlePuppySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLitter) return;

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/puppies`, {
        ...puppyForms[currentPuppyIndex],
        litter_id: selectedLitter.id,
        breeder_id: selectedLitter.breeder_id
      });

      setPuppies([...puppies, response.data]);

      if (currentPuppyIndex < puppyCount - 1) {
        setCurrentPuppyIndex(prev => prev + 1);
      } else {
        // Refresh puppies data after all are added
        const puppiesRes = await axios.get(`${import.meta.env.VITE_API_URL}/puppies`);
        setPuppies(puppiesRes.data);
        setSelectedLitter(null);
        setPuppyCount(0);
        setCurrentPuppyIndex(0);
        setPuppyForms([]);
      }
    } catch (err) {
      setError("Failed to create puppy");
    }
  };

  const handleDeleteLitter = async (litterId: number) => {
    if (!window.confirm("Delete this litter and all associated puppies?")) return;
    
    try {
      // First delete all puppies associated with this litter
      const litterPuppies = puppies.filter(p => p.litter_id === litterId);
      await Promise.all(
        litterPuppies.map(puppy => 
          axios.delete(`${import.meta.env.VITE_API_URL}/puppies/${puppy.id}`)
        )
      );

      // Then delete the litter
      await axios.delete(`${import.meta.env.VITE_API_URL}/litters/${litterId}`);
      
      // Update state
      setLitters(litters.filter(l => l.id !== litterId));
      setPuppies(puppies.filter(p => p.litter_id !== litterId));
    } catch (err) {
      setError("Failed to delete litter");
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {!selectedLitter ? (
        <form onSubmit={handleLitterSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold">Create New Litter</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Mother</label>
              <select
                value={litterFormData.mom_id}
                onChange={e => setLitterFormData({...litterFormData, mom_id: parseInt(e.target.value)})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Mother</option>
                {grumbles.filter(g => g.gender === 'female').map(grumble => (
                  <option key={grumble.id} value={grumble.id}>{grumble.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Father</label>
              <select
                value={litterFormData.dad_id}
                onChange={e => setLitterFormData({...litterFormData, dad_id: parseInt(e.target.value)})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Father</option>
                {grumbles.filter(g => g.gender === 'male').map(grumble => (
                  <option key={grumble.id} value={grumble.id}>{grumble.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Birth Date</label>
              <input
                type="date"
                value={litterFormData.birth_date}
                onChange={e => setLitterFormData({...litterFormData, birth_date: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Number of Puppies</label>
              <input
                type="number"
                min="1"
                value={litterFormData.puppy_count}
                onChange={e => setLitterFormData({...litterFormData, puppy_count: parseInt(e.target.value)})}
                className="w-full p-2 border rounded"
                required
              />
            </div>
          </div>

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Create Litter
          </button>
        </form>
      ) : (
        <form onSubmit={handlePuppySubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold">
            Add Puppy {currentPuppyIndex + 1} of {puppyCount}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Name</label>
              <input
                type="text"
                value={puppyForms[currentPuppyIndex].name}
                onChange={e => {
                  const newForms = [...puppyForms];
                  newForms[currentPuppyIndex] = {...newForms[currentPuppyIndex], name: e.target.value};
                  setPuppyForms(newForms);
                }}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block mb-2">Gender</label>
              <select
                value={puppyForms[currentPuppyIndex].gender}
                onChange={e => {
                  const newForms = [...puppyForms];
                  newForms[currentPuppyIndex] = {...newForms[currentPuppyIndex], gender: e.target.value as 'male' | 'female'};
                  setPuppyForms(newForms);
                }}
                className="w-full p-2 border rounded"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Color</label>
              <select
                value={puppyForms[currentPuppyIndex].color}
                onChange={e => {
                  const newForms = [...puppyForms];
                  newForms[currentPuppyIndex] = {...newForms[currentPuppyIndex], color: e.target.value as PuppyColor};
                  setPuppyForms(newForms);
                }}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select Color</option>
                <option value="black">Black</option>
                <option value="fawn">Fawn</option>
                <option value="apricot">Apricot</option>
              </select>
            </div>

            <div>
              <label className="block mb-2">Status</label>
              <select
                value={puppyForms[currentPuppyIndex].status}
                onChange={e => {
                  const newForms = [...puppyForms];
                  newForms[currentPuppyIndex] = {...newForms[currentPuppyIndex], status: e.target.value as 'available' | 'reserved'};
                  setPuppyForms(newForms);
                }}
                className="w-full p-2 border rounded"
                required
              >
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
          </div>

          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            {currentPuppyIndex < puppyCount - 1 ? 'Next Puppy' : 'Complete Litter'}
          </button>
        </form>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {litters.map(litter => (
          <div key={litter.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">Litter #{litter.id}</h3>
              <button
                onClick={() => handleDeleteLitter(litter.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
            <p>Birth Date: {format(new Date(litter.birth_date), 'MMM dd, yyyy')}</p>
            <p>Mother: {grumbles.find(g => g.id === litter.mom_id)?.name}</p>
            <p>Father: {grumbles.find(g => g.id === litter.dad_id)?.name}</p>
            <p>Breeder: {
              (() => {
                const breeder = breeders.find(b => b.id === litter.breeder_id);
                return breeder ? `${breeder.firstName} ${breeder.lastName}` : 'Unknown';
              })()
            }</p>
            
            <div className="mt-4">
              <h4 className="font-semibold">Puppies:</h4>
              <ul className="mt-2 space-y-2">
                {puppies
                  .filter(p => p.litter_id === litter.id)
                  .map(puppy => (
                    <li key={puppy.id} className="flex justify-between items-center">
                      <span>{puppy.name} - {puppy.gender} - {puppy.color}</span>
                      <span className={`text-sm ${
                        puppy.status === 'available' ? 'text-green-500' : 'text-orange-500'
                      }`}>
                        {puppy.status}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpdateLitters;
