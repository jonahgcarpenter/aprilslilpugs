import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./navbar";

export default function Header() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800/50 sticky top-0 z-50 mb-4">
      <div className="container mx-auto px-4 max-w-7xl py-6">
        <div className="flex flex-col items-center">
          <a href="/" className="group">
            <h1 className="flex items-center justify-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-3xl sm:text-4xl font-extrabold text-center tracking-wider px-4 transition-transform duration-300">
              April's Lil Pugs
              <img
                src="/logo.jpg"
                alt="April's Lil Pugs Logo"
                className="w-9 h-9 ml-8 transform rotate-[-10deg]"
              />
            </h1>
          </a>

          <Navbar />
        </div>
      </div>
    </header>
  );
}
