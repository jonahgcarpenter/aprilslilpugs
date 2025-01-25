import { createContext, useState } from 'react';

export const GrumbleContext = createContext();

export const PLACEHOLDER_GRUMBLE = [
    {
        id: "1",
        name: "Winston",
        gender: "Male",
        description: "A pain in my ass",
        image: "/puppy-placeholder.jpg",
        birthDate: "2020-10-20",
    },
    {
        id: "2",
        name: "Hallie",
        gender: "Female",
        description: "A pain in my ass",
        image: "/puppy-placeholder.jpg",
        birthDate: "2020-10-20",
    },
    {
        id: "3",
        name: "Mille",
        gender: "Female",
        description: "A pain in my ass",
        image: "/puppy-placeholder.jpg",
        birthDate: "2020-10-20",
    },
    {
        id: "4",
        name: "Mardi",
        gender: "Male",
        description: "A pain in my ass",
        image: "/puppy-placeholder.jpg",
        birthDate: "2020-10-20",
    },
];

export const GrumbleProvider = ({ children }) => {
    const [grumbles, setGrumbles] = useState(PLACEHOLDER_GRUMBLE);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGrumbles = async () => {
        setLoading(true);
        setError(null);
        try {
            // Simulating an API call with the placeholder data
            // Later you can replace this with a real API call
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
            setGrumbles(PLACEHOLDER_GRUMBLE);
        } catch (err) {
            setError('Failed to fetch grumbles. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GrumbleContext.Provider value={{ 
            grumbles, 
            setGrumbles, 
            loading, 
            error, 
            fetchGrumbles 
        }}>
            {children}
        </GrumbleContext.Provider>
    );
};
