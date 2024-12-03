import React, { useState, useEffect } from "react";
import '../styles/main.css';
import '../styles/family_puppies.css';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../secrets/firebase";
import Footer from "../components/Footer";

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
    <>
      <div className="page-container">
        <section className="content-section" onClick={handleOutsideClick}>
          <h1 className="section-title">Meet Our Family</h1>
          <div className="slideshow-container">
            <div className="content-card">
              <img
                src={currentFamilyMember.image}
                alt={currentFamilyMember.name}
                className={`content-image ${
                  expandedImageId === currentFamilyMember.id ? "image-expanded" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageClick(currentFamilyMember.id);
                }}
              />
              
              <div className="navigation-controls">
                <button className="prev-button" onClick={handlePrevious}>
                  &lt;
                </button>
                <div className="puppy-info">
                  <h2 className="content-subtitle">{currentFamilyMember.name}</h2>
                  <p className="content-detail">
                    <strong>Age:</strong> {currentFamilyMember.age} years
                  </p>
                  <p className="content-description">{currentFamilyMember.description}</p>
                </div>
                <button className="next-button" onClick={handleNext}>
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Family;
