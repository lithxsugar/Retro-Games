import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Palette } from 'lucide-react';

const COLORS = [
  { name: 'red', class: 'bg-rose-500', shadow: 'shadow-[0_0_20px_rgba(244,63,94,0.8)]' },
  { name: 'blue', class: 'bg-blue-500', shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.8)]' },
  { name: 'green', class: 'bg-emerald-500', shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.8)]' },
  { name: 'yellow', class: 'bg-yellow-400', shadow: 'shadow-[0_0_20px_rgba(250,204,21,0.8)]' }
];

interface FallingBlock {
  id: number;
  y: number;
  colorIndex: number;
  speed: number;
}

interface ColorMatchProps {
  onBack: () => void;
}

export default function ColorMatch({ onBack }: ColorMatchProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  const [playerColorIdx, setPlayerColorIdx] = useState(0);
  const [blocks, setBlocks] = useState<FallingBlock[]>([]);

  const requestRef = useRef<number>();
  const stateRef = useRef({
    playerColorIdx: 0,
    blocks: [] as FallingBlock[],
    lastSpawn: 0,
    score: 0,
    difficulty: 1
  });

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setPlayerColorIdx(0);
    setBlocks([]);
    stateRef.current = {
      playerColorIdx: 0,
      blocks: [],
      lastSpawn: performance.now(),
      score: 0,
      difficulty: 1
    };
  };

  const updateGame = useCallback((time: number) => {
    if (!isPlaying || gameOver) return;

    const state = stateRef.current;

    // Spawn Blocks
    const spawnRate = Math.max(600, 2000 - state.difficulty * 150);
    if (time - state.lastSpawn > spawnRate) {
      state.blocks.push({
        id: time,
        y: -20,
        colorIndex: Math.floor(Math.random() * COLORS.length),
        speed: 3 + state.difficulty * 0.5
      });
      state.lastSpawn = time;
    }

    // Move Blocks & Collision
    let collision = false;
    state.blocks = state.blocks.map(block => {
      block.y += block.speed;
      
      // Collision Check (Player is at bottom 15%, height 10%)
      if (block.y > 80 && block.y < 90) {
        if (block.colorIndex === state.playerColorIdx) {
          // Match!
          state.score += 10;
          if (state.score % 100 === 0) state.difficulty += 0.5;
          block.y = 200; // Move offscreen to be filtered
        } else {
          // Mismatch!
          collision = true;
        }
      }

      return block;
    }).filter(block => block.y < 150);

    if (collision) {
      setGameOver(true);
      setIsPlaying(false);
    } else {
      setBlocks([...state.blocks]);
      setScore(state.score);
      requestRef.current = requestAnimationFrame(updateGame);
    }
  }, [isPlaying, gameOver]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, updateGame]);

  const handleTap = () => {
    if (!isPlaying || gameOver) return;
    const nextColor = (stateRef.current.playerColorIdx + 1) % COLORS.length;
    setPlayerColorIdx(nextColor);
    stateRef.current.playerColorIdx = nextColor;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 z-20 bg-slate-950/80 backdrop-blur-md">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-xs text-slate-400">SCORE</div>
          <div className="font-bold text-xl text-white">{score}</div>
        </div>
        <button onClick={startGame} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div 
        className="flex-1 relative bg-slate-900 overflow-hidden cursor-pointer"
        onClick={handleTap}
        onTouchStart={handleTap}
      >
        {/* Player */}
        <div 
          className={`absolute bottom-[10%] left-1/2 -translate-x-1/2 w-32 h-16 rounded-2xl flex items-center justify-center transition-colors duration-150 ${COLORS[playerColorIdx].class} ${COLORS[playerColorIdx].shadow}`}
        >
          <Palette className="text-white/50 w-8 h-8" />
        </div>

        {/* Falling Blocks */}
        {blocks.map(block => (
          <div
            key={block.id}
            className={`absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-xl ${COLORS[block.colorIndex].class} shadow-[0_0_15px_currentColor]`}
            style={{ top: `${block.y}%` }}
          />
        ))}

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-4 bg-white hover:bg-slate-200 text-slate-950 font-bold rounded-full text-xl shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-transform hover:scale-105"
            >
              TAP TO MATCH
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-30">
            <h2 className="text-4xl font-bold text-rose-500 mb-2 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">WRONG COLOR</h2>
            <p className="text-xl text-slate-300 mb-6">Score: <span className="text-white font-bold">{score}</span></p>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-4 bg-white hover:bg-slate-200 text-slate-950 font-bold rounded-full text-xl shadow-[0_0_20px_rgba(255,255,255,0.5)] transition-transform hover:scale-105"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
