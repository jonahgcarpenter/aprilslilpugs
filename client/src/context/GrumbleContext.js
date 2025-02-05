import { createContext, useState, useEffect } from "react";

export const GrumbleContext = createContext();

export const GrumbleProvider = ({ children }) => {
  const [grumbles, setGrumbles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

      const data = await response.json();

      if (!response.ok) {
        console.error("Server error:", data);
        throw new Error(data.error || "Failed to update grumble");
      }

      setGrumbles((prevGrumbles) =>
        prevGrumbles.map((grumble) =>
          grumble._id === grumbleId ? data : grumble,
        ),
      );
      return data;
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
