import Grumble from "../components/grumble/grumble";
import { useGrumble } from "../hooks/usegrumble";

const OurAdults = () => {
  const { grumbles, isLoading, error } = useGrumble();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <Grumble grumbles={grumbles} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
};

export default OurAdults;
