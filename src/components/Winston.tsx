import React, { useState } from "react";

const Winston: React.FC = () => {
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
        src="/images/winston.jpg"
        alt="Winston"
        className={`section-image ${isExpanded ? "image-expanded" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          handleImageClick();
        }}
      />
      <h2>Winston</h2>
      <p>
        <strong>Age:</strong> 3 years
      </p>
      <p>A brave and friendly pug who loves going on adventures.</p>
    </div>
  );
};

export default Winston;
