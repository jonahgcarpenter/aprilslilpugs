import React from "react";

const Penny: React.FC = () => {
  return (
    <div>
      <img
        src="/images/penny.jpg"
        alt="Penny"
        style={{ width: "100%", borderRadius: "10px" }}
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
