import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSettings } from "../../hooks/useSettings";
import { isAuthenticated } from "../../utils/Auth";
import { adminLogin, adminLogout } from "../../hooks/useAuth";

const Navbar = () => {
  const { settings } = useSettings();
  const liveEnabled = settings?.liveEnabled;
  const location = useLocation();
  const [auth, setAuth] = useState(isAuthenticated());
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    setErrorMessage("");

    const result = await adminLogout();
    if (result.success) {
      setAuth(false);
      navigate("/");
    } else {
      setErrorMessage(result.message);
    }
  };

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={() =>
          setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 200)
        }
      >
        <button
          className={`bg-gradient-to-r ${
            isActive
              ? "from-slate-600 to-slate-400 hover:from-slate-700 hover:to-slate-500"
              : "from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
          } text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap`}
        >
          {children}
        </button>
      </Link>
    );
  };

  const AuthButton = ({ onClick, label, isLogout }) => {
    return (
      <button
        onClick={onClick}
        className={`bg-gradient-to-r ${
          isLogout
            ? "from-red-600 to-red-400 hover:from-red-700 hover:to-red-500"
            : "from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500"
        } text-white px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="flex flex-col items-center">
          <Link
            to="/"
            onClick={() =>
              setTimeout(
                () => window.scrollTo({ top: 0, behavior: "smooth" }),
                200,
              )
            }
          >
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-3xl sm:text-4xl font-extrabold text-center tracking-wider px-4">
              April's Lil Pugs
            </h1>
          </Link>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="text-red-500 text-sm font-semibold mt-2">
              {errorMessage}
            </div>
          )}

          {/* Mobile Navigation */}
          <div className="sm:hidden w-full mt-4 relative">
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900/95 to-transparent pointer-events-none z-10" />
            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/95 to-transparent pointer-events-none z-10" />

            {/* Scrollable Navigation */}
            <div className="overflow-x-auto scrollbar-none">
              <div className="flex gap-2 px-8 pb-2 w-max">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/ouradults">Our Adults</NavLink>
                <NavLink to="/nursery">Nursery</NavLink>

                {/* Conditionally render the Live link */}
                {liveEnabled && (
                  <NavLink to="/live">
                    <div className="flex items-center gap-2">
                      <span>Live Puppy Cam</span>
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    </div>
                  </NavLink>
                )}

                <NavLink to="/past-litters">Past Litters</NavLink>
                <NavLink to="/gallery">Gallery</NavLink>

                {/* Admin Link (Only if Authenticated) */}
                {auth && <NavLink to="/admin">Admin</NavLink>}

                {/* Login / Logout Button */}
                {auth ? (
                  <AuthButton onClick={handleLogout} label="Logout" isLogout />
                ) : (
                  <AuthButton
                    onClick={() => setShowModal(true)}
                    label="Login"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex flex-wrap justify-center gap-3 mt-4 px-4">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/ouradults">Our Adults</NavLink>
            <NavLink to="/nursery">Nursery</NavLink>

            {/* Conditionally render the Live link */}
            {liveEnabled && (
              <NavLink to="/live">
                <div className="flex items-center gap-2">
                  <span>Live Puppy Cam</span>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                </div>
              </NavLink>
            )}

            <NavLink to="/past-litters">Past Litters</NavLink>
            <NavLink to="/gallery">Gallery</NavLink>

            {/* Admin Link (Only if Authenticated) */}
            {auth && <NavLink to="/admin">Admin</NavLink>}

            {/* Login / Logout Button */}
            {auth ? (
              <AuthButton onClick={handleLogout} label="Logout" isLogout />
            ) : (
              <AuthButton onClick={() => setShowModal(true)} label="Login" />
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showModal && (
        <LoginModal onClose={() => setShowModal(false)} setAuth={setAuth} />
      )}
    </div>
  );
};

const LoginModal = ({ onClose, setAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(""); // Clear previous errors
    const result = await adminLogin(email, password);
    if (result.success) {
      setAuth(true);
      onClose(); // Close modal
      navigate("/admin");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm flex items-start justify-center p-4 z-[9999]">
      <div className="mt-[15vh] bg-slate-900/90 backdrop-blur-sm rounded-xl p-8 max-w-md w-full border border-white/10">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6 text-center">
          Admin Login
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 bg-slate-800 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            type="password"
            className="w-full px-3 py-2 bg-slate-800 text-white border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-lg hover:from-blue-600 hover:to-blue-500 transition"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};
export default Navbar;
