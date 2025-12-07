import Grumble from "../components/pugs/grumble";
import { usePug } from "../hooks/usepugs";

const OurAdults = () => {
  const { pugs, isLoading, error } = usePug();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <Grumble grumbles={pugs} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
};

export default OurAdults;
