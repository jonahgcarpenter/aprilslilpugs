import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../secrets/firebase';

const ProfilePicture: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [docId, setDocId] = useState<string>('');

  useEffect(() => {
    fetchExistingProfilePicture();
  }, []);

  const fetchExistingProfilePicture = async () => {
    const querySnapshot = await getDocs(collection(db, 'profilePictures'));
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      setDocId(doc.id);
      setPreviewUrl(doc.data().imageUrl);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSubmit = async () => {
    if (!selectedImage) return;

    setUploading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profilePictures/profile_picture`);
      
      await uploadBytes(storageRef, selectedImage);
      const downloadURL = await getDownloadURL(storageRef);

      const data = {
        imageUrl: downloadURL,
        updatedAt: Date.now(),
        fileName: selectedImage.name
      };

      if (docId) {
        await updateDoc(doc(db, 'profilePictures', docId), data);
      } else {
        // Create first entry if none exists
        const docRef = doc(collection(db, 'profilePictures'));
        await setDoc(docRef, data);
        setDocId(docRef.id);
      }

      setSelectedImage(null);
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
    setUploading(false);
  };

  return (
    <div>
      {previewUrl && (
        <div style={{ marginBottom: '1rem' }}>
          <img 
            src={previewUrl} 
            alt="Profile preview" 
            style={{ maxWidth: '200px', maxHeight: '200px' }}
          />
        </div>
      )}
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {selectedImage && (
        <button onClick={handleSubmit} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Update Profile Picture'}
        </button>
      )}
    </div>
  );
};

export default ProfilePicture;