import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface Block {
  x: number;
  width: number;
  color: string;
}

interface TowerStackProps {
  onBack: () => void;
}

const COLORS = [
  'bg-rose-500', 'bg-pink-500', 'bg-fuchsia-500', 'bg-purple-500', 
  'bg-violet-500', 'bg-indigo-500', 'bg-blue-500', 'bg-cyan-500',
  'bg-teal-500', 'bg-emerald-500'
];

const INITIAL_WIDTH = 200;
const BLOCK_HEIGHT = 30;

export default function TowerStack({ onBack }: TowerStackProps) {
  const [blocks, setBlocks] = useState<Block[]>([{ x: 0, width: INITIAL_WIDTH, color: COLORS[0] }]);
  const [currentX, setCurrentX] = useState(0);
  const [direction, setDirection] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const stateRef = useRef({ currentX: 0, direction: 1, width: INITIAL_WIDTH, speed: 3 });

  const startGame = useCallback(() => {
    setBlocks([{ x: 0, width: INITIAL_WIDTH, color: COLORS[0] }]);
    setScore(0);
    setGameOver(false);
    stateRef.current = { currentX: -150, direction: 1, width: INITIAL_WIDTH, speed: 3 };
    setCurrentX(-150);
  }, []);

  const updateGame = useCallback(() => {
    if (gameOver) return;

    const state = stateRef.current;
    const maxTravel = 150; // Max distance from center

    state.currentX += state.speed * state.direction;

    if (state.currentX > maxTravel) {
      state.currentX = maxTravel;
      state.direction = -1;
    } else if (state.currentX < -maxTravel) {
      state.currentX = -maxTravel;
      state.direction = 1;
    }

    setCurrentX(state.currentX);
    requestRef.current = requestAnimationFrame(updateGame);
  }, [gameOver]);

  useEffect(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    if (!gameOver) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameOver, updateGame]);

  const handleTap = () => {
    if (gameOver) {
      startGame();
      return;
    }

    const previousBlock = blocks[blocks.length - 1];
    const currentBlockX = stateRef.current.currentX;
    const currentWidth = stateRef.current.width;

    // Calculate overlap
    const diff = currentBlockX - previousBlock.x;
    const overlap = currentWidth - Math.abs(diff);

    if (overlap <= 0) {
      // Missed completely
      setGameOver(true);
    } else {
      // Hit!
      const newWidth = overlap;
      const newX = diff > 0 ? previousBlock.x + (diff / 2) : previousBlock.x + (diff / 2);
      
      // Perfect hit bonus (snap to previous)
      let finalX = newX;
      let finalWidth = newWidth;
      if (Math.abs(diff) < 5) {
        finalX = previousBlock.x;
        finalWidth = currentWidth; // Keep width
      }

      const newBlock = {
        x: finalX,
        width: finalWidth,
        color: COLORS[blocks.length % COLORS.length]
      };

      setBlocks(prev => [...prev, newBlock]);
      setScore(s => s + 1);
      
      // Update moving block state
      stateRef.current.width = finalWidth;
      stateRef.current.speed += 0.1; // Increase speed
      stateRef.current.currentX = -150 * stateRef.current.direction; // Start from opposite side
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 z-10 bg-slate-950/80 backdrop-blur-md">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-xs text-slate-400">SCORE</div>
          <div className="font-bold text-2xl text-pink-400">{score}</div>
        </div>
        <button onClick={startGame} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 relative cursor-pointer flex flex-col items-center justify-end pb-20"
        onClick={handleTap}
        onTouchStart={handleTap}
      >
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-20">
            <h2 className="text-4xl font-bold text-rose-500 mb-2 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">TOWER FELL</h2>
            <p className="text-xl text-slate-300 mb-6">Height: <span className="text-pink-400 font-bold">{score}</span></p>
            <p className="text-sm text-slate-400 animate-pulse">Tap to restart</p>
          </div>
        )}

        <div className="relative w-full flex justify-center" style={{ height: '60vh' }}>
          {/* Camera pan effect by moving the container down as blocks increase */}
          <motion.div 
            className="absolute bottom-0 flex flex-col items-center w-full"
            animate={{ y: Math.max(0, (blocks.length - 10) * BLOCK_HEIGHT) }}
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          >
            {/* Placed Blocks */}
            {blocks.map((block, i) => (
              <div
                key={i}
                className={`absolute ${block.color} border-t border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                style={{
                  width: block.width,
                  height: BLOCK_HEIGHT,
                  bottom: i * BLOCK_HEIGHT,
                  transform: `translateX(${block.x}px)`,
                  boxShadow: `0 0 10px var(--tw-shadow-color)`,
                  shadowColor: 'currentColor'
                }}
              />
            ))}

            {/* Moving Block */}
            {!gameOver && (
              <div
                className={`absolute ${COLORS[blocks.length % COLORS.length]} border-t border-white/40 shadow-[0_0_20px_currentColor]`}
                style={{
                  width: stateRef.current.width,
                  height: BLOCK_HEIGHT,
                  bottom: blocks.length * BLOCK_HEIGHT,
                  transform: `translateX(${currentX}px)`,
                }}
              />
            )}
          </motion.div>
        </div>
        
        {!gameOver && score === 0 && (
          <div className="absolute bottom-10 text-slate-400 animate-pulse">
            Tap anywhere to drop
          </div>
        )}
      </div>
    </div>
  );
}
