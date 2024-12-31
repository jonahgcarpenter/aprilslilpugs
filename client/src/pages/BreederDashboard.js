// COMPONENTS
import BreederUpdateForm from '../components/BreederUpdateForm';
import DogCreateForm from '../components/DogCreateForm';
import PuppyCreateForm from '../components/PuppyCreateForm';

const BreederDashboard = () => {
  return (
    <div className="space-y-6 py-8">
      <div className="grid gap-8">
        <BreederUpdateForm />
        <DogCreateForm />
        <PuppyCreateForm />
      </div>
    </div>
  );
};

export default BreederDashboard;