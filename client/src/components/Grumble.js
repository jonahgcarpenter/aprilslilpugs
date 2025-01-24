import React from 'react';

const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
}

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

const Grumble = () => {
    return (
        <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
                    Meet my Grumble
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {PLACEHOLDER_GRUMBLE.map((pug) => (
                        <div
                            key={pug.id}
                            className="bg-slate-800/50 rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300"
                        >
                            <div className="aspect-square w-full overflow-hidden">
                                <img
                                    src={pug.image}
                                    alt={pug.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-semibold text-slate-100">
                                        {pug.name}
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <p className="text-blue-400 font-medium">
                                            {pug.gender}
                                        </p>
                                        <p className="text-slate-300 text-sm">
                                            {calculateAge(pug.birthDate)} years old
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 text-slate-300">
                                    <p className="text-slate-300">
                                        {pug.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>      
        </div>
    ) 
}

export default Grumble;
