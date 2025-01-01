import { useEffect, useState, useRef } from 'react';
import { useDogContext } from '../hooks/useDogContext';
import { motion } from 'framer-motion';

const PuppyList = () => {
  // Add age calculation function at the top of the component
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const monthsDiff = (today.getFullYear() - birth.getFullYear()) * 12 + 
                      (today.getMonth() - birth.getMonth());
    
    // If older than or equal to 12 months, show in years
    if (monthsDiff >= 12) {
      const years = Math.floor(monthsDiff / 12);
      return `${years} year${years !== 1 ? 's' : ''} old`;
    }
    
    // Otherwise show in months
    return `${monthsDiff} month${monthsDiff !== 1 ? 's' : ''} old`;
  };

  const { puppies, dispatch } = useDogContext(); // Update context usage
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef();

  useEffect(() => {
    const fetchPuppies = async () => {
      try {
        const response = await fetch('/api/dogs/puppies');
        const json = await response.json();

        if (response.ok) {
          dispatch({ type: 'SET_PUPPIES', payload: json });
        } else {
          setError(json.error);
        }
      } catch (err) {
        setError('Failed to fetch puppies');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPuppies();
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
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
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8 sm:mb-10 text-center">
        All Puppies
      </h2>

      <motion.div 
        className="overflow-x-auto overflow-y-hidden px-4 pb-4 -mx-4 sm:mx-0"
        style={{ 
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'x mandatory',
          msOverflowStyle: 'none'
        }}
      >
        <motion.div 
          className="flex space-x-4 sm:space-x-8 px-4"
        >
          {puppies?.map((puppy) => (
            <motion.div
              key={puppy._id}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
              style={{
                width: 280,
                scrollSnapAlign: 'start',
                flexShrink: 0,
                flexGrow: 0
              }}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 transform border border-white/10 hover:border-white/20 shadow-lg"
            >
              <div className="text-sm text-white/60 mb-2">
                Parents: {puppy.mother.name} & {puppy.father.name}
              </div>
              {puppy.profilePicture && (
                <div className="overflow-hidden rounded-lg mb-4">
                  <motion.img
                    loading="lazy"
                    src={`/api/images/uploads/profile-pictures/${puppy.profilePicture}`}
                    alt={puppy.name}
                    className="w-full aspect-square object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
              <h4 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/90 mb-3">{puppy.name}</h4>
              <div className="space-y-2 text-white/80">
                <p className="flex items-center gap-2">
                  <span className="text-blue-400">Color:</span> {puppy.color}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-400">Gender:</span> {puppy.gender}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-400">Age:</span> {calculateAge(puppy.birthDate)}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default PuppyList;
