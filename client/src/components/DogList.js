import { useEffect, useState } from 'react';
import { useDogContext } from '../hooks/useDogContext';

const DogList = () => {
  const { grownDogs: dogs, dispatch } = useDogContext();  // Changed from dogs to grownDogs
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath; // Backend already provides full URLs
  };

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const response = await fetch('/api/dogs/grown'); // Match the existing endpoint
        const json = await response.json();

        if (response.ok) {
          dispatch({ type: 'SET_GROWN_DOGS', payload: json });
        } else {
          setError(json.error);
        }
      } catch (err) {
        setError('Failed to fetch dogs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDogs();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <p className="text-white text-center">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
        Adult Dogs
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dogs && dogs.map(dog => (
          <div key={dog._id} className="bg-slate-800/50 rounded-xl p-4">
            {dog.images && dog.images.length > 0 && (
              <img 
                src={getImageUrl(dog.images.find(img => img.isProfile)?.url || dog.images[0].url)}
                alt={dog.name}
                className="w-full aspect-square object-cover rounded-lg mb-4"
              />
            )}
            
            <h3 className="text-xl font-semibold text-white mb-2">{dog.name}</h3>
            
            <div className="space-y-2 text-white/80">
              <p>Color: {dog.color}</p>
              <p>Gender: {dog.gender}</p>
              <p>Birth Date: {new Date(dog.birthDate).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DogList;
