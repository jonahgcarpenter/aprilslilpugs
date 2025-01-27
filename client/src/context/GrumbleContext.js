import { createContext, useState, useEffect } from 'react';

export const GrumbleContext = createContext();

export const GrumbleProvider = ({ children }) => {
    const [grumbles, setGrumbles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getFullImageUrl = (relativePath) => {
        return `${process.env.REACT_APP_API_URL || ''}${relativePath}`;
    };

    const fetchGrumbles = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/grumble');
            if (!response.ok) {
                throw new Error('Failed to fetch grumbles');
            }
            const data = await response.json();
            setGrumbles(data);
        } catch (err) {
            setError('Failed to fetch grumbles. Please try again later.');
            console.error('Error fetching grumbles:', err);
        } finally {
            setLoading(false);
        }
    };

    const addGrumble = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/grumble', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to add grumble');
            }
            
            const newGrumble = await response.json();
            setGrumbles(prevGrumbles => [...prevGrumbles, newGrumble]);
            return newGrumble;
        } catch (err) {
            setError('Failed to add grumble. Please try again later.');
            console.error('Error adding grumble:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteGrumble = async (grumbleId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/grumble/${grumbleId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete grumble');
            }
            
            setGrumbles(prevGrumbles => 
                prevGrumbles.filter(grumble => grumble._id !== grumbleId)
            );
        } catch (err) {
            setError('Failed to delete grumble. Please try again later.');
            console.error('Error deleting grumble:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateGrumble = async (grumbleId, formData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/grumble/${grumbleId}`, {
                method: 'PATCH',
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update grumble');
            }
            
            const updatedGrumble = await response.json();
            setGrumbles(prevGrumbles =>
                prevGrumbles.map(grumble =>
                    grumble._id === grumbleId ? updatedGrumble : grumble
                )
            );
            return updatedGrumble;
        } catch (err) {
            setError('Failed to update grumble. Please try again later.');
            console.error('Error updating grumble:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGrumbles();
    }, []);

    return (
        <GrumbleContext.Provider value={{ 
            grumbles, 
            loading, 
            error, 
            fetchGrumbles,
            addGrumble,
            deleteGrumble,
            updateGrumble
        }}>
            {children}
        </GrumbleContext.Provider>
    );
};
