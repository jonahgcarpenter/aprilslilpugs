// components
import BreederDetails from '../components/BreederDetails';
import BreederUpdateForm from '../components/BreederUpdateForm';
import UnderConstruction from '../components/UnderConstruction';

const Home = () => {
  return (
    <div className="bg-fixed bg-cover bg-center min-h-screen">
      <UnderConstruction />
      <BreederDetails />
      <BreederUpdateForm />
    </div>
  )
}

export default Home;