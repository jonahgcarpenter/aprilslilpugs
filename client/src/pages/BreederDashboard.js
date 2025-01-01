// COMPONENTS
import BreederUpdateForm from '../components/BreederUpdateForm';
import DogCreateForm from '../components/DogCreateForm';
import DogUpdate from '../components/DogUpdate';
import PuppyCreateForm from '../components/PuppyCreateForm';
import PuppyUpdate from '../components/PuppyUpdate';

const BreederDashboard = () => {
  return (
    <div className="space-y-6 py-8">
      <div className="grid gap-8">
        <BreederUpdateForm />
        <DogCreateForm />
        <DogUpdate />
        <PuppyCreateForm />
        <PuppyUpdate />
      </div>
    </div>
  );
};

export default BreederDashboard;