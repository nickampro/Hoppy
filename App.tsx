
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
    const gameLoopId = useRef<number>();

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
        new Audio('/sounds/game-over.wav').play();
        setGameStatus(GameStatus.GameOver);
        if (score > highScore) {
            const newHighScore = score;
            setHighScore(newHighScore);
            localStorage.setItem(HIGH_SCORE_KEY, newHighScore.toString());
        }
    }, [score, highScore]);
    
    const handleJump = useCallback((e: KeyboardEvent) => {
        if (e.code === 'ArrowUp' || e.code === 'Space') {
            e.preventDefault();
            if (gameStatus === GameStatus.Playing && rabbitY.current <= GROUND_HEIGHT) {
                rabbitVelocityY.current = RABBIT_JUMP_VELOCITY;
                new Audio('/sounds/jump.wav').play();
            } else if (gameStatus === GameStatus.Start || gameStatus === GameStatus.GameOver) {
                startGame();
            }
        }
    }, [gameStatus, startGame]);

    useEffect(() => {
        window.addEventListener('keydown', handleJump);
        return () => window.removeEventListener('keydown', handleJump);
    }, [handleJump]);
  
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
            new Audio('/sounds/score.wav').play();
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
        
        const rabbitRect = { x: RABBIT_INITIAL_X, y: rabbitY.current, width: RABBIT_WIDTH-10, height: RABBIT_HEIGHT-10 };
        for (const tree of trees.current) {
            const treeRect = { x: tree.x, y: GROUND_HEIGHT, width: TREE_WIDTH, height: tree.height };
            if (
                rabbitRect.x < treeRect.x + treeRect.width &&
                rabbitRect.x + rabbitRect.width > treeRect.x &&
                rabbitRect.y - rabbitRect.height < treeRect.y + treeRect.height &&
                rabbitRect.y > treeRect.y
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
            if (gameLoopId.current) {
                cancelAnimationFrame(gameLoopId.current);
            }
        };
    }, [gameStatus, gameLoop]);
  
    return (
        <div className="flex justify-center items-center h-screen bg-black select-none">
            <div
                className="relative bg-[#87CEEB] overflow-hidden border-8 border-gray-700 shadow-2xl"
                style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
            >
                <Scoreboard score={score} highScore={highScore} />
                 <div className="absolute top-16 left-0 right-0 text-center pointer-events-none">
                    <h1 className="text-4xl text-white" style={{ textShadow: '3px 3px 0 #000' }}>Hoppy Avoidance! 🥕</h1>
                </div>
                <Rabbit x={RABBIT_INITIAL_X} y={renderedRabbitY} />
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
