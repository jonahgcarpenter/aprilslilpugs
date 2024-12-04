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

  if (!currentFamilyMember || !currentFamilyMember.isActive) return null;

  return (
    <>
      <div className="slideshow-container">
        <img
          src={currentFamilyMember.imageUrl || ''}
          alt={currentFamilyMember.name}
          className="content-image"
          onClick={() => setModalImage({ 
            url: currentFamilyMember.imageUrl, 
            description: currentFamilyMember.name 
          })}
        />
        <div className="navigation-controls">
          <button className="prev-button" onClick={onPrevious}>&lt;</button>
          <button className="next-button" onClick={onNext}>&gt;</button>
        </div>
        <h2 className="content-subtitle">{currentFamilyMember.name}</h2>
        <div className="puppy-info">
          <p className="content-detail">
            <strong>Age:</strong> {currentFamilyMember.age || 'N/A'}
          </p>
          {currentFamilyMember.gender && (
            <p className="content-detail">
              <strong>Gender:</strong> {currentFamilyMember.gender.charAt(0).toUpperCase() + currentFamilyMember.gender.slice(1)}
            </p>
          )}
          <p className="content-description content-center">{currentFamilyMember.description}</p>
        </div>
      </div>

      {modalImage && (
        <div className="image-modal view-modal" onClick={() => setModalImage(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalImage(null)}>×</button>
            <div className="modal-header">{modalImage.description}</div>
            <img 
              src={modalImage.url} 
              alt={modalImage.description} 
              className="modal-image"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default FamilySlideshow;
