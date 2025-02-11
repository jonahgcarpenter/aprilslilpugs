import { FaPaw } from "react-icons/fa";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex items-start justify-center min-h-screen pt-16">
      <div className="relative sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-12 sm:p-16 border border-slate-800/50 shadow-xl max-w-4xl text-center">
        {/* Dog Paw Icon */}
        <div className="relative w-36 h-36 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <FaPaw className="text-white text-8xl" />
          <div className="absolute inset-0 blur-xl opacity-20 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full"></div>
        </div>

        {/* Title & Description */}
        <h1 className="mt-8 text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
          404 - Page Not Found!
        </h1>
        <p className="mt-6 text-xl text-white/80">
          Oops! It looks like this page has run off chasing squirrels.
        </p>

        {/* Navigation Button */}
        <Link
          to="/"
          className="mt-10 inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-2xl transform hover:scale-110 transition-transform shadow-xl border border-white/10 hover:border-white/20"
        >
          Bring Me Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
