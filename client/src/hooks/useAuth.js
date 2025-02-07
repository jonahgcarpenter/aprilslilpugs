import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getToken } from "../utils/Auth";

// ADMIN LOGIN
export const adminLogin = async (email, password) => {
  try {
    const response = await axios.post("/api/breeder/login", {
      email,
      password,
    });

    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
      return { success: true, token: response.data.token };
    }
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// ADMIN LOGOUT
export const adminLogout = async () => {
  try {
    const token = getToken();
    if (!token) return { success: false, message: "No token found" };

    await axios.post(
      "/api/breeder/logout",
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );

    localStorage.removeItem("token");
    return { success: true };
  } catch (error) {
    console.error("Logout failed:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// HOOK TO CHECK AUTHENTICATION STATUS
export const useAuth = () => {
  return useQuery({
    queryKey: ["auth"],
    queryFN: () => getToken(),
    staleTime: Infinity,
    cacheTime: Infinity,
  });
};
