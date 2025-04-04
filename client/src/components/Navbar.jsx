import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/our-adults", label: "Our Adults" },
    { to: "/nursery", label: "Nursery" },
    {
      to: "/live",
      label: (
        <div className="flex items-center gap-2">
          <span>Live Puppy Cam</span>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </div>
      ),
    },
    { to: "/past-litters", label: "Past Litters" },
    { to: "/gallery", label: "Gallery" },
  ];

  const baseClass =
    "px-4 sm:px-6 py-2 text-sm rounded-full font-semibold shadow-md transition-all duration-200 whitespace-nowrap";

  const activeClass = "bg-slate-500 text-white shadow-lg";

  const inactiveClass =
    "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white hover:shadow-lg";

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl py-6 flex flex-col items-center">
        <h1 className="flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-3xl sm:text-4xl font-extrabold text-center tracking-wider px-4">
          April's Lil Pugs
          <img
            src="/pug.png"
            alt="Pug wearing headphones"
            className="w-15 h-15"
          />
        </h1>
        <div className="w-full overflow-x-auto scrollbar-none">
          <div className="flex gap-3 mt-4 min-w-max justify-start sm:justify-center">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`${baseClass} ${
                  currentPath === to ? activeClass : inactiveClass
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
