import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../secrets/firebase.js";

const Puppies: React.FC = () => {
  const [puppiesForSale, setPuppiesForSale] = useState<any[]>([]);
  const [parentNames, setParentNames] = useState<{ [key: string]: string }>({});
  const [currentPuppyIndex, setCurrentPuppyIndex] = useState(0);
  const [openParentId, setOpenParentId] = useState<string | null>(null);
  const [expandedImageId, setExpandedImageId] = useState<number | null>(null);

  useEffect(() => {
    // Fetch puppies and parents data from Firestore
    const fetchData = async () => {
      // Fetch puppies
      const puppiesSnapshot = await getDocs(collection(db, "puppies"));
      const puppies = puppiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch parent names
      const parentSet = new Set<string>();
      puppies.forEach((puppy) => {
        if (puppy.dad) parentSet.add(puppy.dad.id);
        if (puppy.mom) parentSet.add(puppy.mom.id);
      });

      const parentNames: { [key: string]: string } = {};
      await Promise.all(
        Array.from(parentSet).map(async (parentId) => {
          const parentDoc = await getDoc(doc(db, "family", parentId));
          if (parentDoc.exists()) {
            parentNames[parentId] = parentDoc.data().name;
          }
        })
      );

      setPuppiesForSale(puppies);
      setParentNames(parentNames);
    };

    fetchData();
  }, []);

  const handleOpenParentInfo = (parentId: string) => {
    setOpenParentId(parentId);
  };

  const handleCloseModal = () => {
    setOpenParentId(null);
  };

  const handleNext = () => {
    setCurrentPuppyIndex((prevIndex) => (prevIndex + 1) % puppiesForSale.length);
    setOpenParentId(null);
    setExpandedImageId(null);
  };

  const handlePrevious = () => {
    setCurrentPuppyIndex((prevIndex) =>
      prevIndex === 0 ? puppiesForSale.length - 1 : prevIndex - 1
    );
    setOpenParentId(null);
    setExpandedImageId(null);
  };

  const handleImageClick = (puppyId: number) => {
    setExpandedImageId(expandedImageId === puppyId ? null : puppyId);
  };

  const handleOutsideClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).classList.contains("image-expanded")) {
      setExpandedImageId(null);
    }
  };

  if (puppiesForSale.length === 0) {
    return <div>Loading puppies...</div>;
  }

  const currentPuppy = puppiesForSale[currentPuppyIndex];

  return (
    <div className="section-container" onClick={handleOutsideClick}>
      <h1 className="section-title">Puppies</h1>
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
              e.stopPropagation();
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
            {[currentPuppy.dad, currentPuppy.mom].map((parentRef) => (
              <button
                key={parentRef?.id}
                className="parent-link"
                onClick={() => handleOpenParentInfo(parentRef.id)}
              >
                Meet {parentNames[parentRef?.id] || "Unknown"}
              </button>
            ))}
          </div>
        </div>
        <button className="puppies-button" onClick={handleNext}>
          &gt;
        </button>
      </div>

      {openParentId && (
        <div className="modal">
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseModal}>
              &times;
            </button>
            <React.Suspense fallback={<div>Loading parent details...</div>}>
              <h2>{parentNames[openParentId]}</h2>
              {/* Add additional parent details here */}
            </React.Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default Puppies;
