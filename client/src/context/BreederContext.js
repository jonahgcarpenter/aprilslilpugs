import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export const BreederContext = createContext();

export const useBreeder = () => {
  const context = useContext(BreederContext);
  if (!context) {
    throw new Error("useBreeder must be used within a BreederProvider");
  }
  return context;
};

export const BreederProvider = ({ children }) => {
  const [breeder, setBreeder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preloadedImages, setPreloadedImages] = useState({
    profilePicture: null,
    gallery: [],
  });

  const preloadImage = async (imagePath) => {
    if (!imagePath) return null;

    try {
      const fullPath = `/api/images/uploads/breeder-profiles/${imagePath}`;
      const response = await fetch(fullPath);
      if (!response.ok) throw new Error("Image failed to load");

      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error(`Failed to preload image: ${imagePath}`, error);
      return null;
    }
  };

  const preloadBreederImages = async (breederData) => {
    if (!breederData) return;

    try {
      const profileUrl = await preloadImage(breederData.profilePicture);

      const galleryUrls = await Promise.all(
        (breederData.images || []).map((image) => preloadImage(image)),
      );

      setPreloadedImages({
        profilePicture: profileUrl,
        gallery: galleryUrls.filter((url) => url !== null),
      });
    } catch (error) {
      console.error("Failed to preload images:", error);
    }
  };

  const fetchBreederProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/breeder/profile");
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error);
      }

      setBreeder(json);
      await preloadBreederImages(json);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBreederProfile();
  }, [fetchBreederProfile]);

  const updateBreederProfile = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/breeder/profile", {
        method: "PATCH",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error);
      }

      const updatedBreeder = {
        ...json,
        _id: "679fd1587f2c7fe4601d3f2e",
      };

      setBreeder(updatedBreeder);
      await preloadBreederImages(updatedBreeder);

      return { success: true, data: json };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (preloadedImages.profilePicture) {
        URL.revokeObjectURL(preloadedImages.profilePicture);
      }
      preloadedImages.gallery.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [preloadedImages]);

  return (
    <BreederContext.Provider
      value={{
        breeder,
        loading,
        error,
        fetchBreederProfile,
        updateBreederProfile,
        preloadedImages,
      }}
    >
      {children}
    </BreederContext.Provider>
  );
};
