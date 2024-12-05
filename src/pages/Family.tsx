import React, { useState, useEffect } from "react";
import '../styles/main.css';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../secrets/firebase";
import Footer from "../components/footer";
import FamilySlideshow from '../components/familyslideshow';
import Section from "../components/section";

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

  // Filter active family members
  const activeMembers = familyMembers.filter(member => member.isActive);

  const handleNext = () => {
    setCurrentMemberIndex((prevIndex) => (prevIndex + 1) % activeMembers.length);
  };

  const handlePrevious = () => {
    setCurrentMemberIndex((prevIndex) =>
      prevIndex === 0 ? activeMembers.length - 1 : prevIndex - 1
    );
  };

  const handleCloseImageModal = () => {
    setImageModal(null);
  };

  if (activeMembers.length === 0) {
    return <div>No active family members available</div>;
  }

  const currentMember = activeMembers[currentMemberIndex];

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
