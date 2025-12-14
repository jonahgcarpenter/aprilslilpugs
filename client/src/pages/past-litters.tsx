import DisplayLitters from "../components/litters/display-litters";
import { useLitters } from "../hooks/uselitters";

const PastLitters = () => {
  const { pastLitters, isLoading, error } = useLitters();

  return (
    <DisplayLitters
      title="Past Litters"
      litters={pastLitters}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default PastLitters;
