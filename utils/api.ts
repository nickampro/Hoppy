// API client for global leaderboard

const viteEnv = (import.meta as { env?: Record<string, string | boolean | undefined> }).env || {};
const configuredBaseUrl = typeof viteEnv.VITE_API_BASE_URL === 'string' ? viteEnv.VITE_API_BASE_URL : undefined;

const normalizeBaseUrl = (url: string): string => url.replace(/\/$/, '');

const getApiBaseUrlCandidates = (): string[] => {
    if (!Boolean(viteEnv.PROD)) {
        return ['http://localhost:3001/api'];
    }

    const candidates = new Set<string>();

    if (configuredBaseUrl) {
        candidates.add(normalizeBaseUrl(configuredBaseUrl));
    }

    candidates.add(`${window.location.origin}/api`);

    const hostname = window.location.hostname;
    if (hostname.startsWith('hoppy.')) {
        candidates.add(`https://hoppy-api.${hostname.slice('hoppy.'.length)}/api`);
    }

    candidates.add('https://hoppy-api.caprover.nickam.cc/api');

    return Array.from(candidates);
};

const API_BASE_URL_CANDIDATES = getApiBaseUrlCandidates();

const fetchFromApiCandidates = async (path: string, init?: RequestInit): Promise<Response> => {
    let lastError: Error | null = null;

    for (const baseUrl of API_BASE_URL_CANDIDATES) {
        try {
            const response = await fetch(`${baseUrl}${path}`, init);
            if (response.ok) {
                return response;
            }

            if (response.status < 500 && response.status !== 404) {
                return response;
            }
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown API error');
        }
    }

    throw lastError || new Error('No reachable API base URL');
};

// Generate or retrieve device ID for cross-device sync
export const getDeviceId = (): string => {
    let deviceId = localStorage.getItem('hoppy-device-id');
    
    if (!deviceId) {
        deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('hoppy-device-id', deviceId);
    }
    
    return deviceId;
};

// Submit score to global leaderboard
export const submitScoreToAPI = async (playerName: string, score: number): Promise<{
    success: boolean;
    rank?: number;
    error?: string;
}> => {
    try {
        const deviceId = getDeviceId();
        const gameSessionId = 'session-' + Date.now();
        
        const response = await fetchFromApiCandidates('/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                deviceId,
                playerName,
                score,
                gameSessionId
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to submit score');
        }
        
        return {
            success: true,
            rank: data.rank
        };
        
    } catch (error) {
        console.error('Error submitting score:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

// Get global leaderboard
export const getGlobalLeaderboard = async (limit: number = 100, type: 'global' | 'daily' = 'global'): Promise<{
    success: boolean;
    leaderboard?: Array<{
        player_name: string;
        score: number;
        created_at: string;
        rank_position: number;
    }>;
    error?: string;
}> => {
    try {
        const response = await fetchFromApiCandidates(`/leaderboard?limit=${limit}&type=${type}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch leaderboard');
        }
        
        return {
            success: true,
            leaderboard: data.leaderboard
        };
        
    } catch (error) {
        console.error('Error fetching global leaderboard:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

// Get user's personal scores and stats
export const getUserScores = async (limit: number = 10): Promise<{
    success: boolean;
    scores?: Array<{
        score: number;
        player_name: string;
        created_at: string;
    }>;
    stats?: {
        best_score: number;
        total_games: number;
        first_game: string;
        last_game: string;
    };
    error?: string;
}> => {
    try {
        const deviceId = getDeviceId();
        const response = await fetchFromApiCandidates(`/user/${deviceId}/scores?limit=${limit}`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch user scores');
        }
        
        return {
            success: true,
            scores: data.scores,
            stats: data.stats
        };
        
    } catch (error) {
        console.error('Error fetching user scores:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

// Check if API is available (fallback to localStorage if offline)
export const isAPIAvailable = async (): Promise<boolean> => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetchFromApiCandidates('/health', {
            method: 'GET',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        console.warn('API not available, falling back to localStorage');
        return false;
    }
};
