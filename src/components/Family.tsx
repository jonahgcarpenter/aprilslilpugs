import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../secrets/firebase.js"; // Adjust path to your Firebase config

const Family: React.FC = () => {
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [currentFamilyIndex, setCurrentFamilyIndex] = useState(0);
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null);

  // Fetch family members from Firestore
  useEffect(() => {
    const fetchFamilyData = async () => {
      try {
        const familyCollection = collection(db, "family");
        const familySnapshot = await getDocs(familyCollection);
        const familyList = familySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFamilyMembers(familyList);
      } catch (error) {
        console.error("Error fetching family data: ", error);
      }
    };

    fetchFamilyData();
  }, []);

  const handleNext = () => {
    setCurrentFamilyIndex(
      (prevIndex) => (prevIndex + 1) % familyMembers.length
    );
  };

  const handlePrevious = () => {
    setCurrentFamilyIndex(
      (prevIndex) =>
        prevIndex === 0 ? familyMembers.length - 1 : prevIndex - 1
    );
  };

  const handleImageClick = (familyId: string) => {
    setExpandedImageId(expandedImageId === familyId ? null : familyId);
  };

  const handleOutsideClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).classList.contains("image-expanded")) {
      setExpandedImageId(null);
    }
  };

  if (familyMembers.length === 0) {
    return <div>Loading family members...</div>;
  }

  const currentFamilyMember = familyMembers[currentFamilyIndex];

  return (
    <section className="section-container" onClick={handleOutsideClick}>
      <h1 className="section-title">Meet {currentFamilyMember.name}!</h1>
      <div className="section-navigation">
        <button className="family-button" onClick={handlePrevious}>
          &lt;
        </button>
        <div className="section-info">
          <img
            src={currentFamilyMember.image}
            alt={currentFamilyMember.name}
            className={`section-image ${
              expandedImageId === currentFamilyMember.id ? "image-expanded" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleImageClick(currentFamilyMember.id);
            }}
          />
          <h2>{currentFamilyMember.name}</h2>
          <p>
            <strong>Age:</strong> {currentFamilyMember.age} years
          </p>
          <p>{currentFamilyMember.description}</p>
        </div>
        <button className="family-button" onClick={handleNext}>
          &gt;
        </button>
      </div>
    </section>
  );
};

export default Family;
