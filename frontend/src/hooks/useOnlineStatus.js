import { useState, useEffect } from 'react';

/**
 * Custom hook to detect online/offline status
 * @returns {boolean} - true if online, false if offline
 */
export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            console.log('[ONLINE] Connection restored');
            setIsOnline(true);
        };

        const handleOffline = () => {
            console.log('[OFFLINE] Connection lost');
            setIsOnline(false);
        };

        // Add event listeners
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
};

export default useOnlineStatus;
