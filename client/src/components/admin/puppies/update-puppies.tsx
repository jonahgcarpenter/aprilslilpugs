import { useState, useRef } from "react";
import {
  usePuppies,
  type Puppy,
  type PuppyInput,
} from "../../../hooks/usepuppies";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaImage,
  FaDog,
  FaSpinner,
  FaPen,
} from "react-icons/fa";

interface UpdatePuppiesProps {
  litterId: string;
}

const UpdatePuppies = ({ litterId }: UpdatePuppiesProps) => {
  const { puppies, createPuppy, updatePuppy, deletePuppy, isLoading } =
    usePuppies(litterId);

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<PuppyInput>({
    litter_id: litterId,
    name: "",
    color: "",
    gender: "Male",
    status: "Available",
    description: "",
    new_gallery_images: [],
    existing_gallery: [],
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData({
      litter_id: litterId,
      name: "",
      color: "",
      gender: "Male",
      status: "Available",
      description: "",
      new_gallery_images: [],
      existing_gallery: [],
    });
    setProfilePreview(null);
    setGalleryPreviews([]);
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEditClick = (puppy: Puppy) => {
    setFormData({
      litter_id: litterId,
      name: puppy.name,
      color: puppy.color,
      gender: puppy.gender,
      status: puppy.status,
      description: puppy.description || "",
      new_gallery_images: [],
      existing_gallery: JSON.parse(JSON.stringify(puppy.images || [])),
    });
    setProfilePreview(puppy.profilePicture);
    setEditingId(puppy.id);
    setIsEditing(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Delete this puppy? This cannot be undone.")) {
      await deletePuppy(id);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "gallery",
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    if (type === "profile") {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, profile_picture: file }));
      setProfilePreview(URL.createObjectURL(file));
    } else {
      const files = Array.from(e.target.files);
      const newImages = files.map((f) => ({ file: f, description: "" }));

      setFormData((prev) => ({
        ...prev,
        new_gallery_images: [...(prev.new_gallery_images || []), ...newImages],
      }));

      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setGalleryPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await updatePuppy(editingId, formData);
      } else {
        await createPuppy(formData);
      }
      resetForm();
    } catch (err) {
      alert("Failed to save puppy.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "Reserved":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "Sold":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      default:
        return "text-slate-400 bg-slate-500/10 border-slate-500/20";
    }
  };

  if (isLoading)
    return (
      <div className="text-blue-400 flex items-center gap-2">
        <FaSpinner className="animate-spin" /> Loading Puppies...
      </div>
    );

  return (
    <div className="mt-8 border-t border-slate-800 pt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FaDog className="text-blue-400" /> Puppies ({puppies.length})
        </h3>
        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="cursor-pointer text-sm bg-blue-600/20 text-blue-300 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2"
          >
            <FaPlus size={12} /> Add Puppy
          </button>
        )}
      </div>

      {/* Puppy List */}
      {!isEditing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {puppies.map((puppy) => (
            <div
              key={puppy.id}
              className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex gap-3 group hover:border-blue-500/30 transition-colors"
            >
              <img
                src={puppy.profilePicture}
                alt={puppy.name}
                className="w-16 h-16 rounded-lg object-cover bg-slate-900"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-white truncate">
                    {puppy.name}
                  </h4>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditClick(puppy)}
                      className="cursor-pointer p-1.5 text-blue-400 hover:bg-blue-500/20 rounded"
                    >
                      <FaEdit size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(puppy.id)}
                      className="cursor-pointer p-1.5 text-red-400 hover:bg-red-500/20 rounded"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  {puppy.color} • {puppy.gender}
                </p>
                <span
                  className={`inline-block mt-1 text-[10px] uppercase px-1.5 py-0.5 rounded border ${getStatusColor(puppy.status)}`}
                >
                  {puppy.status}
                </span>
              </div>
            </div>
          ))}
          {puppies.length === 0 && (
            <div className="col-span-full text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No puppies added to this litter yet.
            </div>
          )}
        </div>
      )}

      {/* Puppy Form */}
      {isEditing && (
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4 animate-in fade-in zoom-in-95">
          <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
            <h4 className="font-bold text-white">
              {editingId ? "Edit Puppy" : "New Puppy"}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer text-slate-400 hover:text-white"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4">
              {/* Profile Pic Input */}
              <div className="w-24 h-24 shrink-0 relative group">
                <div className="w-full h-full rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <FaDog size={24} />
                    </div>
                  )}
                </div>
                <div
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer rounded-lg transition-opacity"
                  onClick={() => profileInputRef.current?.click()}
                >
                  <FaPen className="text-white" />
                </div>
                <input
                  type="file"
                  ref={profileInputRef}
                  onChange={(e) => handleFileChange(e, "profile")}
                  hidden
                  accept="image/*"
                />
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3">
                <input
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                  required
                />
                <input
                  placeholder="Color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, color: e.target.value }))
                  }
                  className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                  required
                />

                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, gender: e.target.value }))
                  }
                  className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>

                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, status: e.target.value }))
                  }
                  className="bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>
            </div>

            <textarea
              placeholder="Description / Personality..."
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({ ...p, description: e.target.value }))
              }
              className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none h-20 resize-none"
            />

            {/* Gallery Section */}
            <div className="border-t border-slate-800 pt-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-slate-400">
                  Puppy Gallery
                </span>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="cursor-pointer text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300"
                >
                  <FaImage /> Add Photos
                </button>
                <input
                  type="file"
                  ref={galleryInputRef}
                  onChange={(e) => handleFileChange(e, "gallery")}
                  hidden
                  multiple
                  accept="image/*"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {/* Existing Gallery Items */}
                {formData.existing_gallery?.map((img, idx) => (
                  <div
                    key={`exist-${idx}`}
                    className="w-16 h-16 shrink-0 relative group rounded-md overflow-hidden"
                  >
                    <img src={img.url} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const newG = [...(formData.existing_gallery || [])];
                        newG.splice(idx, 1);
                        setFormData((p) => ({ ...p, existing_gallery: newG }));
                      }}
                      className="cursor-pointer absolute top-0 right-0 bg-red-600/80 p-1 text-white opacity-0 group-hover:opacity-100"
                    >
                      <FaTimes size={10} />
                    </button>
                  </div>
                ))}

                {/* New Previews */}
                {galleryPreviews.map((src, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="w-16 h-16 shrink-0 relative group rounded-md overflow-hidden border border-blue-500/50"
                  >
                    <img src={src} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-blue-500/20 pointer-events-none" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2 rounded flex justify-center items-center gap-2"
              >
                {isSaving ? (
                  <FaSpinner className="animate-spin" />
                ) : editingId ? (
                  "Update Puppy"
                ) : (
                  "Add Puppy"
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UpdatePuppies;
