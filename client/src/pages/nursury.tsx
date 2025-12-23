import DisplayLitters from "../components/litters/display-litters";
// import AddWaitlist from "../components/wailist/add-waitlist";
import { useLitters } from "../hooks/uselitters";

const Nursery = () => {
  const { currentLitters, isLoading, error } = useLitters();

  return (
    <div className="space-y-6">
      {/* <AddWaitlist /> */}

      <DisplayLitters
        title="Current Litters"
        litters={currentLitters}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default Nursery;
