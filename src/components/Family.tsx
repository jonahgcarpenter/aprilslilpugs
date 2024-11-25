import React, { useState } from "react";

// Dynamic import of parent components
const dogComponents: { [key: number]: React.LazyExoticComponent<React.FC<{}>> } = {
  1: React.lazy(() => import("./Winston")),
  2: React.lazy(() => import("./Elly")),
  3: React.lazy(() => import("./Penny")),
  4: React.lazy(() => import("./Mardi")),
  5: React.lazy(() => import("./Millie")),
  6: React.lazy(() => import("./Hallie")),
};

const familyMembers = [
  { id: 1, name: "Winston" },
  { id: 2, name: "Elly" },
  { id: 3, name: "Penny" },
  { id: 4, name: "Mardi" },
  { id: 5, name: "Millie" },
  { id: 6, name: "Hallie" },
];

const Family: React.FC = () => {
  const [currentFamilyIndex, setCurrentFamilyIndex] = useState(0);

  const handleNext = () => {
    setCurrentFamilyIndex((prevIndex) => (prevIndex + 1) % familyMembers.length);
  };

  const handlePrevious = () => {
    setCurrentFamilyIndex((prevIndex) =>
      prevIndex === 0 ? familyMembers.length - 1 : prevIndex - 1
    );
  };

  const currentFamilyMember = familyMembers[currentFamilyIndex];
  const CurrentDogComponent = dogComponents[currentFamilyMember.id];

  return (
    <section className="section-container">
        <h1 className="section-title">Meet {currentFamilyMember.name}!</h1>
        <div className="section-navigation">
          <button className="family-button" onClick={handlePrevious}>
            &lt;
          </button>
          <React.Suspense fallback={<div>Loading family member details...</div>}>
            <div className="section-info">
              <CurrentDogComponent />
            </div>
          </React.Suspense>
          <button className="family-button" onClick={handleNext}>
            &gt;
          </button>
        </div>
    </section>
  );  
};

export default Family;
