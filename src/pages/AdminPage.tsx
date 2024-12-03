import '../styles/main.css';
import '../styles/adminpage.css';
import React, { useState, useEffect } from 'react';
import { addDoc, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../secrets/firebase';

const AdminPage = () => {
  const [puppyData, setPuppyData] = useState({
    name: '',
    age: '',
    description: '',
    image: '',
    mom: '/family/',
    dad: '/family/'
  });

  const [familyData, setFamilyData] = useState({
    name: '',
    age: '',
    description: '',
    image: ''
  });

  const [families, setFamilies] = useState<any[]>([]);
  const [editingFamily, setEditingFamily] = useState<any>(null);
  const [puppies, setPuppies] = useState<any[]>([]);
  const [editingPuppy, setEditingPuppy] = useState<any>(null);

  useEffect(() => {
    fetchFamilies();
    fetchPuppies();
  }, []);

  const fetchFamilies = async () => {
    try {
      const familyCollection = collection(db, 'family');
      const familySnapshot = await getDocs(familyCollection);
      const familyList = familySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFamilies(familyList);
    } catch (error) {
      alert('Error fetching families: ' + error);
    }
  };

  const fetchPuppies = async () => {
    try {
      const puppyCollection = collection(db, 'puppies');
      const puppySnapshot = await getDocs(puppyCollection);
      const puppyList = puppySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPuppies(puppyList);
    } catch (error) {
      alert('Error fetching puppies: ' + error);
    }
  };

  const handlePuppySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imagePath = `/images/${puppyData.name.toLowerCase().replace(/\s+/g, '_')}.jpg`;
      const puppyWithImage = {
        ...puppyData,
        image: imagePath
      };
      await addDoc(collection(db, 'puppies'), puppyWithImage);
      alert('Puppy added successfully!');
      setPuppyData({ name: '', age: '', description: '', image: '', mom: '', dad: '' });
      fetchPuppies();
    } catch (error) {
      alert('Error adding puppy: ' + error);
    }
  };

  const handleFamilySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imagePath = `/images/${familyData.name.toLowerCase().replace(/\s+/g, '_')}.jpg`;
      const familyWithImage = {
        ...familyData,
        image: imagePath
      };
      await addDoc(collection(db, 'families'), familyWithImage);
      alert('Family added successfully!');
      setFamilyData({ name: '', age: '', description: '', image: '' });
    } catch (error) {
      alert('Error adding family: ' + error);
    }
  };

  const handleEditFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFamily) return;
    
    try {
      const familyRef = doc(db, 'family', editingFamily.id);
      await updateDoc(familyRef, editingFamily);
      setEditingFamily(null);
      fetchFamilies();
      alert('Family updated successfully!');
    } catch (error) {
      alert('Error updating family: ' + error);
    }
  };

  const handleEditPuppy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPuppy) return;
    
    try {
      const puppyRef = doc(db, 'puppies', editingPuppy.id);
      await updateDoc(puppyRef, editingPuppy);
      setEditingPuppy(null);
      fetchPuppies();
      alert('Puppy updated successfully!');
    } catch (error) {
      alert('Error updating puppy: ' + error);
    }
  };

  const getRefPath = (ref: any) => {
    if (!ref) return '';
    return ref.path || ref;
  };

  const getFamilyNameFromRef = (ref: any) => {
    if (!ref) return 'Unknown';
    
    // Handle both string paths and Firestore references
    let familyId = '';
    if (typeof ref === 'string') {
      familyId = ref.split('/').pop() || '';
    } else if (ref.path) {
      familyId = ref.path.split('/').pop() || '';
    } else if (ref.id) {
      familyId = ref.id;
    }
  
    const family = families.find(f => f.id === familyId);
    return family?.name || 'Unknown';
  };

  return (
    <div id="adminMain">
      <h1>Database Management</h1>
      
      <div className="admin-section">
        <div>
          <h2>Add Puppy</h2>
          <form id="puppyForm" onSubmit={handlePuppySubmit}>
            <input
              type="text"
              placeholder="Name"
              value={puppyData.name}
              onChange={(e) => setPuppyData({...puppyData, name: e.target.value})}
            />
            <input
              type="text"
              placeholder="Age"
              value={puppyData.age}
              onChange={(e) => setPuppyData({...puppyData, age: e.target.value})}
            />
            <textarea
              placeholder="Description"
              value={puppyData.description}
              onChange={(e) => setPuppyData({...puppyData, description: e.target.value})}
            />
            <select
              value={puppyData.mom}
              onChange={(e) => setPuppyData({...puppyData, mom: e.target.value})}
            >
              <option value="">Select Mom</option>
              {families.map(family => (
                <option key={family.id} value={`/family/${family.id}`}>
                  {family.name}
                </option>
              ))}
            </select>
            <select
              value={puppyData.dad}
              onChange={(e) => setPuppyData({...puppyData, dad: e.target.value})}
            >
              <option value="">Select Dad</option>
              {families.map(family => (
                <option key={family.id} value={`/family/${family.id}`}>
                  {family.name}
                </option>
              ))}
            </select>
            <button type="submit">Add Puppy</button>
          </form>
        </div>

        <div>
          <h2>Add Family</h2>
          <form id="familyForm" onSubmit={handleFamilySubmit}>
            <input
              type="text"
              placeholder="Name"
              value={familyData.name}
              onChange={(e) => setFamilyData({...familyData, name: e.target.value})}
            />
            <input
              type="number"
              placeholder="Age"
              value={familyData.age}
              onChange={(e) => setFamilyData({...familyData, age: e.target.value})}
            />
            <textarea
              placeholder="Description"
              value={familyData.description}
              onChange={(e) => setFamilyData({...familyData, description: e.target.value})}
            />
            <button type="submit">Add Family</button>
          </form>
        </div>
      </div>

      <div className="admin-section">
        <h2>Existing Puppies</h2>
        <div id="puppyGrid">
          {puppies.map(puppy => (
            <div key={puppy.id} className="admin-card">
              {editingPuppy?.id === puppy.id ? (
                <form id="editPuppyForm" onSubmit={handleEditPuppy}>
                  <input
                    type="text"
                    value={editingPuppy.name}
                    onChange={e => setEditingPuppy({...editingPuppy, name: e.target.value})}
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={editingPuppy.age}
                    onChange={e => setEditingPuppy({...editingPuppy, age: e.target.value})}
                    placeholder="Age"
                  />
                  <textarea
                    value={editingPuppy.description}
                    onChange={e => setEditingPuppy({...editingPuppy, description: e.target.value})}
                    placeholder="Description"
                  />
                  <input
                    type="text"
                    value={editingPuppy.image}
                    onChange={e => setEditingPuppy({...editingPuppy, image: e.target.value})}
                    placeholder="Image path"
                  />
                  <select
                    value={editingPuppy.mom}
                    onChange={e => setEditingPuppy({...editingPuppy, mom: e.target.value})}
                  >
                    <option value={editingPuppy.mom}>
                      {getFamilyNameFromRef(editingPuppy.mom)}
                    </option>
                    {families.map(family => (
                      <option 
                        key={family.id} 
                        value={`/family/${family.id}`}
                      >
                        {family.name}
                      </option>
                    )).filter(option => option.props.value !== editingPuppy.mom)}
                  </select>
                  <select
                    value={editingPuppy.dad}
                    onChange={e => setEditingPuppy({...editingPuppy, dad: e.target.value})}
                  >
                    <option value={editingPuppy.dad}>
                      {getFamilyNameFromRef(editingPuppy.dad)}
                    </option>
                    {families.map(family => (
                      <option 
                        key={family.id} 
                        value={`/family/${family.id}`}
                      >
                        {family.name}
                      </option>
                    )).filter(option => option.props.value !== editingPuppy.dad)}
                  </select>
                  <div className="card-buttons">
                    <button type="submit" className="save-button">Save</button>
                    <button 
                      type="button"
                      className="cancel-button"
                      onClick={() => setEditingPuppy(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3>{puppy.name}</h3>
                  <p>Age: {puppy.age}</p>
                  <p>{puppy.description}</p>
                  <img 
                    src={puppy.image} 
                    alt={puppy.name}
                  />
                  <p>Mom: {getFamilyNameFromRef(puppy.mom)}</p>
                  <p>Dad: {getFamilyNameFromRef(puppy.dad)}</p>
                  <button 
                    className="edit-button"
                    onClick={() => setEditingPuppy(puppy)}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="admin-section">
        <h2>Existing Family</h2>
        <div id="familyGrid">
          {families.map(family => (
            <div key={family.id} className="admin-card">
              {editingFamily?.id === family.id ? (
                <form id="editFamilyForm" onSubmit={handleEditFamily}>
                  <input
                    type="text"
                    value={editingFamily.name}
                    onChange={e => setEditingFamily({...editingFamily, name: e.target.value})}
                  />
                  <input
                    type="number"
                    value={editingFamily.age}
                    onChange={e => setEditingFamily({...editingFamily, age: e.target.value})}
                  />
                  <textarea
                    value={editingFamily.description}
                    onChange={e => setEditingFamily({...editingFamily, description: e.target.value})}
                  />
                  <input
                    type="text"
                    value={editingFamily.image}
                    onChange={e => setEditingFamily({...editingFamily, image: e.target.value})}
                    placeholder="Image path"
                  />
                  <div className="card-buttons">
                    <button type="submit" className="save-button">Save</button>
                    <button 
                      type="button"
                      className="cancel-button"
                      onClick={() => setEditingFamily(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3>{family.name}</h3>
                  <p>Age: {family.age}</p>
                  <p>{family.description}</p>
                  <img 
                    src={family.image} 
                    alt={family.name}
                  />
                  <button 
                    className="edit-button"
                    onClick={() => setEditingFamily(family)}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;