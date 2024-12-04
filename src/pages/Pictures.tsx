import React, { useState, useEffect } from 'react';
import '../styles/pictures.css';
import '../styles/main.css';
import Footer from '../components/Footer';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../secrets/firebase';
import Section from "../components/Section";

interface MediaData {
  description: string;
  media: string;
}

interface PicturesProps {
  altText?: string;
}

const Pictures: React.FC<PicturesProps> = ({ altText = 'Media' }) => {
  const [selectedMedia, setSelectedMedia] = useState<number | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState<MediaData | null>(null);

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const mediaCollection = collection(db, 'media');
        const mediaSnapshot = await getDocs(mediaCollection);
        const mediaList = mediaSnapshot.docs.map(doc => doc.data() as MediaData);
        setMediaItems(mediaList);
      } catch (error) {
        console.error('Error fetching media:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const handleItemClick = (index: number) => {
    setSelectedMedia(selectedMedia === index ? null : index);
  };

  const handleItemDoubleClick = (media: MediaData) => {
    setModalItem(media);
  };

  const handleCloseModal = () => {
    setModalItem(null);
    setSelectedMedia(null);
  };

  if (loading) {
    return <div className="loading">Loading media...</div>;
  }

  return (
    <>
      <div className="page-container">
        <Section title="Camera Roll">
          <div className="image-container">
            {mediaItems.map((mediaItem, index) => (
              <div 
                key={index} 
                className={`image-item ${selectedMedia === index ? 'selected' : ''}`}
                onClick={() => handleItemClick(index)}
                onDoubleClick={() => handleItemDoubleClick(mediaItem)}
              >
                {mediaItem.media.startsWith('data:video') ? (
                  <video src={mediaItem.media} className="thumbnail" />
                ) : (
                  <img 
                    src={mediaItem.media} 
                    alt={mediaItem.description || `${altText} ${index + 1}`}
                    className="thumbnail"
                  />
                )}
                <div className="image-details">
                  <div className="image-name">{mediaItem.description || 'Untitled'}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {modalItem && (
        <div className="image-modal view-modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            <div className="modal-header">{modalItem.description || 'Untitled'}</div>
            {modalItem.media.startsWith('data:video') ? (
              <video src={modalItem.media} className="modal-image" controls />
            ) : (
              <img 
                src={modalItem.media} 
                alt={modalItem.description} 
                className="modal-image"
              />
            )}
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default Pictures;
