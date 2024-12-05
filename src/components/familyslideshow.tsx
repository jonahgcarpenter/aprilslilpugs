import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../secrets/firebase";
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

const FamilySlideshow: React.FC = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [modalImage, setModalImage] = useState<{ url: string, description: string } | null>(null);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      const familyCollection = collection(db, "family");
      const familySnapshot = await getDocs(familyCollection);
      const familyList = familySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as FamilyMember))
        .filter(member => member.isActive);
      setFamilyMembers(familyList);
    };

    fetchFamilyMembers();
  }, []);

  if (familyMembers.length === 0) return <div>No family members available</div>;

  const currentMember = familyMembers[currentMemberIndex];

  const handlePrevious = () => {
    setCurrentMemberIndex((prevIndex) =>
      prevIndex === 0 ? familyMembers.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentMemberIndex((prevIndex) =>
      (prevIndex + 1) % familyMembers.length
    );
  };

  return (
    <>
      <div className="familyslideshow-container">
        <img
          src={currentMember.imageUrl || ''}
          alt={currentMember.name}
          className="familyslideshow-image"
          onClick={() => setModalImage({
            url: currentMember.imageUrl,
            description: currentMember.name
          })}
        />
        <div className="familyslideshow-controls">
          <button className="familyslideshowprev-button" onClick={handlePrevious}>&lt;</button>
          <button className="familyslideshownext-button" onClick={handleNext}>&gt;</button>
        </div>
        <h2 className="familyslideshow-subtitle">{currentMember.name}</h2>
        <div className="familyslideshow-info">
          <p className="familyslideshow-detail">
            <strong>Age:</strong> {currentMember.age || 'N/A'}
          </p>
          <p className="familyslideshow-detail">
            <strong>Gender:</strong> {currentMember.gender.charAt(0).toUpperCase() + currentMember.gender.slice(1) || 'N/A'}
          </p>
          <p className="familyslideshow-description">{currentMember.description}</p>
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
