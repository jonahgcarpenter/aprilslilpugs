import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../secrets/firebase';
import '../styles/meetthebreeder.css';

const MeetTheBreeder: React.FC = () => {
  const [profileUrl, setProfileUrl] = useState<string>('/images/april-pug-profile.jpg');

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'profilePictures'));
        if (!querySnapshot.empty) {
          const profileData = querySnapshot.docs[0].data();
          setProfileUrl(profileData.imageUrl);
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
      }
    };

    fetchProfilePicture();
  }, []);

  return (
    <div className="breeder-section">
      <h2 className="content-subtitle">Meet the Breeder</h2>
      <p className="breeder-description">
        Pug Breeder in Tupelo, Mississippi
      </p>
      <div className="profilepic-container">
        <img src={profileUrl} alt="April Carpenter - Pug Breeder" />
      </div>
      <p className="breeder-description">
        Hi, I'm April Carpenter! As a dedicated Pug breeder based in Tupelo, Mississippi, 
        I'm committed to breeding healthy, happy Pug puppies that bring joy 
        to families.
      </p>
      <p className="breeder-description">
        Our puppies are raised in our home with love and attention, ensuring they are 
        well-socialized and ready to become cherished members of their new families. 
        We follow strict health testing protocols and focus on breeding Pugs with 
        excellent temperaments, health, and breed standard conformation.
      </p>
    </div>
  );
};

export default MeetTheBreeder;
