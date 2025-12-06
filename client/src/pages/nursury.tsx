import Litters from "../components/litters/litters";
import Waitlist from "../components/waitlist/waitlist";
import { useLitter } from "../hooks/uselitter";
import { useWaitlist } from "../hooks/usewaitlist";
import { useSettings } from "../hooks/usesettings";
import type { Litter } from "../hooks/uselitter";

const Nursery = () => {
  const {
    litters,
    isLoading: isLittersLoading,
    error: littersError,
  } = useLitter();

  const { createEntry, entries } = useWaitlist();
  const { settings, isLoading: isSettingsLoading } = useSettings();

  const currentLitters =
    litters?.filter((litter: Litter) => {
      const hasNoPuppies = !litter.puppies || litter.puppies.length === 0;
      const hasActivePuppies =
        litter.puppies &&
        litter.puppies.some(
          (puppy) =>
            puppy.status === "Available" || puppy.status === "Reserved",
        );

      return hasNoPuppies || hasActivePuppies;
    }) || [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        <Waitlist
          createEntry={createEntry}
          entries={entries}
          settings={settings}
          isLoadingSettings={isSettingsLoading}
        />
        <Litters
          litters={currentLitters}
          isLoading={isLittersLoading}
          littersError={littersError}
        />
      </div>
    </div>
  );
};

export default Nursery;
