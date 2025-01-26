import { useLive } from '../context/LiveContext';
import { LitterContext } from '../context/LitterContext';
import { Link } from 'react-router-dom';

// COMPONENTS
import BreederUpdateForm from '../components/BreederUpdateForm';

const BreederDashboard = () => {
  const { isLive, toggleLive } = useLive();
  const { litters, loading, error } = useContext(LitterContext);

  return (
    <div className="space-y-6 py-8">
      <div className="flex justify-center">
        <button
          onClick={toggleLive}
          className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          {isLive ? '?? Disable Live Page' : '?? Enable Live Page'}
        </button>
      </div>
      <div className="grid gap-8">
        <BreederUpdateForm />
        
        {/* Litter Management Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Litter Management</h2>
            <Link 
              to="/breeder-dashboard/litters/new" 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Create New Litter
            </Link>
          </div>

          {/* Litters List */}
          {loading ? (
            <div>Loading litters...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="grid gap-4">
              {litters.map(litter => (
                <div 
                  key={litter._id} 
                  className="flex items-center justify-between p-4 border rounded hover:bg-gray-50"
                >
                  <div>
                    <h4 className="font-semibold">{litter.name}</h4>
                    <p className="text-sm text-gray-600">
                      Born: {new Date(litter.birthDate).toLocaleDateString()}
                      {'  '}
                      Puppies: {litter.puppies.length}
                    </p>
                  </div>
                  <Link
                    to={`/breeder-dashboard/litters/${litter._id}`}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
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
