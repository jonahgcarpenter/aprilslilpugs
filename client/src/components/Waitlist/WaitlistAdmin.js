import React, { useState, useContext, memo } from 'react';
import { WaitlistContext } from '../../context/WaitlistContext';
import DeleteModal from '../Modals/DeleteModal';
import SuccessModal from '../Modals/SuccessModal';
import ErrorModal from '../Modals/ErrorModal';
import LoadingAnimation from '../LoadingAnimation';

const WaitlistAdmin = memo(() => {
    const { updateEntry, deleteEntry, entries, isEnabled } = useContext(WaitlistContext);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);

    const handleStatusChange = async (id, newStatus) => {
        try {
            setLoading(true);
            const result = await updateEntry(id, { status: newStatus });
            if (!result) {
                throw new Error('Failed to update status');
            }
            setError(null);
            setShowSuccessModal(true);
        } catch (err) {
            setError(err.message || 'Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            setLoading(true);
            const result = await deleteEntry(id);
            if (!result) {
                throw new Error('Failed to delete entry');
            }
            setShowDeleteModal(false);
            setEntryToDelete(null);
            setError(null);
            setShowSuccessModal(true);
        } catch (err) {
            setError(err.message || 'Failed to delete entry');
        } finally {
            setLoading(false);
        }
    };

    if (!isEnabled) return null;

    return (
        <div className="mx-2 sm:mx-4">
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
                        Waitlist Management
                    </h2>
                </div>

                {error && (
                    <div className="mb-4 sm:mb-6 p-3 mx-2 sm:mx-0 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                        {error}
                    </div>
                )}

                <div className="max-w-full overflow-x-auto">
                    <table className="w-full divide-y divide-slate-800">
                        <thead>
                            <tr>
                                <th className="p-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">#</th>
                                <th className="p-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th>
                                <th className="hidden sm:table-cell p-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Phone</th>
                                <th className="p-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="hidden sm:table-cell p-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Preferences</th>
                                <th className="p-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {entries.map((entry) => (
                                <tr key={entry._id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="p-2 sm:px-6 sm:py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                                            entry.position === 1 ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                                        } text-sm sm:text-base font-semibold`}>
                                            {entry.position}
                                        </span>
                                    </td>
                                    <td className="p-2 sm:px-6 sm:py-4 whitespace-nowrap text-slate-300 text-sm sm:text-base">
                                        {entry.firstName} {entry.lastName}
                                    </td>
                                    <td className="hidden sm:table-cell p-2 sm:px-6 sm:py-4 whitespace-nowrap text-slate-300">
                                        {entry.phoneNumber}
                                    </td>
                                    <td className="p-2 sm:px-6 sm:py-4 whitespace-nowrap">
                                        <select
                                            value={entry.status}
                                            onChange={(e) => handleStatusChange(entry._id, e.target.value)}
                                            className="bg-slate-800 text-slate-300 text-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 border border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none"
                                        >
                                            <option value="waiting">Waiting</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </td>
                                    <td className="hidden sm:table-cell p-2 sm:px-6 sm:py-4">
                                        <div className="text-slate-300 max-w-[200px] sm:max-w-xs text-sm truncate">
                                            {entry.notes || 'No preferences specified'}
                                        </div>
                                    </td>
                                    <td className="p-2 sm:px-6 sm:py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => {
                                                setEntryToDelete(entry._id);
                                                setShowDeleteModal(true);
                                            }}
                                            className="text-red-400 hover:text-red-300 transition-colors px-2 py-1 sm:px-4 sm:py-2 text-sm rounded-lg hover:bg-red-500/10"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {entries.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                                        No entries in the waitlist
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {loading && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
                        <LoadingAnimation />
                    </div>
                )}
            </div>

            <DeleteModal 
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onDelete={() => handleDelete(entryToDelete)}
                itemName="this waitlist entry"
            />

            <SuccessModal 
                isOpen={showSuccessModal}
                message="Operation completed successfully!"
            />

            <ErrorModal 
                isOpen={!!error}
                onClose={() => setError(null)}
                message={error}
            />
        </div>
    );
});

export default WaitlistAdmin;
