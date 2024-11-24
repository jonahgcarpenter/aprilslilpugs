import React, { useState } from "react";

const Media: React.FC = () => {
  // Array of media with descriptions
  const media = [
    { type: "image", src: "/src/images/pug1.jpg", description: "Adorable pug puppy" },
    { type: "image", src: "/src/images/pug2.jpg", description: "Playful pug in the grass" },
    { type: "video", src: "/src/videos/pug1.mp4", description: "Pug playing in the park" },
    { type: "video", src: "/src/videos/pug2.mp4", description: "Pug running happily" },
    { type: "image", src: "/src/images/pug3.jpg", description: "Pug enjoying the sunshine" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextMedia = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % media.length);
  };

  const prevMedia = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
  };

  return (
    <section id="media" className="media-container">
      <div className="media">
        {media[currentIndex].type === "image" ? (
          <img
            src={media[currentIndex].src}
            alt={media[currentIndex].description}
            className="media-item"
          />
        ) : (
          <video
            src={media[currentIndex].src}
            className="media-item"
            autoPlay
            muted
            loop
          />
        )}
        <p className="media-description">{media[currentIndex].description}</p>
      </div>
      <div className="media-controls">
        <button onClick={prevMedia} className="media-button">
          Previous
        </button>
        <button onClick={nextMedia} className="media-button">
          Next
        </button>
      </div>
    </section>
  );
};

export default Media;
