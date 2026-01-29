import { useState, useEffect } from 'react';

/**
 * Beautiful Floating PWA Button
 * Click to show Install/Open menu
 */
const SmallInstallButton = () => {
    const [showMenu, setShowMenu] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if running as installed PWA
        const checkInstalled = window.matchMedia('(display-mode: standalone)').matches;
        setIsInstalled(checkInstalled);

        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        const handleAppInstalled = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setIsInstalled(true);
            }
            setDeferredPrompt(null);
        } else {
            alert('To Install:\n\n1. Look for install icon (⊕) in address bar\n2. OR click browser menu (⋮)\n3. Select "Install DialysisTrack"');
        }
        setShowMenu(false);
    };

    const handleOpen = () => {
        window.open('/', '_blank');
        setShowMenu(false);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Menu Popup */}
            {showMenu && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 -z-10"
                        onClick={() => setShowMenu(false)}
                    />

                    {/* Menu Card */}
                    <div className="absolute bottom-20 right-0 bg-white rounded-xl shadow-2xl overflow-hidden min-w-[220px] animate-slideUp">
                        {/* Install Button */}
                        <button
                            onClick={handleInstall}
                            className="w-full px-4 py-4 flex items-center gap-3 hover:bg-blue-50 transition-colors border-b border-gray-100"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-gray-800 text-sm">Install App</div>
                                <div className="text-xs text-gray-500">Add to device</div>
                            </div>
                        </button>

                        {/* Open Button */}
                        <button
                            onClick={handleOpen}
                            className="w-full px-4 py-4 flex items-center gap-3 hover:bg-green-50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-gray-800 text-sm">Open App</div>
                                <div className="text-xs text-gray-500">New window</div>
                            </div>
                        </button>
                    </div>
                </>
            )}

            {/* Main Floating Button */}
            <button
                onClick={() => setShowMenu(!showMenu)}
                className="group relative w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
            >
                {/* App Icon Circle */}
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <img
                        src="/icons/icon-192x192.png"
                        alt="DialysisTrack"
                        className="w-10 h-10 rounded-lg"
                    />
                </div>

                {/* Status Badge */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${isInstalled ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                </div>

                {/* Pulse Ring Animation */}
                {!isInstalled && (
                    <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
                )}
            </button>
        </div>
    );
};

export default SmallInstallButton;
