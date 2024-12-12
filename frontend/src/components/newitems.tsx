import '../styles/newitems.css';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { storage, db } from '../secrets/firebase';
import { useState, useEffect, useRef } from 'react';

const NewItems = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddingPuppy, setIsAddingPuppy] = useState(true);
  const [age, setAge] = useState('');
  const [mom, setMom] = useState('');
  const [dad, setDad] = useState('');
  const [familyDogs, setFamilyDogs] = useState<Array<{id: string, name: string, gender: string}>>([]);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isActive, setIsActive] = useState(true);
  const [gender, setGender] = useState('');

  useEffect(() => {
    const fetchFamilyDogs = async () => {
      const familyRef = collection(db, 'family');
      const snapshot = await getDocs(familyRef);
      const dogs = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        gender: doc.data().gender
      }));
      setFamilyDogs(dogs);
    };
    fetchFamilyDogs();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  const handleFiles = (file: File) => {
    setImage(file);
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    
    setLoading(true);
    try {
      const storageRef = ref(storage, `images/${image.name}`);
      await uploadBytes(storageRef, image);
      const imageUrl = await getDownloadURL(storageRef);

      // Find the selected parent names instead of using IDs
      const selectedMom = familyDogs.find(dog => dog.id === mom)?.name || '';
      const selectedDad = familyDogs.find(dog => dog.id === dad)?.name || '';

      const collectionRef = collection(db, isAddingPuppy ? 'puppies' : 'family');
      const data = isAddingPuppy ? {
        name,
        description,
        imageUrl,
        age,
        mom: selectedMom,    // Store name instead of ID
        dad: selectedDad,    // Store name instead of ID
        gender,           // Add gender field for puppies
        isActive,
        createdAt: new Date(),
      } : {
        name,
        description,
        imageUrl,
        age,
        gender,
        isActive,
        createdAt: new Date(),
      };

      await addDoc(collectionRef, data);

      // Reset all fields
      setName('');
      setDescription('');
      setImage(null);
      setAge('');
      setMom('');
      setDad('');
      setGender('');
      alert('Successfully added new item!');
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Error adding item');
    }
    setLoading(false);
  };

  return (
    <div className="new-items-container">
      <h2 className="new-items-header">
        {isAddingPuppy ? 'Add New Puppy' : 'Add New Family'}
      </h2>
      <div className="new-items-form-toggle">
        <button 
          type="button" 
          onClick={() => setIsAddingPuppy(true)}
          className={`new-items-toggle-btn ${isAddingPuppy ? 'new-items-toggle-btn-active' : ''}`}
        >
          Add Puppy
        </button>
        <button 
          type="button" 
          onClick={() => setIsAddingPuppy(false)}
          className={`new-items-toggle-btn ${!isAddingPuppy ? 'new-items-toggle-btn-active' : ''}`}
        >
          Add Family Dog
        </button>
      </div>

      <form onSubmit={handleSubmit} className="new-items-form">
        <div className="new-items-toggle-container">
          <label className="new-items-toggle-switch">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <span className="new-items-slider new-items-round"></span>
          </label>
          <span className="new-items-toggle-label">
            {isActive ? 'Currently Active' : 'Archived'}
          </span>
        </div>

        <input
          className="new-items-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
        
        <input
          className="new-items-input"
          type="text"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age"
          required
        />

        {!isAddingPuppy && (
          <select value={gender} onChange={(e) => setGender(e.target.value)} required className="new-items-select">
            <option value="">Select Gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        )}

        {isAddingPuppy && (
          <>
            <select value={gender} onChange={(e) => setGender(e.target.value)} required className="new-items-select">
              <option value="">Select Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </select>
            <select value={mom} onChange={(e) => setMom(e.target.value)} required className="new-items-select">
              <option value="">Select Mom</option>
              {familyDogs
                .filter(dog => dog.gender === 'female')
                .map(dog => (
                  <option key={dog.id} value={dog.id}>{dog.name}</option>
                ))}
            </select>
            <select value={dad} onChange={(e) => setDad(e.target.value)} required className="new-items-select">
              <option value="">Select Dad</option>
              {familyDogs
                .filter(dog => dog.gender === 'male')
                .map(dog => (
                  <option key={dog.id} value={dog.id}>{dog.name}</option>
                ))}
            </select>
          </>
        )}

        <textarea
          className="new-items-input"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
        />
        
        <div
          className={`new-items-upload-box ${dragActive ? 'new-items-upload-box-active' : ''}`}
          onClick={onButtonClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
            style={{ display: 'none' }}
          />
          
          {preview ? (
            <div className="new-items-image-preview">
              <img src={preview} alt="Preview" />
              <button 
                type="button" 
                className="new-items-remove-image"
                onClick={(e) => {
                  e.stopPropagation();
                  setImage(null);
                  setPreview(null);
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="new-items-upload-prompt">
              <i className="new-items-upload-icon">📁</i>
              <p>Drag and drop an image here, or click to select</p>
            </div>
          )}
        </div>
        
        <button type="submit" disabled={loading} className="new-items-button">
          {loading ? 'Adding...' : `Add New ${isAddingPuppy ? 'Puppy' : 'Family Dog'}`}
        </button>
      </form>
    </div>
  );
};

export default NewItems;