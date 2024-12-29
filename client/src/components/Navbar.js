import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className="bg-slate-900 p-6 flex flex-col items-center shadow-lg border-b border-slate-800 mb-8">
      <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-3xl font-extrabold text-center tracking-wider">
        April's Lil Pugs
      </h1>
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
      </div>
    </div>
  )
}

export default Navbar