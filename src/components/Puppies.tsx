import React, { useState } from "react";

// Lazy-loaded parent components
const parentComponents = {
  1: React.lazy(() => import("./Winston")),
  2: React.lazy(() => import("./Elly")),
  3: React.lazy(() => import("./Penny")),
  4: React.lazy(() => import("./Mardi")),
  5: React.lazy(() => import("./Millie")),
  6: React.lazy(() => import("./Hallie")),
};

const Puppies: React.FC = () => {
  const puppiesForSale = [
    {
      id: 1,
      name: "Max",
      age: "8 weeks",
      description: "A playful and cuddly puppy ready for a loving home.",
      image: "/images/max.jpg",
      parentId1: 1,
      parentId2: 2,
    },
    {
      id: 2,
      name: "Luna",
      age: "7 weeks",
      description: "A curious and energetic puppy with a lovable personality.",
      image: "/images/luna.jpg",
      parentId1: 3,
      parentId2: 4,
    },
    {
      id: 3,
      name: "Bailey",
      age: "6 weeks",
      description: "A gentle and affectionate puppy looking for a forever family.",
      image: "/images/bailey.jpg",
      parentId1: 5,
      parentId2: 6,
    },
  ];

  const parentNames = {
    1: "Winston",
    2: "Elly",
    3: "Penny",
    4: "Mardi",
    5: "Millie",
    6: "Hallie",
  };

  const [currentPuppyIndex, setCurrentPuppyIndex] = useState(0);
  const [openParentId, setOpenParentId] = useState<number | null>(null);

  const handleOpenParentInfo = (parentId: number) => {
    setOpenParentId(parentId);
  };

  const handleCloseModal = () => {
    setOpenParentId(null);
  };

  const handleNext = () => {
    setCurrentPuppyIndex((prevIndex) => (prevIndex + 1) % puppiesForSale.length);
    setOpenParentId(null);
  };

  const handlePrevious = () => {
    setCurrentPuppyIndex((prevIndex) =>
      prevIndex === 0 ? puppiesForSale.length - 1 : prevIndex - 1
    );
    setOpenParentId(null);
  };

  const currentPuppy = puppiesForSale[currentPuppyIndex];
  const CurrentParentComponent = openParentId
    ? parentComponents[openParentId]
    : null;

  return (
    <div className="puppies-container">
      <h1 className="puppies-title">Puppies for Sale</h1>
      <div className="puppies-slideshow">
        <button className="puppies-button" onClick={handlePrevious}>
          &lt; Previous
        </button>
        <div className="puppies-info">
          <img
            src={currentPuppy.image}
            alt={currentPuppy.name}
            className="puppies-image"
          />
          <h2>{currentPuppy.name}</h2>
          <p>
            <strong>Age:</strong> {currentPuppy.age}
          </p>
          <p>{currentPuppy.description}</p>
          <h3>Parents</h3>
          <div className="puppies-parents-links">
            {[currentPuppy.parentId1, currentPuppy.parentId2].map((parentId) => (
              <button
                key={parentId}
                className="parent-link"
                onClick={() => handleOpenParentInfo(parentId)}
              >
                Meet {parentNames[parentId]}
              </button>
            ))}
          </div>
        </div>
        <button className="puppies-button" onClick={handleNext}>
          Next &gt;
        </button>
      </div>

      {openParentId && CurrentParentComponent && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseModal}>
              &times;
            </button>
            <React.Suspense fallback={<div>Loading parent details...</div>}>
              {React.createElement(CurrentParentComponent)}
            </React.Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default Puppies;
