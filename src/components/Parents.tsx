import React from 'react';

interface ParentData {
  image: string;
  name: string;
  age: string;
  description: string;
}

interface ParentsProps {
  mom: ParentData | null;
  dad: ParentData | null;
  onImageClick: (event: React.MouseEvent, image: string, description: string) => void;
}

const Parents: React.FC<ParentsProps> = ({ mom, dad, onImageClick }) => {
  return (
    <div className="parents-container">
      <div className="parents-grid">
        {dad && (
          <div className="parent-card">
            <img
              src={dad.image}
              alt={dad.name}
              onClick={(e) => onImageClick(e, dad.image, dad.name)}
            />
            <h3>{dad.name}</h3>
            <p className="content-detail">
              <strong>Age:</strong> {dad.age} years
            </p>
            <p className="content-description">{dad.description}</p>
          </div>
        )}
        {mom && (
          <div className="parent-card">
            <img
              src={mom.image}
              alt={mom.name}
              onClick={(e) => onImageClick(e, mom.image, mom.name)}
            />
            <h3>{mom.name}</h3>
            <p className="content-detail">
              <strong>Age:</strong> {mom.age} years
            </p>
            <p className="content-description">{mom.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Parents;