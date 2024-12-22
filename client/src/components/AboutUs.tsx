/**
 * About Us Component
 * Displays company information including breeding standards,
 * services provided, and requirements for potential customers.
 */

import React, { useEffect, useState } from "react";
import api from '../utils/api';

interface AboutUsData {
  breeding_standards: string[];
  services_provided: string[];
  what_we_require: string[];
}

const AboutUs: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aboutData, setAboutData] = useState<AboutUsData>({
    breeding_standards: [],
    services_provided: [],
    what_we_require: []
  });

  // Data fetching effect
  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/aboutus');
        setAboutData({
          breeding_standards: response.data?.breeding_standards || [],
          services_provided: response.data?.services_provided || [],
          what_we_require: response.data?.what_we_require || []
        });
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load about us data');
        console.error('Error fetching about us data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center">
        <div className="text-blue-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
          About Us
        </h1>
      </div>

      <div className="flex justify-center mb-12">
        <div className="w-full">
          <div className="bg-slate-800 rounded-xl p-8 shadow-xl">
            <div className="text-center mb-6 pb-6 border-b border-slate-600">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-blue-500">
                Welcome to April's Lil Pugs
              </h2>
            </div>
            
            <div className="space-y-6">
              <p className="text-slate-300 leading-relaxed">
                We're more than just pug breeders - we're dedicated caretakers 
                passionate about raising exceptional dogs. Our journey began with a deep love for this 
                charming breed, and today, we maintain high standards in breeding practices.
              </p>

              <div className="bg-slate-700/30 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Our Breeding Standards</h3>
                <ul className="text-slate-300 space-y-2">
                  {aboutData.breeding_standards.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              <p className="text-slate-300 leading-relaxed">
                Each puppy receives extensive socialization, beginning with early neurological stimulation 
                and continuing through their developmental stages. We ensure they're well-adjusted and 
                ready for their new families.
              </p>

              <div className="bg-slate-700/30 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">What We Provide</h3>
                <ul className="text-slate-300 space-y-2">
                  {aboutData.services_provided.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              <p className="text-slate-300 leading-relaxed">
                We care about where our puppies go and ensure they're placed in loving homes.
              </p>

              <div className="bg-slate-700/30 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">What We Require</h3>
                <ul className="text-slate-300 space-y-2">
                  {aboutData.what_we_require.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 text-blue-400 mt-4">
                <span className="h-1 w-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></span>
                <span className="text-sm font-semibold tracking-wider uppercase">Excellence in Breeding</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;