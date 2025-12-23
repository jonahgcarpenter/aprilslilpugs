import { useState, useRef } from "react";
import type { Dog, DogInput } from "../../../hooks/usedogs";
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

interface UpdateDogsProps {
  dogs: Dog[];
  onCreate: (data: DogInput) => Promise<boolean>;
  onUpdate: (id: string, data: DogInput) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

const UpdateDogs = ({
  dogs,
  onCreate,
  onUpdate,
  onDelete,
}: UpdateDogsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<DogInput>({
    name: "",
    gender: "Male",
    description: "",
    birthDate: "",
    galleryFiles: [],
    galleryDescriptions: [],
    existingGallery: [],
  });

  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData({
      name: "",
      gender: "Male",
      description: "",
      birthDate: "",
      galleryFiles: [],
      galleryDescriptions: [],
      existingGallery: [],
    });
    setProfilePreview(null);
    setGalleryPreviews([]);
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEditClick = (dog: Dog) => {
    setFormData({
      name: dog.name,
      gender: dog.gender,
      description: dog.description,
      birthDate: dog.birthDate,
      galleryFiles: [],
      galleryDescriptions: [],
      existingGallery: JSON.parse(JSON.stringify(dog.gallery || [])),
    });
    setProfilePreview(dog.profilePicture);
    setEditingId(dog.id);
    setIsEditing(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this dog? This cannot be undone.",
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
      setFormData((prev) => ({ ...prev, profilePictureFile: file }));
      setProfilePreview(URL.createObjectURL(file));
    } else {
      const files = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        galleryFiles: files,
        galleryDescriptions: new Array(files.length).fill(""),
      }));

      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setGalleryPreviews(newPreviews);
    }
  };

  const handleNewDescriptionChange = (index: number, text: string) => {
    setFormData((prev) => {
      const newDescs = [...(prev.galleryDescriptions || [])];
      newDescs[index] = text;
      return { ...prev, galleryDescriptions: newDescs };
    });
  };

  const handleExistingDescriptionChange = (index: number, text: string) => {
    setFormData((prev) => {
      const newGallery = [...(prev.existingGallery || [])];
      newGallery[index].description = text;
      return { ...prev, existingGallery: newGallery };
    });
  };

  const handleRemoveExistingImage = (index: number) => {
    if (!window.confirm("Remove this image? It will be deleted when you save."))
      return;
    setFormData((prev) => {
      const newGallery = [...(prev.existingGallery || [])];
      newGallery.splice(index, 1);
      return { ...prev, existingGallery: newGallery };
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
      alert("Failed to save dog. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-slate-800/50 shadow-xl">
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
              Manage Grumble
            </h2>
            <p className="text-white/60 text-sm">Add, update, or remove dogs</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              <FaPlus /> Add Dog
            </button>
          )}
        </div>

        {/* Mode: List View */}
        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dogs.map((dog) => (
              <div
                key={dog.id}
                onClick={() => handleEditClick(dog)}
                className="cursor-pointer bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-4 items-center group hover:border-blue-500/30 transition-colors"
              >
                <img
                  src={dog.profilePicture}
                  alt={dog.name}
                  className="w-16 h-16 rounded-full object-cover border border-slate-700"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-white">{dog.name}</h3>
                  <p className="text-sm text-white/50">
                    {dog.gender} • {dog.birthDate}
                  </p>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(dog.id);
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
                    <FaEdit className="text-blue-400" /> Edit Dog
                  </>
                ) : (
                  <>
                    <FaDog className="text-blue-400" /> New Dog
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
                    Tap to change
                  </p>
                </div>
              </div>

              {/* Identity Details */}
              <div className="md:col-span-2 flex flex-col gap-5 justify-center">
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
                    placeholder="e.g. Buster"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        M
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
                        F
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-blue-400">
                      Birth Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.birthDate}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          birthDate: e.target.value,
                        }))
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-400">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none placeholder-white/20"
                    placeholder="Tell us about the dog..."
                  />
                </div>
              </div>

              {/* Gallery Editor */}
              {formData.existingGallery &&
                formData.existingGallery.length > 0 && (
                  <div className="md:col-span-3 space-y-4 pt-4 border-t border-slate-800">
                    <label className="text-sm font-medium text-blue-400 block">
                      Current Gallery
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.existingGallery.map((img, index) => (
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
                            value={formData.galleryDescriptions?.[i] || ""}
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
                {editingId ? "Save Changes" : "Create Dog"}
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

export default UpdateDogs;
