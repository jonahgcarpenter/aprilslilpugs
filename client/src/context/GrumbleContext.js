import { createContext, useState, useEffect } from "react";

export const GrumbleContext = createContext();

export const GrumbleProvider = ({ children }) => {
  const [grumbles, setGrumbles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preloadedImages, setPreloadedImages] = useState({});

  const validateImage = (file) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error("Image must be less than 5MB");
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Image must be in JPG or PNG format");
    }
  };

  const validateDate = (dateString) => {
    if (!dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      throw new Error("Invalid date format. Use YYYY-MM-DD");
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return true;
  };

  const preloadImage = async (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error(`Failed to load image: ${imageUrl}`));
    });
  };

  const preloadGrumbleImages = async (grumblesData) => {
    const newPreloadedImages = { ...preloadedImages };

    for (const grumble of grumblesData) {
      if (
        grumble.profilePicture &&
        !newPreloadedImages[grumble.profilePicture]
      ) {
        try {
          const imageUrl = `/api/images/uploads/grumble-images/${grumble.profilePicture}`;
          const img = await preloadImage(imageUrl);
          newPreloadedImages[grumble.profilePicture] = img.src;
        } catch (err) {
          console.error(`Failed to preload image for ${grumble.name}:`, err);
        }
      }
    }

    setPreloadedImages(newPreloadedImages);
  };

  const fetchGrumbles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/grumble");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch grumbles");
      }
      setGrumbles(data);
      await preloadGrumbleImages(data);
    } catch (err) {
      setError(err.message || "Failed to fetch grumbles");
      console.error("Error fetching grumbles:", err);
    } finally {
      setLoading(false);
    }
  };

  const addGrumble = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const birthDate = formData.get("birthDate");
      if (birthDate) {
        validateDate(birthDate);
      }

      const image = formData.get("profilePicture");
      if (image instanceof File) {
        validateImage(image);
      }

      const response = await fetch("/api/grumble", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add grumble");
      }

      const newGrumble = await response.json();
      // Preload the new image
      if (newGrumble.profilePicture) {
        const imageUrl = `/api/images/uploads/grumble-images/${newGrumble.profilePicture}`;
        try {
          const img = await preloadImage(imageUrl);
          setPreloadedImages((prev) => ({
            ...prev,
            [newGrumble.profilePicture]: img.src,
          }));
        } catch (err) {
          console.error("Failed to preload new image:", err);
        }
      }

      setGrumbles((prevGrumbles) => [...prevGrumbles, newGrumble]);
      return newGrumble;
    } catch (err) {
      setError(err.message || "Failed to add grumble");
      console.error("Error adding grumble:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteGrumble = async (grumbleId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/grumble/${grumbleId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete grumble");
      }

      setGrumbles((prevGrumbles) =>
        prevGrumbles.filter((grumble) => grumble._id !== grumbleId),
      );

      const grumbleToDelete = grumbles.find((g) => g._id === grumbleId);
      if (grumbleToDelete?.profilePicture) {
        setPreloadedImages((prev) => {
          const newImages = { ...prev };
          delete newImages[grumbleToDelete.profilePicture];
          return newImages;
        });
      }
    } catch (err) {
      setError("Failed to delete grumble. Please try again later.");
      console.error("Error deleting grumble:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateGrumble = async (grumbleId, formData) => {
    setLoading(true);
    setError(null);
    try {
      const birthDate = formData.get("birthDate");
      if (birthDate) {
        validateDate(birthDate);
      }

      const image = formData.get("profilePicture");
      if (image instanceof File) {
        validateImage(image);
      }

      const response = await fetch(`/api/grumble/${grumbleId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const updatedGrumble = await response.json();

      if (!response.ok) {
        console.error("Server error:", updatedGrumble);
        throw new Error(updatedGrumble.error || "Failed to update grumble");
      }

      if (updatedGrumble.profilePicture) {
        const imageUrl = `/api/images/uploads/grumble-images/${updatedGrumble.profilePicture}`;
        try {
          const img = await preloadImage(imageUrl);
          setPreloadedImages((prev) => ({
            ...prev,
            [updatedGrumble.profilePicture]: img.src,
          }));
        } catch (err) {
          console.error("Failed to preload updated image:", err);
        }
      }

      setGrumbles((prevGrumbles) =>
        prevGrumbles.map((grumble) =>
          grumble._id === grumbleId ? updatedGrumble : grumble,
        ),
      );

      return updatedGrumble;
    } catch (err) {
      console.error("Update error details:", err);
      setError(err.message || "Failed to update grumble");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrumbles();
  }, []);

  return (
    <GrumbleContext.Provider
      value={{
        grumbles,
        loading,
        error,
        preloadedImages,
        fetchGrumbles,
        addGrumble,
        deleteGrumble,
        updateGrumble,
      }}
    >
      {children}
    </GrumbleContext.Provider>
  );
};
