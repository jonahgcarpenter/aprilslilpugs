import React, { useState, useEffect } from "react";
import '../styles/main.css';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../secrets/firebase";
import Footer from "../components/footer";
import Live from "../components/live";
import Waitlist from "../components/waitlist";
import Slideshow from '../components/puppyslideshow';
import Parents from '../components/parents';
import Section from "../components/section";

const sectionDefaults = {
  waitlist: false,
  puppyCam: true,
  meetPuppies: true,
  meetParents: true
};

const Puppies: React.FC = () => {
  const [puppies, setPuppies] = useState<any[]>([]);
  const [currentPuppyIndex, setCurrentPuppyIndex] = useState(0);
  const [activeModal, setActiveModal] = useState<"mom" | "dad" | null>(null);
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

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleNext = () => {
    setCurrentPuppyIndex((prevIndex) => (prevIndex + 1) % puppies.length);
  };

  const handlePrevious = () => {
    setCurrentPuppyIndex((prevIndex) =>
      prevIndex === 0 ? puppies.length - 1 : prevIndex - 1
    );
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
          />
        </Section>
        
        <Section title="Meet The Parents" defaultExpanded={sectionDefaults.meetParents}>
          <Parents
            millie={millie}
            mardis={mardis}
          />
        </Section>

        {/* Modal */}
        {activeModal && (
          <div className="modal" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
              {activeModal === "mom" && millie && (
                <>
                  <div className="modal-header">{millie.name}</div>
                  <img
                    src={millie.image}
                    alt={millie.name}
                    className="content-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(e, millie.image, millie.name);
                    }}
                  />
                  <div className="modal-details">
                    <p className="content-detail">
                      <strong>Age:</strong> {millie.age} years
                    </p>
                    <p className="content-description">{millie.description}</p>
                  </div>
                </>
              )}
              {activeModal === "dad" && mardis && (
                <>
                  <div className="modal-header">{mardis.name}</div>
                  <img
                    src={mardis.image}
                    alt={mardis.name}
                    className="content-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick(e, mardis.image, mardis.name);
                    }}
                  />
                  <div className="modal-details">
                    <p className="content-detail">
                      <strong>Age:</strong> {mardis.age} years
                    </p>
                    <p className="content-description">{mardis.description}</p>
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
