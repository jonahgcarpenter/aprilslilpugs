import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

interface Litter {
  id: number;
  breeder_id: number;
  mom_id: number;
  dad_id: number;
  birth_date: string;
}

interface Breeder {
  id: number;
  firstName: string;
  lastName: string;
}

interface Dog {
  id: number;
  name: string;
}

const Litters: React.FC = () => {
  const [litters, setLitters] = useState<Litter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [breeders, setBreeders] = useState<Breeder[]>([]);
  const [dogs, setDogs] = useState<Dog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [littersRes, breedersRes, dogsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/litters`),
          axios.get(`${import.meta.env.VITE_API_URL}/breeders`),
          axios.get(`${import.meta.env.VITE_API_URL}/dogs`)
        ]);
        // Ensure we're getting arrays from the responses
        setLitters(Array.isArray(littersRes.data) ? littersRes.data : []);
        setBreeders(Array.isArray(breedersRes.data) ? breedersRes.data : []);
        setDogs(Array.isArray(dogsRes.data) ? dogsRes.data : []);
      } catch (err) {
        setError("Failed to fetch data");
        console.error("Error fetching data:", err);
        // Initialize with empty arrays on error
        setLitters([]);
        setBreeders([]);
        setDogs([]);
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
          Available Litters
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
            {litters.map((litter) => (
              <div 
                key={litter.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">
                    Litter #{litter.id}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {format(new Date(litter.birth_date), 'MMM dd, yyyy')}
                  </span>
                </div>
                <div className="space-y-2 text-gray-600">
                  <p>Parents:</p>
                  <div className="ml-4">
                    <p>Mom: {dogs.find(d => d.id === litter.mom_id)?.name || 'Unknown'}</p>
                    <p>Dad: {dogs.find(d => d.id === litter.dad_id)?.name || 'Unknown'}</p>
                  </div>
                  <p>Breeder: {
                    (() => {
                      const breeder = breeders.find(b => b.id === litter.breeder_id);
                      return breeder ? `${breeder.firstName} ${breeder.lastName}` : 'Unknown';
                    })()
                  }</p>
                </div>
              </div>
            ))}
          </div>
          
          {litters.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              No litters currently available
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Litters;