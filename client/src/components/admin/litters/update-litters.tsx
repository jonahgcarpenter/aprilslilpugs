import { useState, useRef, useMemo } from "react";
import type { Litter, LitterInput } from "../../../hooks/uselitters";
import type { Dog } from "../../../hooks/usedogs";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaImage,
  FaPaw,
  FaSpinner,
  FaPen,
} from "react-icons/fa";

interface UpdateLittersProps {
  litters: Litter[];
  dogs: Dog[];
  onCreate: (data: LitterInput) => Promise<void>;
  onUpdate: (id: string, data: LitterInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const UpdateLitters = ({
  litters,
  dogs,
  onCreate,
  onUpdate,
  onDelete,
}: UpdateLittersProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<LitterInput>({
    name: "",
    status: "Planned",
    birth_date: "",
    available_date: "",
    external_mother_name: "",
    external_father_name: "",
    mother_id: "",
    father_id: "",
    new_gallery_images: [],
    existing_gallery: [],
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const dams = useMemo(() => dogs.filter((d) => d.gender === "Female"), [dogs]);
  const sires = useMemo(() => dogs.filter((d) => d.gender === "Male"), [dogs]);

  const resetForm = () => {
    setFormData({
      name: "",
      status: "Planned",
      birth_date: "",
      available_date: "",
      external_mother_name: "",
      external_father_name: "",
      mother_id: "",
      father_id: "",
      new_gallery_images: [],
      existing_gallery: [],
    });
    setProfilePreview(null);
    setGalleryPreviews([]);
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEditClick = (litter: Litter) => {
    setFormData({
      name: litter.name,
      status: litter.status,
      // Ensure date strings are formatted YYYY-MM-DD
      birth_date: litter.birthDate.split("T")[0],
      available_date: litter.availableDate.split("T")[0],
      external_mother_name: litter.externalMotherName || "",
      external_father_name: litter.externalFatherName || "",
      mother_id: litter.motherId || "",
      father_id: litter.fatherId || "",
      new_gallery_images: [],
      existing_gallery: JSON.parse(JSON.stringify(litter.images || [])),
    });
    setProfilePreview(litter.profilePicture);
    setEditingId(litter.id);
    setIsEditing(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this litter? This cannot be undone.",
      )
    ) {
      await onDelete(id);
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
        await onUpdate(editingId, formData);
      } else {
        await onCreate(formData);
      }
      resetForm();
    } catch (err) {
      alert("Failed to save litter. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Planned":
        return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
      case "Available":
        return "text-green-400 border-green-500/30 bg-green-500/10";
      case "Sold":
        return "text-red-400 border-red-500/30 bg-red-500/10";
      default:
        return "text-slate-400 border-slate-500/30 bg-slate-500/10";
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
              Manage Litters
            </h2>
            <p className="text-white/60 text-sm">
              Track litters, dates, and availability
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <FaPlus /> Add Litter
            </button>
          )}
        </div>

        {/* Mode: List View */}
        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {litters.map((litter) => (
              <div
                key={litter.id}
                onClick={() => handleEditClick(litter)}
                className="cursor-pointer bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-4 items-center group hover:border-blue-500/30 transition-colors"
              >
                <img
                  src={litter.profilePicture}
                  alt={litter.name}
                  className="w-20 h-20 rounded-lg object-cover border border-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white truncate">
                      {litter.name}
                    </h3>
                    <span
                      className={`text-[10px] uppercase px-2 py-0.5 rounded border ${getStatusColor(
                        litter.status,
                      )}`}
                    >
                      {litter.status}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 truncate">
                    Dam: {litter.motherName}
                  </p>
                  <p className="text-xs text-white/50 truncate">
                    Sire: {litter.fatherName}
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(litter.id);
                    }}
                    className="cursor-pointer p-2 bg-slate-800 hover:bg-red-600 text-white rounded-lg transition-colors"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mode: Editor Form */}
        {isEditing && (
          <form
            onSubmit={handleSubmit}
            className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {editingId ? (
                  <>
                    <FaEdit className="text-blue-400" /> Edit Litter
                  </>
                ) : (
                  <>
                    <FaPaw className="text-blue-400" /> New Litter
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={resetForm}
                className="cursor-pointer text-white/50 hover:text-white"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile Picture */}
              <div className="md:col-span-1 flex flex-col">
                <div className="relative group w-full aspect-square">
                  <div className="relative w-full h-full rounded-xl overflow-hidden border-2 border-white/10 shadow-xl bg-slate-800">
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
                    <div
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10"
                      onClick={() => profileInputRef.current?.click()}
                    >
                      <FaPen className="text-white text-3xl" />
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={profileInputRef}
                    onChange={(e) => handleFileChange(e, "profile")}
                    accept="image/*"
                    className="hidden"
                  />
                  <p className="text-center text-xs text-white/50 mt-2 relative z-10">
                    Main Photo
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col gap-5 justify-center">
                {/* Name & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-400">
                      Litter Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none placeholder-white/20"
                      placeholder="e.g. The Avengers"
                    />
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
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="Planned">Planned</option>
                      <option value="Available">Available</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-400">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.birth_date}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          birth_date: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-400">
                      Available Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.available_date}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          available_date: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Mother Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-pink-400">
                      Mother
                    </label>
                    <select
                      value={formData.mother_id || ""}
                      onChange={(e) => {
                        const id = e.target.value;
                        setFormData((p) => ({
                          ...p,
                          mother_id: id,
                          external_mother_name: id
                            ? ""
                            : p.external_mother_name,
                        }));
                      }}
                      className="cursor-pointer w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none mb-2"
                    >
                      <option value="">External / Manual Entry</option>
                      {dams.map((dog) => (
                        <option key={dog.id} value={dog.id}>
                          {dog.name}
                        </option>
                      ))}
                    </select>

                    {!formData.mother_id && (
                      <input
                        type="text"
                        value={formData.external_mother_name}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            external_mother_name: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-pink-500 focus:outline-none mb-2"
                        placeholder="Type external mother's name..."
                      />
                    )}
                  </div>

                  {/* Father Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-400">
                      Father
                    </label>
                    <select
                      value={formData.father_id || ""}
                      onChange={(e) => {
                        const id = e.target.value;
                        setFormData((p) => ({
                          ...p,
                          father_id: id,
                          external_father_name: id
                            ? ""
                            : p.external_father_name,
                        }));
                      }}
                      className="cursor-pointer w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none mb-2"
                    >
                      <option value="">External / Manual Entry</option>
                      {sires.map((dog) => (
                        <option key={dog.id} value={dog.id}>
                          {dog.name}
                        </option>
                      ))}
                    </select>

                    {!formData.father_id && (
                      <input
                        type="text"
                        value={formData.external_father_name}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            external_father_name: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none mb-2"
                        placeholder="Type external father's name..."
                      />
                    )}
                  </div>
                </div>
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

                {/* New Gallery Previews */}
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
                              formData.new_gallery_images?.[i]?.description ||
                              ""
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
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <button
                type="submit"
                disabled={isSaving}
                className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isSaving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                {editingId ? "Save Changes" : "Create Litter"}
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
    </div>
  );
};

export default UpdateLitters;
