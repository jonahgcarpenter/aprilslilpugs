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
  FaChevronDown,
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
  const [expandedId, setExpandedId] = useState<number | null>(null);
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
    setExpandedId(entry.id);
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

  const formatDate = (date?: string | null) => {
    return date ? new Date(date).toLocaleDateString() : "N/A";
  };

  const renderEditPanel = (entry: WaitlistEntry) => (
    <div className="p-4 sm:p-6 border border-blue-500/20 bg-slate-900/70 sm:border-y sm:border-x-0 animate-fade-in">
      {error && (
        <div className="mb-4 flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-sm">
          <FaExclamationCircle />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
        <div className="space-y-4 xl:border-r xl:border-slate-800 xl:pr-8">
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <label className="text-xs text-slate-500">Full Name</label>
              <div className="text-slate-300">
                {entry.firstname} {entry.lastname}
              </div>
            </div>
            <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <label className="text-xs text-slate-500">Joined Date</label>
              <div className="text-slate-300">
                {formatDate(entry.createdAt)}
              </div>
            </div>
            <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/70 p-3 sm:col-span-2">
              <label className="text-xs text-slate-500">Email</label>
              <div className="break-all text-slate-300 font-mono text-sm">
                {entry.email}
              </div>
            </div>
            <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/70 p-3 sm:col-span-2">
              <label className="text-xs text-slate-500">Phone</label>
              <div className="text-slate-300 font-mono text-sm">
                {entry.phone || "No phone provided"}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
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
                className="cursor-pointer w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                rows={5}
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

            <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="cursor-pointer justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
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
                className="cursor-pointer px-4 py-2.5 text-slate-400 hover:text-white transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-800/50 shadow-xl overflow-hidden">
      {/* Header & Search */}
      <div className="p-5 sm:p-6 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
            Waitlist
          </h2>
          <p className="text-white/60 text-sm">
            Manage upcoming puppy requests
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-xs font-medium text-slate-400">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            {filteredWaitlist.length} active{" "}
            {filteredWaitlist.length === 1 ? "entry" : "entries"}
          </div>
          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 w-full"
            />
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-4">
        {filteredWaitlist.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center text-slate-500">
            {searchTerm ? "No matching entries found." : "Waitlist is empty."}
          </div>
        ) : (
          filteredWaitlist.map((entry) => (
            <div
              key={entry.id}
              onClick={() =>
                setExpandedId(expandedId === entry.id ? null : entry.id)
              }
              className={`overflow-hidden rounded-2xl border transition-colors ${
                editingId === entry.id
                  ? "border-blue-500/40 bg-blue-500/5 shadow-lg shadow-blue-950/20"
                  : "border-slate-800 bg-slate-950/60"
              } cursor-pointer`}
            >
              <div className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-slate-100">
                      {entry.firstname} {entry.lastname}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <FaCalendarAlt className="text-slate-600" />
                        {formatDate(entry.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        entry.status,
                      )}`}
                    >
                      {entry.status}
                    </span>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-900 text-slate-400 transition-transform ${
                        expandedId === entry.id
                          ? "rotate-180 text-blue-300"
                          : ""
                      }`}
                    >
                      <FaChevronDown className="text-xs" />
                    </span>
                  </div>
                </div>

                <div className="grid gap-2 text-sm">
                  <a
                    href={`mailto:${entry.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-start gap-2 text-blue-400 hover:underline break-all"
                  >
                    <FaEnvelope className="mt-0.5 text-xs shrink-0" />
                    <span className="truncate">{entry.email}</span>
                  </a>
                  {expandedId === entry.id && entry.phone && (
                    <div className="flex items-start gap-2 text-slate-400 break-all">
                      <FaPhone className="mt-0.5 text-xs shrink-0" />
                      <span>{entry.phone}</span>
                    </div>
                  )}
                </div>

                {expandedId === entry.id &&
                  entry.preferences &&
                  editingId !== entry.id && (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-sm text-slate-400">
                      {entry.preferences}
                    </div>
                  )}

                {expandedId === entry.id && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(entry);
                      }}
                      className={`cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        editingId === entry.id
                          ? "bg-blue-500/10 text-blue-300 border border-blue-500/30"
                          : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-blue-500/30 hover:text-blue-300"
                      }`}
                      title={
                        editingId === entry.id ? "Close Edit" : "Edit Entry"
                      }
                    >
                      {editingId === entry.id ? <FaTimes /> : <FaEdit />}
                      {editingId === entry.id ? "Close" : "Edit"}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(entry.id);
                      }}
                      disabled={isDeleting === entry.id}
                      className="cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-red-300 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors disabled:opacity-50"
                      title="Delete Entry"
                    >
                      {isDeleting === entry.id ? (
                        <span className="block w-4 h-4 border-2 border-red-200/30 border-t-red-300 rounded-full animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {(expandedId === entry.id || editingId === entry.id) &&
                editingId === entry.id && (
                  <div onClick={(e) => e.stopPropagation()}>
                    {renderEditPanel(entry)}
                  </div>
                )}
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
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
                        {formatDate(entry.createdAt)}
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
                        {renderEditPanel(entry)}
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
