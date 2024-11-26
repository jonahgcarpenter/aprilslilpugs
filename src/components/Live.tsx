import React, { useState, useEffect } from "react";
import ContactMe from "./ContactMe";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../secrets/firebase.js"; // Adjust path to your Firebase config

const Live: React.FC = () => {
  const [activeModal, setActiveModal] = useState<"mom" | "dad" | null>(null); // Modal state
  const [mom, setMom] = useState<any | null>(null); // Mom's data
  const [dad, setDad] = useState<any | null>(null); // Dad's data
  const [expandedImageId, setExpandedImageId] = useState<string | null>(null); // Image expansion state

  // Fetch mom and dad data from Firestore
  useEffect(() => {
    const fetchParents = async () => {
      try {
        const momDoc = await getDoc(doc(db, "family", "U0zC1dbHPibdoC1vlIEk")); // Replace with actual mom's document ID
        const dadDoc = await getDoc(doc(db, "family", "xNtokSGQEtUjIoJ3bsz7")); // Replace with actual dad's document ID

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

  // Handlers for modal
  const handleOpenModal = (modalType: "mom" | "dad") => {
    setActiveModal(modalType);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setExpandedImageId(null); // Close any expanded image
  };

  // Handlers for image expansion
  const handleImageClick = (imageId: string) => {
    setExpandedImageId(expandedImageId === imageId ? null : imageId);
  };

  const handleOutsideClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).classList.contains("image-expanded")) {
      setExpandedImageId(null); // Close expanded image
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <main style={{ flex: "1 0 auto" }}>
        <section id="live" className="section-container">
          <h1 className="section-title">April's Lil Pugs Live</h1>
          <div className="iframe-container">
            <iframe
              className="live-iframe"
              src="https://www.youtube.com/embed/live_stream?channel=UCGoYuWwpBLy4oVw1_c7P06Q"
              title="Puppies Live Stream"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
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
        </section>
      </main>
  
      {/* Footer */}
      <footer className="section-footer" style={{ flexShrink: 0 }}>
        <ContactMe />
      </footer>
    </div>
  );
};

export default Live;
