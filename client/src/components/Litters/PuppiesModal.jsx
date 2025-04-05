const PuppiesModal = ({ selectedLitter, onClose }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-[10000] bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl max-w-7xl mx-4 max-h-[90vh] overflow-y-auto scrollbar-none">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            {selectedLitter.name}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close litter details"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {selectedLitter.puppies.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-blue-500/10 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-slate-100 mb-4">
              Puppies Coming Soon!
            </h4>
            <p className="text-slate-300 max-w-md">
              We're excited to announce that puppies will be arriving soon for
              this litter. Check back later for updates and photos of the new
              arrivals!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {selectedLitter.puppies.map((puppy) => (
              <div
                key={puppy.id}
                className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50"
              >
                <div className="aspect-square w-full overflow-hidden">
                  <img
                    src={puppy.profilePicture}
                    alt={puppy.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <h4 className="text-2xl font-semibold text-slate-100">
                    {puppy.name}
                  </h4>
                  <div className="space-y-2 text-slate-300">
                    <p>Color: {puppy.color}</p>
                    <p>Gender: {puppy.gender}</p>
                    <p
                      className={`inline-block px-3 py-1 rounded-full text-sm ${
                        puppy.status === "Available"
                          ? "bg-green-500/20 text-green-400"
                          : puppy.status === "Reserved"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {puppy.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PuppiesModal;
