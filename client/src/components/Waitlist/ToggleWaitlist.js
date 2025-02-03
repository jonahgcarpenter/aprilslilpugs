import { useSettings } from '../../context/SettingsContext';
import LoadingAnimation from '../LoadingAnimation';

const ToggleWaitlist = () => {
  const { waitlistEnabled, toggleWaitlist, isLoading } = useSettings();

  return (
    <button
      onClick={toggleWaitlist}
      disabled={isLoading}
      className={`w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2.5 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-transform duration-200 ${
        isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading ? (
        <LoadingAnimation containerClassName="h-6" />
      ) : (
        waitlistEnabled ? 'Disable Waitlist' : 'Enable Waitlist'
      )}
    </button>
  );
};

export default ToggleWaitlist;
