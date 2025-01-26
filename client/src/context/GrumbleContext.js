/**
 * Grumble Management Context
 * Handles state and operations for grumble (group of pugs) management
 */
import { createContext, useState, useEffect } from 'react';

export const GrumbleContext = createContext();

export const GrumbleProvider = ({ children }) => {
    // State Management
    const [grumbles, setGrumbles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // CRUD Operations
    // Fetch all grumbles
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

    // Add a new grumble
    const addGrumble = async (grumbleData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/grumble', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(grumbleData),
            });
            
            if (!response.ok) {
                throw new Error('Failed to add grumble');
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

    // Delete a grumble
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

    // Update a grumble
    const updateGrumble = async (grumbleId, updateData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/grumble/${grumbleId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update grumble');
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

    // Initialize data on mount
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
