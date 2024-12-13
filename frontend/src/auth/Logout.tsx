const Logout = () => {
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      window.location.reload(); // Refresh to update auth state

    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
    >
      Sign Out
    </button>
  );
};

export default Logout;
