import type { Puppy } from "../../data/puppies";

interface PuppyListProps {
  puppies: Puppy[];
}

const getStatusColor = (status: Puppy["status"]) => {
  switch (status) {
    case "Available":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "Reserved":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "Sold":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-slate-500/20 text-slate-300 border-slate-500/30";
  }
};

const getGenderBadge = (gender: "Male" | "Female") => {
  if (gender === "Male") {
    return (
      <span
        title="Male"
        className="text-blue-400 bg-blue-400/10 p-2 rounded-lg border border-blue-400/20"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 3h5v5" />
          <path d="m21 3-6.75 6.75" />
          <circle cx="10" cy="14" r="5" />
        </svg>
      </span>
    );
  }

  return (
    <span
      title="Female"
      className="text-pink-400 bg-pink-400/10 p-2 rounded-lg border border-pink-400/20"
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 15v7" />
        <path d="M9 19h6" />
        <circle cx="12" cy="9" r="6" />
      </svg>
    </span>
  );
};

const PuppyList = ({ puppies }: PuppyListProps) => {
  if (!puppies || puppies.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 border-t border-slate-700/50 pt-12">
      <div className="flex items-center gap-3 mb-8">
        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 flex items-center gap-2">
          Meet the Puppies
        </h3>
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-900/30 text-blue-300 border border-blue-500/20">
          {puppies.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {puppies.map((puppy) => (
          <div
            key={puppy.id}
            className="group bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 hover:border-blue-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 flex flex-col"
          >
            {/* Image Container */}
            <div className="aspect-square relative overflow-hidden bg-slate-900">
              <img
                src={puppy.profile_picture}
                alt={puppy.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute top-3 right-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border backdrop-blur-md shadow-sm ${getStatusColor(
                    puppy.status,
                  )}`}
                >
                  {puppy.status}
                </span>
              </div>
            </div>

            <div className="p-5 flex-grow flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                    {puppy.name}
                  </h4>
                  <p className="text-sm text-slate-400 font-medium mt-1">
                    {puppy.color}
                  </p>
                </div>

                {getGenderBadge(puppy.gender)}
              </div>

              {puppy.description && (
                <p className="text-sm text-slate-300 leading-relaxed line-clamp-3">
                  {puppy.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PuppyList;
