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

  if (!currentPuppy) return null;

  return (
    <>
      <div className="puppyslideshow-container">
        <img
          src={currentPuppy.imageUrl || ''}
          alt={currentPuppy.name}
          className="puppyslideshow-image"
          onClick={() => setModalImage({ url: currentPuppy.imageUrl, description: currentPuppy.name })}
        />
        <div className="puppyslideshow-controls">
          <button className="puppyslideshowprev-button" onClick={onPrevious}>&lt;</button>
          <button className="puppyslideshownext-button" onClick={onNext}>&gt;</button>
        </div>
        <h2 className="puppyslideshow-subtitle">{currentPuppy.name}</h2>
        <div className="puppyslideshow-info">
          <p className="puppyslideshow-detail">
            <strong>Age:</strong> {currentPuppy.age || 'N/A'}
          </p>
          <p className="puppyslideshow-detail">
            <strong>Gender:</strong> {currentPuppy.gender.charAt(0).toUpperCase() + currentPuppy.gender.slice(1) || 'N/A'}
          </p>
          {(currentPuppy.mom || currentPuppy.dad) && (
            <p className="puppyslideshow-detail">
              <strong>Parents:</strong> {[currentPuppy.mom, currentPuppy.dad].filter(Boolean).join(' & ') || 'N/A'}
            </p>
          )}
          <p className="puppyslideshow-description">{currentPuppy.description}</p>
        </div>
      </div>

      {modalImage && (
        <div className="puppyslideshow-modal" onClick={() => setModalImage(null)}>
          <div className="puppyslideshowmodal-content" onClick={e => e.stopPropagation()}>
            <button className="puppyslideshowmodal-close" onClick={() => setModalImage(null)}>×</button>
            <div className="puppyslideshowmodal-header">{modalImage.description}</div>
            <img 
              src={modalImage.url} 
              alt={modalImage.description} 
              className="puppyslideshowmodal-image"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Slideshow;
