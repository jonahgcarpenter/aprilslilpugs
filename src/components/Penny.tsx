import React, { useState } from "react";

const Penny: React.FC = () => {
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
        src="/images/penny.jpg"
        alt="Penny"
        className={`section-image ${isExpanded ? "image-expanded" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          handleImageClick();
        }}
      />
      <h2>Penny</h2>
      <p>
        <strong>Age:</strong> 1 year
      </p>
      <p>An energetic and playful pug who loves to run and fetch toys.</p>
    </div>
  );
};

export default Penny;
