import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

interface BreederData {
    firstName: string;
    lastName: string;
    city: string;
    state: string;
    phone: string;
    email: string;
    experienceYears: number;
    story: string;
    profile_image?: string;
}

const Breeder: React.FC = () => {
    const [data, setData] = useState<BreederData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        axios.get('/api/breeder')
            .then(response => {
                if (response.data.status === 'success') {
                    setData(response.data.data);
                } else {
                    setError('Failed to load breeder data');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                setError('Failed to load breeder data');
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
                                Meet the Breeder
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
                            <div className="flex justify-center">
                                <div className="bg-slate-700/30 rounded-full overflow-hidden w-[240px] sm:w-[280px] h-[240px] sm:h-[280px]">
                                    <img 
                                        src={data.profile_image ? `data:image/jpeg;base64,${data.profile_image}` : '/images/default-profile.jpg'}
                                        alt="Breeder Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            
                            <div className="bg-slate-700/30 p-4 sm:p-5 rounded-lg">
                                <h3 className="text-lg sm:text-xl font-semibold text-blue-400 mb-2">
                                    {data.firstName} {data.lastName}
                                </h3>
                                <p className="text-slate-300 mb-3 text-base sm:text-lg">Professional Pug Breeder</p>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <FaMapMarkerAlt className="text-blue-400" />
                                        <p className="text-slate-300">{data.city}, {data.state}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FaClock className="text-blue-400" />
                                        <p className="text-slate-300">{data.experienceYears} Years Experience</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FaPhone className="text-blue-400" />
                                        <p className="text-slate-300">{data.phone}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <FaEnvelope className="text-blue-400" />
                                        <p className="text-slate-300">{data.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-700/30 p-4 sm:p-6 rounded-lg mt-6">
                            <h3 className="text-lg sm:text-xl font-semibold text-blue-400 mb-2 sm:mb-3">My Story</h3>
                            <div className="text-slate-300 space-y-4 text-base sm:text-lg">
                                {data.story.split('\n').map((paragraph, index) => (
                                    <p key={index} className="leading-relaxed">{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Breeder;