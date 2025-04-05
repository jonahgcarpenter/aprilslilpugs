import React, { useState, useEffect } from "react";
import Litters from "../components/Litters/Litters.jsx";
import PuppiesModal from "../components/Litters/PuppiesModal.jsx";
import NoLitters from "../components/Litters/NoLitters.jsx";
import litters from "../tempdata/litters.js";

const Nursery = () => {
  const [selectedLitter, setSelectedLitter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLitters, setCurrentLitters] = useState([]);

  useEffect(() => {
    if (Array.isArray(litters) && litters.length > 0) {
      const filtered = litters.filter((litter) => {
        return (
          !litter.puppies ||
          litter.puppies.length === 0 ||
          (litter.puppies.length > 0 &&
            litter.puppies.some(
              (puppy) =>
                puppy.status === "Available" || puppy.status === "Reserved",
            ))
        );
      });
      setCurrentLitters(filtered);
    }
  }, [litters]);

  const handleLitterClick = (litter) => {
    setSelectedLitter(litter);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {currentLitters.length === 0 ? (
          <NoLitters />
        ) : (
          <Litters
            litters={currentLitters}
            onLitterClick={handleLitterClick}
            title="Current Litters"
          />
        )}
      </div>

      {isModalOpen && selectedLitter && (
        <PuppiesModal
          selectedLitter={selectedLitter}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedLitter(null);
          }}
        />
      )}
    </div>
  );
};

export default Nursery;
