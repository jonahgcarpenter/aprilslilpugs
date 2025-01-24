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
        <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
                    Litters
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {PLACEHOLDER_LITTERS.map((litter) => (
                        <div key={litter.id} className="bg-slate-900/80 backdrop-blur-sm border border-slate-800/50 shadow-xl rounded-lg overflow-hidden hover:border-white/20 transition-all duration-300">
                            <img
                                src={litter.image}
                                alt={litter.name}
                                className="w-full h-48 object-cover object-center"
                            />
                            <div className="p-4">
                                <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">{litter.name}</h2>
                                <p className="text-white/80">Born on {litter.birthDate}</p>
                                <p className="text-white/80">Available on {litter.availableDate}</p>
                                <p className="text-white/80">Mother: {litter.mother}</p>
                                <p className="text-white/80">Father: {litter.father}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Litters;