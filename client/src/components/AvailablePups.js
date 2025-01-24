import React from 'react';

export const PLACEHOLDER_LITTERS = [
    
    {
        id: "litter1",
        name: "Litter 1",
        mother: "Mother 1",
        father: "Father 1",
        birthDate: "January 1, 2022",
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
                status: "Available",
            },
            {
                id: "puppy3",
                name: "Puppy 3",
                color: "Color 3",
                image: "/puppy-placeholder.jpg",
                gender: "Male",
                status: "Available",
            },
        ],
    },
];

const AvailablePups = () => {
    return (
        <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
                    Available Puppies
                </h1>
            </div>
        </div>
    )
}

export default AvailablePups;
