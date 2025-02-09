import { jwtDecode } from "jwt-decode";

// Get the token from localStorage
export const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token); // Decode the JWT
    if (decoded.exp * 1000 < Date.now()) {
      // If expired, remove token
      localStorage.removeItem("token");
      return null;
    }
    return token; // Valid token
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token"); // Remove if it's invalid
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => !!getToken();
