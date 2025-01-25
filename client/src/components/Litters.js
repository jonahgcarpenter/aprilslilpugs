import React, { useContext, useEffect } from 'react';
import { LitterContext } from '../context/LitterContext';

const Litters = () => {
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

    return (
        <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
                    Litters
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {litters.map((litter) => (
                        <div 
                            key={litter.id} 
                            className="bg-slate-800/50 rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 border border-slate-700/50"
                        >
                            <div className="aspect-square w-full overflow-hidden">
                                <img
                                    src={litter.image}
                                    alt={litter.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6 space-y-4">
                                <h2 className="text-2xl font-semibold text-slate-100">{litter.name}</h2>
                                <div className="space-y-2 text-slate-300">
                                    <p>Born on {litter.birthDate}</p>
                                    <p>Available on {litter.availableDate}</p>
                                    <p>Mother: {litter.mother}</p>
                                    <p>Father: {litter.father}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Litters;
