// Check for token in localStorage
export const getToken = () => localStorage.getItem("token");

// Check if user is authenticated
export const isAuthenticated = () => !!getToken();
