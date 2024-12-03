import React, { useState, useEffect } from "react";
import '../styles/main.css';
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../secrets/firebase";
import Footer from "../components/Footer";
import Live from "../components/Live";
import Waitlist from "../components/Waitlist";
import Slideshow from '../components/puppyslideshow';
import Parents from '../components/Parents';
import Section from "../components/Section";

const sectionDefaults = {
  waitlist: false,
  puppyCam: true,
  meetPuppies: true,
  meetParents: true
};

const Puppies: React.FC = () => {
  const [puppies, setPuppies] = useState<any[]>([]);
  const [currentPuppyIndex, setCurrentPuppyIndex] = useState(0);
  const [activeModal, setActiveModal] = useState<"mom" | "dad" | null>(null); // Modal state
  const [mom, setMom] = useState<any | null>(null); // Mom's data
  const [dad, setDad] = useState<any | null>(null); // Dad's data
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null);
  const [imageModal, setImageModal] = useState<{ image: string; description: string } | null>(null);
  const [millie, setMillie] = useState<any>(null);
  const [mardis, setMardis] = useState<any>(null);

  // Fetch puppies data from Firestore
  useEffect(() => {
    const fetchPuppies = async () => {
      const puppiesCollection = collection(db, "puppies");
      const puppiesSnapshot = await getDocs(puppiesCollection);
      const puppiesList = puppiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPuppies(puppiesList);
    };

    fetchPuppies();
  }, []);

  // Fetch parent details when opening modal
  useEffect(() => {
    const fetchParents = async () => {
      try {
        console.log("Starting to fetch parents...");
        const familyRef = collection(db, "family"); // Changed from "pets" to "family"
        const querySnapshot = await getDocs(familyRef);
        
        console.log("Total documents found:", querySnapshot.size);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log("Found document:", doc.id, data);
          
          // Updated to match exact database names
          if (data.name === "Millie") {
            console.log("Setting Millie data:", data);
            setMillie({
              ...data,
              imageUrl: data.imageUrl || data.image, // Handle both property names
              isActive: true // Force isActive if not present
            });
          } else if (data.name === "Mardi") { // Changed from "Mardis" to "Mardi"
            console.log("Setting Mardi data:", data);
            setMardis({
              ...data,
              imageUrl: data.imageUrl || data.image, // Handle both property names
              isActive: true // Force isActive if not present
            });
          }
        });
      } catch (error) {
        console.error("Error fetching parent data:", error);
      }
    };

    fetchParents();
  }, []);

  const handleOpenModal = (modalType: "mom" | "dad") => {
    setActiveModal(modalType);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setExpandedImageId(null);
  };

  const handleNext = () => {
    setCurrentPuppyIndex((prevIndex) => (prevIndex + 1) % puppies.length);
    setExpandedImageId(null); // Reset expanded image
  };

  const handlePrevious = () => {
    setCurrentPuppyIndex((prevIndex) =>
      prevIndex === 0 ? puppies.length - 1 : prevIndex - 1
    );
    setExpandedImageId(null); // Reset expanded image
  };

  const handleImageClick = (event: React.MouseEvent, image: string, description: string) => {
    event.stopPropagation();
    setImageModal({ image, description });
  };

  const handleCloseImageModal = () => {
    setImageModal(null);
  };

  if (puppies.length === 0) {
    return <div>Loading puppies...</div>;
  }

  const currentPuppy = puppies[currentPuppyIndex];

  return (
    <>
      <div className="page-container">
        <Section title="Waitlist" defaultExpanded={sectionDefaults.waitlist}>
          <Waitlist />
        </Section>

        <Section title="Live Puppy Cam" defaultExpanded={sectionDefaults.puppyCam}>
          <Live />
        </Section>

        <Section title="Meet the Puppies" defaultExpanded={sectionDefaults.meetPuppies}>
          <Slideshow
            currentPuppy={currentPuppy}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onImageClick={handleImageClick}
          />
        </Section>
        
        <Section title="Meet The Parents" defaultExpanded={sectionDefaults.meetParents}>
          <Parents
            millie={millie}
            mardis={mardis}
            onImageClick={handleImageClick}
          />
        </Section>

        {/* Modal */}
        {activeModal && (
          <div className="modal" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
              {activeModal === "mom" && mom && (
                <>
                  <div className="modal-header">{mom.name}</div>
                  <img
                    src={mom.image}
                    alt={mom.name}
                    className="content-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(e, mom.image, mom.name);
                    }}
                  />
                  <div className="modal-details">
                    <p className="content-detail">
                      <strong>Age:</strong> {mom.age} years
                    </p>
                    <p className="content-description">{mom.description}</p>
                  </div>
                </>
              )}
              {activeModal === "dad" && dad && (
                <>
                  <div className="modal-header">{dad.name}</div>
                  <img
                    src={dad.image}
                    alt={dad.name}
                    className="content-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(e, dad.image, dad.name);
                    }}
                  />
                  <div className="modal-details">
                    <p className="content-detail">
                      <strong>Age:</strong> {dad.age} years
                    </p>
                    <p className="content-description">{dad.description}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Image Modal */}
        {imageModal && (
          <div className="image-modal" onClick={handleCloseImageModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={handleCloseImageModal}>×</button>
              <div className="modal-header">{imageModal.description}</div>
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

export default Puppies;
