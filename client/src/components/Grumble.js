import React, { useContext, useEffect, useState } from 'react';
import { GrumbleContext } from '../context/GrumbleContext';
import LoadingAnimation from './LoadingAnimation';

const calculateAge = (birthDateString) => {
    // Parse the ISO date string (YYYY-MM-DD)
    const [birthYear, birthMonth, birthDay] = birthDateString.split('-').map(Number);
    
    // Get current date in Central Time
    const now = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });
    const currentDate = new Date(now);
    
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
    const currentDay = currentDate.getDate();
    
    let age = currentYear - birthYear;
    
    // Check if birthday hasn't occurred this year
    if (currentMonth < birthMonth || 
        (currentMonth === birthMonth && currentDay < birthDay)) {
        age--;
    }
    
    return age;
}

const Grumble = () => {
    const { grumbles, loading: fetchLoading, error, fetchGrumbles } = useContext(GrumbleContext);
    const [loading, setLoading] = useState(true);

    const preloadGrumbleImages = async (grumbles) => {
        const loadImage = (src) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src.startsWith('/api/images') ? src : `/api/images${src}`;
                img.onload = resolve;
                img.onerror = reject;
            });
        };

        try {
            await Promise.all(grumbles.map(pug => loadImage(pug.image)));
        } catch (error) {
            console.error('Error preloading grumble images:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchGrumbles();
        };
        loadData();
    }, []);

    useEffect(() => {
        const loadImages = async () => {
            if (grumbles.length > 0) {
                await preloadGrumbleImages(grumbles);
                setLoading(false);
            }
        };
        loadImages();
    }, [grumbles]);

    if (loading || fetchLoading) {
        return (
            <div className={`transition-all duration-500 ease-in-out`}>
                <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
                        <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
                            Meet my Grumble
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

    return (
        <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
                <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-center tracking-wider px-4">
                    Meet my Grumble
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {grumbles.map((pug) => (
                        <div
                            key={pug._id}
                            className="bg-slate-800/50 rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 border border-slate-700/50"
                        >
                            <div className="aspect-square w-full overflow-hidden">
                                <img
                                    src={pug.image.startsWith('/api/images') ? pug.image : `/api/images${pug.image}`}
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
                                <p className="text-slate-300">{pug.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>      
        </div>
    );
};

export default Grumble;
