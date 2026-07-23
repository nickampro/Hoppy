
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    GROUND_HEIGHT, RABBIT_WIDTH, RABBIT_HEIGHT,
    RABBIT_INITIAL_X, GRAVITY, TREE_WIDTH,
  MIN_TREE_HEIGHT, MAX_TREE_HEIGHT, LATE_GAME_MIN_HEIGHT, LATE_GAME_MAX_HEIGHT,
    INITIAL_GAME_SPEED, GAME_SPEED_INCREMENT, HIGH_SCORE_KEY,
        RABBIT_MIN_X, ROCK_WIDTH, RIVER_WIDTH
} from './constants';
import { type Tree as TreeType, GameStatus, LeaderboardEntry } from './types';
import { GameSettings } from './types/settings';
import { Rabbit } from './components/Rabbit';
import { Tree } from './components/Tree';
import { Ground } from './components/Ground';
import { Scoreboard } from './components/Scoreboard';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { NameEntry } from './components/NameEntry';
import { SettingsMenu } from './components/SettingsMenu';
import { 
  getLeaderboard, 
    submitLeaderboardScore,
  getLeaderboardPosition 
} from './utils/leaderboard';
import { checkForUpdates, ensureLatestVersionOnLoad, forceUpdate, setCurrentVersion } from './utils/version';
import { loadSettings, saveSettings, playGameSound } from './utils/settings';
import {
    AchievementDefinition,
    getAchievementById,
    getTierName,
    loadProgress,
    PlayerProgress,
    recordGameResult,
    savePlayerName,
} from './utils/progression';

interface GhostFrame {
    x: number;
    y: number;
}

interface RabbitLifeStats {
    ageLabel: string;
    scale: number;
    jumpVelocity: number;
    moveSpeed: number;
}

const GHOST_RUN_KEY = 'hoppy-best-run-ghost';
const USERNAME_COOKIE_KEY = 'hoppyPlayerName';

const setUsernameCookie = (name: string): void => {
    const value = encodeURIComponent(name.trim());
    if (!value) return;
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${USERNAME_COOKIE_KEY}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
};

const getUsernameCookie = (): string => {
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    const match = cookies.find(entry => entry.startsWith(`${USERNAME_COOKIE_KEY}=`));
    if (!match) return '';
    return decodeURIComponent(match.split('=')[1] || '');
};

const getFamilyLifeCapacity = (level: number): number => {
    if (level >= 65) return 5;
    if (level >= 50) return 4;
    if (level >= 35) return 3;
    if (level >= 20) return 2;
    return 1;
};

const getRabbitLifeStats = (level: number): RabbitLifeStats => {
    const getDescriptor = (lvl: number): string => {
        if (lvl <= 2) return 'Baby';
        if (lvl <= 4) return 'Child';
        if (lvl <= 6) return 'Teen';
        if (lvl <= 9) return 'Young Adult';
        if (lvl <= 14) return 'Adult';
        if (lvl <= 64) return 'Parent';
        if (lvl <= 89) return 'Elder';
        return 'Ancestor';
    };

    if (level < 3) {
        const t = Math.max(0, (level - 1) / 2);
        return {
            ageLabel: `${level} ${getDescriptor(level)}`,
            scale: 0.58 + t * 0.12,
            jumpVelocity: 16.5 + t * 1.5,
            moveSpeed: 3 + t * 0.8,
        };
    }

    if (level < 5) {
        const t = (level - 3) / 2;
        return {
            ageLabel: `${level} ${getDescriptor(level)}`,
            scale: 0.72 + t * 0.1,
            jumpVelocity: 18.5 + t * 0.8,
            moveSpeed: 4 + t * 0.4,
        };
    }

    if (level < 7) {
        const t = (level - 5) / 2;
        return {
            ageLabel: `${level} ${getDescriptor(level)}`,
            scale: 0.84 + t * 0.08,
            jumpVelocity: 19.4 + t * 0.9,
            moveSpeed: 4.4 + t * 0.4,
        };
    }

    if (level < 10) {
        const t = (level - 7) / 3;
        return {
            ageLabel: `${level} ${getDescriptor(level)}`,
            scale: 0.93 + t * 0.08,
            jumpVelocity: 20.5 + t * 1,
            moveSpeed: 4.8 + t * 0.6,
        };
    }

    if (level < 14) {
        const t = (level - 10) / 4;
        return {
            ageLabel: `${level} ${getDescriptor(level)}`,
            scale: 1.02 + t * 0.06,
            jumpVelocity: 21.5 + t * 0.8,
            moveSpeed: 5.4 + t * 0.4,
        };
    }

    if (level < 65) {
        const t = (level - 14) / 51;
        return {
            ageLabel: `${level} ${getDescriptor(level)}`,
            scale: 1.08 + t * 0.1,
            jumpVelocity: 22.3 + t * 1.1,
            moveSpeed: 5.8 + t * 0.7,
        };
    }

    if (level < 90) {
        const t = (level - 65) / 25;
        return {
            ageLabel: `${level} ${getDescriptor(level)}`,
            scale: 1.15 - t * 0.15,
            jumpVelocity: 20 - t * 7,
            moveSpeed: 5.6 - t * 1.9,
        };
    }

    const t = Math.min((level - 90) / 10, 1);
    return {
        ageLabel: `${level} ${getDescriptor(level)}`,
        scale: 1 - t * 0.1,
        jumpVelocity: 12 - t * 4,
        moveSpeed: 3.6 - t * 1,
    };
};

const App: React.FC = () => {
    const getInitialHighScore = (): number => {
        const savedScore = localStorage.getItem(HIGH_SCORE_KEY);
        return savedScore ? parseInt(savedScore, 10) : 0;
    };

    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Start);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(getInitialHighScore);
    const [sceneWidth, setSceneWidth] = useState(window.innerWidth);
    const [sceneHeight, setSceneHeight] = useState(window.innerHeight);
    const [renderedRabbitY, setRenderedRabbitY] = useState(GROUND_HEIGHT);
    const [renderedTrees, setRenderedTrees] = useState<TreeType[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [playerPosition, setPlayerPosition] = useState<number>(0);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
    const [updateDismissed, setUpdateDismissed] = useState(false); // Track if user dismissed the notification
    const [settings, setSettings] = useState<GameSettings>(loadSettings);
    const [showSettings, setShowSettings] = useState(false);
    const [gameIsPaused, setGameIsPaused] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const [gameOverTime, setGameOverTime] = useState<number | null>(null); // Track when game ended
    const [streak, setStreak] = useState(0);
    const [scoreMultiplier, setScoreMultiplier] = useState(1);
    const [runLevel, setRunLevel] = useState(1);
    const [globalRank, setGlobalRank] = useState<number | null>(null);
    const [xpGained, setXpGained] = useState(0);
    const [unlockedAchievements, setUnlockedAchievements] = useState<AchievementDefinition[]>([]);
    const [playerProgress, setPlayerProgress] = useState<PlayerProgress>(loadProgress);
    const [rabbitX, setRabbitX] = useState(RABBIT_INITIAL_X);
    const [rabbitFacing, setRabbitFacing] = useState<'left' | 'right'>('right');
    const [ghostEnabled, setGhostEnabled] = useState(Boolean(settings.ghostReplayEnabled));
    const [ghostFrames, setGhostFrames] = useState<GhostFrame[]>([]);
    const [ghostFrameIndex, setGhostFrameIndex] = useState(0);
    const [ghostActive, setGhostActive] = useState(false);
    const [showGhostHint, setShowGhostHint] = useState(false);
    const [rabbitScale, setRabbitScale] = useState(0.62);
    const [rabbitAgeLabel, setRabbitAgeLabel] = useState<RabbitLifeStats['ageLabel']>('1 Baby');
    const [completedRunLevel, setCompletedRunLevel] = useState(1);
    const [completedRunAgeLabel, setCompletedRunAgeLabel] = useState('1 Baby');
    const [familyLifeCapacity, setFamilyLifeCapacity] = useState(1);
    const [livesRemaining, setLivesRemaining] = useState(1);
    const [isHitFlash, setIsHitFlash] = useState(false);
    const [levelUpNotice, setLevelUpNotice] = useState<string | null>(null);
    const [nextLevelMarkerX, setNextLevelMarkerX] = useState<number | null>(null);
    const [nextLevelMarkerLevel, setNextLevelMarkerLevel] = useState<number | null>(null);

    const rabbitXRef = useRef(RABBIT_INITIAL_X);
    const rabbitY = useRef(GROUND_HEIGHT);
    const rabbitVelocityY = useRef(0);
    const trees = useRef<TreeType[]>([]);
    const gameSpeed = useRef(INITIAL_GAME_SPEED);
    const lastTreeTime = useRef(0);
    const gameLoopId = useRef<number | null>(null);
    const hasDoubleJumped = useRef(false); // Track double jump usage
    const currentStreak = useRef(0);
    const bestRunStreak = useRef(0);
    const moveLeftPressed = useRef(false);
    const moveRightPressed = useRef(false);
    const runGhostFrames = useRef<GhostFrame[]>([]);
    const bestGhostRef = useRef<GhostFrame[]>([]);
    const invulnerableUntil = useRef(0);
    const levelPauseUntil = useRef(0);

    const getRabbitHorizontalRange = useCallback((level: number, width: number) => {
        const rabbitLife = getRabbitLifeStats(level);
        const baseX = Math.max(34, Math.min(96, width * 0.14));
        return {
            baseX,
            minX: Math.max(RABBIT_MIN_X, baseX - 24),
            maxX: Math.min(width - RABBIT_WIDTH * rabbitLife.scale - 30, baseX + 96),
            rabbitLife,
        };
    }, []);

    const moveRabbitStep = useCallback((direction: 'left' | 'right', stepMultiplier = 1) => {
        const { minX, maxX, rabbitLife } = getRabbitHorizontalRange(runLevel, sceneWidth);
        const delta = rabbitLife.moveSpeed * stepMultiplier;
        rabbitXRef.current = direction === 'left'
            ? Math.max(minX, rabbitXRef.current - delta)
            : Math.min(maxX, rabbitXRef.current + delta);
        setRabbitFacing(direction === 'left' ? 'left' : 'right');
        setRabbitX(rabbitXRef.current);
    }, [getRabbitHorizontalRange, runLevel, sceneWidth]);

    const resetGame = useCallback(() => {
        rabbitY.current = GROUND_HEIGHT;
        rabbitXRef.current = RABBIT_INITIAL_X;
        rabbitVelocityY.current = 0;
        trees.current = [];
        gameSpeed.current = INITIAL_GAME_SPEED;
        lastTreeTime.current = 0;
        hasDoubleJumped.current = false; // Reset double jump
        currentStreak.current = 0;
        bestRunStreak.current = 0;
        setCountdown(null);
        setIsCountingDown(false);

        setScore(0);
        setStreak(0);
        setScoreMultiplier(1);
        setRunLevel(1);
        setGlobalRank(null);
        setXpGained(0);
        setUnlockedAchievements([]);
        setRabbitX(RABBIT_INITIAL_X);
        setRabbitFacing('right');
        setGhostFrameIndex(0);
        setGhostActive(false);
        setRabbitScale(0.62);
        setRabbitAgeLabel('1 Baby');
        setCompletedRunLevel(1);
        setCompletedRunAgeLabel('1 Baby');
        setFamilyLifeCapacity(1);
        setLivesRemaining(1);
        setIsHitFlash(false);
        setLevelUpNotice(null);
        setNextLevelMarkerX(null);
        setNextLevelMarkerLevel(null);
        levelPauseUntil.current = 0;
        setRenderedRabbitY(GROUND_HEIGHT);
        setRenderedTrees([]);
    }, []);

    const startGame = useCallback(() => {
        resetGame();
        setShowGhostHint(ghostEnabled && bestGhostRef.current.length > 0);
        setGhostActive(ghostEnabled && bestGhostRef.current.length > 0);
        setGameOverTime(null); // Reset the game over time
        setIsCountingDown(true);
        setCountdown(3);
        
        // Countdown sequence
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev === null || prev <= 1) {
                    clearInterval(countdownInterval);
                    setIsCountingDown(false);
                    setCountdown(null);
                    runGhostFrames.current = [];
                    setGameStatus(GameStatus.Playing);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    }, [ghostEnabled, resetGame]);

    useEffect(() => {
        // One-time migration to set ghost replay off by default for this release.
        if (settings.version !== '1.2.6' && settings.ghostReplayEnabled !== false) {
            const migratedSettings = { ...settings, ghostReplayEnabled: false, version: '1.2.6' };
            setSettings(migratedSettings);
            setGhostEnabled(false);
            saveSettings(migratedSettings);
        }
    }, [settings]);

    const endGame = useCallback(async (finalScoreOverride?: number) => {
        const finalScore = typeof finalScoreOverride === 'number' ? finalScoreOverride : score;
        const finalRunLevel = Math.floor(finalScore / 15) + 1;
        const finalRunAge = getRabbitLifeStats(finalRunLevel).ageLabel;

        setCompletedRunLevel(finalRunLevel);
        setCompletedRunAgeLabel(finalRunAge);
        setRunLevel(finalRunLevel);
        setRabbitAgeLabel(finalRunAge);

    // Set the time when game ended to prevent immediate restarts
    setGameOverTime(Date.now());

        const progressionResult = recordGameResult(finalScore, bestRunStreak.current);
        setPlayerProgress(progressionResult.progress);
        setXpGained(progressionResult.xpGained);
        setUnlockedAchievements(
            progressionResult.unlockedAchievementIds
                .map(id => getAchievementById(id))
                .filter((achievement): achievement is AchievementDefinition => Boolean(achievement))
        );
    
    // Update high score if needed
        if (finalScore > highScore) {
            setHighScore(finalScore);
            localStorage.setItem(HIGH_SCORE_KEY, finalScore.toString());
    }
    
        // Only allow leaderboard submission for Normal difficulty
                if (settings.difficulty !== 'normal' || finalScore <= 0) {
      setGameStatus(GameStatus.GameOver);
            return;
    }

        const knownPlayerName = playerProgress.playerName.trim();

        if (!knownPlayerName) {
            const position = await getLeaderboardPosition(finalScore);
            setPlayerPosition(position);
            setGameStatus(GameStatus.NameEntry);
            return;
        }

        setUsernameCookie(knownPlayerName);

        const submissionResult = await submitLeaderboardScore(knownPlayerName, finalScore);
        setLeaderboard(submissionResult.leaderboard);
        setGlobalRank(submissionResult.rank);
        setGameStatus(GameStatus.GameOver);
    }, [highScore, playerProgress.playerName, score, settings.difficulty]);

    const saveGhostIfBest = useCallback((finalScore: number) => {
        if (runGhostFrames.current.length < 8 || finalScore < highScore) {
            return;
        }

        try {
            localStorage.setItem(GHOST_RUN_KEY, JSON.stringify(runGhostFrames.current));
            bestGhostRef.current = [...runGhostFrames.current];
            setGhostFrames(bestGhostRef.current);
        } catch (error) {
            console.warn('Unable to save ghost replay:', error);
        }
    }, [highScore]);

    const handleJump = useCallback((e?: KeyboardEvent) => {
        const rabbitLife = getRabbitLifeStats(runLevel);
        if (!e || e.code === 'ArrowUp' || e.code === 'Space') {
            e?.preventDefault();
            if (gameStatus === GameStatus.Playing) {
                // Check if rabbit can jump
                const canNormalJump = rabbitY.current <= GROUND_HEIGHT;
                const canDoubleJump = settings.difficulty === 'easy' && 
                                    !hasDoubleJumped.current && 
                                    rabbitY.current > GROUND_HEIGHT;
                
                if (canNormalJump || canDoubleJump) {
                    rabbitVelocityY.current = rabbitLife.jumpVelocity;
                    playGameSound('sounds/jump.wav', settings);
                    
                    // Mark double jump as used if this was a mid-air jump
                    if (canDoubleJump) {
                        hasDoubleJumped.current = true;
                    }
                }
            } else if ((gameStatus === GameStatus.Start || gameStatus === GameStatus.GameOver) && 
                       (e?.code === 'ArrowUp' || e?.code === 'Space')) {
                // Add delay after death to prevent accidental restarts
                if (gameStatus === GameStatus.GameOver && gameOverTime) {
                    const timeSinceDeath = Date.now() - gameOverTime;
                    if (timeSinceDeath < 1000) { // 1 second delay
                        return; // Ignore restart attempts within 1 second of death
                    }
                }
                // Only restart on specific keys when in Start or GameOver state
                startGame();
            }
            // Note: NameEntry state is handled by its own component, no jump action needed
        }
    }, [gameStatus, startGame, settings, gameOverTime, runLevel]);

    const handleMovementDown = useCallback((e: KeyboardEvent) => {
        if (gameStatus !== GameStatus.Playing) return;

        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            moveLeftPressed.current = true;
            setRabbitFacing('left');
        }

        if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            moveRightPressed.current = true;
            setRabbitFacing('right');
        }
    }, [gameStatus]);

    const handleMovementUp = useCallback((e: KeyboardEvent) => {
        if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
            moveLeftPressed.current = false;
        }

        if (e.code === 'ArrowRight' || e.code === 'KeyD') {
            moveRightPressed.current = false;
        }
    }, []);

    const handleTouchJump = useCallback((e: TouchEvent) => {
        // Don't handle touches on buttons, inputs, or other interactive elements
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' || 
            target.tagName === 'INPUT' || 
            target.tagName === 'A' ||
            target.closest('button') ||
            target.closest('input') ||
            target.closest('a') ||
            target.closest('[role="button"]')) {
            return; // Let the button handle its own touch
        }
        
        e.preventDefault();
        handleJump();
    }, [handleJump]);

    const handleNameSubmit = useCallback(async (name: string) => {
        const updatedProgress = savePlayerName(name);
        setPlayerProgress(updatedProgress);
        setUsernameCookie(name);

        const submissionResult = await submitLeaderboardScore(name, score);
        setLeaderboard(submissionResult.leaderboard);
        setGlobalRank(submissionResult.rank);
        setGameStatus(GameStatus.GameOver);
    }, [score]);

    const handleNameSkip = useCallback(() => {
        setGameStatus(GameStatus.GameOver);
    }, []);

    const handleClickJump = useCallback((e: MouseEvent) => {
        // Don't handle clicks on buttons, inputs, or other interactive elements
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' || 
            target.tagName === 'INPUT' || 
            target.tagName === 'A' ||
            target.closest('button') ||
            target.closest('input') ||
            target.closest('a') ||
            target.closest('[role="button"]')) {
            return; // Let the button handle its own click
        }
        
        e.preventDefault();
        handleJump();
    }, [handleJump]);

    // Save settings when they change
    const handleSettingsChange = useCallback((newSettings: GameSettings) => {
        setSettings(newSettings);
        setGhostEnabled(newSettings.ghostReplayEnabled);
        saveSettings(newSettings);
    }, []);

    const handleSettingsToggle = useCallback(() => {
        if (gameStatus === GameStatus.Playing) {
            setGameIsPaused(!gameIsPaused);
        }
        setShowSettings(!showSettings);
    }, [gameStatus, gameIsPaused, showSettings]);

    const handleSettingsClose = useCallback(() => {
        setShowSettings(false);
        setGameIsPaused(false);
    }, []);
    useEffect(() => {
        const loadLeaderboard = async () => {
            const leaderboard = await getLeaderboard();
            setLeaderboard(leaderboard);
        };

        const initializeApp = async () => {
            const refreshed = await ensureLatestVersionOnLoad();
            if (refreshed) {
                return;
            }

            const savedGhost = localStorage.getItem(GHOST_RUN_KEY);
            if (savedGhost) {
                try {
                    const parsed = JSON.parse(savedGhost) as GhostFrame[];
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        bestGhostRef.current = parsed;
                        setGhostFrames(parsed);
                    }
                } catch (error) {
                    console.warn('Failed to load ghost replay:', error);
                }
            }

            const cookieName = getUsernameCookie();
            if (cookieName && !loadProgress().playerName) {
                const updated = savePlayerName(cookieName);
                setPlayerProgress(updated);
            }

            await loadLeaderboard();
            setCurrentVersion(); // Set current app version
        };

        void initializeApp();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setSceneWidth(Math.max(360, window.innerWidth));
            setSceneHeight(Math.max(560, window.innerHeight));
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Check for updates periodically
    useEffect(() => {
        const checkUpdates = async () => {
            const updateInfo = await checkForUpdates();
            if (updateInfo.updateAvailable && !updateDismissed) {
                setUpdateAvailable(true);
                setShowUpdatePrompt(true);
                
                // Auto-dismiss after 5 seconds
                setTimeout(() => {
                    setShowUpdatePrompt(false);
                }, 5000);
            }
        };
        
        checkUpdates();
        // Check every 5 minutes
        const interval = setInterval(checkUpdates, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [updateDismissed]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Force refresh shortcut: Ctrl+Shift+R or Cmd+Shift+R
            if (e.shiftKey && (e.ctrlKey || e.metaKey) && e.key === 'R') {
                e.preventDefault();
                console.log('🔄 Force refresh triggered by keyboard shortcut');
                forceUpdate().then(() => {
                    window.location.href = window.location.href + '?t=' + Date.now();
                });
                return;
            }
            
            // Regular game controls
            handleJump(e);
            handleMovementDown(e);
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            handleMovementUp(e);
        };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('click', handleClickJump);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('click', handleClickJump);
        };
    }, [handleJump, handleClickJump, handleMovementDown, handleMovementUp]);
  
    const gameLoop = useCallback((timestamp: number) => {
        if (gameStatus !== GameStatus.Playing || gameIsPaused || isCountingDown) return;

        if (levelPauseUntil.current > timestamp) {
            gameLoopId.current = requestAnimationFrame(gameLoop);
            return;
        }

        const { minX, maxX, baseX, rabbitLife } = getRabbitHorizontalRange(runLevel, sceneWidth);

        setRabbitScale(rabbitLife.scale);
        setRabbitAgeLabel(rabbitLife.ageLabel);

        if (rabbitXRef.current < minX || rabbitXRef.current > maxX) {
            rabbitXRef.current = Math.min(maxX, Math.max(minX, rabbitXRef.current));
        }

        const nextCapacity = getFamilyLifeCapacity(runLevel);
        if (nextCapacity > familyLifeCapacity) {
            const gain = nextCapacity - familyLifeCapacity;
            setFamilyLifeCapacity(nextCapacity);
            setLivesRemaining(prev => prev + gain);
        }

        // Rabbit physics
        rabbitVelocityY.current += GRAVITY;
        rabbitY.current += rabbitVelocityY.current;

        if (moveLeftPressed.current && !moveRightPressed.current) {
            rabbitXRef.current = Math.max(minX, rabbitXRef.current - rabbitLife.moveSpeed);
        } else if (moveRightPressed.current && !moveLeftPressed.current) {
            rabbitXRef.current = Math.min(maxX, rabbitXRef.current + rabbitLife.moveSpeed);
        } else {
            const returnStep = Math.max(1.2, rabbitLife.moveSpeed * 0.35);
            if (rabbitXRef.current > baseX) {
                rabbitXRef.current = Math.max(baseX, rabbitXRef.current - returnStep);
            } else if (rabbitXRef.current < baseX) {
                rabbitXRef.current = Math.min(baseX, rabbitXRef.current + returnStep);
            }
        }

        if (rabbitY.current < GROUND_HEIGHT) {
            rabbitY.current = GROUND_HEIGHT;
            rabbitVelocityY.current = 0;
            hasDoubleJumped.current = false; // Reset double jump when landing
        }

        gameSpeed.current += GAME_SPEED_INCREMENT;

        let newScore = score;
        let passedTreeCount = 0;

        trees.current = trees.current.map(tree => ({ ...tree, x: tree.x - gameSpeed.current }));

        trees.current.forEach(tree => {
            if (!tree.passed && tree.x + tree.width < rabbitXRef.current) {
                tree.passed = true;
                passedTreeCount++;
            }
        });

        if (passedTreeCount > 0) {
            currentStreak.current += passedTreeCount;
            bestRunStreak.current = Math.max(bestRunStreak.current, currentStreak.current);

            const comboMultiplier = Math.min(5, 1 + Math.floor((currentStreak.current - 1) / 4));
            newScore += passedTreeCount * comboMultiplier;

            const nextRunLevel = Math.floor(newScore / 15) + 1;

            if (nextRunLevel > runLevel) {
                const nextLife = getRabbitLifeStats(nextRunLevel);
                setLevelUpNotice(`LEVEL UP ${nextRunLevel} | ${nextLife.ageLabel}`);
                levelPauseUntil.current = timestamp + 2600;
                setTimeout(() => setLevelUpNotice(null), 2600);
            }

            setStreak(currentStreak.current);
            setScoreMultiplier(comboMultiplier);
            setRunLevel(nextRunLevel);
            playGameSound('sounds/score.wav', settings);
            setScore(newScore);
        }
        
        trees.current = trees.current.filter(tree => tree.x > -Math.max(tree.width, TREE_WIDTH));

        const effectiveRunLevel = Math.floor(newScore / 15) + 1;
        const nextLevelTargetScore = effectiveRunLevel * 15;
        const pointsNeededForNextLevel = nextLevelTargetScore - newScore;

        if (pointsNeededForNextLevel <= 0) {
            setNextLevelMarkerX(null);
            setNextLevelMarkerLevel(null);
        } else {
            const upcomingTrees = trees.current
                .filter(tree => !tree.passed && tree.x + tree.width >= rabbitXRef.current)
                .sort((a, b) => a.x - b.x);

            let projectedStreak = currentStreak.current;
            let projectedPoints = 0;
            let projectedMarkerX: number | null = null;

            for (const tree of upcomingTrees) {
                projectedStreak += 1;
                const projectedMultiplier = Math.min(5, 1 + Math.floor((projectedStreak - 1) / 4));
                projectedPoints += projectedMultiplier;

                if (projectedPoints >= pointsNeededForNextLevel) {
                    // Crossing this line indicates the obstacle pass that levels the rabbit up.
                    projectedMarkerX = tree.x + tree.width;
                    break;
                }
            }

            setNextLevelMarkerX(projectedMarkerX);
            setNextLevelMarkerLevel(projectedMarkerX === null ? null : effectiveRunLevel + 1);
        }

        const spawnInterval = Math.max(640, 1120 - (runLevel - 1) * 24);
        if (timestamp - lastTreeTime.current > spawnInterval) {
            const lastTree = trees.current[trees.current.length - 1];
            if (!lastTree || lastTree.x < sceneWidth - (220 + Math.random() * 260) ) {
                // Progressive difficulty: start with small trees, gradually increase
                const difficultyProgress = Math.min(newScore / 35, 1);
            const currentMinHeight = Math.max(24, MIN_TREE_HEIGHT - 12) + (LATE_GAME_MIN_HEIGHT - Math.max(24, MIN_TREE_HEIGHT - 12)) * difficultyProgress;
            const currentMaxHeight = Math.max(74, MAX_TREE_HEIGHT - 16) + (LATE_GAME_MAX_HEIGHT - Math.max(74, MAX_TREE_HEIGHT - 16)) * difficultyProgress;

                const obstacleRoll = Math.random();
                const obstacleType: TreeType['type'] = obstacleRoll < 0.58 ? 'tree' : obstacleRoll < 0.83 ? 'rock' : 'river';
                const obstacleWidth = obstacleType === 'tree' ? TREE_WIDTH : obstacleType === 'rock' ? ROCK_WIDTH : RIVER_WIDTH;
                const newHeight = obstacleType === 'river'
                    ? 22
                    : currentMinHeight + Math.random() * (currentMaxHeight - currentMinHeight);
                // Spawn trees well off-screen to ensure smooth entry on all screen sizes
                trees.current.push({
                    id: Date.now(),
                    x: sceneWidth + obstacleWidth + 70,
                    width: obstacleWidth,
                    type: obstacleType,
                    height: newHeight,
                    passed: false
                });
                lastTreeTime.current = timestamp;
            }
        }
        
        const rabbitRect = {
            x: rabbitXRef.current + 6,
            y: rabbitY.current + 4,
            width: Math.max(14, RABBIT_WIDTH * rabbitLife.scale - 16),
            height: Math.max(14, RABBIT_HEIGHT * rabbitLife.scale - 14)
        };

        const processHit = (id: number): boolean => {
            if (timestamp < invulnerableUntil.current) {
                return false;
            }

            if (livesRemaining > 1) {
                setLivesRemaining(prev => Math.max(1, prev - 1));
                setIsHitFlash(true);
                setTimeout(() => setIsHitFlash(false), 250);
                currentStreak.current = 0;
                setStreak(0);
                setScoreMultiplier(1);
                invulnerableUntil.current = timestamp + 1200;
                trees.current = trees.current.filter(obstacle => obstacle.id !== id);
                return false;
            }

            saveGhostIfBest(newScore);
            void endGame(newScore);
            return true;
        };

        for (const tree of trees.current) {
            const treePaddingX = tree.type === 'rock' ? 8 : 10;
            const treePaddingY = tree.type === 'rock' ? 6 : 8;
            const treeRect = {
                x: tree.x + treePaddingX,
                y: GROUND_HEIGHT + treePaddingY,
                width: Math.max(10, tree.width - treePaddingX * 2),
                height: Math.max(10, tree.height - treePaddingY)
            };
            
            if (tree.type === 'river') {
                const rabbitFeetBottom = rabbitRect.y;
                const feetInsideRiver = rabbitRect.x + rabbitRect.width * 0.66 > treeRect.x && rabbitRect.x + rabbitRect.width * 0.34 < treeRect.x + treeRect.width;
                const fellIntoRiver = feetInsideRiver && rabbitFeetBottom <= GROUND_HEIGHT + 10;
                if (fellIntoRiver) {
                    if (processHit(tree.id)) return;
                }
                continue;
            }

            if (
                rabbitRect.x < treeRect.x + treeRect.width &&
                rabbitRect.x + rabbitRect.width > treeRect.x &&
                rabbitRect.y < treeRect.y + treeRect.height &&
                rabbitRect.y + rabbitRect.height > treeRect.y
            ) {
                if (processHit(tree.id)) return;
            }
        }

        runGhostFrames.current.push({ x: rabbitXRef.current, y: rabbitY.current });
        if (ghostActive && ghostEnabled && ghostFrames.length > 0) {
            setGhostFrameIndex(prev => {
                const next = prev + 1;
                if (next >= ghostFrames.length) {
                    setGhostActive(false);
                    return ghostFrames.length - 1;
                }
                return next;
            });
        }

        setRabbitX(rabbitXRef.current);
        setRenderedRabbitY(rabbitY.current);
        setRenderedTrees([...trees.current]);

        gameLoopId.current = requestAnimationFrame(gameLoop);
    }, [
        score,
        endGame,
        gameStatus,
        gameIsPaused,
        ghostEnabled,
        ghostActive,
        ghostFrames.length,
        isCountingDown,
        runLevel,
        saveGhostIfBest,
        settings,
        sceneWidth,
        familyLifeCapacity,
        getRabbitHorizontalRange,
        livesRemaining,
    ]);

    useEffect(() => {
        if (gameStatus === GameStatus.Playing) {
            gameLoopId.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            // FIX: Check for null to avoid a bug where an animation frame ID of 0 is considered falsy.
            if (gameLoopId.current !== null) {
                cancelAnimationFrame(gameLoopId.current);
            }
        };
    }, [gameStatus, gameLoop]);
  
    const showingCompletedRun = gameStatus === GameStatus.GameOver || gameStatus === GameStatus.NameEntry;
    const displayRunLevel = showingCompletedRun ? completedRunLevel : runLevel;
    const displayRunAgeLabel = showingCompletedRun ? completedRunAgeLabel : rabbitAgeLabel;

    return (
        <div 
            className="bg-black select-none touch-none"
            style={{ 
                width: '100vw', 
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: 0,
                padding: 0
            }}
        >
            <div
                className="relative bg-[#87CEEB] overflow-hidden border-[6px] border-[#1f3d5a]"
                style={{ 
                    width: '100vw',
                    height: '100vh',
                    minWidth: '360px',
                    minHeight: '560px',
                    boxShadow: '0 0 0 4px #0e2236, 0 12px 0 #0a1824'
                }}
            >
                {/* Update notification */}
                {showUpdatePrompt && (
                    <div className="absolute top-4 left-4 right-4 bg-yellow-400 text-black p-3 rounded-lg border-2 border-yellow-600 z-50">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-sm">🔄 Update Available!</span>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => forceUpdate()}
                                    className="px-3 py-1 bg-green-500 text-white text-xs rounded font-bold hover:bg-green-600 active:bg-green-700 touch-manipulation"
                                >
                                    Update Now
                                </button>
                                <button 
                                    onClick={() => {
                                        setShowUpdatePrompt(false);
                                        setUpdateDismissed(true); // Mark as dismissed to prevent showing again
                                    }}
                                    className="px-3 py-1 bg-gray-500 text-white text-xs rounded font-bold hover:bg-gray-600 active:bg-gray-700 touch-manipulation"
                                >
                                    Later
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Button */}
                <button
                    onClick={handleSettingsToggle}
                    className="absolute top-2 right-2 text-[#f0ead2] transition-all z-40 w-11 h-11 flex items-center justify-center border-2 border-black"
                    title={gameStatus === GameStatus.Playing ? (gameIsPaused ? "Resume Game" : "Pause Game") : "Settings"}
                    style={{ 
                        background: 'linear-gradient(180deg, #4c4a46 0%, #2d2b28 100%)',
                        borderRadius: '2px',
                        boxShadow: '0 4px 0 #141311'
                    }}
                >
                    <span className="relative block w-5 h-5">
                        <span className="absolute inset-x-[6px] top-0 h-full bg-[#f0ead2]" />
                        <span className="absolute inset-y-[6px] left-0 w-full bg-[#f0ead2]" />
                        <span className="absolute inset-[3px] border-2 border-[#2d2b28] bg-[#f0ead2]" />
                        <span className="absolute inset-[7px] bg-[#2d2b28]" />
                    </span>
                </button>

                <Scoreboard
                    score={score}
                    highScore={highScore}
                    level={displayRunLevel}
                    streak={streak}
                    multiplier={scoreMultiplier}
                    tierName={getTierName(score)}
                    ageLabel={displayRunAgeLabel}
                    lives={livesRemaining}
                    nextLevelScore={displayRunLevel * 15}
                    seasonLevel={playerProgress.level}
                />

                {levelUpNotice && gameStatus === GameStatus.Playing && (
                    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                        <div className="bg-black bg-opacity-80 border-2 border-yellow-400 px-8 py-5 text-center shadow-2xl">
                            <p className="text-yellow-200 text-3xl font-bold mb-2">{levelUpNotice}</p>
                            <p className="text-white text-sm">Rabbit upgraded. Catch your breath.</p>
                            <p className="text-[#bde8ff] text-xs mt-2">Game pauses briefly at each level-up.</p>
                        </div>
                    </div>
                )}

                {gameStatus === GameStatus.Playing && nextLevelMarkerX !== null && nextLevelMarkerLevel !== null && (
                    <>
                        <div
                            className="absolute z-20 pointer-events-none"
                            style={{
                                left: `${nextLevelMarkerX - 4}px`,
                                bottom: '0px',
                                width: '8px',
                                height: `${GROUND_HEIGHT}px`,
                                backgroundImage: 'repeating-linear-gradient(180deg, #ffffff 0px, #ffffff 6px, #111827 6px, #111827 12px)',
                            }}
                        />
                        <div
                            className="absolute z-20 pointer-events-none"
                            style={{
                                left: `${nextLevelMarkerX - 5}px`,
                                bottom: `${GROUND_HEIGHT}px`,
                                width: '10px',
                                height: '32px',
                                backgroundImage: 'repeating-linear-gradient(180deg, #fff8dc 0px, #fff8dc 6px, #111 6px, #111 12px)',
                                border: '2px solid #111',
                            }}
                        />
                        <div
                            className="absolute z-20 pointer-events-none text-[10px] font-bold text-[#111] px-1 py-[2px] border border-black"
                            style={{
                                left: `${nextLevelMarkerX - 22}px`,
                                bottom: `${GROUND_HEIGHT + 36}px`,
                                background: '#ffe066',
                            }}
                        >
                            LEVEL {nextLevelMarkerLevel}
                        </div>
                    </>
                )}
                
                {/* Mobile touch instruction */}
                {gameStatus === GameStatus.Playing && !gameIsPaused && (
                    <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none sm:hidden">
                        <p className="text-xs text-white bg-black bg-opacity-50 rounded px-2 py-1 inline-block">
                            Use the on-screen controls
                        </p>
                    </div>
                )}

                {gameStatus === GameStatus.Playing && !gameIsPaused && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 sm:hidden">
                        <button
                            onTouchStart={(e) => { e.preventDefault(); moveRabbitStep('left', 4); }}
                            onClick={() => moveRabbitStep('left', 4)}
                            className="w-14 h-14 border-2 border-black text-white text-2xl"
                            style={{ background: 'linear-gradient(180deg, #4c4a46 0%, #2d2b28 100%)', boxShadow: '0 4px 0 #141311' }}
                        >
                            ◀
                        </button>
                        <button
                            onTouchStart={(e) => { e.preventDefault(); handleJump(); }}
                            onClick={() => handleJump()}
                            className="w-16 h-16 border-2 border-black text-white text-lg font-bold"
                            style={{ background: 'linear-gradient(180deg, #3c8c4d 0%, #1d6b2f 100%)', boxShadow: '0 4px 0 #0f3c1c' }}
                        >
                            JUMP
                        </button>
                        <button
                            onTouchStart={(e) => { e.preventDefault(); moveRabbitStep('right', 4); }}
                            onClick={() => moveRabbitStep('right', 4)}
                            className="w-14 h-14 border-2 border-black text-white text-2xl"
                            style={{ background: 'linear-gradient(180deg, #4c4a46 0%, #2d2b28 100%)', boxShadow: '0 4px 0 #141311' }}
                        >
                            ▶
                        </button>
                    </div>
                )}

                {showGhostHint && gameStatus !== GameStatus.Playing && (
                    <div className="absolute top-14 left-3 bg-[#143a58] border-2 border-black text-[#d4efff] px-2 py-1 text-[10px] z-30">
                        Ghost replay loaded
                    </div>
                )}

                {livesRemaining > 1 && (
                    <div className="absolute left-3 bottom-[92px] z-20 flex gap-2">
                        {Array.from({ length: livesRemaining - 1 }, (_, index) => (
                            <Rabbit
                                key={`follower-${index}`}
                                x={Math.max(8, rabbitX - (index + 1) * 26)}
                                y={GROUND_HEIGHT}
                                scale={Math.max(0.46, rabbitScale - 0.16)}
                                isGhost={true}
                                facing={rabbitFacing}
                            />
                        ))}
                    </div>
                )}

                {/* Pause overlay */}
                {gameStatus === GameStatus.Playing && gameIsPaused && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-30">
                        <div className="text-white text-center">
                            <div className="text-6xl mb-4">⏸️</div>
                            <div className="text-2xl font-bold mb-2">PAUSED</div>
                            <div className="text-sm">Click settings to resume or change options</div>
                        </div>
                    </div>
                )}

                {/* Countdown overlay */}
                {isCountingDown && countdown !== null && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-30">
                        <div className="text-white text-center">
                            <div className="text-9xl mb-4 animate-pulse font-bold">
                                {countdown}
                            </div>
                            <div className="text-2xl font-bold mb-2">GET READY!</div>
                            <div className="text-sm">
                                {settings.difficulty === 'easy' ? 'Double jump enabled' : 'Single jump only'}
                            </div>
                        </div>
                    </div>
                )}
                
                {ghostActive && ghostEnabled && ghostFrames.length > 0 && gameStatus === GameStatus.Playing && ghostFrames[ghostFrameIndex] && (
                    <Rabbit
                        x={ghostFrames[ghostFrameIndex].x}
                        y={ghostFrames[ghostFrameIndex].y}
                        isGhost={true}
                        facing={'right'}
                        scale={rabbitScale}
                    />
                )}
                <Rabbit
                    x={rabbitX}
                    y={renderedRabbitY}
                    isGameOver={gameStatus === GameStatus.GameOver}
                    facing={rabbitFacing}
                    scale={rabbitScale}
                    isGhost={isHitFlash}
                />
                {renderedTrees.map(tree => (
                    <Tree key={tree.id} x={tree.x} height={tree.height} width={tree.width} type={tree.type} />
                ))}
                <Ground />

                {gameStatus === GameStatus.Start && <StartScreen onStart={startGame} progress={playerProgress} />}
                {gameStatus === GameStatus.NameEntry && (
                    <NameEntry 
                        score={score}
                        position={playerPosition}
                        onSubmit={handleNameSubmit}
                        onSkip={handleNameSkip}
                        initialName={playerProgress.playerName}
                    />
                )}
                {gameStatus === GameStatus.GameOver && (
                    <GameOverScreen
                        score={score}
                        highScore={highScore}
                        onRestart={startGame}
                        rank={globalRank}
                        xpGained={xpGained}
                        unlockedAchievements={unlockedAchievements}
                        progress={playerProgress}
                        runLevel={completedRunLevel}
                        runAgeLabel={completedRunAgeLabel}
                    />
                )}
                
                {/* Settings Menu */}
                <SettingsMenu
                    isOpen={showSettings}
                    onClose={handleSettingsClose}
                    settings={settings}
                    onSettingsChange={handleSettingsChange}
                />
            </div>
        </div>
    );
};

export default App;