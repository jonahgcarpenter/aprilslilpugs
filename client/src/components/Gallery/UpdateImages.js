import React, { useState } from "react";
import useGallery from "../../hooks/useGallery";
import { useGrumble } from "../../hooks/useGrumble";
import { useLitter } from "../../hooks/useLitter";
import LoadingAnimation from "../Misc/LoadingAnimation";

// TODO:
// use DELETE MODAL
// should update as soon as new image is uploaded

const UpdateImages = () => {
  const { useGalleryItems, updateGalleryItem, deleteGalleryItem } =
    useGallery();
  const { grumbles } = useGrumble();
  const { litters } = useLitter();
  const [editingId, setEditingId] = useState(null);
  const [editingDescription, setEditingDescription] = useState("");

  // Fetch all gallery items
  const { data: galleryItems, isLoading, error } = useGalleryItems();

  const getEntityInfo = (item) => {
    if (!item.entityType || item.entityType === "none") return null;

    if (item.entityType === "grumble") {
      const grumble = grumbles?.find((g) => g._id === item.grumbleId);
      return grumble?.name;
    }

    if (item.entityType === "litter") {
      const litter = litters?.find((l) => l._id === item.litterId);
      if (item.puppyId) {
        const puppy = litter?.puppies?.find((p) => p._id === item.puppyId);
        return `${litter?.name} - ${puppy?.name}`;
      }
      return litter?.name;
    }

    return null;
  };

  const handleEditStart = (item) => {
    setEditingId(item._id);
    setEditingDescription(item.description || "");
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingDescription("");
  };

  const handleSaveDescription = async (itemId) => {
    try {
      await updateGalleryItem.mutateAsync({
        itemId,
        description: editingDescription,
      });
      setEditingId(null);
      setEditingDescription("");
    } catch (error) {
      alert("Error updating image: " + error.message);
    }
  };

  const handleDelete = async (itemId) => {
    if (
      window.confirm(
        "Are you sure you want to delete this image? This action cannot be undone.",
      )
    ) {
      try {
        await deleteGalleryItem.mutateAsync(itemId);
      } catch (error) {
        alert("Error deleting image: " + error.message);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <LoadingAnimation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-2 sm:mx-4 bg-slate-900 rounded-xl shadow-xl p-4 sm:p-8">
        <p className="text-red-500 text-center">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="mx-2 sm:mx-4 bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-xl">
      <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 mb-8">
        Update Images
      </h2>

      {!galleryItems?.length ? (
        <div className="text-center text-gray-400">
          <p>No images found in the gallery.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div
              key={item._id}
              className="bg-slate-800 rounded-lg overflow-hidden shadow-lg"
            >
              {/* Image Container */}
              <div className="aspect-square relative">
                <img
                  src={item.filename}
                  alt={item.description || "Gallery image"}
                  className="w-full h-full object-cover"
                />

                {/* Updated Image Info Overlay */}
                {getEntityInfo(item) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-2 text-xs text-white">
                    <p className="truncate">{getEntityInfo(item)}</p>
                  </div>
                )}
              </div>

              {/* Description and Actions */}
              <div className="p-4 space-y-3">
                {editingId === item._id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <textarea
                      value={editingDescription}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      className="w-full p-2 rounded bg-slate-700 text-white border border-slate-600 focus:ring-2 focus:ring-blue-500 resize-none"
                      rows="2"
                      placeholder="Enter image description"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveDescription(item._id)}
                        disabled={updateGalleryItem.isPending}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-3">
                    <p className="text-gray-300 min-h-[3rem]">
                      {item.description || "No description"}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditStart(item)}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        disabled={deleteGalleryItem.isPending}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpdateImages;
