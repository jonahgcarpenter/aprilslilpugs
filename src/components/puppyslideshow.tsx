import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../secrets/firebase";
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

const Slideshow: React.FC = () => {
  const [puppies, setPuppies] = useState<PuppyData[]>([]);
  const [currentPuppyIndex, setCurrentPuppyIndex] = useState(0);
  const [modalImage, setModalImage] = useState<{ url: string, description: string } | null>(null);

  useEffect(() => {
    const fetchPuppies = async () => {
      const puppiesCollection = collection(db, "puppies");
      const puppiesSnapshot = await getDocs(puppiesCollection);
      const puppiesList = puppiesSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter(puppy => puppy.isActive);
      setPuppies(puppiesList);
    };

    fetchPuppies();
  }, []);

  if (puppies.length === 0) return <div>No active puppies available</div>;

  const currentPuppy = puppies[currentPuppyIndex];
  const handlePrevious = () => {
    setCurrentPuppyIndex((prevIndex) =>
      prevIndex === 0 ? puppies.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentPuppyIndex((prevIndex) => (prevIndex + 1) % puppies.length);
  };

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
          <button className="puppyslideshowprev-button" onClick={handlePrevious}>&lt;</button>
          <button className="puppyslideshownext-button" onClick={handleNext}>&gt;</button>
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
