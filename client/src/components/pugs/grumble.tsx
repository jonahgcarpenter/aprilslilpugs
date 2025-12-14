import type { Pug } from "../../hooks/usepugs";

interface GrumbleProps {
  grumbles: Pug[];
  isLoading: boolean;
  error: any;
}

const calculateAge = (birthDateString: string) => {
  if (!birthDateString) return 0;

  const [birthYear, birthMonth, birthDay] = birthDateString
    .split("-")
    .map(Number);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  let age = currentYear - birthYear;

  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < birthDay)
  ) {
    age--;
  }

  return age;
};

const Grumble = ({ grumbles, isLoading, error }: GrumbleProps) => {
  if (isLoading) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-12 border border-slate-800/50 shadow-xl flex justify-center">
        <span className="text-blue-400 font-semibold animate-pulse">
          Loading...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-8 text-center border border-slate-800/50 text-red-400">
        Failed to load the Grumble. Please try again later.
      </div>
    );
  }

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
          Meet my Grumble
        </h1>

        {grumbles && grumbles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...grumbles]
              .sort(
                (a, b) => calculateAge(b.birthDate) - calculateAge(a.birthDate),
              )
              .map((pug) => (
                <div
                  key={pug.id}
                  className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50 shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                >
                  <div className="aspect-square w-full overflow-hidden">
                    {pug.profilePicture ? (
                      <img
                        src={pug.profilePicture}
                        alt={pug.name}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold text-slate-100">
                        {pug.name}
                      </h3>
                      <div className="flex justify-between items-center">
                        <p className="text-blue-400 font-medium">
                          {pug.gender}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {calculateAge(pug.birthDate)} years old
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed line-clamp-4">
                      {pug.description}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            No pugs found in the grumble yet!
          </div>
        )}
      </div>
    </div>
  );
};

export default Grumble;
