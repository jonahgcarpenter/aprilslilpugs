import React from 'react';
import '../styles/slideshow.css';

interface FamilyMember {
  id: string;
  image: string;
  name: string;
  age: number;
  description: string;
}

interface FamilySlideshowProps {
  currentFamilyMember: FamilyMember;
  onPrevious: () => void;
  onNext: () => void;
  onImageClick: (image: string, description: string) => void;
  isExpanded: boolean;
}

const FamilySlideshow: React.FC<FamilySlideshowProps> = ({
  currentFamilyMember,
  onPrevious,
  onNext,
  onImageClick,
  isExpanded,
}) => {
  return (
    <div className="slideshow-container">
      <img
        src={currentFamilyMember.image}
        alt={currentFamilyMember.name}
        className="content-image"
        onClick={(e) => {
          e.stopPropagation();
          onImageClick(currentFamilyMember.image, currentFamilyMember.name);
        }}
      />
      <div className="navigation-controls">
        <button className="prev-button" onClick={onPrevious}>&lt;</button>
        <button className="next-button" onClick={onNext}>&gt;</button>
      </div>
      <h2 className="content-subtitle">{currentFamilyMember.name}</h2>
      <div className="puppy-info">
        <p className="content-detail">
          <strong>Age:</strong> {currentFamilyMember.age} years
        </p>
        <p className="content-description content-center">{currentFamilyMember.description}</p>
      </div>
    </div>
  );
};

export default FamilySlideshow;
