import { useEffect, useState } from 'react';
import { useDogContext } from '../hooks/useDogContext';

const PuppyList = () => {
  const { litters, dispatch } = useDogContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLitters = async () => {
      try {
        const response = await fetch('/api/dogs/puppies/litters');
        const json = await response.json();

        if (response.ok) {
          dispatch({ type: 'SET_LITTERS', payload: json });
        } else {
          setError(json.error);
        }
      } catch (err) {
        setError('Failed to fetch litters');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLitters();
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
        All Litters
      </h2>

      {litters?.map(litter => (
        <div key={`${litter._id.mother}-${litter._id.birthDate}`} className="mb-8 bg-slate-800/50 rounded-xl p-4">
          <h3 className="text-xl font-semibold text-white mb-4">
            {litter.mother.name} x {litter.father.name} - {new Date(litter.birthDate).toLocaleDateString()}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {litter.puppies.map(puppy => (
              <div key={puppy._id} className="bg-slate-700/50 rounded-lg p-4">
                {puppy.images && puppy.images.length > 0 && (
                  <img
                    loading="lazy"
                    src={puppy.images.find(img => img.isProfile)?.url || puppy.images[0].url}
                    alt={puppy.name}
                    className="w-full aspect-square object-cover rounded-lg mb-4"
                  />
                )}
                <h4 className="text-lg font-medium text-white">{puppy.name}</h4>
                <p className="text-white/80">Color: {puppy.color}</p>
                <p className="text-white/80">Gender: {puppy.gender}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PuppyList;
