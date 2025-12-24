import { useState, useMemo } from "react";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCheck,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import type {
  WaitlistEntry,
  WaitlistUpdateInput,
} from "../../../hooks/usewaitlist";

interface EditWaitlistProps {
  waitlist: WaitlistEntry[];
  onUpdate: (
    id: number | string,
    data: Partial<WaitlistUpdateInput>,
  ) => Promise<void>;
  onDelete: (id: number | string) => Promise<void>;
}

export const EditWaitlist = ({
  waitlist,
  onUpdate,
  onDelete,
}: EditWaitlistProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<WaitlistUpdateInput>>({});

  const filteredWaitlist = useMemo(() => {
    if (!searchTerm) return waitlist;
    const lower = searchTerm.toLowerCase();
    return waitlist.filter(
      (entry) =>
        entry.firstname.toLowerCase().includes(lower) ||
        entry.lastname.toLowerCase().includes(lower) ||
        entry.email.toLowerCase().includes(lower),
    );
  }, [waitlist, searchTerm]);

  const handleEditClick = (entry: WaitlistEntry) => {
    setError(null);
    setEditingId(entry.id);
    setFormData({
      firstname: entry.firstname,
      lastname: entry.lastname,
      email: entry.email,
      phone: entry.phone,
      preferences: entry.preferences,
      status: entry.status,
    });
  };

  const handleSave = async () => {
    if (editingId === null) return;
    setIsSaving(true);
    setError(null);

    try {
      await onUpdate(editingId, formData);
      setEditingId(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to delete this entry? This cannot be undone.",
      )
    ) {
      setIsDeleting(id);
      try {
        await onDelete(id);
      } catch (err) {
        console.error(err);
        alert("Failed to delete entry.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Contacted":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "Complete":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      default:
        return "bg-slate-700/50 text-slate-400";
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
      {/* Header & Search */}
      <div className="pb-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            Waitlist
          </h2>
          <p className="text-white/60 text-sm">
            Manage upcoming puppy requests
          </p>
        </div>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/50 text-slate-400 text-sm uppercase tracking-wider">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredWaitlist.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  {searchTerm
                    ? "No matching entries found."
                    : "Waitlist is empty."}
                </td>
              </tr>
            ) : (
              filteredWaitlist.map((entry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="p-4 text-slate-400 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-slate-600" />
                      {entry.created_at
                        ? new Date(entry.created_at).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-slate-200">
                      {entry.firstname} {entry.lastname}
                    </div>
                    {entry.preferences && (
                      <div className="text-xs text-slate-500 mt-1 max-w-[200px] truncate">
                        {entry.preferences}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1 text-sm">
                      <a
                        href={`mailto:${entry.email}`}
                        className="flex items-center gap-2 text-blue-400 hover:underline"
                      >
                        <FaEnvelope className="text-xs" /> {entry.email}
                      </a>
                      {entry.phone && (
                        <div className="flex items-center gap-2 text-slate-400">
                          <FaPhone className="text-xs" /> {entry.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        entry.status,
                      )}`}
                    >
                      {entry.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(entry)}
                        className="cursor-pointer p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit Entry"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        disabled={isDeleting === entry.id}
                        className="cursor-pointer p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete Entry"
                      >
                        {isDeleting === entry.id ? (
                          <span className="block w-4 h-4 border-2 border-slate-500 border-t-red-500 rounded-full animate-spin" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-100">Edit Entry</h3>
              <button
                onClick={() => setEditingId(null)}
                className="cursor-pointer text-slate-500 hover:text-white transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-sm">
                <FaExclamationCircle />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstname || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, firstname: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastname || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, lastname: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={formData.status || "New"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="cursor-pointer w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none appearance-none"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Complete">Complete</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Preferences
                </label>
                <textarea
                  rows={3}
                  value={formData.preferences || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, preferences: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-800">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FaCheck /> Save Changes
                  </>
                )}
              </button>
              <button
                onClick={() => setEditingId(null)}
                disabled={isSaving}
                className="cursor-pointer px-4 py-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditWaitlist;
