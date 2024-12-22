/**
 * About Us Component
 * Displays company information including breeding standards,
 * services provided, and requirements for potential customers.
 */

import React, { useEffect, useState } from "react";
import * as aboutService from '../services/aboutService';
import type { AboutUsData } from '../services/types';

const AboutUs: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aboutData, setAboutData] = useState<AboutUsData>({
    breeding_standards: [],
    services_provided: [],
    what_we_require: []
  });

  useEffect(() => {
    let isSubscribed = true;
    
    const fetchAboutData = async () => {
      try {
        const response = await aboutService.getAboutInfo();
        if (isSubscribed && response.data) {
          setAboutData(response.data);
        }
      } catch (err) {
        if (isSubscribed) {
          setError(err instanceof Error ? err.message : 'Failed to load about us data');
          console.error('Error loading about data:', err);
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    fetchAboutData();
    return () => { isSubscribed = false; };
  }, []);

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-400">Error: {error}</div>;

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
              <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                We're more than just pug breeders - we're dedicated caretakers 
                passionate about raising exceptional dogs. Our journey began with a deep love for this 
                charming breed, and today, we maintain high standards in breeding practices.
              </p>

              {aboutData.breeding_standards.length > 0 && (
                <div className="bg-slate-700/30 p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400 mb-2 sm:mb-3">Our Breeding Standards</h3>
                  <ul className="text-slate-300 space-y-2 text-base sm:text-lg">
                    {aboutData.breeding_standards.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                Each puppy receives extensive socialization, beginning with early neurological stimulation 
                and continuing through their developmental stages. We ensure they're well-adjusted and 
                ready for their new families.
              </p>

              {aboutData.services_provided.length > 0 && (
                <div className="bg-slate-700/30 p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400 mb-2 sm:mb-3">What We Provide</h3>
                  <ul className="text-slate-300 space-y-2 text-base sm:text-lg">
                    {aboutData.services_provided.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-slate-300 leading-relaxed text-base sm:text-lg">
                We care about where our puppies go and ensure they're placed in loving homes.
              </p>

              {aboutData.what_we_require.length > 0 && (
                <div className="bg-slate-700/30 p-4 sm:p-6 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-semibold text-blue-400 mb-2 sm:mb-3">What We Require</h3>
                  <ul className="text-slate-300 space-y-2 text-base sm:text-lg">
                    {aboutData.what_we_require.map((item, index) => (
                      <li key={index}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Remove the excellence in breeding section */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;