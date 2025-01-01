import { useEffect, useState, useRef } from 'react';
import { useDogContext } from '../hooks/useDogContext';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  const ageInYears = (today - birth) / (365.25 * 24 * 60 * 60 * 1000);
  
  if (ageInYears < 1) {
    const months = Math.floor(ageInYears * 12);
    return `${months} month${months !== 1 ? 's' : ''} old`;
  }
  
  const years = Math.floor(ageInYears);
  return `${years} year${years !== 1 ? 's' : ''} old`;
};

const DogList = () => {
  const { grownDogs: dogs, dispatch } = useDogContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [width, setWidth] = useState(0);
  const carousel = useRef();
  const mouseX = useMotionValue(0);
  const containerRef = useRef();
  const [visibleItems, setVisibleItems] = useState(3);
  const CARD_WIDTH = 300; // Fixed card width
  const CARD_GAP = 32; // Matches space-x-8

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const response = await fetch('/api/dogs/grown');
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

  useEffect(() => {
    const updateVisibleItems = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const itemsPerView = Math.floor(containerWidth / (CARD_WIDTH + CARD_GAP));
        setVisibleItems(Math.max(1, itemsPerView));
      }
    };

    updateVisibleItems();
    window.addEventListener('resize', updateVisibleItems);
    return () => window.removeEventListener('resize', updateVisibleItems);
  }, []);

  useEffect(() => {
    if (carousel.current && dogs) {
      const totalWidth = dogs.length * (CARD_WIDTH + CARD_GAP) - CARD_GAP;
      const containerWidth = carousel.current.offsetWidth;
      setWidth(Math.max(0, totalWidth - containerWidth));
    }
  }, [dogs, visibleItems]);

  // Add this function to handle container classes
  const getContainerClasses = () => {
    if (!dogs || dogs.length <= visibleItems) {
      return 'flex justify-center space-x-8';
    }
    return 'flex space-x-8';
  };

  const x = useSpring(useMotionValue(0), {
    stiffness: 100,
    damping: 30
  });

  const handleMouseMove = (event) => {
    if (width <= 0) return; // Don't move if all cards fit
    const mouseXPosition = event.clientX;
    const carouselWidth = carousel.current.offsetWidth;
    const percentage = mouseXPosition / carouselWidth;
    const newX = percentage * -width;
    x.set(Math.max(Math.min(newX, 0), -width));
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      scale: 1.05,
      rotateY: 10,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    }
  };

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
      className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl overflow-hidden"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8 sm:mb-10 text-center">
        Our Family
      </h2>
      
      <motion.div 
        ref={carousel}
        className={`cursor-${width > 0 ? 'grab' : 'default'}`}
        onMouseMove={width > 0 ? handleMouseMove : undefined}
        whileTap={width > 0 ? { cursor: "grabbing" } : undefined}
      >
        <motion.div 
          className={getContainerClasses()}
          style={{ x: width > 0 ? x : 0 }}
          drag={width > 0 ? "x" : false}
          dragConstraints={{ right: 0, left: -width }}
          dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
        >
          {dogs && dogs.map((dog, index) => (
            <motion.div 
              key={dog._id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap={{ scale: 0.98 }}
              custom={index}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 transform border border-white/10 hover:border-white/20 shadow-lg"
              style={{
                width: CARD_WIDTH,
                flexShrink: 0,
                flexGrow: 0
              }}
            >
              {dog.profilePicture && (
                <div className="overflow-hidden rounded-lg mb-4">
                  <motion.img 
                    src={`/api/images/uploads/profile-pictures/${dog.profilePicture}`}
                    alt={dog.name}
                    className="w-full aspect-square object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
              <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/90 mb-3">{dog.name}</h3>
              <div className="space-y-2 text-white/80">
                <p className="flex items-center gap-2">
                  <span className="text-blue-400">Color:</span> {dog.color}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-400">Gender:</span> {dog.gender}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-blue-400">Age:</span> {calculateAge(dog.birthDate)}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default DogList;
