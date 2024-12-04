import React, { useState } from 'react';
import '../styles/slideshow.css';

interface PuppyData {
  imageUrl: string;
  name: string;
  age: string;
  description: string;
  mom: string;
  dad: string;
  isActive: boolean;
  gender: string;
}

interface SlideshowProps {
  currentPuppy: PuppyData;
  onPrevious: () => void;
  onNext: () => void;
}

const Slideshow: React.FC<SlideshowProps> = ({ currentPuppy, onPrevious, onNext }) => {
  const [modalImage, setModalImage] = useState<{ url: string, description: string } | null>(null);

  if (!currentPuppy || !currentPuppy.isActive) return null;

  return (
    <>
      <div className="slideshow-container">
        <img
          src={currentPuppy.imageUrl || ''}
          alt={currentPuppy.name}
          className="content-image"
          onClick={() => setModalImage({ url: currentPuppy.imageUrl, description: currentPuppy.name })}
        />
        <div className="navigation-controls">
          <button className="prev-button" onClick={onPrevious}>&lt;</button>
          <button className="next-button" onClick={onNext}>&gt;</button>
        </div>
        <h2 className="content-subtitle">{currentPuppy.name}</h2>
        <div className="puppy-info">
          <p className="content-detail">
            <strong>Age:</strong> {currentPuppy.age || 'N/A'}
          </p>
          <p className="content-detail">
            <strong>Gender:</strong> {currentPuppy.gender.charAt(0).toUpperCase() + currentPuppy.gender.slice(1) || 'N/A'}
          </p>
          {(currentPuppy.mom || currentPuppy.dad) && (
            <p className="content-detail">
              <strong>Parents:</strong> {[currentPuppy.mom, currentPuppy.dad].filter(Boolean).join(' & ') || 'N/A'}
            </p>
          )}
          <p className="content-description content-center">{currentPuppy.description}</p>
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

export default Slideshow;
