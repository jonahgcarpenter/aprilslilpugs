import { createContext, useState, useEffect } from 'react';

export const LitterContext = createContext();

export const LitterProvider = ({ children }) => {
    const [litters, setLitters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all litters
    const fetchLitters = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/litters');
            if (!response.ok) {
                throw new Error('Failed to fetch litters');
            }
            const data = await response.json();
            
            // Format dates for display
            const formattedLitters = data.map(litter => ({
                ...litter,
                id: litter._id, // Map MongoDB _id to id for frontend compatibility
                birthDate: new Date(litter.birthDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                }),
                availableDate: new Date(litter.availableDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                }),
                puppies: litter.puppies.map(puppy => ({
                    ...puppy,
                    id: puppy._id // Map MongoDB _id to id for frontend compatibility
                }))
            }));
            
            setLitters(formattedLitters);
        } catch (err) {
            setError('Failed to fetch litters. Please try again later.');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Create new litter
    const createLitter = async (litterData) => {
        try {
            const response = await fetch('/api/litters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(litterData)
            });

            if (!response.ok) {
                throw new Error('Failed to create litter');
            }

            // Refresh litters after creation
            await fetchLitters();
            return true;
        } catch (err) {
            setError('Failed to create litter. Please try again.');
            console.error('Create error:', err);
            return false;
        }
    };

    // Add puppy to litter
    const addPuppy = async (litterId, puppyData) => {
        try {
            const response = await fetch(`/api/litters/${litterId}/puppies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(puppyData)
            });

            if (!response.ok) {
                throw new Error('Failed to add puppy');
            }

            // Refresh litters after adding puppy
            await fetchLitters();
            return true;
        } catch (err) {
            setError('Failed to add puppy. Please try again.');
            console.error('Add puppy error:', err);
            return false;
        }
    };

    // Update puppy status
    const updatePuppy = async (litterId, puppyId, updateData) => {
        try {
            const response = await fetch(`/api/litters/${litterId}/puppies/${puppyId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Failed to update puppy');
            }

            // Refresh litters after update
            await fetchLitters();
            return true;
        } catch (err) {
            setError('Failed to update puppy. Please try again.');
            console.error('Update error:', err);
            return false;
        }
    };

    // Fetch litters on component mount
    useEffect(() => {
        fetchLitters();
    }, []);

    return (
        <LitterContext.Provider value={{ 
            litters, 
            loading, 
            error, 
            fetchLitters,
            createLitter,
            addPuppy,
            updatePuppy
        }}>
            {children}
        </LitterContext.Provider>
    );
};
