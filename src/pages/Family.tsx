import React, { useState, useEffect } from "react";
import '../styles/main.css';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../secrets/firebase";
import Footer from "../components/Footer";
import FamilySlideshow from '../components/familyslideshow';
import Section from "../components/Section";

const sectionDefaults = {
  meetFamily: true,
};

const Family: React.FC = () => {
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0);
  const [imageModal, setImageModal] = useState<{ image: string; description: string } | null>(null);

  useEffect(() => {
    const fetchFamilyMembers = async () => {
      const familyCollection = collection(db, "family");
      const familySnapshot = await getDocs(familyCollection);
      const familyList = familySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFamilyMembers(familyList);
    };

    fetchFamilyMembers();
  }, []);

  const handleNext = () => {
    setCurrentMemberIndex((prevIndex) => (prevIndex + 1) % familyMembers.length);
  };

  const handlePrevious = () => {
    setCurrentMemberIndex((prevIndex) =>
      prevIndex === 0 ? familyMembers.length - 1 : prevIndex - 1
    );
  };

  const handleCloseImageModal = () => {
    setImageModal(null);
  };

  if (familyMembers.length === 0) {
    return <div>Loading family members...</div>;
  }

  const currentMember = familyMembers[currentMemberIndex];

  return (
    <>
      <div className="page-container">
        <Section title="Meet My Family" defaultExpanded={sectionDefaults.meetFamily}>
          <FamilySlideshow
            currentFamilyMember={currentMember}
            onPrevious={handlePrevious}
            onNext={handleNext}
          />
        </Section>

        {/* Image Modal */}
        {imageModal && (
          <div className="image-modal" onClick={handleCloseImageModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={handleCloseImageModal}>×</button>
              <div className="modal-header">{currentMember.name}</div>
              <img 
                src={imageModal.image} 
                alt={imageModal.description} 
                className="modal-image"
              />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Family;
