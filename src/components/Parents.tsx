import React, { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../secrets/firebase";
import '../styles/parents.css';

interface PetData {
  imageUrl: string;
  name: string;
  age: number;
  description: string;
  gender: string;
  isActive: boolean;
  updatedAt: any;
}

interface ParentsProps {
  momName: string;
  dadName: string;
}

const Parents: React.FC<ParentsProps> = ({ momName, dadName }) => {
  const [mom, setMom] = useState<PetData | null>(null);
  const [dad, setDad] = useState<PetData | null>(null);
  const [imgErrors, setImgErrors] = useState<{ [key: string]: boolean }>({});
  const [modalImage, setModalImage] = useState<{ url: string, description: string } | null>(null);

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const familyRef = collection(db, "family");
        const querySnapshot = await getDocs(familyRef);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data() as PetData;
          if (data.name === momName) {
            setMom({
              ...data,
              imageUrl: data.imageUrl || data.image,
              isActive: true
            });
          } else if (data.name === dadName) {
            setDad({
              ...data,
              imageUrl: data.imageUrl || data.image,
              isActive: true
            });
          }
        });
      } catch (error) {
        console.error("Error fetching parent data:", error);
      }
    };

    fetchParents();
  }, [momName, dadName]);

  const handleImageError = (petType: 'mom' | 'dad') => {
    setImgErrors(prev => ({ ...prev, [petType]: true }));
    console.error('Image failed to load:', petType === 'mom' ? mom?.imageUrl : dad?.imageUrl);
  };

  const getFallbackImage = () => '/path/to/fallback-image.png';

  const handleImageClick = (url: string, description: string) => {
    setModalImage({ url, description });
  };

  const handleCloseModal = () => {
    setModalImage(null);
  };

  return (
    <>
      <div className="parents-container">
        <div className="parents-grid">
          {!mom && !dad && (
            <div className="no-pets-message">
              <p>Loading parents...</p>
            </div>
          )}
          
          {mom && mom.isActive && (
            <div className="parent-card" data-testid="mom-card">
              <div className="parentimage-container">
                <img
                  src={imgErrors['mom'] ? getFallbackImage() : mom.imageUrl}
                  alt={`${mom.name} - ${mom.gender === 'female' ? 'Female' : 'Male'} Dog`}
                  onClick={() => !imgErrors['mom'] && handleImageClick(mom.imageUrl, mom.name)}
                  className={`parent-image ${imgErrors['mom'] ? 'image-error' : ''}`}
                  onError={() => handleImageError('mom')}
                />
              </div>
              <div className="parent-info">
                <h3 className="parent-name">{mom.name}</h3>
                <p className="parent-age">Age: {mom.age} {mom.age === 1 ? 'year' : 'years'}</p>
                <p className="parent-gender">Gender: {mom.gender.charAt(0).toUpperCase() + mom.gender.slice(1)}</p>
                <p className="parent-description">{mom.description}</p>
              </div>
            </div>
          )}
          
          {dad && dad.isActive && (
            <div className="parent-card" data-testid="dad-card">
              <div className="parentimage-container">
                <img
                  src={imgErrors['dad'] ? getFallbackImage() : dad.imageUrl}
                  alt={`${dad.name} - ${dad.gender === 'female' ? 'Female' : 'Male'} Dog`}
                  onClick={() => !imgErrors['dad'] && handleImageClick(dad.imageUrl, dad.name)}
                  className={`parent-image ${imgErrors['dad'] ? 'image-error' : ''}`}
                  onError={() => handleImageError('dad')}
                />
              </div>
              <div className="parent-info">
                <h3 className="parent-name">{dad.name}</h3>
                <p className="parent-age">Age: {dad.age} {dad.age === 1 ? 'year' : 'years'}</p>
                <p className="parent-gender">Gender: {dad.gender.charAt(0).toUpperCase() + dad.gender.slice(1)}</p>
                <p className="parent-description">{dad.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {modalImage && (
        <div className="parentimage-modal" onClick={handleCloseModal}>
          <div className="parentmodal-content" onClick={e => e.stopPropagation()}>
            <button className="parentmodal-close" onClick={handleCloseModal}>×</button>
            <div className="parentmodal-header">{modalImage.description}</div>
            <img 
              src={modalImage.url} 
              alt={modalImage.description} 
              className="parentmodal-image"
            />
          </div>
        </div>
      )}
    </>
  );
};

Parents.displayName = 'Parents';

export default Parents;