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
      <title>Available Puppies & Nursery | April's Lil Pugs</title>
      <meta
        name="description"
        content="View our current Pug litters and available puppies looking for their forever homes. Join our waitlist today!"
      />
      <meta property="og:title" content="Current Litters | April's Lil Pugs" />
      <meta property="og:url" content="https://aprilslilpugs.com/nursery" />

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
