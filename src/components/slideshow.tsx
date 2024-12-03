import React from 'react';

interface SlideshowProps {
  currentPuppy: {
    image: string;
    name: string;
    age: string;
    description: string;
  };
  onPrevious: () => void;
  onNext: () => void;
  onImageClick: (event: React.MouseEvent, image: string, description: string) => void;
}

const Slideshow: React.FC<SlideshowProps> = ({ currentPuppy, onPrevious, onNext, onImageClick }) => {
  return (
    <div className="slideshow-container">
      <img
        src={currentPuppy.image}
        alt={currentPuppy.name}
        className="content-image"
        onClick={(e) => onImageClick(e, currentPuppy.image, currentPuppy.name)}
      />
      <h2 className="content-subtitle">{currentPuppy.name}</h2>
      <div className="navigation-controls">
        <button className="prev-button" onClick={onPrevious}>&lt;</button>
        <div className="puppy-info">
          <p className="content-detail">
            <strong>Age:</strong> {currentPuppy.age}
          </p>
          <p className="content-description">{currentPuppy.description}</p>
        </div>
        <button className="next-button" onClick={onNext}>&gt;</button>
      </div>
    </div>
  );
};

export default Slideshow;
