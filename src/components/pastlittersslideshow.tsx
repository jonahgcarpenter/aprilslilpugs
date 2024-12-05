import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../secrets/firebase";
import '../styles/slideshow.css';

interface LitterData {
  imageUrl: string;
  name: string;
  age: string;
  description: string;
  mom: string;
  dad: string;
  isActive: boolean;
  gender: string;
}

interface PastLittersSlideshowProps {
  onEmpty?: () => void;
}

const PastLittersSlideshow: React.FC<PastLittersSlideshowProps> = ({ onEmpty }) => {
  const [litters, setLitters] = useState<LitterData[]>([]);
  const [currentLitterIndex, setCurrentLitterIndex] = useState(0);
  const [modalImage, setModalImage] = useState<{ url: string, description: string } | null>(null);

  useEffect(() => {
    const fetchLitters = async () => {
      const littersCollection = collection(db, "puppies");
      const littersSnapshot = await getDocs(littersCollection);
      const littersList = littersSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(litter => !litter.isActive);
      setLitters(littersList);
      
      if (littersList.length === 0 && onEmpty) {
        onEmpty();
      }
    };

    fetchLitters();
  }, [onEmpty]);

  if (litters.length === 0) return null;

  const currentLitter = litters[currentLitterIndex];
  const handlePrevious = () => {
    setCurrentLitterIndex((prevIndex) =>
      prevIndex === 0 ? litters.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentLitterIndex((prevIndex) => (prevIndex + 1) % litters.length);
  };

  return (
    <>
      <div className="pastlittersslideshow-container">
        <img
          src={currentLitter.imageUrl || ''}
          alt={currentLitter.name}
          className="pastlittersslideshow-image"
          onClick={() => setModalImage({ url: currentLitter.imageUrl, description: currentLitter.name })}
        />
        <div className="pastlittersslideshow-controls">
          <button className="pastlittersslideshowprev-button" onClick={handlePrevious}>&lt;</button>
          <button className="pastlittersslideshownext-button" onClick={handleNext}>&gt;</button>
        </div>
        <h2 className="pastlittersslideshow-subtitle">{currentLitter.name}</h2>
        <div className="pastlittersslideshow-info">
          <p className="pastlittersslideshow-detail">
            <strong>Age:</strong> {currentLitter.age || 'N/A'}
          </p>
          <p className="pastlittersslideshow-detail">
            <strong>Gender:</strong> {currentLitter.gender.charAt(0).toUpperCase() + currentLitter.gender.slice(1) || 'N/A'}
          </p>
          {(currentLitter.mom || currentLitter.dad) && (
            <p className="pastlittersslideshow-detail">
              <strong>Parents:</strong> {[currentLitter.mom, currentLitter.dad].filter(Boolean).join(' & ') || 'N/A'}
            </p>
          )}
          <p className="pastlittersslideshow-description">{currentLitter.description}</p>
        </div>
      </div>

      {modalImage && (
        <div className="pastlittersslideshow-modal" onClick={() => setModalImage(null)}>
          <div className="pastlittersslideshowmodal-content" onClick={e => e.stopPropagation()}>
            <button className="pastlittersslideshowmodal-close" onClick={() => setModalImage(null)}>×</button>
            <div className="pastlittersslideshowmodal-header">{modalImage.description}</div>
            <img 
              src={modalImage.url} 
              alt={modalImage.description} 
              className="pastlittersslideshowmodal-image"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default PastLittersSlideshow;
