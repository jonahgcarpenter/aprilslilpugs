import React, { useState, useEffect } from 'react';
import '../styles/pictures.css';
import '../styles/main.css';
import Footer from '../components/Footer';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../secrets/firebase';

interface ImageData {
  description: string;
  folder: string;
  image: string;
}

interface PicturesProps {
  altText?: string;
}

const Pictures: React.FC<PicturesProps> = ({ altText = 'Image' }) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const imagesCollection = collection(db, 'pictures');
        const imagesSnapshot = await getDocs(imagesCollection);
        const imagesList = imagesSnapshot.docs.map(doc => doc.data() as ImageData);
        setImages(imagesList);
        
        // Extract unique folders
        const uniqueFolders = [...new Set(imagesList.map(img => img.folder))];
        setFolders(uniqueFolders);
      } catch (error) {
        console.error('Error fetching images:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const getFolderItemCount = (folderName: string) => {
    return images.filter(img => img.folder === folderName).length;
  };

  const handleImageClick = (index: number) => {
    setSelectedImage(selectedImage === index ? null : index);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleFolderClick = (folder: string) => {
    setCurrentFolder(folder);
    setSelectedImage(null);
  };

  const handleBackClick = () => {
    setCurrentFolder(null);
    setSelectedImage(null);
  };

  if (loading) {
    return <div className="loading">Loading images...</div>;
  }

  const filteredImages = currentFolder
    ? images.filter(img => img.folder === currentFolder)
    : [];

  return (
    <>
      <div className="page-container">
        <div className="explorer-controls">
          <div className="view-controls">
            <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}>
              Grid
            </button>
            <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>
              List
            </button>
          </div>
        </div>

        {!currentFolder ? (
          <section className={`content-section ${viewMode}-view`}>
            <div className="breadcrumb">
              <span>Pictures</span>
            </div>
            <div className={`folder-container ${viewMode}-view`}>
              {folders.map((folder, index) => (
                <div 
                  key={index}
                  className={`folder-item ${viewMode}-view`}
                  onClick={() => handleFolderClick(folder)}
                >
                  <div className="folder-icon">📁</div>
                  <div className="folder-details">
                    <span className="folder-name">{folder}</span>
                    <span className="folder-meta">
                      {getFolderItemCount(folder)} items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className={`content-section ${viewMode}-view`}>
            <div className="breadcrumb">
              <span className="clickable" onClick={handleBackClick}>Pictures</span>
              <span className="separator">›</span>
              <span>{currentFolder}</span>
            </div>
            <div className={`image-container ${viewMode}-view`}>
              {filteredImages.map((imageData, index) => (
                <div 
                  key={index} 
                  className={`image-item ${viewMode}-view ${selectedImage === index ? 'selected' : ''}`}
                  onClick={() => handleImageClick(index)}
                >
                  <div className="image-preview">
                    <img 
                      src={imageData.image} 
                      alt={imageData.description || `${altText} ${index + 1}`}
                      className="thumbnail"
                    />
                  </div>
                  <div className="image-details">
                    <span className="image-name">{imageData.description}</span>
                    <span className="image-meta">Image</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Pictures;
