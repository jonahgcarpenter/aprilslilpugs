import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl py-6 flex flex-col items-center">
        {/* Title and Icon */}
        <h1 className="flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-3xl sm:text-4xl font-extrabold text-center tracking-wider px-4">
          April's Lil Pugs
          <img
            src="/alp.svg"
            alt="Logo"
            className="w-9 h-9 ml-8 transform rotate-[-10deg]"
          />
        </h1>
        {/* Navigation Links */}
        <div className="w-full overflow-x-auto scrollbar-none">
          <div className="flex gap-3 mt-4 min-w-max justify-start sm:justify-center">
            <Link
              to="/"
              className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Home
            </Link>
            <Link
              to="/our-adults"
              className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Our Adults
            </Link>
            <Link
              to="/nursery"
              className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Nursery
            </Link>
            <Link
              to="/live"
              className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              <div className="flex items-center gap-2">
                <span>Live Puppy Cam</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>
            </Link>
            <Link
              to="/past-litters"
              className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Past Litters
            </Link>
            <Link
              to="/gallery"
              className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              Gallery
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
