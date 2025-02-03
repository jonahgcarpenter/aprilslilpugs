import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LitterContext } from '../../context/LitterContext';
import LoadingAnimation from '../LoadingAnimation';
import ErrorModal from '../Modals/ErrorModal';

const LitterManagement = () => {
  const { litters, loading, error } = useContext(LitterContext);
  const [errorModal, setErrorModal] = useState({ show: false, message: '' });
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: '2-digit',
      timeZone: 'UTC'
    });
  };

  const isFutureDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date > today;
  };

  if (loading) return <LoadingAnimation />;

  // Sort litters by birthdate (most recent first)
  const sortedLitters = [...litters].sort((a, b) => 
    new Date(b.birthDate) - new Date(a.birthDate)
  );

  return (
    <div className="mx-0 sm:mx-4">
      <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-slate-800/50 shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            Litter Management
          </h2>
          <button
            onClick={() => navigate('/breeder/litter/create')}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white rounded-lg font-semibold shadow-lg transition-all duration-200"
          >
            Create New Litter
          </button>
        </div>

        <ErrorModal
          isOpen={errorModal.show || !!error}
          onClose={() => setErrorModal({ show: false, message: '' })}
          message={errorModal.message || error}
        />

        {loading && <LoadingAnimation containerClassName="py-10" />}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedLitters.map((litter) => (
            <div key={litter._id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-white">{litter.name}</h3>
                  <p className="text-slate-400">Parents: {litter.mother} & {litter.father}</p>
                  <p className="text-slate-400">
                    {isFutureDate(litter.birthDate) ? 'Expected by: ' : 'Born on: '}
                    {formatDate(litter.birthDate)}
                  </p>
                  <p className="text-slate-400">Available: {formatDate(litter.availableDate)}</p>
                </div>
                <button
                  onClick={() => navigate(`/breeder/litter/update/${litter._id}`)}
                  className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  Edit
                </button>
              </div>

              {litter.profilePicture && (
                <img
                  src={`/api/images/uploads/litter-images/${litter.profilePicture}`}
                  alt={`Litter ${litter.litterName}`}
                  className="w-full h-48 object-cover rounded-lg border border-slate-700/50 mb-4"
                />
              )}

              <div>
                <h4 className="font-semibold text-slate-300 mb-3">Puppies ({litter.puppies?.length || 0})</h4>
                <div className="grid grid-cols-2 gap-2">
                  {litter.puppies?.map((puppy, index) => (
                    <div key={index} className="text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full ${
                        puppy.status === 'available' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                        puppy.status === 'reserved' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {puppy.name} - {puppy.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {litters.length === 0 && !loading && (
          <div className="text-center py-10">
            <p className="text-slate-400">No litters found. Create your first litter!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LitterManagement;