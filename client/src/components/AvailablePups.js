import React, { useContext, useEffect } from 'react';
import { LitterContext } from '../context/LitterContext';

const AvailablePups = () => {
    const { litters, loading, error, fetchLitters } = useContext(LitterContext);

    useEffect(() => {
        fetchLitters();
    }, []);

    if (loading) {
        return (
            <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50">
                <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
                <p className="text-red-500 text-center">{error}</p>
            </div>
        );
    }

    const availablePuppies = litters.reduce((acc, litter) => {
        return [...acc, ...litter.puppies.filter(puppy => puppy.status === "Available")];
    }, []);

    return (
        <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
                    Available Puppies
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availablePuppies.map(puppy => (
                        <div
                            key={puppy.id}
                            className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 hover:border-blue-500/50 transition-all"
                        >
                            <div className="aspect-square w-full overflow-hidden rounded-lg mb-4">
                                <img
                                    src={puppy.image}
                                    alt={puppy.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl front-semibold text-slate-100">
                                    {puppy.name}
                                </h3>
                                <div className="text-slate-300 space-y-1">
                                    <p>Color: {puppy.color}</p>
                                    <p>Gender: {puppy.gender}</p>
                                    <p className="inline-block bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm">{puppy.status}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {availablePuppies.length === 0 && (
                    <p className="text-center text-slate-300 py-8">
                        No puppies are currently available. Please check back later!
                    </p>
                )}
            </div>      
        </div>
    );
};

export default AvailablePups;
