// Simplify API base URL handling for development and production
const API_BASE = '/api';  // Always use relative path

export const getProfile = async () => {
    const url = `${API_BASE}/breeder/breeders`;  // Removed trailing slash
    console.log('Fetching from:', url);
    try {
        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Raw breeder data:', data); // Add logging
        
        if (data.status === 'error') {
            throw new Error(data.message || 'Failed to fetch breeder data');
        }
        
        return data;
    } catch (error) {
        console.error('Error fetching breeder profile:', error);
        throw error;
    }
};

export const getAboutInfo = async () => {
    try {
        const response = await fetch(`${API_BASE}/aboutus/`);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching about us info:', error);
        throw error;
    }
};
