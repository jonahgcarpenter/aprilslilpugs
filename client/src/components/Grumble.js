import React from 'react';

export const PLACEHOLDER_GRUMBLE = [
    
    {
        id: "1",
        name: "Winston",
        image: "/puppy-placeholder.jpg",
    },
];

const Grumble = () => {
    return (
        <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
                    Meet my Grumble
                </h1>
            </div>      
        </div>
    ) 
}

export default Grumble;
