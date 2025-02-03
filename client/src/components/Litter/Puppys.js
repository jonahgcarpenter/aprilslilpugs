import React from 'react';

const Puppys = ({ puppies, onPuppyChange, onAddPuppy, onRemovePuppy }) => {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
          Puppies
        </h3>
        <button
          type="button"
          onClick={onAddPuppy}
          className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
        >
          Add Puppy
        </button>
      </div>
      
      {puppies.map((puppy, index) => (
        <div key={index} className="mb-6 p-6 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={puppy.name}
                onChange={(e) => onPuppyChange(index, 'name', e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                placeholder="Puppy's name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
              <input
                type="text"
                value={puppy.color}
                onChange={(e) => onPuppyChange(index, 'color', e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                placeholder="Puppy's color"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
              <select
                value={puppy.gender}
                onChange={(e) => onPuppyChange(index, 'gender', e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={puppy.status}
                onChange={(e) => onPuppyChange(index, 'status', e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onRemovePuppy(index)}
            className="mt-4 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
          >
            Remove Puppy
          </button>
        </div>
      ))}
    </div>
  );
};

export default Puppys;
