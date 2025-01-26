import { createContext, useState, useEffect } from 'react';

export const LitterContext = createContext();

export const LitterProvider = ({ children }) => {
    const [litters, setLitters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const formatLitterData = (litter) => ({
        ...litter,
        id: litter._id,
        birthDate: formatDate(litter.birthDate),
        availableDate: formatDate(litter.availableDate),
        rawBirthDate: formatDateForInput(litter.birthDate),
        rawAvailableDate: formatDateForInput(litter.availableDate),
        puppies: litter.puppies.map(puppy => ({
            ...puppy,
            id: puppy._id
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

    const getLitter = async (litterId) => {
        try {
            // First check if we already have the litter in state
            const existingLitter = litters.find(l => l._id === litterId);
            if (existingLitter) {
                return existingLitter;
            }

            const response = await fetch(`/api/litters/${litterId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch litter');
            }
            const data = await response.json();
            return formatLitterData(data);
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

    const addPuppy = async (litterId, puppyData) => {
        try {
            setError(null);
            const formData = new FormData();
            Object.keys(puppyData).forEach(key => {
                if (puppyData[key] !== undefined && puppyData[key] !== null) {
                    formData.append(key, puppyData[key]);
                }
            });

            const response = await fetch(`/api/litters/${litterId}/puppies`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to add puppy');
            }

            await fetchLitters();
            return true;
        } catch (err) {
            setError('Failed to add puppy. Please try again.');
            console.error('Add puppy error:', err);
            return false;
        }
    };

    const updatePuppy = async (litterId, puppyId, puppyData) => {
        try {
            setError(null);
            const formData = new FormData();
            Object.keys(puppyData).forEach(key => {
                if (puppyData[key] !== undefined && puppyData[key] !== null) {
                    formData.append(key, puppyData[key]);
                }
            });

            const response = await fetch(`/api/litters/${litterId}/puppies/${puppyId}`, {
                method: 'PATCH',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to update puppy');
            }

            await fetchLitters();
            return true;
        } catch (err) {
            setError('Failed to update puppy. Please try again.');
            console.error('Update error:', err);
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
