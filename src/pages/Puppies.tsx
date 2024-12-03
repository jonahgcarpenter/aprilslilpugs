import React, { useState, useEffect } from "react";
import '../styles/main.css';
import '../styles/family_puppies.css';
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../secrets/firebase";
import Footer from "../components/Footer";
import Live from "../components/Live";
import Waitlist from "../components/Waitlist";

const Puppies: React.FC = () => {
  const [puppies, setPuppies] = useState<any[]>([]);
  const [currentPuppyIndex, setCurrentPuppyIndex] = useState(0);
  const [activeModal, setActiveModal] = useState<"mom" | "dad" | null>(null); // Modal state
  const [mom, setMom] = useState<any | null>(null); // Mom's data
  const [dad, setDad] = useState<any | null>(null); // Dad's data
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null);

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
        const momDoc = await getDoc(doc(db, "family", "U0zC1dbHPibdoC1vlIEk")); // Replace with actual mom document ID
        const dadDoc = await getDoc(doc(db, "family", "xNtokSGQEtUjIoJ3bsz7")); // Replace with actual dad document ID

        if (momDoc.exists()) {
          setMom(momDoc.data());
        }
        if (dadDoc.exists()) {
          setDad(dadDoc.data());
        }
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

  const handleImageClick = (imageId: string) => {
    setExpandedImageId(expandedImageId === imageId ? null : imageId);
  };

  const handleOutsideClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).classList.contains("image-expanded")) {
      setExpandedImageId(null); // Close expanded image
    }
  };

  if (puppies.length === 0) {
    return <div>Loading puppies...</div>;
  }

  const currentPuppy = puppies[currentPuppyIndex];

  return (
    <>
      <div className="page-container">
        <Live />
        <section className="content-section" onClick={handleOutsideClick}>
          <h1 className="section-title">Meet the Puppies</h1>
          <div className="slideshow-container">
            <div className="content-card">
              <img
                src={currentPuppy.image}
                alt={currentPuppy.name}
                className={`content-image ${
                  expandedImageId === currentPuppy.id ? "image-expanded" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent click from bubbling
                  handleImageClick(currentPuppy.id);
                }}
              />
              
              <div className="navigation-controls">
                <button className="prev-button" onClick={handlePrevious}>
                  &lt;
                </button>
                <div className="puppy-info">
                  <h2 className="content-subtitle">{currentPuppy.name}</h2>
                  <p className="content-detail">
                    <strong>Age:</strong> {currentPuppy.age}
                  </p>
                  <p className="content-description">{currentPuppy.description}</p>
                </div>
                <button className="next-button" onClick={handleNext}>
                  &gt;
                </button>
              </div>
              
              <div className="parents-section">
                <h3 className="parents-title">Meet The Parents</h3>
                <div className="button-container">
                  {dad && (
                    <button className="action-button" onClick={() => handleOpenModal("dad")}>
                      Meet Dad
                    </button>
                  )}
                  {mom && (
                    <button className="action-button" onClick={() => handleOpenModal("mom")}>
                      Meet Mom
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="waitlist-section">
            <Waitlist />
          </div>
        </section>

        {/* Modal */}
        {activeModal && (
          <div className="modal" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
              {activeModal === "mom" && mom && (
                <div>
                  <h2 className="section-title">{mom.name}</h2>
                  <img
                    src={mom.image}
                    alt={mom.name}
                    className="content-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick("mom");
                    }}
                  />
                  <p className="content-detail">
                    <strong>Age:</strong> {mom.age} years
                  </p>
                  <p className="content-description">{mom.description}</p>
                </div>
              )}
              {activeModal === "dad" && dad && (
                <div>
                  <h2 className="section-title">{dad.name}</h2>
                  <img
                    src={dad.image}
                    alt={dad.name}
                    className="content-image"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageClick("dad");
                    }}
                  />
                  <p className="content-detail">
                    <strong>Age:</strong> {dad.age} years
                  </p>
                  <p className="content-description">{dad.description}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Puppies;
