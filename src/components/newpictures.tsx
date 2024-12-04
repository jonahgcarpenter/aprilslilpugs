import '../styles/pictures.css';
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

export const NewPicture: React.FC = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [editingImage, setEditingImage] = useState<ImageData | null>(null);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
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

  const handleImageClick = (index: number) => {
    setSelectedImage(selectedImage === index ? null : index);
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
        className={`image-container ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div 
          className="drag-drop-zone"
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
            className={`image-item ${selectedImage === index ? 'selected' : ''}`}
            onClick={() => handleEdit(imageData)}
          >
            {imageData.media.startsWith('data:video') ? (
              <video src={imageData.media} className="thumbnail" />
            ) : (
              <img src={imageData.media} alt={imageData.description} className="thumbnail" />
            )}
            <div className="image-details">
              <div className="image-name">{imageData.description || 'Untitled'}</div>
            </div>
          </div>
        ))}
      </div>

      {uploadData && (
        <div className="image-modal edit-modal" id="media-upload-modal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setUploadData(null)}>×</button>
            <div className="modal-image-container">
              {uploadData.media.startsWith('data:video') ? (
                <video src={uploadData.media} className="modal-image" controls />
              ) : (
                <img src={uploadData.media} alt="upload preview" className="modal-image" />
              )}
            </div>
            <div className="modal-form-container">
              <h2 className="modal-header">Add New Media</h2>
              <form className="edit-form" onSubmit={(e) => {
                e.preventDefault();
                const description = new FormData(e.currentTarget).get('description') as string;
                handleUploadComplete(description);
              }}>
                <div className="form-group">
                  <input
                    type="text"
                    name="description"
                    placeholder="Enter description"
                    required
                  />
                </div>
                <div className="button-group single-button">
                  <button type="submit" className="button-primary" disabled={operationLoading}>
                    {operationLoading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {editingImage && (
        <div className="image-modal edit-modal" id="media-edit-modal">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setEditingImage(null)}>×</button>
            <div className="modal-image-container">
              {editingImage.media.startsWith('data:video') ? (
                <video src={editingImage.media} className="modal-image" controls />
              ) : (
                <img src={editingImage.media} alt={editingImage.description} className="modal-image" />
              )}
            </div>
            <div className="modal-form-container">
              <h2 className="modal-header">Edit Media</h2>
              <form className="edit-form" onSubmit={handleUpdateImage}>
                <div className="form-group">
                  <input
                    type="text"
                    value={editingImage.description}
                    onChange={(e) => setEditingImage({...editingImage, description: e.target.value})}
                    placeholder="Description"
                    required
                  />
                </div>
                <div className="button-group edit-actions">
                  <button type="submit" className="button-primary" disabled={operationLoading}>
                    {operationLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    className="delete-button"
                    onClick={() => setDeleteConfirmation(editingImage.id!)}
                    disabled={operationLoading}
                  >
                    Delete
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteConfirmation && (
        <div className="image-modal">
          <div className="modal-content confirmation-modal">
            <h2 className="modal-header">Confirm Delete</h2>
            <p>Are you sure you want to delete this media?</p>
            <div className="button-group">
              <button 
                className="delete-button" 
                onClick={() => handleDelete(deleteConfirmation)}
                disabled={operationLoading}
              >
                {operationLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button 
                className="button-secondary" 
                onClick={() => setDeleteConfirmation(null)}
                disabled={operationLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
