import { useState } from 'react';
import { FaEye, FaEdit } from 'react-icons/fa';
import BreederUpdateForm from '../components/BreederUpdateForm';
import BreederDetails from '../components/BreederDetails';

const BreederDashboard = () => {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="space-y-6 py-8">
      {/* Preview Toggle Button */}
      <div className="flex justify-center px-4">
        <button 
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-1.5 rounded-md text-xl transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700"
        >
          {showPreview ? <FaEdit /> : <FaEye />}
        </button>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        {showPreview ? (
          <BreederDetails />
        ) : (
          <BreederUpdateForm />
        )}
      </div>
    </div>
  );
};

export default BreederDashboard;