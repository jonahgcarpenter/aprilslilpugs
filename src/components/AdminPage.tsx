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
      const puppyWithImage = {
        ...puppyData,
        image: `/images/${puppyData.name.toLowerCase().replace(/\s+/g, '_')}.jpg`
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
      const familyWithImage = {
        ...familyData,
        image: `/images/${familyData.name.toLowerCase().replace(/\s+/g, '_')}.jpg`
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
      const updatedFamily = {
        ...editingFamily,
        image: `/images/${editingFamily.name.toLowerCase().replace(/\s+/g, '_')}.jpg`
      };
      const familyRef = doc(db, 'family', editingFamily.id);
      await updateDoc(familyRef, updatedFamily);
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
      const updatedPuppy = {
        ...editingPuppy,
        image: `/images/${editingPuppy.name.toLowerCase().replace(/\s+/g, '_')}.jpg`
      };
      const puppyRef = doc(db, 'puppies', editingPuppy.id);
      await updateDoc(puppyRef, updatedPuppy);
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
    <div style={{
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{
        textAlign: 'center',
        color: '#333',
        marginBottom: '40px'
      }}>Database Management</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        marginBottom: '40px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#444' }}>Add New Puppy</h2>
          <form onSubmit={handlePuppySubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <input
              style={inputStyle}
              type="text"
              placeholder="Name (e.g., 'Available Female Puppy')"
              value={puppyData.name}
              onChange={(e) => setPuppyData({...puppyData, name: e.target.value})}
            />
            <input
              style={inputStyle}
              type="text"
              placeholder="Age (e.g., '3 weeks')"
              value={puppyData.age}
              onChange={(e) => setPuppyData({...puppyData, age: e.target.value})}
            />
            <textarea
              style={{...inputStyle, minHeight: '100px'}}
              placeholder="Description"
              value={puppyData.description}
              onChange={(e) => setPuppyData({...puppyData, description: e.target.value})}
            />
            <select
              style={inputStyle}
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
              style={inputStyle}
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
            <button type="submit" style={buttonStyle}>Add Puppy</button>
          </form>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ marginBottom: '20px', color: '#444' }}>Add New Family</h2>
          <form onSubmit={handleFamilySubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <input
              style={inputStyle}
              type="text"
              placeholder="Family Name"
              value={familyData.name}
              onChange={(e) => setFamilyData({...familyData, name: e.target.value})}
            />
            <input
              style={inputStyle}
              type="number"
              placeholder="Age"
              value={familyData.age}
              onChange={(e) => setFamilyData({...familyData, age: e.target.value})}
            />
            <textarea
              style={{...inputStyle, minHeight: '100px'}}
              placeholder="Description"
              value={familyData.description}
              onChange={(e) => setFamilyData({...familyData, description: e.target.value})}
            />
            <button type="submit" style={buttonStyle}>Add Family</button>
          </form>
        </div>
      </div>

      <div style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        marginBottom: '40px'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#444' }}>Existing Puppies</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {puppies.map(puppy => (
            <div key={puppy.id} style={{
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {editingPuppy?.id === puppy.id ? (
                <form onSubmit={handleEditPuppy} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}>
                  <input
                    style={inputStyle}
                    type="text"
                    value={editingPuppy.name}
                    onChange={e => setEditingPuppy({...editingPuppy, name: e.target.value})}
                    placeholder="Name"
                  />
                  <input
                    style={inputStyle}
                    type="text"
                    value={editingPuppy.age}
                    onChange={e => setEditingPuppy({...editingPuppy, age: e.target.value})}
                    placeholder="Age"
                  />
                  <textarea
                    style={{...inputStyle, minHeight: '100px'}}
                    value={editingPuppy.description}
                    onChange={e => setEditingPuppy({...editingPuppy, description: e.target.value})}
                    placeholder="Description"
                  />
                  <input
                    style={inputStyle}
                    type="text"
                    value={editingPuppy.image}
                    onChange={e => setEditingPuppy({...editingPuppy, image: e.target.value})}
                    placeholder="Image path"
                  />
                  <select
                    style={inputStyle}
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
                    style={inputStyle}
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
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={buttonStyle}>Save</button>
                    <button 
                      type="button" 
                      style={{...buttonStyle, backgroundColor: '#666'}}
                      onClick={() => setEditingPuppy(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3 style={{ marginBottom: '10px', color: '#333' }}>{puppy.name}</h3>
                  <p style={{ margin: '5px 0', color: '#666' }}>Age: {puppy.age}</p>
                  <p style={{ margin: '5px 0', color: '#666' }}>{puppy.description}</p>
                  <img 
                    src={puppy.image} 
                    alt={puppy.name} 
                    style={{ 
                      maxWidth: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }} 
                  />
                  <p style={{ margin: '5px 0', color: '#666' }}>Mom: {getFamilyNameFromRef(puppy.mom)}</p>
                  <p style={{ margin: '5px 0', color: '#666' }}>Dad: {getFamilyNameFromRef(puppy.dad)}</p>
                  <button 
                    onClick={() => setEditingPuppy(puppy)}
                    style={{...buttonStyle, width: '100%'}}
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '20px', color: '#444' }}>Existing Families</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {families.map(family => (
            <div key={family.id} style={{
              padding: '15px',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              {editingFamily?.id === family.id ? (
                <form onSubmit={handleEditFamily} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '15px'
                }}>
                  <input
                    style={inputStyle}
                    type="text"
                    value={editingFamily.name}
                    onChange={e => setEditingFamily({...editingFamily, name: e.target.value})}
                  />
                  <input
                    style={inputStyle}
                    type="number"
                    value={editingFamily.age}
                    onChange={e => setEditingFamily({...editingFamily, age: e.target.value})}
                  />
                  <textarea
                    style={{...inputStyle, minHeight: '100px'}}
                    value={editingFamily.description}
                    onChange={e => setEditingFamily({...editingFamily, description: e.target.value})}
                  />
                  <input
                    style={inputStyle}
                    type="text"
                    value={editingFamily.image}
                    onChange={e => setEditingFamily({...editingFamily, image: e.target.value})}
                    placeholder="Image path"
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={buttonStyle}>Save</button>
                    <button 
                      type="button" 
                      style={{...buttonStyle, backgroundColor: '#666'}}
                      onClick={() => setEditingFamily(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h3 style={{ marginBottom: '10px', color: '#333' }}>{family.name}</h3>
                  <p style={{ margin: '5px 0', color: '#666' }}>Age: {family.age}</p>
                  <p style={{ margin: '5px 0', color: '#666' }}>{family.description}</p>
                  <img 
                    src={family.image} 
                    alt={family.name} 
                    style={{ 
                      maxWidth: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginBottom: '10px'
                    }} 
                  />
                  <button 
                    onClick={() => setEditingFamily(family)}
                    style={{...buttonStyle, width: '100%'}}
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

const inputStyle = {
  padding: '8px 12px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  fontSize: '14px',
  width: '100%',
  boxSizing: 'border-box' as const
};

const buttonStyle = {
  padding: '10px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500' as const,
  ':hover': {
    backgroundColor: '#0056b3'
  }
};

export default AdminPage;