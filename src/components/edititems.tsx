import { useState, useEffect, useRef } from 'react';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../secrets/firebase';
import '../styles/edititems.css';

const EditItems = () => {
    const [entries, setEntries] = useState<any[]>([]);
    const [selectedEntry, setSelectedEntry] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        age: '',
        mom: '',
        dad: '',
        gender: '',
        isActive: true,
        imageUrl: ''
    });
    const [familyDogs, setFamilyDogs] = useState<Array<{id: string, name: string, gender: string}>>([]);
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        fetchEntries();
    }, []);

    useEffect(() => {
        if (selectedEntry) {
            setPreview(selectedEntry.imageUrl || null);
            setImage(null); // Reset any selected new image
        } else {
            setPreview(null);
            setImage(null);
        }
        
        // Cleanup function
        return () => {
            if (preview && !preview.includes('firebasestorage.googleapis.com')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [selectedEntry]);

    const fetchEntries = async () => {
        try {
            const puppiesSnap = await getDocs(collection(db, 'puppies'));
            const familySnap = await getDocs(collection(db, 'family'));
            
            const puppies = puppiesSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'puppy'
            }));
            
            const family = familySnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'family'
            }));

            setEntries([...puppies, ...family]);
        } catch (error) {
            console.error('Error fetching entries:', error);
        }
    };

    const handleSelect = (entry: any) => {
        setSelectedEntry(entry);
        setFormData({
            name: entry.name || '',
            description: entry.description || '',
            age: entry.age || '',
            mom: entry.type === 'puppy' ? entry.mom || '' : '',
            dad: entry.type === 'puppy' ? entry.dad || '' : '',
            gender: entry.gender || '', // Always include gender
            isActive: entry.isActive !== undefined ? entry.isActive : true,
            imageUrl: entry.imageUrl || ''
        });
        setPreview(entry.imageUrl || null);
        setImage(null);
    };

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
        // Revoke previous preview URL if it's not a Firebase URL
        if (preview && !preview.includes('firebasestorage.googleapis.com')) {
            URL.revokeObjectURL(preview);
        }
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEntry) return;

        setLoading(true);
        try {
            let imageUrl = selectedEntry.imageUrl;

            // Only upload new image if one was selected
            if (image) {
                const storageRef = ref(storage, `images/${image.name}`);
                await uploadBytes(storageRef, image);
                imageUrl = await getDownloadURL(storageRef);
            }

            const docRef = doc(db, selectedEntry.type === 'puppy' ? 'puppies' : 'family', selectedEntry.id);
            
            // Remove mom and dad fields for family entries
            const updateData = selectedEntry.type === 'family' 
                ? {
                    name: formData.name,
                    description: formData.description,
                    age: formData.age,
                    gender: formData.gender,
                    isActive: formData.isActive,
                    imageUrl,
                    updatedAt: new Date()
                } 
                : {
                    ...formData,
                    imageUrl,
                    updatedAt: new Date()
                };

            await updateDoc(docRef, updateData);

            await fetchEntries();
            setSelectedEntry(null);
            setImage(null);
            setPreview(null);
            alert('Successfully updated!');
        } catch (error) {
            console.error('Error updating:', error);
            alert('Error updating entry');
        }
        setLoading(false);
    };

    const handleDelete = async () => {
        if (!selectedEntry || !window.confirm('Are you sure you want to delete this entry?')) return;
        
        setLoading(true);
        try {
            const docRef = doc(db, selectedEntry.type === 'puppy' ? 'puppies' : 'family', selectedEntry.id);
            await deleteDoc(docRef);
            await fetchEntries();
            setSelectedEntry(null);
            alert('Successfully deleted!');
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Error deleting entry');
        }
        setLoading(false);
    };

    return (
        <div className="edit-items-container">
            <div className="entries-list">
                {entries.map(entry => (
                    <div 
                        key={entry.id} 
                        className={`entry-item ${selectedEntry?.id === entry.id ? 'selected' : ''}`}
                        onClick={() => handleSelect(entry)}
                    >
                        {entry.name} ({entry.type})
                    </div>
                ))}
            </div>
            {selectedEntry && (
                <form onSubmit={handleSubmit} className="edit-form">
                    <div className="toggle-container">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    isActive: e.target.checked
                                }))}
                            />
                            <span className="slider round"></span>
                        </label>
                        <span className="toggle-label">
                            {formData.isActive ? 'Currently Active' : 'Archived'}
                        </span>
                    </div>

                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Name"
                        required
                    />
                    
                    <input
                        type="text"
                        value={formData.age}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                        placeholder="Age"
                        required
                    />

                    <select 
                        value={formData.gender} 
                        onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                    </select>

                    {selectedEntry.type === 'puppy' && (
                        <>
                            <select 
                                value={formData.mom} 
                                onChange={(e) => setFormData(prev => ({ ...prev, mom: e.target.value }))}
                                required
                            >
                                <option value="">Select Mom</option>
                                {familyDogs
                                    .filter(dog => dog.gender === 'female')
                                    .map(dog => (
                                        <option key={dog.id} value={dog.name}>{dog.name}</option>
                                    ))}
                            </select>
                            <select 
                                value={formData.dad} 
                                onChange={(e) => setFormData(prev => ({ ...prev, dad: e.target.value }))}
                                required
                            >
                                <option value="">Select Dad</option>
                                {familyDogs
                                    .filter(dog => dog.gender === 'male')
                                    .map(dog => (
                                        <option key={dog.id} value={dog.name}>{dog.name}</option>
                                    ))}
                            </select>
                        </>
                    )}

                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description"
                        required
                    />

                    <div
                        className={`image-upload-box ${dragActive ? 'drag-active' : ''}`}
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
                            style={{ display: 'none' }}
                        />
                        
                        {preview ? (
                            <div className="image-preview">
                                <img src={preview} alt="Preview" />
                                <button 
                                    type="button" 
                                    className="remove-image"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setImage(null);
                                        setPreview(selectedEntry.imageUrl);
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <div className="upload-prompt">
                                <i className="upload-icon">📁</i>
                                <p>Drag and drop an image here, or click to select</p>
                            </div>
                        )}
                    </div>

                    <div className="button-group">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Entry'}
                        </button>
                        <button 
                            type="button" 
                            onClick={handleDelete} 
                            className="delete-button"
                            disabled={loading}
                        >
                            {loading ? 'Deleting...' : 'Delete Entry'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default EditItems;
