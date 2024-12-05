import React, { useState } from 'react';
import '../styles/slideshow.css';

interface FamilyMember {
  id: string;
  imageUrl: string;
  name: string;
  age: string;
  description: string;
  gender: string;
  isActive: boolean;
}

interface FamilySlideshowProps {
  currentFamilyMember: FamilyMember;
  onPrevious: () => void;
  onNext: () => void;
}

const FamilySlideshow: React.FC<FamilySlideshowProps> = ({
  currentFamilyMember,
  onPrevious,
  onNext,
}) => {
  const [modalImage, setModalImage] = useState<{ url: string, description: string } | null>(null);

  if (!currentFamilyMember) return null;

  return (
    <>
      <div className="familyslideshow-container">
        <img
          src={currentFamilyMember.imageUrl || ''}
          alt={currentFamilyMember.name}
          className="familyslideshow-image"
          onClick={() => setModalImage({ 
            url: currentFamilyMember.imageUrl, 
            description: currentFamilyMember.name 
          })}
        />
        <div className="familyslideshow-controls">
          <button className="familyslideshowprev-button" onClick={onPrevious}>&lt;</button>
          <button className="familyslideshownext-button" onClick={onNext}>&gt;</button>
        </div>
        <h2 className="familyslideshow-subtitle">{currentFamilyMember.name}</h2>
        <div className="familyslideshow-info">
          <p className="familyslideshow-detail">
            <strong>Age:</strong> {currentFamilyMember.age || 'N/A'}
          </p>
          {currentFamilyMember.gender && (
            <p className="familyslideshow-detail">
              <strong>Gender:</strong> {currentFamilyMember.gender.charAt(0).toUpperCase() + currentFamilyMember.gender.slice(1)}
            </p>
          )}
          <p className="familyslideshow-description">{currentFamilyMember.description}</p>
        </div>
      </div>

      {modalImage && (
        <div className="familyslideshow-modal" onClick={() => setModalImage(null)}>
          <div className="familyslideshowmodal-content" onClick={e => e.stopPropagation()}>
            <button className="familyslideshowmodal-close" onClick={() => setModalImage(null)}>×</button>
            <div className="familyslideshowmodal-header">{modalImage.description}</div>
            <img 
              src={modalImage.url} 
              alt={modalImage.description} 
              className="familyslideshowmodal-image"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FamilySlideshow;
