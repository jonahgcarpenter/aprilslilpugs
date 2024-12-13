import React from "react";
import { Link } from "react-router-dom";
import PageNav from "./PageNav";

const Header: React.FC = () => {
  return (
    <div className="bg-slate-900 p-6 flex flex-col items-center shadow-lg border-b border-slate-800 mb-8">
      <Link to="/">
        <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-3xl font-extrabold text-center tracking-wider">
          April's Lil Pugs
        </h1>
      </Link>
      <PageNav />
    </div>
  );
};

export default Header;