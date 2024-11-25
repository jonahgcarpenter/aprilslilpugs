import React, { useState } from "react";
import ContactMe from "./ContactMe";
import Millie from "./Millie";
import Mardi from "./Mardi";

const Live: React.FC = () => {
  const [activeModal, setActiveModal] = useState<"millie" | "mardi" | null>(null); // Modal state

  // Handler to open modal
  const handleOpenModal = (modalType: "millie" | "mardi") => {
    setActiveModal(modalType);
  };

  // Handler to close modal
  const handleCloseModal = () => {
    setActiveModal(null);
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
            <button className="parent-link" onClick={() => handleOpenModal("millie")}>
              Meet Mom
            </button>
            <button className="parent-link" onClick={() => handleOpenModal("mardi")}>
              Meet Dad
            </button>
          </div>
  
          {/* Modal */}
          {activeModal && (
            <div className="modal" onClick={handleCloseModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={handleCloseModal}>
                  ✖
                </button>
                {activeModal === "millie" && <Millie />}
                {activeModal === "mardi" && <Mardi />}
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
