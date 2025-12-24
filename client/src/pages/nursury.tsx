import DisplayLitters from "../components/litters/display-litters";
import AddWaitlist from "../components/wailist/add-waitlist";
import { useLitters } from "../hooks/uselitters";
import { useWaitlist } from "../hooks/usewaitlist";

const Nursery = () => {
  const { currentLitters, isLoading, error } = useLitters();
  const { createWaitlist } = useWaitlist();

  return (
    <div className="space-y-6">
      <AddWaitlist onSubmit={createWaitlist} />

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
