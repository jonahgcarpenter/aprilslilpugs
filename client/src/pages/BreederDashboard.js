import { useContext } from 'react';
import { Link } from 'react-router-dom';

// CONTEXT
import { LitterContext } from '../context/LitterContext';

// COMPONENTS
import BreederUpdateForm from '../components/Breeder/BreederUpdateForm';
import GrumbleUpdate from '../components/Grumble/GrumbleUpdate';
import WaitlistAdmin from '../components/Waitlist/WaitlistAdmin';
import LoadingAnimation from '../components/LoadingAnimation';
import ToggleStream from '../components/LiveStream/ToggleStream';
import ToggleWaitlist from '../components/Waitlist/ToggleWaitlist';

const BreederDashboard = () => {
  const { litters, loading: littersLoading, error: littersError } = useContext(LitterContext);

  const isDateInFuture = (dateString) => {
    try {
      const inputDate = new Date(dateString);
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
      inputDate.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      return inputDate > now;
    } catch (error) {
      console.error('Error comparing dates:', error);
      return false;
    }
  };

  if (littersLoading) return <LoadingAnimation />;

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6 py-4 sm:py-8">
      <div className="flex justify-center gap-4">
        <ToggleStream />
        <ToggleWaitlist />
      </div>

      <div className="grid gap-4 sm:gap-8">
        <WaitlistAdmin />
        <BreederUpdateForm />
        <GrumbleUpdate />
        <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
              Litter Management
            </h2>
            <Link 
              to="/breeder-dashboard/litters/new" 
              className="w-full sm:w-auto text-center bg-green-500 text-white px-4 py-2 text-sm rounded hover:bg-green-600 transition-colors"
            >
              Create New Litter
            </Link>
          </div>

          {littersLoading ? (
            <div className="text-gray-500">Loading litters...</div>
          ) : littersError ? (
            <div className="text-red-500">{littersError}</div>
          ) : (
            <div className="grid gap-3">
              {litters.map(litter => (
                <div 
                  key={litter._id} 
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-slate-800 border-slate-700 hover:bg-slate-700 transition-all duration-200 gap-4"
                >
                  <div>
                    <h4 className="font-semibold text-white mb-1">{litter.name}</h4>
                    <p className="text-sm text-gray-400">
                      {isDateInFuture(litter.birthDate) ? 'Expected on:' : 'Born on:'} {new Date(litter.birthDate).toLocaleDateString()}
                      <br className="sm:hidden" />
                      <span className="hidden sm:inline"> · </span>
                      Puppies: {litter.puppies.length}
                    </p>
                  </div>
                  <Link
                    to={`/breeder-dashboard/litters/${litter._id}`}
                    className="w-full sm:w-auto text-center bg-blue-500 text-white px-4 py-2 text-sm rounded hover:bg-blue-600 transition-all duration-200"
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
