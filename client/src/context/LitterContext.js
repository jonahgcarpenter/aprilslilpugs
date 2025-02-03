import { createContext, useState, useEffect } from 'react';

export const LitterContext = createContext();

export const LitterProvider = ({ children }) => {
    const [litters, setLitters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatDate = (dateString) => {
        // Parse the ISO date string (YYYY-MM-DD)
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-based in Date constructor
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatLitterData = (litter) => ({
        ...litter,
        birthDate: formatDate(litter.birthDate),
        availableDate: formatDate(litter.availableDate),
        rawBirthDate: litter.birthDate, // Store original format
        rawAvailableDate: litter.availableDate, // Store original format
        profilePicture: litter.profilePicture,
        puppies: litter.puppies.map(puppy => ({
            ...puppy,
            _id: puppy._id // Keep only _id, remove id
        }))
    });

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

    const getLitter = async (id) => {
        try {
            const response = await fetch(`/api/litters/${id}`);
            if (response.status === 404) {
                return null;
            }
            if (!response.ok) {
                throw new Error('Failed to fetch litter');
            }
            const json = await response.json();
            return json;
        } catch (error) {
            console.error('Fetch error:', error);
            throw error;
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
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to create litter');
            }

            const newLitter = await response.json();
            await fetchLitters();
            return newLitter; // Return the new litter data including _id
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
                if (litterData[key] !== undefined && litterData[key] !== null && litterData[key] !== '') {
                    if (key === 'profilePicture' && litterData[key] instanceof File) {
                        formData.append('profilePicture', litterData[key]);
                    } else {
                        formData.append(key, litterData[key]);
                    }
                }
            });

            const response = await fetch(`/api/litters/${litterId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
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

    const deleteLitter = async (id) => {
        try {
            const response = await fetch(`/api/litters/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete litter');
            }
            
            setLitters(prev => prev.filter(litter => litter._id !== id));
            return true;
        } catch (error) {
            console.error('Delete error:', error);
            throw error;
        }
    };

    const addPuppy = async (litterId, puppyData) => {
        try {
            setError(null);
            const formData = new FormData();
            
            Object.keys(puppyData).forEach(key => {
                if (puppyData[key] !== undefined && puppyData[key] !== null && puppyData[key] !== '') {
                    if (key === 'profilePicture' && puppyData[key] instanceof File) {
                        formData.append('profilePicture', puppyData[key]);
                    } else {
                        formData.append(key, puppyData[key]);
                    }
                }
            });
        
            const response = await fetch(`/api/litters/${litterId}/puppies`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add puppy');
            }
        
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

    const updatePuppy = async (litterId, puppyId, puppyData) => {
        try {
            setError(null);
            const formData = new FormData();
            
            Object.keys(puppyData).forEach(key => {
              if (puppyData[key] !== undefined && puppyData[key] !== null && puppyData[key] !== '') {
                if (key === 'profilePicture' && puppyData[key] instanceof File) {
                  formData.append('profilePicture', puppyData[key]);
                } else {
                  formData.append(key, puppyData[key]);
                }
              }
            });
        
            const response = await fetch(`/api/litters/${litterId}/puppies/${puppyId}`, {
              method: 'PATCH',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: formData
            });
        
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to update puppy');
            }
        
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
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete puppy');
            }

            const updatedLitter = await getLitter(litterId);
            setLitters(prev => prev.map(l => 
                l._id === litterId ? updatedLitter : l
            ));

            return true;
        } catch (err) {
            setError(err.message || 'Failed to delete puppy. Please try again.');
            console.error('Delete puppy error:', err);
            return false;
        }
    };

    const clearError = () => {
        setError(null);
    };

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
