import Grumble from "../components/pugs/grumble";
import { useDogs } from "../hooks/usedogs";

const OurAdults = () => {
  const { dogs, isLoading, error } = useDogs();

  return <Grumble grumbles={dogs} isLoading={isLoading} error={error} />;
};

export default OurAdults;
