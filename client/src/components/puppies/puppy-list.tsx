import type { Puppy } from "../../hooks/usepuppies";

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

const getGenderBadge = (gender: string) => {
  if (gender === "Male") {
    return (
      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-blue-500/20 text-blue-300 border-blue-500/30">
        Male
      </span>
    );
  }

  return (
    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border bg-pink-500/20 text-pink-300 border-pink-500/30">
      Female
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
                src={puppy.profilePicture}
                alt={puppy.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
            </div>

            <div className="p-5 flex-grow flex flex-col">
              {/* Name */}
              <h4 className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors mb-4">
                {puppy.name}
              </h4>

              <div className="grid grid-cols-3 gap-2 mb-4">
                {/* Color */}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                    Color
                  </p>
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {puppy.color}
                  </p>
                </div>

                {/* Gender */}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                    Gender
                  </p>
                  <div>{getGenderBadge(puppy.gender)}</div>
                </div>

                {/* Status */}
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1">
                    Status
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(
                      puppy.status,
                    )}`}
                  >
                    {puppy.status}
                  </span>
                </div>
              </div>

              {/* Description Divider */}
              {puppy.description && (
                <div className="border-t border-slate-700/50 pt-3 mt-auto">
                  <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">
                    {puppy.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PuppyList;
