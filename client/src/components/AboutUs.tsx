import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AboutUsData {
    breeding_standards: string[];
    services_provided: string[];
    what_we_require: string[];
}

const AboutUs: React.FC = () => {
    const [data, setData] = useState<AboutUsData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios.get('/api/about')
            .then(response => {
                if (response.data.status === 'success') {
                    setData(response.data.data);
                } else {
                    setError('Failed to load about data');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setError('Failed to load about data');
            });
    }, []);

    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!data) return <div className="text-center p-8">Loading...</div>;

    return (
        <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
            <div className="flex justify-center">
                <div className="w-full">
                    <div className="bg-slate-800 rounded-xl p-4 sm:p-6 md:p-8 shadow-xl">
                        <div className="text-center mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-600">
                            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
                                Welcome to April's Lil Pugs
                            </h1>
                        </div>
                        
                        <div className="space-y-4 sm:space-y-6">
                            <div className="bg-slate-700/30 p-4 sm:p-6 rounded-lg">
                                <h3 className="text-lg sm:text-xl font-semibold text-blue-400 mb-2 sm:mb-3">Our Breeding Standards</h3>
                                <ul className="text-slate-300 space-y-2 text-base sm:text-lg">
                                    {data.breeding_standards.map((item, index) => (
                                        <li key={index}>• {item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-slate-700/30 p-4 sm:p-6 rounded-lg">
                                <h3 className="text-lg sm:text-xl font-semibold text-blue-400 mb-2 sm:mb-3">What We Provide</h3>
                                <ul className="text-slate-300 space-y-2 text-base sm:text-lg">
                                    {data.services_provided.map((item, index) => (
                                        <li key={index}>• {item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-slate-700/30 p-4 sm:p-6 rounded-lg">
                                <h3 className="text-lg sm:text-xl font-semibold text-blue-400 mb-2 sm:mb-3">What We Require</h3>
                                <ul className="text-slate-300 space-y-2 text-base sm:text-lg">
                                    {data.what_we_require.map((item, index) => (
                                        <li key={index}>• {item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;