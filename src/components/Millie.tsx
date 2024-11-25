import React, { useState } from "react";

const Millie: React.FC = () => {
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
        src="/images/millie.jpg"
        alt="Millie"
        className={`section-image ${isExpanded ? "image-expanded" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          handleImageClick();
        }}
      />
      <h2>Millie</h2>
      <p>
        <strong>Age:</strong> 3 years
      </p>
      <p>A sweet pug who loves cuddles and spending time with family.</p>
    </div>
  );
};

export default Millie;
