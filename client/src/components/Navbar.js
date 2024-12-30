import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginButton from './LoginButton'
import LogoutButton from './LogoutButton'

const Navbar = () => {
  const { user } = useAuth();

  return (
    <div className="bg-slate-900 border-b border-slate-800">
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="flex flex-col items-center">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-4xl font-extrabold text-center tracking-wider">
            April's Lil Pugs
          </h1>
          <div className="flex justify-center space-x-4 mt-4">
            <Link to="/">
              <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                Home
              </button>
            </Link>
            <Link to="/puppies">
              <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                Puppies
              </button>
            </Link>
            {user && (
              <Link to="/breeder-dashboard">
                <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                  Admin
                </button>
              </Link>
            )}
            {user ? <LogoutButton /> : <LoginButton />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navbar