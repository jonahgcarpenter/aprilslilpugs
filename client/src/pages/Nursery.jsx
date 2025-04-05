import React, { useState, useEffect } from "react";
import Litters from "../components/Litters/Litters.jsx";
import NoLitters from "../components/Litters/NoLitters.jsx";
import litters from "../tempdata/litters.js";

const Nursery = () => {
  const [currentLitters, setCurrentLitters] = useState([]);

  // Filter litters to only include those that include an  available or reserved puppy
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

  return (
    <div className="min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        {currentLitters.length === 0 ? (
          <NoLitters />
        ) : (
          <Litters litters={currentLitters} title="Current Litters" />
        )}
      </div>
    </div>
  );
};

export default Nursery;
