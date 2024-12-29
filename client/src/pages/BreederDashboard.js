import { useAuth } from '../context/AuthContext';

const BreederDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="py-8">
      <div className="bg-slate-800 rounded-xl p-8 shadow-lg">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            Breeder Dashboard
          </h1>
          <button
            onClick={logout}
            className="bg-gradient-to-r from-red-600 to-red-400 hover:from-red-700 hover:to-red-500 text-white px-6 py-2 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            Logout
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-slate-700 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-slate-400">Name</p>
              <p className="text-white">{user?.firstName} {user?.lastName}</p>
            </div>
            <div>
              <p className="text-slate-400">Email</p>
              <p className="text-white">{user?.email}</p>
            </div>
            <div>
              <p className="text-slate-400">Phone</p>
              <p className="text-white">{user?.phoneNumber}</p>
            </div>
            <div>
              <p className="text-slate-400">Location</p>
              <p className="text-white">{user?.location}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <button className="bg-slate-700 p-6 rounded-lg hover:bg-slate-600 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">Update Profile</h3>
            <p className="text-slate-400">Modify your profile information</p>
          </button>
          <button className="bg-slate-700 p-6 rounded-lg hover:bg-slate-600 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">Manage Puppies</h3>
            <p className="text-slate-400">Add or update puppy listings</p>
          </button>
          <button className="bg-slate-700 p-6 rounded-lg hover:bg-slate-600 transition-colors">
            <h3 className="text-lg font-semibold text-white mb-2">Messages</h3>
            <p className="text-slate-400">View inquiries and messages</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreederDashboard;