import { FaGithub, FaFacebook } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-slate-900/95 backdrop-blur-sm border-t border-slate-800/50 mt-4 py-6">
      <div className="container mx-auto px-4 max-w-7xl relative flex flex-col items-center justify-center">
        <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center">
          &copy; {new Date().getFullYear()} April's Lil Pugs. All rights
          reserved.
        </p>

        <div className="flex gap-4 items-center mt-4 md:mt-0 md:absolute md:right-4">
          <a
            href="https://github.com/jonahgcarpenter"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaGithub size={24} />
          </a>

          <a
            href="https://www.facebook.com/AprilsLilPugs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-400 transition-colors"
          >
            <FaFacebook size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}
