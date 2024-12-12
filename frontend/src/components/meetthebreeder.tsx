import React from 'react';
import ProfilePicture from '/images/profilepic.jpg';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

interface BreederInfo {
    firstName: string;
    lastName: string;
    city: string;
    state: string;
    experienceYears: number;
    story: string;
    phone: string;
    email: string;
}

const MeetTheBreeder: React.FC = () => {
    const breederInfo: BreederInfo = {
        firstName: "April",
        lastName: "Carpenter",
        city: "Tupelo",
        state: "MS",
        experienceYears: 15,
        story: "I've been passionate about breeding dogs for over 15 years. My journey started when I rescued my first dog and realized the importance of responsible breeding. I've dedicated my life to ensuring our puppies are raised in a loving, healthy environment and go to wonderful homes.",
        phone: "(662) 321-8352",
        email: "aprilslilpugs@gmail.com"
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">Meet the Breeder</h1>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                <div className="w-full md:w-1/2">
                    <img 
                        src={ProfilePicture} 
                        alt="Breeder Profile" 
                        className="w-full max-w-lg mx-auto h-[400px] object-cover rounded-xl shadow-lg"
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
                            <div className="flex items-center gap-3">
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

                            <div className="flex items-center gap-3">
                                <FaPhone className="text-blue-400 text-xl" />
                                <div>
                                    <p className="text-slate-300">{breederInfo.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
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

export default MeetTheBreeder;
