import React from "react";

const Millie: React.FC = () => {
  return (
    <div>
      <img
        src="/images/millie.jpg"
        alt="Millie"
        style={{ width: "100%", borderRadius: "10px" }}
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
