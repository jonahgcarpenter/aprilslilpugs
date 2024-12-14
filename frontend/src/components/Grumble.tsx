import React, { useState, useEffect } from "react";
import axios from "axios";

interface Grumble {
  id: number;
  breeder_id: number;
  name: string;
  gender: 'male' | 'female';
  color: string;
  created_at: string;
}

interface Breeder {
  id: number;
  firstName: string;
  lastName: string;
}

const Grumble: React.FC = () => {
  const [grumbles, setGrumbles] = useState<Grumble[]>([]);
  const [breeders, setBreeders] = useState<Breeder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [grumblesRes, breedersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/grumbles`),
          axios.get(`${import.meta.env.VITE_API_URL}/breeders`)
        ]);
        setGrumbles(Array.isArray(grumblesRes.data) ? grumblesRes.data : []);
        setBreeders(Array.isArray(breedersRes.data) ? breedersRes.data : []);
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-8 bg-white/90 rounded-lg shadow-lg">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
          Our Grumble Members
        </h1>
      </div>
      
      {error && (
        <div className="mb-4 p-4 text-red-500 bg-red-100 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {grumbles.map((grumble) => (
              <div 
                key={grumble.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{grumble.name}</h3>
                  <span className="text-sm text-gray-500 capitalize">{grumble.gender}</span>
                </div>
                <div className="space-y-2 text-gray-600">
                  <p>Color: {grumble.color}</p>
                  <p>Breeder: {
                    (() => {
                      const breeder = breeders.find(b => b.id === grumble.breeder_id);
                      return breeder ? `${breeder.firstName} ${breeder.lastName}` : 'Unknown';
                    })()
                  }</p>
                </div>
              </div>
            ))}
          </div>
          
          {grumbles.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              No grumble members found
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Grumble;
