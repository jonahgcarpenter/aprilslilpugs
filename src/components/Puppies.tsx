import React, { useState } from "react";
import { Link } from "react-router-dom";

interface Puppy {
  id: number;
  name: string;
  age: string;
  description: string;
  image: string;
  parentId1: number; // First parent
  parentId2: number; // Second parent
}

const Puppies: React.FC = () => {
  const puppiesForSale: Puppy[] = [
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

  const handleNext = () => {
    setCurrentPuppyIndex((prevIndex) => (prevIndex + 1) % puppiesForSale.length);
  };

  const handlePrevious = () => {
    setCurrentPuppyIndex((prevIndex) =>
      prevIndex === 0 ? puppiesForSale.length - 1 : prevIndex - 1
    );
  };

  const currentPuppy = puppiesForSale[currentPuppyIndex];

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
            <Link
              to={`/family/${currentPuppy.parentId1}`}
              className="parent-link"
            >
              Meet {parentNames[currentPuppy.parentId1]}
            </Link>
            <Link
              to={`/family/${currentPuppy.parentId2}`}
              className="parent-link"
            >
              Meet {parentNames[currentPuppy.parentId2]}
            </Link>
          </div>
        </div>
        <button className="puppies-button" onClick={handleNext}>
          Next &gt;
        </button>
      </div>
    </div>
  );
};

export default Puppies;
