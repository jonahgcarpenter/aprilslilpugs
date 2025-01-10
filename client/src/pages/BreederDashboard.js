import { useState } from 'react';
import { useLive } from '../context/LiveContext';
// COMPONENTS
import BreederUpdateForm from '../components/BreederUpdateForm';
import DogCreateForm from '../components/DogCreateForm';
import DogUpdate from '../components/DogUpdate';
import PuppyCreateForm from '../components/PuppyCreateForm';
import PuppyUpdate from '../components/PuppyUpdate';

const BreederDashboard = () => {
  const { isLive, toggleLive } = useLive();

  return (
    <div className="space-y-6 py-8">
      <div className="flex justify-center">
        <button
          onClick={toggleLive}
          className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
          {isLive ? '🔴 Disable Live Page' : '🟢 Enable Live Page'}
        </button>
      </div>
      <div className="grid gap-8">
        <BreederUpdateForm />
        <DogCreateForm />
        <DogUpdate />
        <PuppyCreateForm />
        <PuppyUpdate />
      </div>
    </div>
  );
};

export default BreederDashboard;