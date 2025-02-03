// COMPONENTS
import UnderConstruction from '../components/UnderConstruction';

const Gallery = () => {
  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <div className="max-w-4xl mx-auto transform hover:scale-[1.01] transition-all duration-300">
          <UnderConstruction />
        </div>
        <h1> Gallery </h1>
      </div>
    </div>
  )
}

export default Gallery;
