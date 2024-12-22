/**
 * Breeder Profile Component
 * Displays comprehensive information about the breeder including contact details
 * and professional background.
 */

import React, { useState, useEffect } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { getProfile } from '../services/breederService';
import type { BreederData } from '../services/types';

const Breeder: React.FC = () => {
    const [breederInfo, setBreederInfo] = useState<BreederData | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const getImageSrc = (imageData?: string) => {
        if (!imageData) return '/images/default-profile.jpg';
        return `data:image/jpeg;base64,${imageData}`;
    };

    useEffect(() => {
        let isSubscribed = true;
        
        const fetchBreederInfo = async () => {
            try {
                const response = await getProfile();
                if (isSubscribed) {
                    if (response.status === 'success' && response.data) {
                        setBreederInfo(response.data);
                        setError('');
                    } else {
                        throw new Error(response.message || 'Failed to load breeder data');
                    }
                }
            } catch (err) {
                if (isSubscribed) {
                    setError(err instanceof Error ? err.message : 'Failed to load breeder information');
                    console.error('Breeder fetch error:', err);
                }
            } finally {
                if (isSubscribed) {
                    setLoading(false);
                }
            }
        };

        fetchBreederInfo();
        return () => { isSubscribed = false; };
    }, []);

    // Handler functions
    const handleEmailClick = () => window.location.href = `mailto:${breederInfo?.email}`;
    const handlePhoneClick = () => window.location.href = `tel:${breederInfo?.phone}`;
    const handleLocationClick = () => {
        const address = `${breederInfo?.city}, ${breederInfo?.state}`;
        window.open(`https://maps.google.com?q=${encodeURIComponent(address)}`, '_blank');
    };

    if (loading) return <div className="text-center p-8">Loading...</div>;
    if (error) return <div className="text-red-500 text-center p-8">{error}</div>;
    if (!breederInfo) return <div className="text-center p-8">No breeder information found</div>;

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

                        <div className="space-y-6 sm:space-y-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
                                <div className="flex justify-center">
                                    <div className="bg-slate-700/30 rounded-full overflow-hidden w-[240px] sm:w-[280px] h-[240px] sm:h-[280px]">
                                        <img 
                                            src={getImageSrc(breederInfo?.profile_image)}
                                            alt="Breeder Profile" 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/images/default-profile.jpg';
                                            }}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <div className="bg-slate-700/30 p-4 sm:p-5 rounded-lg">
                                        <h3 className="text-lg sm:text-xl font-semibold text-blue-400 mb-2">
                                            {breederInfo.firstName} {breederInfo.lastName}
                                        </h3>
                                        <p className="text-slate-300 mb-3 text-base sm:text-lg">Professional Pug Breeder</p>
                                        
                                        <div className="space-y-3">
                                            {[
                                                {
                                                    icon: <FaMapMarkerAlt className="text-blue-400" />,
                                                    text: `${breederInfo.city}, ${breederInfo.state}`,
                                                    action: handleLocationClick
                                                },
                                                {
                                                    icon: <FaClock className="text-blue-400" />,
                                                    text: `${breederInfo.experienceYears} Years Experience`
                                                },
                                                {
                                                    icon: <FaPhone className="text-blue-400" />,
                                                    text: breederInfo.phone,
                                                    action: handlePhoneClick
                                                },
                                                {
                                                    icon: <FaEnvelope className="text-blue-400" />,
                                                    text: breederInfo.email,
                                                    action: handleEmailClick
                                                }
                                            ].map((item, index) => (
                                                <div 
                                                    key={index}
                                                    onClick={item.action}
                                                    className={`flex items-center gap-3 ${item.action ? 'cursor-pointer hover:text-blue-400' : ''} transition-colors`}
                                                >
                                                    {item.icon}
                                                    <p className="text-slate-300">{item.text}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-700/30 p-4 sm:p-6 rounded-lg">
                                <h3 className="text-lg sm:text-xl font-semibold text-blue-400 mb-2 sm:mb-3">My Story</h3>
                                <div className="text-slate-300 space-y-4 text-base sm:text-lg">
                                    {breederInfo.story.split('\n').map((paragraph, index) => (
                                        <p key={index} className="leading-relaxed">{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                            {/* Remove the excellence in breeding section */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Breeder;