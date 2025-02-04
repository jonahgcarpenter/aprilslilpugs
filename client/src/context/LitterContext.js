import { createContext, useState, useEffect } from 'react';

export const LitterContext = createContext();

export const LitterProvider = ({ children }) => {
    const [litters, setLitters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Validation functions
    const validateImage = (file) => {
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            throw new Error('Image must be less than 2MB');
        }
        
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Image must be in JPG or PNG format');
        }
    };

    const validateDate = (dateString) => {
        if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            throw new Error('Invalid date format. Use YYYY-MM-DD');
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            throw new Error('Invalid date');
        }
        return true;
    };

    const fetchLitters = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/litters');
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch litters');
            }
            setLitters(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch litters');
            console.error('Error fetching litters:', err);
        } finally {
            setLoading(false);
        }
    };

    const getLitter = async (litterId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/litters/${litterId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch litter');
            }
            return data;
        } catch (err) {
            setError('Failed to fetch litter details');
            console.error('Error fetching litter:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const createLitter = async (formData) => {
        setLoading(true);
        setError(null);
        try {
            // Validate date if present in FormData
            const birthDate = formData.get('birthDate');
            const availableDate = formData.get('availableDate');
            if (birthDate) validateDate(birthDate);
            if (availableDate) validateDate(availableDate);

            // Validate image if present
            const image = formData.get('profilePicture');
            if (image instanceof File) {
                validateImage(image);
            }

            const response = await fetch('/api/litters', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to add litter');
            }
            
            setLitters(prevLitters => [...prevLitters, data]);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to add litter');
            console.error('Error adding litter:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateLitter = async (litterId, formData) => {
        setLoading(true);
        setError(null);
        try {
            const jsonData = JSON.parse(formData.get('data'));

            // Create new FormData with all fields
            const formattedFormData = new FormData();
            
            // Add all fields individually (this is what multer expects)
            Object.keys(jsonData).forEach(key => {
                formattedFormData.append(key, jsonData[key]);
            });

            // Add the image file if it exists
            const imageFile = formData.get('profilePicture');
            if (imageFile instanceof File) {
                validateImage(imageFile);
                formattedFormData.append('profilePicture', imageFile);
            }

            const response = await fetch(`/api/litters/${litterId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formattedFormData // Send as multipart/form-data
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update litter');
            }

            const updatedLitter = await response.json();

            setLitters(prevLitters =>
                prevLitters.map(litter =>
                    litter._id === litterId ? {
                        ...updatedLitter,
                        birthDate: updatedLitter.birthDate?.split('T')[0],
                        availableDate: updatedLitter.availableDate?.split('T')[0]
                    } : litter
                )
            );

            return updatedLitter;
        } catch (err) {
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteLitter = async (litterId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/litters/${litterId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete litter');
            }
            
            setLitters(prevLitters => 
                prevLitters.filter(litter => litter._id !== litterId)
            );
        } catch (err) {
            setError('Failed to delete litter. Please try again later.');
            console.error('Error deleting litter:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const addPuppy = async (litterId, puppyData, puppyImage = null) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            
            // Add puppy data
            Object.keys(puppyData).forEach(key => {
                formData.append(key, puppyData[key]);
            });
            
            // Add puppy image if provided
            if (puppyImage) {
                validateImage(puppyImage);
                formData.append('profilePicture', puppyImage);
            }

            const response = await fetch(`/api/litters/${litterId}/puppies`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to add puppy');
            }
            
            setLitters(prevLitters =>
                prevLitters.map(litter =>
                    litter._id === litterId ? data : litter
                )
            );
            return data;
        } catch (err) {
            setError(err.message || 'Failed to add puppy');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePuppy = async (litterId, puppyId, puppyData, puppyImage = null) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            
            // Add puppy data
            Object.keys(puppyData).forEach(key => {
                formData.append(key, puppyData[key]);
            });
            
            // Add puppy image if provided
            if (puppyImage) {
                validateImage(puppyImage);
                formData.append('profilePicture', puppyImage);
            }

            const response = await fetch(`/api/litters/${litterId}/puppies/${puppyId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update puppy');
            }
            
            setLitters(prevLitters =>
                prevLitters.map(litter =>
                    litter._id === litterId ? data : litter
                )
            );
            return data;
        } catch (err) {
            setError(err.message || 'Failed to update puppy');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deletePuppy = async (litterId, puppyId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/litters/${litterId}/puppies/${puppyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete puppy');
            }

            const data = await response.json();
            setLitters(prevLitters =>
                prevLitters.map(litter =>
                    litter._id === litterId ? data : litter
                )
            );
            
            return data;
        } catch (err) {
            setError('Failed to delete puppy. Please try again later.');
            console.error('Error deleting puppy:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const getPuppies = async (litterId) => {        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/litters/${litterId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch puppies');
            }
            
            return data.puppies || [];
        } catch (err) {
            setError('Failed to fetch puppies. Please try again later.');
            console.error('Error fetching puppies:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLitters();
    }, []);

    return (
        <LitterContext.Provider value={{ 
            litters,
            loading,
            error,
            fetchLitters,
            getLitter,
            createLitter,
            updateLitter,
            deleteLitter,
            addPuppy,
            updatePuppy,
            deletePuppy,
            getPuppies
        }}>
            {children}
        </LitterContext.Provider>
    );
};

export default LitterProvider;