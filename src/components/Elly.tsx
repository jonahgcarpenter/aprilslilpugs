import React from "react";

const Elly: React.FC = () => {
  return (
    <div>
      <img
        src="/images/elly.jpg"
        alt="Elly"
        style={{ width: "100%", borderRadius: "10px" }}
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
