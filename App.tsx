
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GAME_WIDTH, GAME_HEIGHT, GROUND_HEIGHT, RABBIT_WIDTH, RABBIT_HEIGHT,
  RABBIT_INITIAL_X, RABBIT_JUMP_VELOCITY, GRAVITY, TREE_WIDTH,
  MIN_TREE_HEIGHT, MAX_TREE_HEIGHT, LATE_GAME_MIN_HEIGHT, LATE_GAME_MAX_HEIGHT,
  INITIAL_GAME_SPEED, GAME_SPEED_INCREMENT, HIGH_SCORE_KEY
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
  addLeaderboardEntry, 
  isTopScore, 
  getLeaderboardPosition 
} from './utils/leaderboard';
import { checkForUpdates, forceUpdate, setCurrentVersion } from './utils/version';
import { loadSettings, saveSettings, playGameSound } from './utils/settings';

const App: React.FC = () => {
    const getInitialHighScore = (): number => {
        const savedScore = localStorage.getItem(HIGH_SCORE_KEY);
        return savedScore ? parseInt(savedScore, 10) : 0;
    };

    const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.Start);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(getInitialHighScore);
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

    const rabbitY = useRef(GROUND_HEIGHT);
    const rabbitVelocityY = useRef(0);
    const trees = useRef<TreeType[]>([]);
    const gameSpeed = useRef(INITIAL_GAME_SPEED);
    const lastTreeTime = useRef(0);
    const gameLoopId = useRef<number | null>(null);
    const hasDoubleJumped = useRef(false); // Track double jump usage

    const resetGame = useCallback(() => {
        rabbitY.current = GROUND_HEIGHT;
        rabbitVelocityY.current = 0;
        trees.current = [];
        gameSpeed.current = INITIAL_GAME_SPEED;
        lastTreeTime.current = 0;
        hasDoubleJumped.current = false; // Reset double jump
        setCountdown(null);
        setIsCountingDown(false);

        setScore(0);
        setRenderedRabbitY(GROUND_HEIGHT);
        setRenderedTrees([]);
    }, []);

    const startGame = useCallback(() => {
        resetGame();
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
                    setGameStatus(GameStatus.Playing);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    }, [resetGame]);

  const endGame = () => {
    console.log('🎮 endGame called, score:', score);
    console.log('🎮 Current difficulty:', settings.difficulty);
    
    // Set the time when game ended to prevent immediate restarts
    setGameOverTime(Date.now());
    
    // Update high score if needed
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem(HIGH_SCORE_KEY, score.toString());
      console.log('🏆 New high score:', score);
    }
    
    // Only allow leaderboard submission for Normal difficulty
    if (settings.difficulty === 'normal') {
      console.log('📊 Checking if top score...');
      const isTop = isTopScore(score);
      console.log('🏆 isTopScore result:', isTop);
      
      if (isTop) {
        // Calculate the position this score would have
        const position = getLeaderboardPosition(score);
        setPlayerPosition(position);
        setGameStatus(GameStatus.NameEntry);
      } else {
        setGameStatus(GameStatus.GameOver);
      }
    } else {
      console.log('🟢 Easy mode - skipping leaderboard, going to Game Over');
      setGameStatus(GameStatus.GameOver);
    }
  };    const handleJump = useCallback((e?: KeyboardEvent) => {
        if (!e || e.code === 'ArrowUp' || e.code === 'Space') {
            e?.preventDefault();
            if (gameStatus === GameStatus.Playing) {
                // Check if rabbit can jump
                const canNormalJump = rabbitY.current <= GROUND_HEIGHT;
                const canDoubleJump = settings.difficulty === 'easy' && 
                                    !hasDoubleJumped.current && 
                                    rabbitY.current > GROUND_HEIGHT;
                
                if (canNormalJump || canDoubleJump) {
                    rabbitVelocityY.current = RABBIT_JUMP_VELOCITY;
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
    }, [gameStatus, startGame, settings, gameOverTime]);

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

    const handleNameSubmit = useCallback((name: string) => {
        console.log('🎯 handleNameSubmit called with:', { name, score });
        const updatedLeaderboard = addLeaderboardEntry(name, score);
        console.log('📊 Leaderboard after save:', updatedLeaderboard);
        setLeaderboard(updatedLeaderboard);
        setGameStatus(GameStatus.GameOver);
        console.log('✅ Game status set to GameOver');
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
        setLeaderboard(getLeaderboard());
        setCurrentVersion(); // Set current app version
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
        };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('touchstart', handleTouchJump, { passive: false });
        window.addEventListener('click', handleClickJump);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('touchstart', handleTouchJump);
            window.removeEventListener('click', handleClickJump);
        };
    }, [handleJump, handleTouchJump, handleClickJump]);
  
    const gameLoop = useCallback((timestamp: number) => {
        if (gameStatus !== GameStatus.Playing || gameIsPaused || isCountingDown) return;

        // Rabbit physics
        rabbitVelocityY.current += GRAVITY;
        rabbitY.current += rabbitVelocityY.current;
        if (rabbitY.current < GROUND_HEIGHT) {
            rabbitY.current = GROUND_HEIGHT;
            rabbitVelocityY.current = 0;
            hasDoubleJumped.current = false; // Reset double jump when landing
        }

        gameSpeed.current += GAME_SPEED_INCREMENT;

        let newScore = score;
        let passedTree = false;

        trees.current = trees.current.map(tree => ({ ...tree, x: tree.x - gameSpeed.current }));

        trees.current.forEach(tree => {
            if (!tree.passed && tree.x + TREE_WIDTH < RABBIT_INITIAL_X) {
                tree.passed = true;
                newScore++;
                passedTree = true;
            }
        });

        if (passedTree) {
            playGameSound('sounds/score.wav', settings);
            setScore(newScore);
        }
        
        trees.current = trees.current.filter(tree => tree.x > -TREE_WIDTH);

        if (timestamp - lastTreeTime.current > 1000) { 
            const lastTree = trees.current[trees.current.length - 1];
            if (!lastTree || lastTree.x < GAME_WIDTH - (250 + Math.random() * 250) ) {
                // Progressive difficulty: start with small trees, gradually increase
                const difficultyProgress = Math.min(score / 20, 1); // Reaches full difficulty at score 20
                const currentMinHeight = MIN_TREE_HEIGHT + (LATE_GAME_MIN_HEIGHT - MIN_TREE_HEIGHT) * difficultyProgress;
                const currentMaxHeight = MAX_TREE_HEIGHT + (LATE_GAME_MAX_HEIGHT - MAX_TREE_HEIGHT) * difficultyProgress;
                
                const newHeight = currentMinHeight + Math.random() * (currentMaxHeight - currentMinHeight);
                trees.current.push({ id: Date.now(), x: GAME_WIDTH, height: newHeight, passed: false });
                lastTreeTime.current = timestamp;
            }
        }
        
        const rabbitRect = { x: RABBIT_INITIAL_X, y: rabbitY.current, width: RABBIT_WIDTH - 10, height: RABBIT_HEIGHT - 10 };
        for (const tree of trees.current) {
            // Tree is positioned from the ground up, so its collision box starts at GROUND_HEIGHT and goes up by tree.height
            const treeRect = { x: tree.x, y: GROUND_HEIGHT, width: TREE_WIDTH, height: tree.height };
            if (
                rabbitRect.x < treeRect.x + treeRect.width &&
                rabbitRect.x + rabbitRect.width > treeRect.x &&
                rabbitRect.y < treeRect.y + treeRect.height &&
                rabbitRect.y + rabbitRect.height > treeRect.y
            ) {
                endGame();
                return;
            }
        }

        setRenderedRabbitY(rabbitY.current);
        setRenderedTrees([...trees.current]);

        gameLoopId.current = requestAnimationFrame(gameLoop);
    }, [score, endGame, gameStatus, gameIsPaused, isCountingDown]);

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
                className="relative bg-[#87CEEB] overflow-hidden"
                style={{ 
                    width: '100vw',
                    height: '100vh',
                    aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}`,
                    objectFit: 'contain'
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

                {/* Settings Button - Always visible, larger, serves as pause during gameplay */}
                <button
                    onClick={handleSettingsToggle}
                    className="absolute top-2 right-2 text-white hover:scale-105 transition-all z-40 w-12 h-12 flex items-center justify-center text-2xl"
                    title={gameStatus === GameStatus.Playing ? (gameIsPaused ? "Resume Game" : "Pause Game") : "Settings"}
                    style={{ 
                        filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        backdropFilter: 'blur(4px)',
                        borderRadius: '8px'
                    }}
                >
                    {gameStatus === GameStatus.Playing && gameIsPaused ? '▶️' : '⚙️'}
                </button>

                <Scoreboard score={score} highScore={highScore} />
                
                {/* Mobile touch instruction */}
                {gameStatus === GameStatus.Playing && !gameIsPaused && (
                    <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none sm:hidden">
                        <p className="text-xs text-white bg-black bg-opacity-50 rounded px-2 py-1 inline-block">
                            Tap outside buttons to jump!
                        </p>
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
                
                <Rabbit x={RABBIT_INITIAL_X} y={renderedRabbitY} isGameOver={gameStatus === GameStatus.GameOver} />
                {renderedTrees.map(tree => (
                    <Tree key={tree.id} x={tree.x} height={tree.height} />
                ))}
                <Ground />

                {gameStatus === GameStatus.Start && <StartScreen onStart={startGame} />}
                {gameStatus === GameStatus.NameEntry && (
                    <NameEntry 
                        score={score}
                        position={playerPosition}
                        onSubmit={handleNameSubmit}
                        onSkip={handleNameSkip}
                    />
                )}
                {gameStatus === GameStatus.GameOver && <GameOverScreen score={score} highScore={highScore} onRestart={startGame} />}
                
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