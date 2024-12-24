import { useState } from 'react';
import { clearSession } from '../utils/sessionManager';

interface LogoutButtonProps {
    breederId: number;
}

export const LogoutButton = ({ breederId }: LogoutButtonProps) => {
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ breederId }),
            });
            
            if (response.ok) {
                clearSession();
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-4 py-1.5 text-sm rounded-full font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
        >
            {loading ? 'Logging out...' : 'Logout'}
        </button>
    );
};
