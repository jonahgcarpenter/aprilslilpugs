import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaArrowLeft } from "react-icons/fa";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <title>Page Not Found | April's Lil Pugs</title>
      <meta name="robots" content="noindex, nofollow" />

      <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur-sm rounded-2xl p-8 sm:p-12 border border-slate-800/50 shadow-2xl text-center">
        <div className="mb-8 relative select-none">
          <h1 className="text-9xl font-black text-slate-800/50 leading-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
              Ruh-roh!
            </span>
          </div>
        </div>

        {/* Description Text */}
        <h2 className="text-2xl font-bold text-slate-200 mb-4">
          This page seems to have run away
        </h2>

        <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-lg mx-auto">
          We looked everywhere (even under the couch), but we couldn't find the
          page you're looking for. It might have been moved or deleted.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="cursor-pointer px-8 py-3.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <FaArrowLeft />
            Go Back
          </button>

          <Link
            to="/"
            className="px-8 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <FaHome />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
