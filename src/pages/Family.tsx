import React, { useState, useEffect } from "react";
import '../styles/main.css';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../secrets/firebase";
import Footer from "../components/Footer";
import FamilySlideshow from '../components/familyslideshow';

interface SectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, children, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="explorer-section">
      <div className="explorer-header" onClick={() => setIsExpanded(!isExpanded)}>
        <span className={`explorer-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
        <h2 className="explorer-title">{title}</h2>
      </div>
      {isExpanded && <div className="explorer-content">{children}</div>}
    </div>
  );
};

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

  const handleImageClick = (image: string, description: string) => {
    setImageModal({ image, description, name: currentMember.name });
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
            onImageClick={handleImageClick}
            isExpanded={!!imageModal}
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
