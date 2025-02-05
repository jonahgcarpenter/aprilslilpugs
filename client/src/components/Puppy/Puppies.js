import { useState, useContext, useRef } from "react";
import { LitterContext } from "../../context/LitterContext";
import LoadingAnimation from "../LoadingAnimation";
import DeleteModal from "../Modals/DeleteModal";

const Puppies = ({ litterId, existingPuppies = [], readOnly = false }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPuppy, setSelectedPuppy] = useState(null);
  const fileInputRef = useRef();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const { addPuppy, updatePuppy, deletePuppy, loading, preloadedImages } =
    useContext(LitterContext);

  const [newPuppy, setNewPuppy] = useState({
    name: "",
    color: "",
    gender: "",
    status: "Available",
  });

  const [newlyUploadedImage, setNewlyUploadedImage] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setNewlyUploadedImage(true);
    }
  };

  const clearImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setNewlyUploadedImage(false);

    if (
      isEditing &&
      selectedPuppy?.profilePicture &&
      preloadedImages?.puppies[selectedPuppy.profilePicture]
    ) {
      setPreviewUrl(preloadedImages.puppies[selectedPuppy.profilePicture]);
    } else {
      setPreviewUrl(null);
    }
  };

  const handlePuppySubmit = async (e) => {
    e.preventDefault();
    try {
      const puppyImage = fileInputRef.current?.files[0];

      if (isEditing && selectedPuppy) {
        await updatePuppy(litterId, selectedPuppy._id, newPuppy, puppyImage);
      } else {
        await addPuppy(litterId, newPuppy, puppyImage);
      }

      setNewlyUploadedImage(false);
      resetForm();
    } catch (err) {
      console.error("Error handling puppy:", err);
    }
  };

  const resetForm = () => {
    setNewPuppy({
      name: "",
      color: "",
      gender: "",
      status: "Available",
    });
    setIsEditing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setNewlyUploadedImage(false);
    setPreviewUrl(null);
    setSelectedPuppy(null);
  };

  const handleEdit = (puppy) => {
    setIsEditing(true);
    setSelectedPuppy(puppy);
    setNewPuppy({
      name: puppy.name,
      color: puppy.color,
      gender: puppy.gender,
      status: puppy.status,
    });

    if (
      puppy.profilePicture &&
      preloadedImages?.puppies[puppy.profilePicture]
    ) {
      setPreviewUrl(preloadedImages.puppies[puppy.profilePicture]);
      setNewlyUploadedImage(false);
    } else {
      clearImage();
    }
  };

  const handlePuppyDelete = async () => {
    if (!selectedPuppy) return;
    try {
      await deletePuppy(litterId, selectedPuppy._id);
      setShowDeleteModal(false);
      setSelectedPuppy(null);
    } catch (err) {
      console.error("Error deleting puppy:", err);
    }
  };

  if (loading) {
    return <LoadingAnimation containerClassName="scale-150" />;
  }

  return (
    <div className="mt-8">
      <form
        onSubmit={handlePuppySubmit}
        className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-slate-800/50 shadow-xl"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
          {isEditing ? "Edit Puppy" : "Add New Puppy To Litter"}
        </h2>

        {!readOnly && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={newPuppy.name}
                onChange={(e) =>
                  setNewPuppy({ ...newPuppy, name: e.target.value })
                }
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color
              </label>
              <input
                type="text"
                value={newPuppy.color}
                onChange={(e) =>
                  setNewPuppy({ ...newPuppy, color: e.target.value })
                }
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gender
              </label>
              <select
                value={newPuppy.gender}
                onChange={(e) =>
                  setNewPuppy({ ...newPuppy, gender: e.target.value })
                }
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="form-group">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={newPuppy.status}
                onChange={(e) =>
                  setNewPuppy({ ...newPuppy, status: e.target.value })
                }
                className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
              </select>
            </div>

            {/* Profile picture upload */}
            <div className="form-group sm:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Puppy Image
              </label>
              {previewUrl && (
                <div className="mb-4 relative w-32 h-32">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg border border-slate-700"
                  />
                  {newlyUploadedImage && (
                    <button
                      type="button"
                      onClick={clearImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      x
                    </button>
                  )}
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png"
                className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-colors"
              />
            </div>
          </div>
        )}

        {!readOnly && (
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200"
            >
              {isEditing ? "Update Puppy" : "Add Puppy"}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-3 rounded-lg font-semibold text-slate-300 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 transition-all duration-200"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </form>

      {existingPuppies.length > 0 && (
        <div className="mt-8 bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-8 border border-slate-800/50 shadow-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
            Current Puppies
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {existingPuppies.map((puppy) => (
              <div
                key={puppy._id}
                className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/30 transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                {puppy.profilePicture &&
                  preloadedImages?.puppies[puppy.profilePicture] && (
                    <div className="relative pb-[75%]">
                      <img
                        src={preloadedImages.puppies[puppy.profilePicture]}
                        alt={puppy.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                <div className="p-4">
                  <h4 className="text-xl font-semibold text-white mb-2">
                    {puppy.name}
                  </h4>
                  <div className="space-y-2 text-gray-300">
                    <p>
                      <span className="text-gray-400">Color:</span>{" "}
                      {puppy.color}
                    </p>
                    <p>
                      <span className="text-gray-400">Gender:</span>{" "}
                      {puppy.gender}
                    </p>
                    <p>
                      <span className="text-gray-400">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-sm ${
                          puppy.status === "Available"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : puppy.status === "Reserved"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {puppy.status}
                      </span>
                    </p>
                  </div>
                  {!readOnly && (
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => {
                          handleEdit(puppy);
                          window.scrollBy({ top: -550, behavior: "smooth" });
                        }}
                        className="w-full bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/20 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPuppy(puppy);
                          setShowDeleteModal(true);
                        }}
                        className="w-full bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPuppy(null);
        }}
        onDelete={handlePuppyDelete}
        itemName={`puppy "${selectedPuppy?.name}"`}
      />
    </div>
  );
};

export default Puppies;

