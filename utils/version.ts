// Version management for PWA cache busting
export const APP_VERSION = '1.2.3'; // Update this with each release

export const checkForUpdates = async (): Promise<{
    updateAvailable: boolean;
    currentVersion: string;
    latestVersion?: string;
}> => {
    try {
        // Check if there's a newer version available
        const response = await fetch('/version.json?t=' + Date.now());
        const { version: latestVersion } = await response.json();
        
        const currentVersion = APP_VERSION; // Use actual app version, not localStorage
        const updateAvailable = latestVersion !== currentVersion && 
                               isNewerVersion(latestVersion, currentVersion);
        
        if (updateAvailable) {
            console.log(`🔄 Update available: ${currentVersion} → ${latestVersion}`);
        } else {
            console.log(`✅ Already up-to-date: ${currentVersion}`);
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
            currentVersion: APP_VERSION
        };
    }
};

// Helper function to compare semantic versions
const isNewerVersion = (newVersion: string, currentVersion: string): boolean => {
    const parseVersion = (version: string) => {
        return version.split('.').map(num => parseInt(num, 10));
    };
    
    const newParts = parseVersion(newVersion);
    const currentParts = parseVersion(currentVersion);
    
    for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
        const newPart = newParts[i] || 0;
        const currentPart = currentParts[i] || 0;
        
        if (newPart > currentPart) return true;
        if (newPart < currentPart) return false;
    }
    
    return false; // Versions are equal
};

export const forceUpdate = async (): Promise<void> => {
    try {
        console.log('🔄 Starting force update...');
        
        // Clear all service worker caches
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                console.log('🧹 Unregistering service worker...');
                await registration.unregister();
            }
        }
        
        // Clear all browser caches aggressively
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            console.log(`🧹 Clearing ${cacheNames.length} caches...`);
            await Promise.all(
                cacheNames.map(async (cacheName) => {
                    console.log(`🗑️ Deleting cache: ${cacheName}`);
                    return caches.delete(cacheName);
                })
            );
        }
        
        // Clear localStorage and sessionStorage, but preserve important game data
        console.log('🧹 Clearing storage while preserving game data...');
        
        // Backup important data before clearing
        const leaderboardData = localStorage.getItem('hoppy-leaderboard');
        const highScoreData = localStorage.getItem('hoppyAvoidanceHighScore');
        const settingsData = localStorage.getItem('hoppy-settings');
        
        // Clear all storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Restore important game data
        if (leaderboardData) {
            localStorage.setItem('hoppy-leaderboard', leaderboardData);
            console.log('💾 Preserved leaderboard data');
        }
        if (highScoreData) {
            localStorage.setItem('hoppyAvoidanceHighScore', highScoreData);
            console.log('💾 Preserved high score data');
        }
        if (settingsData) {
            localStorage.setItem('hoppy-settings', settingsData);
            console.log('💾 Preserved settings data');
        }
        
        // Force clear any remaining cache by adding timestamp
        console.log('🔄 Force reloading with cache bust...');
        
    } catch (error) {
        console.error('Error during force update:', error);
    }
};

export const setCurrentVersion = (): void => {
    localStorage.setItem('app-version', APP_VERSION);
};