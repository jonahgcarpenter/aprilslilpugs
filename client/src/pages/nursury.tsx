import CurrentLitters from "../components/litters/current-litters";
import { useLitters } from "../hooks/uselitters";

const Nursery = () => {
  const { currentLitters, isLoading, error } = useLitters();

  return (
    <CurrentLitters
      litters={currentLitters}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default Nursery;
