import DisplayLitters from "../components/litters/display-litters";
import { useLitters } from "../hooks/uselitters";

const Nursery = () => {
  const { currentLitters, isLoading, error } = useLitters();

  return (
    <DisplayLitters
      title="Current Litters"
      litters={currentLitters}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default Nursery;
