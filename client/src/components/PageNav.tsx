import { Link } from 'react-router-dom';
import LoginButton from '../auth/LoginButton';

const PageNav: React.FC = () => {
  return (
    <div className="flex justify-center space-x-4 mt-4">
      <Link to="/">
        <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 py-1.5 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
          Home
        </button>
      </Link>
      <Link to="/puppies">
        <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 py-1.5 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
          Puppies
        </button>
      </Link>
      <LoginButton />
    </div>
  );
};

export default PageNav;
