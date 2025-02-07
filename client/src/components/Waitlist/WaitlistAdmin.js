import React, { useState, useContext, memo } from "react";
import { WaitlistContext } from "../../context/WaitlistContext";
import { useSettings } from "../../context/SettingsContext";
import DeleteModal from "../Modals/DeleteModal";
import SuccessModal from "../Modals/SuccessModal";
import ErrorModal from "../Modals/ErrorModal";
import LoadingAnimation from "../Misc/LoadingAnimation";

const WaitlistAdmin = memo(() => {
  const {
    updateEntry,
    deleteEntry,
    entries,
    isLoading: entriesLoading,
  } = useContext(WaitlistContext);
  const {
    waitlistEnabled,
    isLoading: settingsLoading,
    error: settingsError,
  } = useSettings();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState(
    "Operation completed successfully!",
  );

  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoading(true);
      const result = await updateEntry(id, { status: newStatus });
      if (!result) {
        throw new Error("Failed to update status");
      }
      setError(null);
      setSuccessMessage("Status updated successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const result = await deleteEntry(id);
      if (!result) {
        throw new Error("Failed to delete entry");
      }
      setShowDeleteModal(false);
      setEntryToDelete(null);
      setError(null);
      setSuccessMessage("Entry deleted successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message || "Failed to delete entry");
    } finally {
      setLoading(false);
    }
  };

  if (settingsLoading || entriesLoading) {
    return (
      <div className="mx-2 sm:mx-4">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
          <div className="min-h-[200px] flex items-center justify-center">
            <LoadingAnimation />
          </div>
        </div>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className="mx-2 sm:mx-4">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
          <div className="text-red-400 text-center">
            <p className="text-lg font-medium mb-2">
              Error loading waitlist settings
            </p>
            <p className="text-sm opacity-90">{settingsError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (waitlistEnabled === null) {
    return (
      <div className="mx-2 sm:mx-4">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
          <div className="text-red-400 text-center">
            <p className="text-lg font-medium mb-2">Error</p>
            <p className="text-sm opacity-90">
              Unable to determine waitlist status
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!waitlistEnabled) {
    return (
      <div className="mx-2 sm:mx-4">
        <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
          <div className="text-slate-400 text-center">
            <p>Waitlist is currently disabled</p>
            <p className="text-sm">Enable the waitlist to manage entries</p>
          </div>
        </div>
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

        {error && (
          <div className="mb-4 sm:mb-6 p-3 mx-2 sm:mx-0 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

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
                        disabled={loading}
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
                          setEntryToDelete(entry._id);
                          setShowDeleteModal(true);
                        }}
                        disabled={loading}
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

        {loading && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
            <LoadingAnimation />
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setEntryToDelete(null);
        }}
        onDelete={() => handleDelete(entryToDelete)}
        itemName="this waitlist entry"
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
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
