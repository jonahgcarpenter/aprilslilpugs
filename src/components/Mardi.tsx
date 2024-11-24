import React from "react";

const Mardi: React.FC = () => {
  return (
    <div>
      <img
        src="/images/mardi.jpg"
        alt="Mardi"
        style={{ width: "100%", borderRadius: "10px" }}
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
