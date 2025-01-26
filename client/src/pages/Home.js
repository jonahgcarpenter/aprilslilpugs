// Import Components
import BreederDetails from '../components/BreederDetails';
import UnderConstruction from '../components/UnderConstruction';

/**
 * Home Page Component
 * Landing page displaying breeder information and construction status
 */
const Home = () => {
  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {/* Under Construction Notice */}
        <div className="max-w-4xl mx-auto transform hover:scale-[1.01] transition-all duration-300">
          <UnderConstruction />
        </div>
        {/* Main Content */}
        <BreederDetails />
      </div>
    </div>
  )
}

export default Home;
