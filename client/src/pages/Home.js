// components
import BreederDetails from '../components/BreederDetails';
import DogList from '../components/DogList';
import UnderConstruction from '../components/UnderConstruction';

const Home = () => {
  return (
    <div className="space-y-6 py-8">
      <div className="max-w-4xl mx-auto">
        <UnderConstruction />
      </div>
      <div className="grid gap-8">
        <BreederDetails />
        <DogList />
      </div>
    </div>
  )
}

export default Home;