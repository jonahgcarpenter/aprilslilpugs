import React, { useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../secrets/firebase";


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
    <div className="section-container" onClick={handleOutsideClick}>
      <h1 className="section-title">Meet the Puppies</h1>
      <div className="section-slideshow">
        <button className="puppies-button" onClick={handlePrevious}>
          &lt;
        </button>
        <div className="section-info">
          <img
            src={currentPuppy.image}
            alt={currentPuppy.name}
            className={`section-image ${
              expandedImageId === currentPuppy.id ? "image-expanded" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation(); // Prevent click from bubbling
              handleImageClick(currentPuppy.id);
            }}
          />
          <h2>{currentPuppy.name}</h2>
          <p>
            <strong>Age:</strong> {currentPuppy.age}
          </p>
          <p>{currentPuppy.description}</p>
          <h3>Parents</h3>
          <div className="section-parents-links">
            {dad && (
              <button className="parent-link" onClick={() => handleOpenModal("dad")}>
                Meet Dad
              </button>
            )}
            {mom && (
              <button className="parent-link" onClick={() => handleOpenModal("mom")}>
                Meet Mom
              </button>
            )}
          </div>
        </div>
        <button className="puppies-button" onClick={handleNext}>
          &gt;
        </button>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              ✖
            </button>
            {activeModal === "mom" && mom && (
              <div>
                <h2>{mom.name}</h2>
                <img
                  src={mom.image}
                  alt={mom.name}
                  className={`section-image ${
                    expandedImageId === "mom" ? "image-expanded" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick("mom");
                  }}
                />
                <p>
                  <strong>Age:</strong> {mom.age} years
                </p>
                <p>{mom.description}</p>
              </div>
            )}
            {activeModal === "dad" && dad && (
              <div>
                <h2>{dad.name}</h2>
                <img
                  src={dad.image}
                  alt={dad.name}
                  className={`section-image ${
                    expandedImageId === "dad" ? "image-expanded" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick("dad");
                  }}
                />
                <p>
                  <strong>Age:</strong> {dad.age} years
                </p>
                <p>{dad.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Puppies;
