import Grumble from "../components/pugs/grumble";
import { usePug } from "../hooks/usepugs";

const OurAdults = () => {
  const { pugs, isLoading, error } = usePug();

  return <Grumble grumbles={pugs} isLoading={isLoading} error={error} />;
};

export default OurAdults;
