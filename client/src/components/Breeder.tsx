/**
 * Breeder Profile Component
 * Displays comprehensive information about the breeder including contact details
 * and professional background.
 */

import React, { useState, useEffect } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import api from '../utils/api';

interface BreederInfo {
    firstName: string;
    lastName: string;
    city: string;
    state: string;
    experienceYears: number;
    story: string;
    phone: string;
    email: string;
    profile_image: string | null;
    image_type?: string;
}

const Breeder: React.FC = () => {
    const [breederInfo, setBreederInfo] = useState<BreederInfo | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBreederInfo = async () => {
            try {
                const response = await api.get('/breeder/profile');
                setBreederInfo(response.data);
            } catch (err: any) {
                const errorMessage = err.response?.data?.message || 'Failed to load breeder information';
                setError(errorMessage);
                console.error('Error fetching breeder info:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBreederInfo();
    }, []);

    // Handler functions
    const handleEmailClick = () => window.location.href = `mailto:${breederInfo?.email}`;
    const handlePhoneClick = () => window.location.href = `tel:${breederInfo?.phone}`;
    const handleLocationClick = () => {
        const address = `${breederInfo?.city}, ${breederInfo?.state}`;
        window.open(`https://maps.google.com?q=${encodeURIComponent(address)}`, '_blank');
    };

    const getImageUrl = (imageData: string | null) => 
        imageData ? `data:image/jpeg;base64,${imageData}` : '/images/default-profile.jpg';

    if (loading) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
    if (!breederInfo) return <div className="text-center p-8">No breeder information found</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">Meet the Breeder</h1>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                <div className="w-full md:w-1/2">
                    <img 
                        src={breederInfo.profile_image ? getImageUrl(breederInfo.profile_image) : '/images/default-profile.jpg'} 
                        alt="Breeder Profile" 
                        className="w-full max-w-lg mx-auto h-[400px] object-cover rounded-xl shadow-lg"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/default-profile.jpg';
                        }}
                    />
                </div>
                <div className="w-full md:w-1/2">
                    <div className="bg-slate-800 rounded-xl p-8 shadow-xl w-full">
                        <div className="text-center mb-6 pb-6 border-b border-slate-600">
                            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
                                {breederInfo.firstName} {breederInfo.lastName}
                            </h2>
                            <p className="text-slate-400 mt-2">Pug Breeder</p>
                        </div>
                        
                        <div className="space-y-6">
                            <div 
                                className="flex items-center gap-3 cursor-pointer hover:text-blue-400 transition-colors"
                                onClick={handleLocationClick}
                            >
                                <FaMapMarkerAlt className="text-blue-400 text-xl" />
                                <div>
                                    <p className="text-slate-300">{breederInfo.city}, {breederInfo.state}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <FaClock className="text-blue-400 text-xl" />
                                <div>
                                    <p className="text-slate-300">{breederInfo.experienceYears} Years Experience</p>
                                </div>
                            </div>

                            <div 
                                className="flex items-center gap-3 cursor-pointer hover:text-blue-400 transition-colors"
                                onClick={handlePhoneClick}
                            >
                                <FaPhone className="text-blue-400 text-xl" />
                                <div>
                                    <p className="text-slate-300">{breederInfo.phone}</p>
                                </div>
                            </div>

                            <div 
                                className="flex items-center gap-3 cursor-pointer hover:text-blue-400 transition-colors"
                                onClick={handleEmailClick}
                            >
                                <FaEnvelope className="text-blue-400 text-xl" />
                                <div>
                                    <p className="text-slate-300">{breederInfo.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 leading-relaxed">
                <h2 className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">My Story</h2>
                <p className="text-slate-300 leading-relaxed">{breederInfo.story}</p>
            </div>
        </div>
    );
};

export default Breeder;
