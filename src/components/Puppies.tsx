import React, { useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../secrets/firebase.js"; // Adjust path to your Firebase config

const Puppies: React.FC = () => {
  const [puppies, setPuppies] = useState<any[]>([]);
  const [currentPuppyIndex, setCurrentPuppyIndex] = useState(0);
  const [openParentId, setOpenParentId] = useState<string | null>(null);
  const [parentDetails, setParentDetails] = useState<any | null>(null);
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

  // Fetch parent details dynamically
  const fetchParentDetails = async (parentId: string) => {
    try {
      const parentDoc = await getDoc(doc(db, "family", parentId));
      if (parentDoc.exists()) {
        setParentDetails(parentDoc.data());
        setOpenParentId(parentId);
      }
    } catch (error) {
      console.error("Error fetching parent details: ", error);
    }
  };

  const handleOpenParentModal = (parentId: string) => {
    fetchParentDetails(parentId);
  };

  const handleCloseModal = () => {
    setOpenParentId(null);
    setParentDetails(null);
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
            {currentPuppy.dad && (
              <button
                className="parent-link"
                onClick={() => handleOpenParentModal(currentPuppy.dad.id)}
              >
                Meet Dad
              </button>
            )}
            {currentPuppy.mom && (
              <button
                className="parent-link"
                onClick={() => handleOpenParentModal(currentPuppy.mom.id)}
              >
                Meet Mom
              </button>
            )}
          </div>
        </div>
        <button className="puppies-button" onClick={handleNext}>
          &gt;
        </button>
      </div>

      {/* Modal for parent details */}
      {openParentId && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseModal}>
              &times;
            </button>
            <React.Suspense fallback={<div>Loading parent details...</div>}>
              {parentDetails && (
                <>
                  <img
                    src={parentDetails.image}
                    alt={parentDetails.name}
                    className={`section-image ${
                      expandedImageId === openParentId ? "image-expanded" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent click from bubbling
                      handleImageClick(openParentId);
                    }}
                  />
                  <h2>{parentDetails.name}</h2>
                  <p>
                    <strong>Age:</strong> {parentDetails.age} years
                  </p>
                  <p>{parentDetails.description}</p>
                </>
              )}
            </React.Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default Puppies;
