import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useLive } from '../context/LiveContext';
import { LitterContext } from '../context/LitterContext';
import BreederUpdateForm from '../components/BreederUpdateForm';
import GrumbleUpdate from '../components/GrumbleUpdate';

/**
 * Breeder Dashboard Component
 * Central management interface for breeder operations
 */
const BreederDashboard = () => {
  // Context and State Management
  const { isLive, toggleLive } = useLive();
  const { litters, loading, error } = useContext(LitterContext);

  return (
    <div className="mx-2 sm:mx-4 space-y-6 py-8">
      {/* Live Stream Toggle */}
      <div className="flex justify-center">
        <button
          onClick={toggleLive}
          className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2 text-xs sm:text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-200"
        >
          {isLive ? 'Disable Live Page' : 'Enable Live Page'}
        </button>
      </div>

      <div className="grid gap-8">
        {/* Breeder Information Update Section */}
        <BreederUpdateForm />

        {/* Grumble Management Section */}
        <GrumbleUpdate />

        {/* Litter Management Section */}
        <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
              Litter Management
            </h2>
            <Link 
              to="/breeder-dashboard/litters/new" 
              className="bg-green-500 text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded hover:bg-green-600 transition-colors"
            >
              Create New Litter
            </Link>
          </div>

          {/* Litters List Section */}
          {loading ? (
            <div className="text-gray-500">Loading litters...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            // Litter Items
            <div className="grid gap-4">
              {litters.map(litter => (
                <div 
                  key={litter._id} 
                  className="flex items-center justify-between p-4 border rounded-lg bg-slate-800 border-slate-700 hover:bg-slate-700 transition-all duration-200"
                >
                  <div>
                    <h4 className="font-semibold text-white">{litter.name}</h4>
                    <p className="text-sm text-gray-400">
                      Born: {new Date(litter.birthDate).toLocaleDateString()}
                      {' '}
                      Puppies: {litter.puppies.length}
                    </p>
                  </div>
                  <Link
                    to={`/breeder-dashboard/litters/${litter._id}`}
                    className="bg-blue-500 text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded hover:bg-blue-600 transition-all duration-200"
                  >
                    Manage Litter
                  </Link>
                </div>
              ))}
              {litters.length === 0 && (
                <p className="text-gray-500 text-center py-4">No litters found. Create your first litter!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BreederDashboard;
