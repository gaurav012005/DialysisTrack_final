import { useOnlineStatus } from '../hooks/useOnlineStatus';

/**
 * OfflineBanner Component
 * Displays a warning banner when the user is offline
 */
const OfflineBanner = () => {
    const isOnline = useOnlineStatus();

    const handleRetry = () => {
        window.location.reload();
    };

    if (isOnline) {
        return null; // Don't render anything when online
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg animate-slideDown">
            <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <svg
                                className="w-6 h-6 animate-pulse"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-sm md:text-base">
                                You are offline
                            </p>
                            <p className="text-xs md:text-sm opacity-90">
                                Some features may not work. Please check your internet connection.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleRetry}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-orange-600 rounded-lg font-medium text-sm hover:bg-opacity-90 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Retry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OfflineBanner;
