import Stream from "../components/live/stream";

const Live = () => {
  return (
    <div className="space-y-6">
      <Stream />
      <div className="bg-slate-900/80 border border-slate-800/50 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
              Stream Disclaimer
            </h3>
            <p className="mt-1 text-md text-white/90">
              This livestream does not include audio. There may be a latency of
              60-90 seconds depending on your network connection along with an
              included delay.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Live;
