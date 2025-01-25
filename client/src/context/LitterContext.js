import { createContext, useState } from 'react';

export const LitterContext = createContext();

export const PLACEHOLDER_LITTERS = [
    {
        id: "1",
        name: "Litter 1",
        mother: "Mother 1",
        father: "Father 1",
        birthDate: "January 25, 2025",
        availableDate: "February 1, 2022",
        image: "/puppy-placeholder.jpg",
        puppies: [
            {
                id: "puppy1",
                name: "Puppy 1",
                color: "Color 1",
                image: "/puppy-placeholder.jpg",
                gender: "Female",
                status: "Available",
            },
            {
                id: "puppy2",
                name: "Puppy 2",
                color: "Color 2",
                image: "/puppy-placeholder.jpg",
                gender: "Female",
                status: "Reserved",
            },
            {
                id: "puppy3",
                name: "Puppy 3",
                color: "Color 3",
                image: "/puppy-placeholder.jpg",
                gender: "Male",
                status: "Sold",
            },
        ],
    },
];

export const LitterProvider = ({ children }) => {
    const [litters, setLitters] = useState(PLACEHOLDER_LITTERS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchLitters = async () => {
        setLoading(true);
        setError(null);
        try {
            // Simulating an API call with the placeholder data
            // Later you can replace this with a real API call
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            setLitters(PLACEHOLDER_LITTERS);
        } catch (err) {
            setError('Failed to fetch litters. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LitterContext.Provider value={{ 
            litters, 
            setLitters, 
            loading, 
            error, 
            fetchLitters
        }}>
            {children}
        </LitterContext.Provider>
    );
};
