import '../styles/newpictures.css';
import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../secrets/firebase';

interface ImageData {
  id?: string;
  description: string;
  media: string;  // base64 string of image/video
}

interface UploadData {
  media: string;
  file: File;
}

const UploadModal: React.FC<{
  uploadData: UploadData;
  onClose: () => void;
  onSubmit: (description: string) => Promise<void>;
  loading: boolean;
}> = ({ uploadData, onClose, onSubmit, loading }) => (
  <div className="upload-modal">
    <div className="uploadmodal-content">
      <button className="uploadmodal-close" onClick={onClose}>×</button>
      <div className="uploadmodal-image-container">
        {uploadData.media.startsWith('data:video') ? (
          <video src={uploadData.media} className="uploadmodal-image" controls />
        ) : (
          <img src={uploadData.media} alt="upload preview" className="uploadmodal-image" />
        )}
      </div>
      <div className="uploadmodal-form-container">
        <h2 className="uploadmodal-header">Add New Media</h2>
        <form className="uploadform" onSubmit={(e) => {
          e.preventDefault();
          const description = new FormData(e.currentTarget).get('description') as string;
          onSubmit(description);
        }}>
          <div className="uploadform-group">
            <input type="text" name="description" placeholder="Enter description" required />
          </div>
          <button type="submit" className="uploadbutton" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  </div>
);

const EditModal: React.FC<{
  image: ImageData;
  onClose: () => void;
  onUpdate: (e: React.FormEvent) => Promise<void>;
  onDelete: () => void;
  onChange: (value: string) => void;
  loading: boolean;
}> = ({ image, onClose, onUpdate, onDelete, onChange, loading }) => (
  <div className="edit-modal">
    <div className="editmodal-content">
      <button className="editmodal-close" onClick={onClose}>×</button>
      <div className="editmodal-image-container">
        {image.media.startsWith('data:video') ? (
          <video src={image.media} className="editmodal-image" controls />
        ) : (
          <img src={image.media} alt={image.description} className="editmodal-image" />
        )}
      </div>
      <div className="editmodal-form-container">
        <h2 className="editmodal-header">Edit Media</h2>
        <form className="editform" onSubmit={onUpdate}>
          <div className="editform-group">
            <input
              type="text"
              value={image.description}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Description"
              required
            />
          </div>
          <div className="editform-group">
            <button type="submit" className="editbutton" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" className="deletebutton" onClick={onDelete} disabled={loading}>
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

const DeleteModal: React.FC<{
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}> = ({ onConfirm, onCancel, loading }) => (
  <div className="delete-modal">
    <div className="deletemodal-content">
      <h2 className="deletemodal-header">Confirm Delete</h2>
      <p>Are you sure you want to delete this media?</p>
      <div className="deleteform-group">
        <button className="deletebutton" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : 'Yes, Delete'}
        </button>
        <button className="cancelbutton" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export const NewPicture: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [uploadData, setUploadData] = useState<UploadData | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const mediaCollection = collection(db, 'media');  // Changed from 'pictures'
      const mediaSnapshot = await getDocs(mediaCollection);
      const mediaList = mediaSnapshot.docs.map(doc => ({
        ...doc.data() as ImageData,
        id: doc.id
      }));
      setImages(mediaList);
    } catch (error) {
      console.error('Error fetching media:', error);  // Updated error message
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUploadComplete = async (description: string) => {
    if (!uploadData) return;
    setOperationLoading(true);
    try {
      await addDoc(collection(db, 'media'), {
        media: uploadData.media,
        description
      });
      await fetchImages();
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setOperationLoading(false);
    setUploadData(null);
  };

  const processFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setUploadData({ media: base64, file });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const mediaFile = files.find(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (mediaFile) {
      await processFile(mediaFile);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (image: ImageData) => {
    if (!image.id) return;
    setEditingImage(image);
  };

  const handleUpdateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingImage?.id) return;
    setOperationLoading(true);
    try {
      const docRef = doc(db, 'media', editingImage.id);  // Changed from 'pictures'
      await updateDoc(docRef, {
        description: editingImage.description,
        media: editingImage.media
      });
      setEditingImage(null);
      await fetchImages();
    } catch (error) {
      console.error('Error updating image:', error);
    }
    setOperationLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    setOperationLoading(true);
    try {
      const docRef = doc(db, 'media', id);
      await deleteDoc(docRef);
      setDeleteConfirmation(null);
      setEditingImage(null);
      await fetchImages();
    } catch (error) {
      console.error('Error deleting media:', error);
    }
    setOperationLoading(false);
  };

  if (loading) {
    return <div className="loading">Loading images...</div>;
  }

  return (
    <>
      <div 
        className={`newpicture-container ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div 
          className="newpicturedrag-drop-zone"
          onClick={() => fileInputRef.current?.click()}
        >
          <p>Drag and drop or click to select images/videos</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*"
            style={{ display: 'none' }}
            multiple
          />
        </div>

        {images.map((imageData, index) => (
          <div 
            key={index} 
            className="newpicture-item"
            onClick={() => handleEdit(imageData)}
          >
            {imageData.media.startsWith('data:video') ? (
              <video src={imageData.media} className="newpicturethumbnail" />
            ) : (
              <img src={imageData.media} alt={imageData.description} className="newpicturethumbnail" />
            )}
            <div className="newpicture-details">
              <div className="newpicture-name">{imageData.description || 'Untitled'}</div>
            </div>
          </div>
        ))}
      </div>

      {uploadData && (
        <UploadModal
          uploadData={uploadData}
          onClose={() => setUploadData(null)}
          onSubmit={handleUploadComplete}
          loading={operationLoading}
        />
      )}

      {editingImage && (
        <EditModal
          image={editingImage}
          onClose={() => setEditingImage(null)}
          onUpdate={handleUpdateImage}
          onDelete={() => setDeleteConfirmation(editingImage.id!)}
          onChange={(value) => setEditingImage({...editingImage, description: value})}
          loading={operationLoading}
        />
      )}

      {deleteConfirmation && (
        <DeleteModal
          onConfirm={() => handleDelete(deleteConfirmation)}
          onCancel={() => setDeleteConfirmation(null)}
          loading={operationLoading}
        />
      )}
    </>
  );
};
