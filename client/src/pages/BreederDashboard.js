// COMPONENTS
import BreederUpdateForm from '../components/Breeder/BreederUpdateForm';
import GrumbleUpdate from '../components/Grumble/GrumbleUpdate';
import WaitlistAdmin from '../components/Waitlist/WaitlistAdmin';
import ToggleStream from '../components/LiveStream/ToggleStream';
import ToggleWaitlist from '../components/Waitlist/ToggleWaitlist';
import LitterManagement from '../components/Litter/LitterManagement';

const BreederDashboard = () => {

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
      <div className="flex justify-center gap-4">
        <ToggleStream />
        <ToggleWaitlist />
      </div>
        <WaitlistAdmin />
        <BreederUpdateForm />
        <GrumbleUpdate />
        <LitterManagement />
      </div>
    </div>
  )
};

export default BreederDashboard;
