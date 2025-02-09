import React from "react";
import { Link } from "react-router-dom";

const NoLitters = () => {
  return (
    <div className="space-y-8">
      <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="aspect-square w-full overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                Coming Soon
              </h3>
            </div>
          </div>
          <div className="p-8 flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-6">
              No Active Litters
            </h2>
            <div className="space-y-6 text-lg text-slate-300">
              <p>
                We currently do not have any available puppies. Stay connected
                for updates on upcoming litters!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://www.facebook.com/AprilsLilPugs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600/20 to-blue-500/20 hover:from-blue-600/30 hover:to-blue-500/30 text-blue-400 rounded-xl border border-blue-500/20 hover:border-blue-500/30 transition-all duration-300"
                >
                  <span>Follow on Facebook</span>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.378 14.192 5 15.115 5H18V0h-3.808C10.596 0 9 1.583 9 4.615V8z" />
                  </svg>
                </a>
                <Link
                  to="/past-litters"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-slate-700/30 to-slate-600/30 hover:from-slate-700/40 hover:to-slate-600/40 text-slate-300 rounded-xl border border-slate-600/30 hover:border-slate-600/40 transition-all duration-300"
                >
                  <span>View Past Litters</span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoLitters;
