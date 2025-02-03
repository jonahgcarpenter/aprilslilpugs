import { Link } from 'react-router-dom'

// CONTEXT
import { useAuth } from '../context/AuthContext'
import { useSettings } from '../context/SettingsContext'

// COMPONENTS
import LoginButton from './Auth/LoginButton'
import LogoutButton from './Auth/LogoutButton'

const Navbar = () => {
  const { user } = useAuth();
  const { liveEnabled } = useSettings();

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="flex flex-col items-center">
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-3xl sm:text-4xl font-extrabold text-center tracking-wider px-4 hover:scale-105 transition-transform duration-300">
            April's Lil Pugs
          </h1>
          <div className="flex flex-wrap justify-center gap-3 mt-4 px-4">
            <Link to="/">
              <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                Home
              </button>
            </Link>
            <Link to="/ouradults">
                <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    Our Adults
                </button>
            </Link>
            <Link to="/nursery">
                <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    Nursery
                </button>
            </Link>
            {liveEnabled && (
              <Link to="/live">
                <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2">
                  <span>Live Puppy Cam</span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                </button>
              </Link>
            )}
            <Link to="/past-litters">
                <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    Past Litters
                </button>
            </Link>
            <Link to="/gallery">
                <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                    Gallery
                </button>
            </Link>
            {user && (
              <Link to="/breeder-dashboard">
                <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
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
