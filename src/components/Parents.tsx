import React, { useState } from 'react';
import '../styles/parents.css';

interface PetData {
  imageUrl: string;
  name: string;
  age: number;
  description: string;
  gender: string;
  isActive: boolean;
  updatedAt: any; // Using 'any' for Firebase timestamp
}

interface ParentsProps {
  millie: PetData | null;
  mardis: PetData | null; // Note: We keep this as 'mardis' for prop naming consistency
  onImageClick: (event: React.MouseEvent, image: string, description: string) => void;
}

const Parents: React.FC<ParentsProps> = ({ millie, mardis, onImageClick }) => {
  const [imgErrors, setImgErrors] = useState<{ [key: string]: boolean }>({});

  // Add debug logging
  React.useEffect(() => {
    console.log('Component rendered with props:', { millie, mardis });
  }, [millie, mardis]);

  React.useEffect(() => {
    if (millie) console.log('Millie image URL:', millie.imageUrl);
    if (mardis) console.log('Mardis image URL:', mardis.imageUrl);
  }, [millie, mardis]);

  const handleImageError = (petType: 'millie' | 'mardis') => {
    setImgErrors(prev => ({ ...prev, [petType]: true }));
    console.error('Image failed to load:', petType === 'millie' ? millie?.imageUrl : mardis?.imageUrl);
  };

  const getFallbackImage = () => '/path/to/fallback-image.png';

  return (
    <div className="pets-container">
      <div className="pets-grid">
        {/* Add debug message if no pets */}
        {!millie && !mardis && (
          <div className="no-pets-message">
            <p>No pet data available</p>
            <p>Debug info: Millie: {JSON.stringify(!!millie)}, Mardis: {JSON.stringify(!!mardis)}</p>
          </div>
        )}
        
        {/* Add debug info to each pet card */}
        {millie && millie.isActive && (
          <div className="pet-card" data-testid="millie-card">
            <div className="image-container">
              <img
                src={imgErrors['millie'] ? getFallbackImage() : millie.imageUrl}
                alt={`${millie.name} - ${millie.gender === 'female' ? 'Female' : 'Male'} Dog`}
                onClick={(e) => !imgErrors['millie'] && onImageClick(e, millie.imageUrl, millie.name)}
                className={`pet-image ${imgErrors['millie'] ? 'image-error' : ''}`}
                onError={() => handleImageError('millie')}
              />
            </div>
            <div className="pet-info">
              <h3 className="pet-name">{millie.name}</h3>
              <p className="pet-age">Age: {millie.age} {millie.age === 1 ? 'year' : 'years'}</p>
              <p className="pet-gender">Gender: {millie.gender.charAt(0).toUpperCase() + millie.gender.slice(1)}</p>
              <p className="pet-description">{millie.description}</p>
            </div>
          </div>
        )}
        
        {mardis && mardis.isActive && (
          <div className="pet-card" data-testid="mardis-card">
            <div className="image-container">
              <img
                src={imgErrors['mardis'] ? getFallbackImage() : mardis.imageUrl}
                alt={`${mardis.name} - ${mardis.gender === 'female' ? 'Female' : 'Male'} Dog`}
                onClick={(e) => !imgErrors['mardis'] && onImageClick(e, mardis.imageUrl, mardis.name)}
                className={`pet-image ${imgErrors['mardis'] ? 'image-error' : ''}`}
                onError={() => handleImageError('mardis')}
              />
            </div>
            <div className="pet-info">
              <h3 className="pet-name">{mardis.name}</h3>
              <p className="pet-age">Age: {mardis.age} {mardis.age === 1 ? 'year' : 'years'}</p>
              <p className="pet-gender">Gender: {mardis.gender.charAt(0).toUpperCase() + mardis.gender.slice(1)}</p>
              <p className="pet-description">{mardis.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add displayName for debugging
Parents.displayName = 'Parents';

export default Parents;