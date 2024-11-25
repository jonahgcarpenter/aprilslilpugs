import React, { useState } from "react";

const Mardi: React.FC = () => {
  const [isExpanded, setExpanded] = useState(false);

  const handleImageClick = () => {
    setExpanded(!isExpanded);
  };

  const handleOutsideClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).classList.contains("image-expanded")) {
      setExpanded(false);
    }
  };

  return (
    <div onClick={handleOutsideClick}>
      <img
        src="/images/mardi.jpg"
        alt="Mardi"
        className={`section-image ${isExpanded ? "image-expanded" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          handleImageClick();
        }}
      />
      <h2>Mardi</h2>
      <p>
        <strong>Age:</strong> 4 years
      </p>
      <p>A calm and affectionate pug who enjoys lounging in the sun.</p>
    </div>
  );
};

export default Mardi;
