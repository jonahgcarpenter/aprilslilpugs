import { useState, useRef } from "react";
import type { Dog, DogInput } from "../../hooks/usedogs";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaImage,
  FaDog,
  FaSpinner,
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
      setFormData((prev) => ({ ...prev, galleryFiles: files }));

      const newPreviews = files.map((f) => URL.createObjectURL(f));
      setGalleryPreviews(newPreviews);
    }
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
        {/* Header */}
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
              <FaPlus /> Add New Dog
            </button>
          )}
        </div>

        {/* Mode: List View */}
        {!isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dogs.map((dog) => (
              <div
                key={dog.id}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-4 items-center group hover:border-blue-500/30 transition-colors"
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
                    onClick={() => handleEditClick(dog)}
                    className="cursor-pointer p-2 bg-slate-800 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(dog.id)}
                    className="cursor-pointer p-2 bg-slate-800 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
            {dogs.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                No dogs found. Click "Add New Dog" to start building your
                grumble!
              </div>
            )}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Profile Picture Upload */}
              <div className="sm:col-span-2 flex flex-col items-center gap-4 p-6 bg-slate-950/50 rounded-xl border border-dashed border-slate-800">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-800 relative bg-slate-900">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <FaImage size={32} />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => profileInputRef.current?.click()}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  {editingId
                    ? "Change Profile Picture"
                    : "Upload Profile Picture"}
                </button>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, "profile")}
                />
              </div>

              {/* Inputs */}
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-400">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      gender: e.target.value as "Male" | "Female",
                    }))
                  }
                  className="cursor-pointer w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
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
                    setFormData((p) => ({ ...p, birthDate: e.target.value }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium text-blue-400">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none resize-none"
                />
              </div>

              {/* Gallery Upload */}
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium text-blue-400 flex justify-between">
                  <span>
                    Gallery Images{" "}
                    {editingId && "(New images will be appended)"}
                  </span>
                  <span className="text-xs text-white/40">
                    {galleryPreviews.length} selected
                  </span>
                </label>
                <div
                  onClick={() => galleryInputRef.current?.click()}
                  className="cursor-pointer bg-slate-950/50 border border-dashed border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center hover:border-blue-500/50 transition-colors"
                >
                  <FaImage className="text-3xl text-slate-700 mb-2" />
                  <span className="text-sm text-slate-500">
                    Click to select photos
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

                {/* Previews of pending uploads */}
                {galleryPreviews.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                    {galleryPreviews.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        className="w-full aspect-square object-cover rounded-lg border border-white/10"
                        alt=""
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

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
