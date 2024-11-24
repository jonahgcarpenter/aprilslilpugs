import React, { useState } from "react";

interface Puppy {
  id: number;
  name: string;
  age: string;
  description: string;
  image: string;
}

const Puppies: React.FC = () => {
  const puppies: Puppy[] = [
    {
      id: 1,
      name: "Bella",
      age: "2 years",
      description: "A playful pug who loves belly rubs and naps.",
      image: "https://via.placeholder.com/300x200?text=Bella", // Replace with actual image URL
    },
    {
      id: 2,
      name: "Charlie",
      age: "3 years",
      description: "A curious pug who enjoys exploring and playing with toys.",
      image: "https://via.placeholder.com/300x200?text=Charlie", // Replace with actual image URL
    },
    {
      id: 3,
      name: "Daisy",
      age: "1 year",
      description: "A friendly pug who loves meeting new people and snuggling.",
      image: "https://via.placeholder.com/300x200?text=Daisy", // Replace with actual image URL
    },
  ];

  const [currentPuppyIndex, setCurrentPuppyIndex] = useState(0);

  const handleNext = () => {
    setCurrentPuppyIndex((prevIndex) => (prevIndex + 1) % puppies.length);
  };

  const handlePrevious = () => {
    setCurrentPuppyIndex((prevIndex) =>
      prevIndex === 0 ? puppies.length - 1 : prevIndex - 1
    );
  };

  const currentPuppy = puppies[currentPuppyIndex];

  return (
    <div className="puppy-container">
      <h1 className="puppy-title">Meet Our Pugs!</h1>
      <div className="puppy-content">
        <button className="puppy-button" onClick={handlePrevious}>
          &lt; Previous
        </button>
        <div className="puppy-info">
          <img
            src={currentPuppy.image}
            alt={currentPuppy.name}
            className="puppy-image"
          />
          <h2>{currentPuppy.name}</h2>
          <p>
            <strong>Age:</strong> {currentPuppy.age}
          </p>
          <p>{currentPuppy.description}</p>
        </div>
        <button className="puppy-button" onClick={handleNext}>
          Next &gt;
        </button>
      </div>
    </div>
  );
};

export default Puppies;
