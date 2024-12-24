const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const setSessionData = (userData: any) => {
    const expiryTime = new Date().getTime() + SESSION_TIMEOUT;
    const sessionData = {
        ...userData,
        expiryTime
    };
    localStorage.setItem('user', JSON.stringify(sessionData));
    startSessionTimer();
};

export const checkSession = () => {
    const sessionData = localStorage.getItem('user');
    if (!sessionData) return null;

    const { expiryTime, ...userData } = JSON.parse(sessionData);
    if (new Date().getTime() > expiryTime) {
        clearSession();
        return null;
    }
    return userData;
};

export const clearSession = () => {
    localStorage.removeItem('user');
    window.location.reload();
};

export const startSessionTimer = () => {
    const checkInterval = setInterval(() => {
        const session = checkSession();
        if (!session) {
            clearInterval(checkInterval);
        }
    }, 60000); // Check every minute
};
