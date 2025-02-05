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

      setBreeder({
        ...json,
        _id: "679fd1587f2c7fe4601d3f2e",
      });
      return { success: true, data: json };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return (
    <BreederContext.Provider
      value={{
        breeder,
        loading,
        error,
        fetchBreederProfile,
        updateBreederProfile,
      }}
    >
      {children}
    </BreederContext.Provider>
  );
};
