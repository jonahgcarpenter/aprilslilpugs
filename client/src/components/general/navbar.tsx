import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { useSettings } from "../../hooks/usesettings";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();

  const linkStyles = (isActive: boolean) =>
    `px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap text-white ${
      isActive
        ? "bg-gradient-to-r from-slate-600 to-slate-400 hover:from-slate-700 hover:to-slate-500 scale-105"
        : "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 hover:-translate-y-0.5"
    }`;

  const logoutStyles =
    "cursor-pointer px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap text-white bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 hover:-translate-y-0.5";

  const NavLinks = () => (
    <>
      <NavLink to="/" className={({ isActive }) => linkStyles(isActive)}>
        Home
      </NavLink>

      <NavLink
        to="/ouradults"
        className={({ isActive }) => linkStyles(isActive)}
      >
        Our Adults
      </NavLink>

      <NavLink to="/nursery" className={({ isActive }) => linkStyles(isActive)}>
        Nursery
      </NavLink>

      {settings?.stream_enabled && (
        <NavLink to="/live" className={({ isActive }) => linkStyles(isActive)}>
          <div className="flex items-center gap-2">
            Live Puppy Cam
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
        </NavLink>
      )}

      <NavLink
        to="/pastlitters"
        className={({ isActive }) => linkStyles(isActive)}
      >
        Past Litters
      </NavLink>

      <NavLink to="/gallery" className={({ isActive }) => linkStyles(isActive)}>
        Gallery
      </NavLink>

      <NavLink to="/admin" className={({ isActive }) => linkStyles(isActive)}>
        Admin
      </NavLink>

      {user && (
        <button onClick={logout} className={logoutStyles}>
          Logout
        </button>
      )}
    </>
  );

  return (
    <nav className="w-full mt-4">
      {/* Mobile Navigation */}
      <div className="sm:hidden w-full relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-900/95 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-900/95 to-transparent pointer-events-none z-10" />
        {/* BUG: Hide horizontal scrollbar */}
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex gap-2 px-8 pb-2 w-max">
            <NavLinks />
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden sm:flex flex-wrap justify-center gap-3 px-4">
        <NavLinks />
      </div>
    </nav>
  );
}
