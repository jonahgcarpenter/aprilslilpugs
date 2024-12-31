// COMPONENTS
import UnderConstruction from '../components/UnderConstruction';
import PuppyList from '../components/PuppyList';

const Puppies = () => {
  return (
    <div className="space-y-6 py-8">
      <div className="max-w-4xl mx-auto">
        <UnderConstruction />
      </div>
      <div className="grid gap-8">
        <PuppyList />
      </div>
    </div>
  )
}

export default Puppies;