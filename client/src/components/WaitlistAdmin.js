import { useEffect } from 'react';
import { useWaitlist } from '../context/WaitlistContext';

const WaitlistAdmin = () => {
  const { entries, refreshEntries, updateEntry, deleteEntry } = useWaitlist();

  useEffect(() => {
    refreshEntries();
  }, []);

  const handleStatusChange = (id, status) => {
    updateEntry(id, { status });
  };

  const handleNotesChange = (id, notes) => {
    updateEntry(id, { notes });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      deleteEntry(id);
    }
  };

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 mb-8">
        Waitlist Management
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-slate-300">
          <thead>
            <tr className="text-left border-b border-slate-700">
              <th className="p-4">Name</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Notes</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry._id} className="border-b border-slate-800/50">
                <td className="p-4">{`${entry.firstName} ${entry.lastName}`}</td>
                <td className="p-4">{entry.phoneNumber}</td>
                <td className="p-4">{new Date(entry.submissionDate).toLocaleDateString()}</td>
                <td className="p-4">
                  <select
                    value={entry.status}
                    onChange={(e) => handleStatusChange(entry._id, e.target.value)}
                    className="bg-slate-800 rounded p-2"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
                <td className="p-4">
                  <input
                    type="text"
                    value={entry.notes || ''}
                    onChange={(e) => handleNotesChange(entry._id, e.target.value)}
                    className="bg-slate-800 rounded p-2 w-full"
                    placeholder="Add notes..."
                  />
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WaitlistAdmin;
