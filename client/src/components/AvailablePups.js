import React, { useContext, useEffect, useState } from 'react';
import { LitterContext } from '../context/LitterContext';
import LoadingAnimation from './LoadingAnimation';

const AvailablePups = () => {
    const { litters, loading: fetchLoading, error, fetchLitters } = useContext(LitterContext);
    const [loading, setLoading] = useState(true);

    const preloadPuppyImages = async (puppies) => {
        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = `/api/images${src}`;
                img.onload = resolve;
                img.onerror = reject;
            });
        };

        try {
            await Promise.all(puppies.map(puppy => loadImage(puppy.image)));
        } catch (error) {
            console.error('Error preloading puppy images:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchLitters();
        };
        loadData();
    }, []);

    useEffect(() => {
        const loadImages = async () => {
            if (litters.length > 0) {
                const availablePuppies = litters.reduce((acc, litter) => {
                    return [...acc, ...litter.puppies.filter(puppy => puppy.status === "Available")];
                }, []);
                
                if (availablePuppies.length > 0) {
                    await preloadPuppyImages(availablePuppies);
                }
                setLoading(false);
            }
        };
        loadImages();
    }, [litters]);

    if (loading || fetchLoading) {
        return (
            <div className={`transition-all duration-500 ease-in-out`}>
                <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
                        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
                            Available Puppies
                        </h1>
                        <div className="h-20 flex items-center justify-center">
                            <LoadingAnimation />
                        </div>
                    </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {availablePuppies.map(puppy => (
                        <div
                            key={puppy.id}
                            className="bg-slate-800/50 rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 border border-slate-700/50"
                        >
                            <div className="aspect-square w-full overflow-hidden">
                                <img
                                    src={`/api/images${puppy.image}`}
                                    alt={puppy.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6 space-y-4">
                                <h3 className="text-2xl font-semibold text-slate-100">
                                    {puppy.name}
                                </h3>
                                <div className="space-y-2 text-slate-300">
                                    <p>Color: {puppy.color}</p>
                                    <p>Gender: {puppy.gender}</p>
                                    <p className="inline-block bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm">
                                        {puppy.status}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {availablePuppies.length === 0 && (
                    <p className="text-center text-slate-300 py-8">
                        No puppies are currently available. Please check back later! Or join our waitlist to be the first to know when new puppies are available.
                    </p>
                )}
            </div>      
        </div>
    );
};

export default AvailablePups;
