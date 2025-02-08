import { useGrumble } from "../../hooks/useGrumble";
import LoadingAnimation from "../Misc/LoadingAnimation";

const calculateAge = (birthDateString) => {
  const [birthYear, birthMonth, birthDay] = birthDateString
    .split("-")
    .map(Number);

  const now = new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
  });
  const currentDate = new Date(now);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentDay = currentDate.getDate();

  let age = currentYear - birthYear;

  if (
    currentMonth < birthMonth ||
    (currentMonth === birthMonth && currentDay < birthDay)
  ) {
    age--;
  }

  return age;
};

const Grumble = () => {
  const { grumbles, isLoading, error } = useGrumble();

  if (isLoading) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <LoadingAnimation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <p className="text-red-500 text-center">
          {error.message || "An error occurred"}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
          Meet my Grumble
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {grumbles
            .sort(
              (a, b) => calculateAge(b.birthDate) - calculateAge(a.birthDate),
            )
            .map((pug) => {
              return (
                <div
                  key={pug._id}
                  className="bg-slate-800/50 rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 border border-slate-700/50"
                >
                  <div className="aspect-square w-full overflow-hidden">
                    {pug.profilePicture && (
                      <img
                        src={pug.profilePicture}
                        alt={pug.name}
                        className="w-full h-full object-cover"
                      />
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
                        <p className="text-slate-300 text-sm">
                          {calculateAge(pug.birthDate)} years old
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-300">{pug.description}</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Grumble;
