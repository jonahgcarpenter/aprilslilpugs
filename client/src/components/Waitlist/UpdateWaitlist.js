import React, { useState } from "react";
import { useWaitlist } from "../../hooks/useWaitlist";
import LoadingAnimation from "../Misc/LoadingAnimation";
import DeleteModal from "../Modals/DeleteModal";
import { createPortal } from "react-dom";

// BUG:  Sometimes we get 401 error immediately after login

const UpdateWaitlist = () => {
  const { entries, isLoading, error, updateWaitlist, deleteWaitlist } =
    useWaitlist();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateWaitlist({ id, data: { status: newStatus } });
    } catch (err) {
      alert(`Failed to update status for entry ${id}: ${err?.message || err}`);
    }
  };

  const handleDeleteClick = (entry) => {
    setEntryToDelete(entry);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!entryToDelete) return;

    try {
      await deleteWaitlist({ id: entryToDelete._id });
      setIsDeleteModalOpen(false);
      setEntryToDelete(null);
    } catch (err) {
      alert(`Failed to delete entry ${entryToDelete._id}: ${err.message}`);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setEntryToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <LoadingAnimation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <p className="text-red-500 text-center">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-2 sm:mx-4">
      <div className="relative bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            Waitlist Management
          </h2>
          <span className="text-sm text-slate-400">
            {Array.isArray(entries) ? `${entries.length} entries` : "0 entries"}
          </span>
        </div>
        <div className="max-w-full overflow-x-auto">
          <table className="w-full divide-y divide-slate-800">
            <thead>
              <tr>
                <th className="p-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  #
                </th>
                <th className="p-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="hidden sm:table-cell p-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Phone
                </th>
                <th className="p-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden sm:table-cell p-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Preferences
                </th>
                <th className="p-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {Array.isArray(entries) && entries.length > 0 ? (
                entries.map((entry) => (
                  <tr
                    key={entry._id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                          entry.position === 1
                            ? "bg-green-500/10 text-green-400"
                            : "bg-blue-500/10 text-blue-400"
                        } text-sm sm:text-base font-semibold`}
                      >
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
                        onChange={(e) =>
                          handleStatusChange(entry._id, e.target.value)
                        }
                        className="bg-slate-800 text-slate-300 text-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 border border-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="waiting">Waiting</option>
                        <option value="contacted">Contacted</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="hidden sm:table-cell p-2 sm:px-6 sm:py-4">
                      <div className="text-slate-300 max-w-[200px] sm:max-w-xs text-sm truncate">
                        {entry.notes || "No preferences specified"}
                      </div>
                    </td>
                    <td className="p-2 sm:px-6 sm:py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          handleDeleteClick(entry);
                        }}
                        className="text-red-400 hover:text-red-300 transition-colors px-2 py-1 sm:px-4 sm:py-2 text-sm rounded-lg hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    {Array.isArray(entries)
                      ? "No entries in the waitlist"
                      : "Error loading waitlist entries"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Delete Modal Portal */}
      {createPortal(
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          onDelete={handleDeleteConfirm}
          title="Delete Waitlist Entry"
          message="This action cannot be undone."
          itemName={
            entryToDelete
              ? `${entryToDelete.firstName} ${entryToDelete.lastName}'s entry`
              : "this entry"
          }
        />,
        document.body,
      )}
    </div>
  );
};

export default UpdateWaitlist;
