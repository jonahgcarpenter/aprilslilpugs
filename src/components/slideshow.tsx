import React from 'react';
import '../styles/slideshow.css';

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
      <div className="navigation-controls">
        <button className="prev-button" onClick={onPrevious}>&lt;</button>
        <button className="next-button" onClick={onNext}>&gt;</button>
      </div>
      <h2 className="content-subtitle">{currentPuppy.name}</h2>
      <div className="puppy-info">
        <p className="content-detail">
          <strong>Age:</strong> {currentPuppy.age}
        </p>
        <p className="content-description content-center">{currentPuppy.description}</p>
      </div>
    </div>
  );
};

export default Slideshow;
