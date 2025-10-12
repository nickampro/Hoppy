// Version management for PWA cache busting
export const APP_VERSION = '1.1.0'; // Update this with each release

export const checkForUpdates = async (): Promise<{
    updateAvailable: boolean;
    currentVersion: string;
    latestVersion?: string;
}> => {
    try {
        // Check if there's a newer version available
        const response = await fetch('/version.json?t=' + Date.now());
        const { version: latestVersion } = await response.json();
        
        const currentVersion = localStorage.getItem('app-version') || '1.0.0';
        const updateAvailable = latestVersion !== currentVersion;
        
        if (updateAvailable) {
            console.log(`🔄 Update available: ${currentVersion} → ${latestVersion}`);
        }
        
        return {
            updateAvailable,
            currentVersion,
            latestVersion
        };
    } catch (error) {
        console.warn('Could not check for updates:', error);
        return {
            updateAvailable: false,
            currentVersion: localStorage.getItem('app-version') || '1.0.0'
        };
    }
};

export const forceUpdate = async (): Promise<void> => {
    try {
        // Clear all caches
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration();
            if (registration) {
                console.log('🧹 Clearing service worker cache...');
                await registration.unregister();
            }
        }
        
        // Clear browser caches
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('🧹 Cleared all caches');
        }
        
        // Update stored version
        localStorage.setItem('app-version', APP_VERSION);
        
        // Force reload
        window.location.reload();
        
    } catch (error) {
        console.error('Error during force update:', error);
        // Fallback: just reload
        window.location.reload();
    }
};

export const setCurrentVersion = (): void => {
    localStorage.setItem('app-version', APP_VERSION);
};