
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  GAME_WIDTH, GAME_HEIGHT, GROUND_HEIGHT, RABBIT_WIDTH, RABBIT_HEIGHT,
  RABBIT_INITIAL_X, RABBIT_JUMP_VELOCITY, GRAVITY, TREE_WIDTH,
  MIN_TREE_HEIGHT, MAX_TREE_HEIGHT, INITIAL_GAME_SPEED,
  GAME_SPEED_INCREMENT, HIGH_SCORE_KEY
} from './constants';
import { type Tree as TreeType, GameStatus } from './types';
import { Rabbit } from './components/Rabbit';
import { Tree } from './components/Tree';
import { Ground } from './components/Ground';
import { Scoreboard } from './components/Scoreboard';
import { StartScreen } from './components/StartScreen';
import { GameOverScreen } from './components/GameOverScreen';

const playSound = (soundFile: string) => {
    try {
        const audio = new Audio(soundFile);
        audio.play().catch(e => console.warn(`Could not play sound ${soundFile}:`, e));
    } catch (e) {
        console.error(`Could not create audio for ${soundFile}:`, e);
    }
};

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

    const rabbitY = useRef(GROUND_HEIGHT);
    const rabbitVelocityY = useRef(0);
    const trees = useRef<TreeType[]>([]);
    const gameSpeed = useRef(INITIAL_GAME_SPEED);
    const lastTreeTime = useRef(0);
    // FIX: Initialize useRef with null to be more explicit and avoid ambiguity.
    const gameLoopId = useRef<number | null>(null);

    const resetGame = useCallback(() => {
        rabbitY.current = GROUND_HEIGHT;
        rabbitVelocityY.current = 0;
        trees.current = [];
        gameSpeed.current = INITIAL_GAME_SPEED;
        lastTreeTime.current = 0;

        setScore(0);
        setRenderedRabbitY(GROUND_HEIGHT);
        setRenderedTrees([]);
    }, []);

    const startGame = useCallback(() => {
        resetGame();
        setGameStatus(GameStatus.Playing);
    }, [resetGame]);

    const endGame = useCallback(() => {
        playSound('sounds/game-over.wav');
        setGameStatus(GameStatus.GameOver);
        if (score > highScore) {
            const newHighScore = score;
            setHighScore(newHighScore);
            localStorage.setItem(HIGH_SCORE_KEY, newHighScore.toString());
        }
    }, [score, highScore]);
    
    const handleJump = useCallback((e?: KeyboardEvent) => {
        if (!e || e.code === 'ArrowUp' || e.code === 'Space') {
            e?.preventDefault();
            if (gameStatus === GameStatus.Playing && rabbitY.current <= GROUND_HEIGHT) {
                rabbitVelocityY.current = RABBIT_JUMP_VELOCITY;
                playSound('sounds/jump.wav');
            } else if (gameStatus === GameStatus.Start || gameStatus === GameStatus.GameOver) {
                startGame();
            }
        }
    }, [gameStatus, startGame]);

    const handleTouchJump = useCallback((e: TouchEvent) => {
        e.preventDefault();
        handleJump();
    }, [handleJump]);

    const handleClickJump = useCallback((e: MouseEvent) => {
        e.preventDefault();
        handleJump();
    }, [handleJump]);

    useEffect(() => {
        window.addEventListener('keydown', handleJump);
        window.addEventListener('touchstart', handleTouchJump, { passive: false });
        window.addEventListener('click', handleClickJump);
        return () => {
            window.removeEventListener('keydown', handleJump);
            window.removeEventListener('touchstart', handleTouchJump);
            window.removeEventListener('click', handleClickJump);
        };
    }, [handleJump, handleTouchJump, handleClickJump]);
  
    const gameLoop = useCallback((timestamp: number) => {
        if (gameStatus !== GameStatus.Playing) return;

        // Rabbit physics
        rabbitVelocityY.current += GRAVITY;
        rabbitY.current += rabbitVelocityY.current;
        if (rabbitY.current < GROUND_HEIGHT) {
            rabbitY.current = GROUND_HEIGHT;
            rabbitVelocityY.current = 0;
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
            playSound('sounds/score.wav');
            setScore(newScore);
        }
        
        trees.current = trees.current.filter(tree => tree.x > -TREE_WIDTH);

        if (timestamp - lastTreeTime.current > 1000) { 
            const lastTree = trees.current[trees.current.length - 1];
            if (!lastTree || lastTree.x < GAME_WIDTH - (250 + Math.random() * 250) ) {
                const newHeight = MIN_TREE_HEIGHT + Math.random() * (MAX_TREE_HEIGHT - MIN_TREE_HEIGHT);
                trees.current.push({ id: Date.now(), x: GAME_WIDTH, height: newHeight, passed: false });
                lastTreeTime.current = timestamp;
            }
        }
        
        const rabbitRect = { x: RABBIT_INITIAL_X, y: rabbitY.current, width: RABBIT_WIDTH - 10, height: RABBIT_HEIGHT - 10 };
        for (const tree of trees.current) {
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
    }, [score, endGame, gameStatus]);

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
        <div className="flex justify-center items-center min-h-screen bg-black select-none touch-none p-2">
            <div
                className="relative bg-[#87CEEB] overflow-hidden border-4 border-gray-700 shadow-2xl max-w-full max-h-full"
                style={{ 
                    width: `min(${GAME_WIDTH}px, 100vw - 16px)`, 
                    height: `min(${GAME_HEIGHT}px, 100vh - 16px)`,
                    aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}`
                }}
            >
                <Scoreboard score={score} highScore={highScore} />
                 <div className="absolute top-12 sm:top-16 left-0 right-0 text-center pointer-events-none">
                    <h1 className="text-2xl sm:text-4xl text-white" style={{ textShadow: '3px 3px 0 #000' }}>Hoppy Avoidance! 🥕</h1>
                </div>
                
                {/* Mobile touch instruction */}
                {gameStatus === GameStatus.Playing && (
                    <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none sm:hidden">
                        <p className="text-xs text-white bg-black bg-opacity-50 rounded px-2 py-1 inline-block">
                            Tap anywhere to jump!
                        </p>
                    </div>
                )}
                
                <Rabbit x={RABBIT_INITIAL_X} y={renderedRabbitY} isGameOver={gameStatus === GameStatus.GameOver} />
                {renderedTrees.map(tree => (
                    <Tree key={tree.id} x={tree.x} height={tree.height} />
                ))}
                <Ground />

                {gameStatus === GameStatus.Start && <StartScreen onStart={startGame} />}
                {gameStatus === GameStatus.GameOver && <GameOverScreen score={score} highScore={highScore} onRestart={startGame} />}
            </div>
        </div>
    );
};

export default App;