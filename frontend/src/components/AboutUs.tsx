import React from "react";

const AboutUs: React.FC = () => {
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
                Welcome to our premier pug breeding establishment.{' '}
                <span className="text-blue-400 font-semibold">We are dedicated</span> to raising 
                healthy, happy, and well-socialized pugs in a loving environment.
              </p>
              <p className="text-slate-300 leading-relaxed italic border-l-4 border-blue-500 pl-4">
                With years of experience and a commitment to excellence, we ensure that each of our 
                puppies receives the best care and attention before joining their forever homes.
              </p>
              <div className="flex items-center gap-2 text-blue-400 mt-4">
                <span className="h-1 w-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></span>
                <span className="text-sm font-semibold tracking-wider uppercase">Quality & Care</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;