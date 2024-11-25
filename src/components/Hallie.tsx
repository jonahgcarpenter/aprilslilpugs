import React, { useState } from "react";

const Hallie: React.FC = () => {
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
        src="/images/hallie.jpg"
        alt="Hallie"
        className={`section-image ${isExpanded ? "image-expanded" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          handleImageClick();
        }}
      />
      <h2>Hallie</h2>
      <p>
        <strong>Age:</strong> 2 years
      </p>
      <p>An adventurous pug who loves exploring trails and playing in the park.</p>
    </div>
  );
};

export default Hallie;
