import { useState, useRef } from "react";
import {
  usePuppies,
  type Puppy,
  type PuppyInput,
} from "../../../hooks/usepuppies";
import {
  FaPlus,
  FaTrash,
  FaSave,
  FaImage,
  FaSpinner,
  FaPen,
  FaArrowLeft,
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

  const handleNewDescriptionChange = (index: number, text: string) => {
    setFormData((prev) => {
      const newImages = [...(prev.new_gallery_images || [])];
      if (newImages[index]) {
        newImages[index].description = text;
      }
      return { ...prev, new_gallery_images: newImages };
    });
  };

  const handleExistingDescriptionChange = (index: number, text: string) => {
    setFormData((prev) => {
      const newGallery = [...(prev.existing_gallery || [])];
      newGallery[index].description = text;
      return { ...prev, existing_gallery: newGallery };
    });
  };

  const handleRemoveExistingImage = (index: number) => {
    if (!window.confirm("Remove this image? It will be deleted when you save."))
      return;
    setFormData((prev) => {
      const newGallery = [...(prev.existing_gallery || [])];
      newGallery.splice(index, 1);
      return { ...prev, existing_gallery: newGallery };
    });
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

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header / Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {isEditing && (
            <button
              onClick={resetForm}
              className="cursor-pointer mr-2 p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors"
            >
              <FaArrowLeft />
            </button>
          )}
          <h2 className="text-lg font-semibold text-white">
            {isEditing
              ? editingId
                ? "Editing Puppy"
                : "New Puppy"
              : `Puppies (${puppies.length})`}
          </h2>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-blue-500/20"
          >
            <FaPlus size={12} /> Add Puppy
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && !isEditing && (
        <div className="text-blue-400 flex items-center justify-center py-12 gap-2">
          <FaSpinner className="animate-spin" /> Loading Puppies...
        </div>
      )}

      {/* Mode: List View */}
      {!isEditing && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {puppies.map((puppy) => (
            <div
              key={puppy.id}
              onClick={() => handleEditClick(puppy)}
              className="cursor-pointer bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-4 items-center group hover:border-blue-500/30 transition-colors"
            >
              <img
                src={puppy.profilePicture}
                alt={puppy.name}
                className="w-20 h-20 rounded-lg object-cover border border-slate-700"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-white">{puppy.name}</h3>
                  <span
                    className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${getStatusColor(puppy.status)}`}
                  >
                    {puppy.status}
                  </span>
                </div>
                <p className="text-sm text-white/50">
                  {puppy.color} • {puppy.gender}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(puppy.id);
                  }}
                  className="cursor-pointer p-2 hover:bg-red-600 hover:text-white text-slate-400 rounded-lg transition-colors"
                  title="Delete"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}

          {/* Empty State / Add Placeholder */}
          {puppies.length === 0 && (
            <div
              onClick={() => setIsEditing(true)}
              className="col-span-full cursor-pointer group border-2 border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
                <FaPlus />
              </div>
              <p className="text-sm text-slate-500 group-hover:text-slate-400">
                No puppies yet. Click to add one.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mode: Editor Form */}
      {isEditing && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Profile Picture */}
            <div className="mx-auto sm:mx-0 w-32 h-32 shrink-0 relative group">
              <div className="aspect-square w-full h-full rounded-xl overflow-hidden border-2 border-white/10 shadow-xl bg-slate-800">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaImage className="text-4xl text-slate-600" />
                  </div>
                )}
              </div>
              <div
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10"
                onClick={() => profileInputRef.current?.click()}
              >
                <FaPen className="text-white text-3xl" />
              </div>
              <input
                type="file"
                ref={profileInputRef}
                onChange={(e) => handleFileChange(e, "profile")}
                accept="image/*"
                className="hidden"
              />

              <p className="text-center text-xs text-white/50 mt-2 relative z-10">
                Tap to change
              </p>
            </div>

            {/* Identity Details */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-400">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none placeholder-white/20"
                    placeholder="e.g. Spot"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-400">
                    Color
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.color}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, color: e.target.value }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none placeholder-white/20"
                    placeholder="e.g. Fawn"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-400">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, gender: "Male" }))
                      }
                      className={`cursor-pointer px-4 py-3 rounded-lg transition-all ${
                        formData.gender === "Male"
                          ? "bg-blue-600 border-blue-500 font-semibold text-white shadow-lg shadow-blue-500/20"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, gender: "Female" }))
                      }
                      className={`cursor-pointer px-4 py-3 rounded-lg transition-all ${
                        formData.gender === "Female"
                          ? "bg-pink-500 border-pink-400 font-semibold text-white shadow-lg shadow-pink-400/20"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-400">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, status: e.target.value }))
                    }
                    className="w-full cursor-pointer bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-400">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  description: e.target.value,
                }))
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none placeholder-white/20"
              placeholder="Puppy personality..."
            />
          </div>

          {/* Gallery Editor */}
          {formData.existing_gallery &&
            formData.existing_gallery.length > 0 && (
              <div className="md:col-span-3 space-y-4 pt-4 border-t border-slate-800">
                <label className="text-sm font-medium text-blue-400 block">
                  Current Gallery
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.existing_gallery.map((img, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-3 bg-slate-950 rounded-lg border border-slate-800"
                    >
                      <img
                        src={img.url}
                        className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                        alt=""
                      />
                      <div className="flex flex-col flex-1 gap-2">
                        <textarea
                          placeholder="Image description..."
                          value={img.description || ""}
                          onChange={(e) =>
                            handleExistingDescriptionChange(
                              index,
                              e.target.value,
                            )
                          }
                          className="w-full h-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white resize-none focus:border-blue-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(index)}
                          className="cursor-pointer text-xs text-red-400 hover:text-red-300 self-end flex items-center gap-1"
                        >
                          <FaTrash /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          <div className="md:col-span-3 space-y-2 pt-4 border-t border-slate-800">
            <label className="text-sm font-medium text-blue-400 flex justify-between">
              <span>Upload New Photos</span>
              <span className="text-xs text-white/40">
                {galleryPreviews.length} added
              </span>
            </label>

            <div
              onClick={() => galleryInputRef.current?.click()}
              className="cursor-pointer bg-slate-950/50 border border-dashed border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center hover:border-blue-500/50 transition-colors"
            >
              <FaImage className="text-3xl text-slate-700 mb-2" />
              <span className="text-sm text-slate-500">
                Click to add photos
              </span>
            </div>
            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "gallery")}
            />

            {/* Gallery Previews */}
            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {galleryPreviews.map((src, i) => (
                  <div
                    key={i}
                    className="flex gap-4 p-3 bg-slate-950 rounded-lg border border-slate-800 relative"
                  >
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-xs px-2 py-0.5 rounded-full text-white shadow-sm">
                      New
                    </div>
                    <img
                      src={src}
                      className="w-24 h-24 object-cover rounded-md flex-shrink-0"
                      alt=""
                    />
                    <div className="flex flex-col flex-1 gap-2">
                      <textarea
                        placeholder="Add a description..."
                        value={
                          formData.new_gallery_images?.[i]?.description || ""
                        }
                        onChange={(e) =>
                          handleNewDescriptionChange(i, e.target.value)
                        }
                        className="w-full h-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-white resize-none focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-4 border-t border-white/10">
            <button
              type="submit"
              disabled={isSaving}
              className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Save Puppy
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UpdatePuppies;
