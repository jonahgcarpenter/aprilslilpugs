import { Link, useLocation } from "react-router-dom";

// CONTEXT
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

// COMPONENTS
import LoginButton from "./Auth/LoginButton";
import LogoutButton from "./Auth/LogoutButton";

const Navbar = () => {
  const { user } = useAuth();
  const { liveEnabled } = useSettings();
  const location = useLocation();

  const handleTitleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    const mobileNav = document.querySelector(".overflow-x-auto");
    if (mobileNav) {
      mobileNav.scrollTo({ left: 0, behavior: "smooth" });
    }
  };

  const handleNavClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} onClick={handleNavClick}>
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

  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="flex flex-col items-center">
          <Link
            to="/"
            className="hover:opacity-80 transition-opacity duration-200"
            onClick={handleTitleClick}
          >
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-3xl sm:text-4xl font-extrabold text-center tracking-wider px-4 hover:scale-105 transition-transform duration-200">
              April's Lil Pugs
            </h1>
          </Link>

          {/* Mobile Navigation */}
          <div className="sm:hidden w-full mt-4 relative">
            {/* Left fade */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900/95 to-transparent pointer-events-none z-10" />
            {/* Right fade */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/95 to-transparent pointer-events-none z-10" />

            <div className="overflow-x-auto scrollbar-none">
              <div className="flex gap-2 px-8 pb-2 w-max">
                {" "}
                <NavLink to="/">Home</NavLink>
                <NavLink to="/ouradults">Our Adults</NavLink>
                <NavLink to="/nursery">Nursery</NavLink>
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
                {user && <NavLink to="/breeder-dashboard">Admin</NavLink>}
                {user ? <LogoutButton /> : <LoginButton />}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex flex-wrap justify-center gap-3 mt-4 px-4">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/ouradults">Our Adults</NavLink>
            <NavLink to="/nursery">Nursery</NavLink>
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
            {user && <NavLink to="/breeder-dashboard">Admin</NavLink>}
            {user ? <LogoutButton /> : <LoginButton />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Navbar;
