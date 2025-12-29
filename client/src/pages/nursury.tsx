import DisplayLitters from "../components/litters/display-litters";
import AddWaitlist from "../components/wailist/add-waitlist";
import { useLitters } from "../hooks/uselitters";
import { useWaitlist } from "../hooks/usewaitlist";
import { useSettings } from "../hooks/usesettings";

const Nursery = () => {
  const { currentLitters, isLoading, error } = useLitters();
  const { createWaitlist } = useWaitlist(false);
  const { settings } = useSettings();

  return (
    <div className="space-y-6">
      {settings?.waitlist_enabled && <AddWaitlist onSubmit={createWaitlist} />}

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
