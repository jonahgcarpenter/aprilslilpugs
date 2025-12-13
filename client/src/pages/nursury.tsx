import { useState } from "react";
import CurrentLitters from "../components/litters/current-litters";
import PuppiesModal from "../components/puppies/modal";
import { useLitters } from "../hooks/uselitters";

const Nursery = () => {
  const { currentLitters, isLoading, error } = useLitters();

  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(null);

  const selectedLitter = currentLitters
    ? currentLitters.find((l) => l.id === selectedLitterId) || null
    : null;

  return (
    <>
      <CurrentLitters
        litters={currentLitters}
        isLoading={isLoading}
        error={error}
        onLitterClick={setSelectedLitterId}
      />

      <PuppiesModal
        isOpen={!!selectedLitterId}
        litter={selectedLitter}
        onClose={() => setSelectedLitterId(null)}
      />
    </>
  );
};

export default Nursery;
