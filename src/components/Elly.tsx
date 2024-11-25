import React, { useState } from "react";

const Elly: React.FC = () => {
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
        src="/images/elly.jpg"
        alt="Elly"
        className={`section-image ${isExpanded ? "image-expanded" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          handleImageClick();
        }}
      />
      <h2>Elly</h2>
      <p>
        <strong>Age:</strong> 2 years
      </p>
      <p>A curious pug who loves exploring the garden and chasing butterflies.</p>
    </div>
  );
};

export default Elly;
