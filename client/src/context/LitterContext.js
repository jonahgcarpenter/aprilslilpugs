/**
 * Litter Management Context
 * Handles all litter-related operations and state management
 */
import { createContext, useState, useEffect } from 'react';

export const LitterContext = createContext();

export const LitterProvider = ({ children }) => {
    // State Management
    const [litters, setLitters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Utility Functions
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatDateForInput = (date) => {
        return new Date(date).toISOString().split('T')[0];
    };

    // Add API base URL utility
    const getFullImageUrl = (relativePath) => {
        return `${process.env.REACT_APP_API_URL || ''}${relativePath}`;
    };

    // Update formatLitterData to properly handle IDs and image paths
    const formatLitterData = (litter) => ({
        ...litter,
        _id: litter._id, // Keep the original _id
        id: litter._id,  // Add id alias for compatibility
        birthDate: formatDate(litter.birthDate),
        availableDate: formatDate(litter.availableDate),
        rawBirthDate: formatDateForInput(litter.birthDate),
        rawAvailableDate: formatDateForInput(litter.availableDate),
        image: litter.image, // Keep the image path as is
        puppies: litter.puppies.map(puppy => ({
            ...puppy,
            _id: puppy._id, // Keep the original _id
            id: puppy._id,  // Add id alias for compatibility
            image: puppy.image // Keep the image path as is
        }))
    });

    // CRUD Operations
    const fetchLitters = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/litters');
            if (!response.ok) {
                throw new Error('Failed to fetch litters');
            }
            const data = await response.json();
            const formattedLitters = data.map(formatLitterData);
            setLitters(formattedLitters);
        } catch (err) {
            setError('Failed to fetch litters. Please try again later.');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Update getLitter to properly handle the response
    const getLitter = async (litterId) => {
        try {
            const response = await fetch(`/api/litters/${litterId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch litter');
            }
            const data = await response.json();
            const formattedLitter = formatLitterData(data);
            return formattedLitter;
        } catch (err) {
            setError('Failed to fetch litter details.');
            console.error('Fetch error:', err);
            return null;
        }
    };

    const createLitter = async (litterData) => {
        try {
            setError(null);
            const formData = new FormData();
            Object.keys(litterData).forEach(key => {
                formData.append(key, litterData[key]);
            });

            const response = await fetch('/api/litters', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to create litter');
            }

            await fetchLitters();
            return true;
        } catch (err) {
            setError('Failed to create litter. Please try again.');
            console.error('Create error:', err);
            return false;
        }
    };

    const updateLitter = async (litterId, litterData) => {
        try {
            setError(null);
            const formData = new FormData();
            Object.keys(litterData).forEach(key => {
                if (litterData[key] !== undefined && litterData[key] !== null) {
                    formData.append(key, litterData[key]);
                }
            });

            const response = await fetch(`/api/litters/${litterId}`, {
                method: 'PATCH',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to update litter');
            }

            await fetchLitters();
            return true;
        } catch (err) {
            setError('Failed to update litter. Please try again.');
            console.error('Update error:', err);
            return false;
        }
    };

    const deleteLitter = async (litterId) => {
        try {
            setError(null);
            const response = await fetch(`/api/litters/${litterId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete litter');
            }

            await fetchLitters();
            return true;
        } catch (err) {
            setError('Failed to delete litter. Please try again.');
            console.error('Delete error:', err);
            return false;
        }
    };

    /**
     * Puppy Management Operations
     */
    // Update addPuppy to properly handle the response
    const addPuppy = async (litterId, puppyData) => {
        try {
            setError(null);
            const formData = new FormData();
            
            Object.keys(puppyData).forEach(key => {
                if (puppyData[key] !== undefined && puppyData[key] !== null) {
                    if (key === 'image' && puppyData[key] instanceof File) {
                        formData.append('image', puppyData[key]);
                    } else {
                        formData.append(key, puppyData[key]);
                    }
                }
            });
        
            const response = await fetch(`/api/litters/${litterId}/puppies`, {
                method: 'POST',
                body: formData
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add puppy');
            }
        
            // Force a fresh fetch of litter data
            const updatedLitter = await getLitter(litterId);
            setLitters(prev => prev.map(l => 
                l._id === litterId ? updatedLitter : l
            ));
        
            return true;
        } catch (err) {
            setError(err.message || 'Failed to add puppy. Please try again.');
            console.error('Add puppy error:', err);
            return false;
        }
    };

    // Update updatePuppy to properly handle the response
    const updatePuppy = async (litterId, puppyId, puppyData) => {
        try {
            setError(null);
            const formData = new FormData();
            
            // Handle all form fields
            Object.keys(puppyData).forEach(key => {
              if (puppyData[key] !== undefined && puppyData[key] !== null) {
                // If it's an image, append it directly
                if (key === 'image' && puppyData[key] instanceof File) {
                  formData.append('image', puppyData[key]);
                } else {
                  formData.append(key, puppyData[key]);
                }
              }
            });
        
            const response = await fetch(`/api/litters/${litterId}/puppies/${puppyId}`, {
              method: 'PATCH',
              body: formData
            });
        
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to update puppy');
            }
        
            // Force a fresh fetch of litter data to get updated image URLs
            const updatedLitter = await getLitter(litterId);
            setLitters(prev => prev.map(l => 
              l._id === litterId ? updatedLitter : l
            ));
        
            return true;
          } catch (err) {
            setError(err.message || 'Failed to update puppy. Please try again.');
            console.error('Update puppy error:', err);
            return false;
          }
    };

    const deletePuppy = async (litterId, puppyId) => {
        try {
            setError(null);
            const response = await fetch(`/api/litters/${litterId}/puppies/${puppyId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete puppy');
            }

            await fetchLitters();
            return true;
        } catch (err) {
            setError('Failed to delete puppy. Please try again.');
            console.error('Delete error:', err);
            return false;
        }
    };

    const clearError = () => {
        setError(null);
    };

    // Initialize data on mount
    useEffect(() => {
        fetchLitters();
    }, []);

    return (
        <LitterContext.Provider value={{ 
            litters,
            loading,
            error,
            clearError,
            fetchLitters,
            getLitter,
            createLitter,
            updateLitter,
            deleteLitter,
            addPuppy,
            updatePuppy,
            deletePuppy
        }}>
            {children}
        </LitterContext.Provider>
    );
};

export default LitterProvider;
