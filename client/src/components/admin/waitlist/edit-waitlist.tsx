import { useState, useMemo, Fragment } from "react";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaCalendarAlt,
  FaTimes,
  FaExclamationCircle,
  FaSave,
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
    const activeEntries = waitlist.filter(
      (entry) => entry.status !== "Complete",
    );
    if (!searchTerm) return activeEntries;
    const lower = searchTerm.toLowerCase();
    return activeEntries.filter(
      (entry) =>
        entry.firstname.toLowerCase().includes(lower) ||
        entry.lastname.toLowerCase().includes(lower) ||
        entry.email.toLowerCase().includes(lower),
    );
  }, [waitlist, searchTerm]);

  const handleEditClick = (entry: WaitlistEntry) => {
    if (editingId === entry.id) {
      setEditingId(null);
      return;
    }

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
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800/50 shadow-xl overflow-hidden">
      {/* Header & Search */}
      <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                <Fragment key={entry.id}>
                  {/* Standard Row */}
                  <tr
                    key={entry.id}
                    className={`transition-colors group ${
                      editingId === entry.id
                        ? "bg-blue-500/5 border-l-2 border-l-blue-500"
                        : "hover:bg-slate-800/30"
                    }`}
                  >
                    <td className="p-4 text-slate-400 whitespace-nowrap text-sm align-top">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-slate-600" />
                        {entry.createdAt
                          ? new Date(entry.createdAt).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="font-medium text-slate-200">
                        {entry.firstname} {entry.lastname}
                      </div>
                      {editingId !== entry.id && entry.preferences && (
                        <div className="text-xs text-slate-500 mt-1 max-w-[200px] truncate">
                          {entry.preferences}
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-top">
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
                    <td className="p-4 align-top">
                      {editingId !== entry.id && (
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            entry.status,
                          )}`}
                        >
                          {entry.status}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right align-top">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(entry)}
                          className={`cursor-pointer p-2 rounded-lg transition-colors ${
                            editingId === entry.id
                              ? "text-blue-400 bg-blue-500/10"
                              : "text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                          }`}
                          title={
                            editingId === entry.id ? "Close Edit" : "Edit Entry"
                          }
                        >
                          {editingId === entry.id ? <FaTimes /> : <FaEdit />}
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

                  {/* Edit Row */}
                  {editingId === entry.id && (
                    <tr className="bg-slate-900/50">
                      <td colSpan={5} className="p-0">
                        <div className="p-6 border-y border-blue-500/20 animate-fade-in">
                          {error && (
                            <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-sm">
                              <FaExclamationCircle />
                              <span>{error}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Read-Only Info */}
                            <div className="space-y-4 border-r-0 md:border-r border-slate-800 pr-0 md:pr-8">
                              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                                Contact Information
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <label className="text-xs text-slate-500">
                                    Full Name
                                  </label>
                                  <div className="text-slate-300">
                                    {entry.firstname} {entry.lastname}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs text-slate-500">
                                    Joined Date
                                  </label>
                                  <div className="text-slate-300">
                                    {new Date(
                                      entry.createdAt || "",
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="col-span-2 space-y-1">
                                  <label className="text-xs text-slate-500">
                                    Email
                                  </label>
                                  <div className="text-slate-300 font-mono text-sm">
                                    {entry.email}
                                  </div>
                                </div>
                                <div className="col-span-2 space-y-1">
                                  <label className="text-xs text-slate-500">
                                    Phone
                                  </label>
                                  <div className="text-slate-300 font-mono text-sm">
                                    {entry.phone}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Editable Fields */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-4">
                                Management
                              </h4>
                              <div className="space-y-4">
                                <div>
                                  <label className="block text-xs font-medium text-slate-400 mb-1">
                                    Application Status
                                  </label>
                                  <select
                                    value={formData.status || "New"}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        status: e.target.value,
                                      })
                                    }
                                    className="cursor-pointer w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="New">New</option>
                                    <option value="Contacted">Contacted</option>
                                    <option value="Complete">Complete</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-slate-400 mb-1">
                                    Preferences / Admin Notes
                                  </label>
                                  <textarea
                                    rows={4}
                                    value={formData.preferences || ""}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        preferences: e.target.value,
                                      })
                                    }
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                                    placeholder="Enter preferences or internal notes here..."
                                  />
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                  <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
                                  >
                                    {isSaving ? (
                                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                      <>
                                        <FaSave /> Save Changes
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
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EditWaitlist;
