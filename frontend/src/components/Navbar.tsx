import React from "react";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-slate-900 p-6 grid grid-cols-3 items-center shadow-lg border-b border-slate-800 mb-8">
      <div>
        <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
          Login
        </button>
      </div>
      <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-3xl font-extrabold text-center tracking-wider">
        April's Lil Pugs
      </h1>
      <div className="flex justify-end space-x-4">
        <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
          Contact Me
        </button>
        <button className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
        Join Waitlist
        </button>
      </div>
    </nav>
  );
};

export default Navbar;