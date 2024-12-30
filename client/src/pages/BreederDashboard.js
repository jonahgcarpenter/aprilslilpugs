import { useState } from 'react';
import BreederUpdateForm from '../components/BreederUpdateForm';
import BreederDetails from '../components/BreederDetails';

const BreederDashboard = () => {
  const [activeTab, setActiveTab] = useState('view'); // 'view' or 'edit'

  return (
    <div className="space-y-6 py-8">
      {/* Tab Navigation */}
      <div className="flex gap-4 justify-center mb-8">
        <button 
          onClick={() => setActiveTab('view')}
          className={`px-6 py-2 rounded-lg transition-all duration-300 ${
            activeTab === 'view' 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-slate-800 text-white/70 hover:bg-slate-700'
          }`}
        >
          View Profile
        </button>
        <button 
          onClick={() => setActiveTab('edit')}
          className={`px-6 py-2 rounded-lg transition-all duration-300 ${
            activeTab === 'edit' 
              ? 'bg-blue-500 text-white shadow-lg' 
              : 'bg-slate-800 text-white/70 hover:bg-slate-700'
          }`}
        >
          Edit Profile
        </button>
      </div>

      {/* Content */}
      <div className="grid gap-8">
        {activeTab === 'view' ? (
          <BreederDetails />
        ) : (
          <BreederUpdateForm />
        )}
      </div>
    </div>
  );
};

export default BreederDashboard;