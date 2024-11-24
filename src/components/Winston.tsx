import React from "react";

const Winston: React.FC = () => {
  return (
    <div>
      <img
        src="/images/winston.jpg"
        alt="Winston"
        style={{ width: "100%", borderRadius: "10px" }}
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
