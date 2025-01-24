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

const Litters = () => {
    return (
        <div className="min-h-screen pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-center tracking-wider px-4">
                    Litters
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {PLACEHOLDER_LITTERS.map((litter) => (
                        <div key={litter.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <img src="/puppy-placeholder.jpg" alt="Litter 1" className="w-full h-48 object-cover object-center" />
                            <div className="p-4">
                                <h2 className="text-xl font-semibold text-gray-800">{litter.name}</h2>
                                <p className="text-gray-600">Born on {litter.birthDate}</p>
                                <p className="text-gray-600">Available on {litter.availableDate}</p>
                                <p className="text-gray-600">Mother: {litter.mother}</p>
                                <p className="text-gray-600">Father: {litter.father}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Litters;
