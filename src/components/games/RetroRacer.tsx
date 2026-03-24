import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RefreshCw, CarFront } from 'lucide-react';

interface Enemy {
  id: number;
  lane: number;
  y: number;
}

interface RetroRacerProps {
  onBack: () => void;
}

const LANES = [0, 1, 2];
const LANE_WIDTH = 80;

export default function RetroRacer({ onBack }: RetroRacerProps) {
  const [playerLane, setPlayerLane] = useState(1);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const requestRef = useRef<number>();
  const lastSpawnRef = useRef<number>(0);
  const speedRef = useRef(5);
  const enemyIdCounter = useRef(0);

  const startGame = () => {
    setPlayerLane(1);
    setEnemies([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    speedRef.current = 5;
    lastSpawnRef.current = performance.now();
  };

  const updateGame = useCallback((time: number) => {
    if (!isPlaying || gameOver) return;

    // Spawn enemies
    const spawnRate = Math.max(800, 2000 - score * 50);
    if (time - lastSpawnRef.current > spawnRate) {
      const lane = Math.floor(Math.random() * 3);
      setEnemies(prev => [...prev, { id: enemyIdCounter.current++, lane, y: -100 }]);
      lastSpawnRef.current = time;
    }

    // Move enemies & check collision
    setEnemies(prev => {
      let collision = false;
      const newEnemies = prev.map(enemy => {
        const newY = enemy.y + speedRef.current;
        
        // Collision check (simplified AABB)
        // Player is at y: 80% of screen (approx 500px), height 60px
        // Enemy is at newY, height 60px
        if (enemy.lane === playerLane && newY > 440 && newY < 560) {
          collision = true;
        }
        
        return { ...enemy, y: newY };
      }).filter(enemy => {
        if (enemy.y > 800) {
          setScore(s => s + 10);
          speedRef.current += 0.1; // Increase speed
          return false;
        }
        return true;
      });

      if (collision) {
        setGameOver(true);
        setIsPlaying(false);
      }

      return newEnemies;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, [isPlaying, gameOver, playerLane, score]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, updateGame]);

  const handleTap = (direction: 'left' | 'right') => {
    if (!isPlaying || gameOver) return;
    if (direction === 'left') setPlayerLane(l => Math.max(0, l - 1));
    if (direction === 'right') setPlayerLane(l => Math.min(2, l + 1));
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 z-20 bg-slate-950/80 backdrop-blur-md">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-xs text-slate-400">SCORE</div>
          <div className="font-bold text-xl text-rose-500">{score}</div>
        </div>
        <button onClick={startGame} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 relative bg-slate-900 flex justify-center overflow-hidden">
        {/* Road */}
        <div className="w-[240px] h-full bg-slate-800 relative border-l-4 border-r-4 border-slate-600">
          {/* Lane Dividers */}
          <div className="absolute left-1/3 top-0 bottom-0 w-1 border-l-4 border-dashed border-white/20 animate-[slide_1s_linear_infinite]" />
          <div className="absolute right-1/3 top-0 bottom-0 w-1 border-l-4 border-dashed border-white/20 animate-[slide_1s_linear_infinite]" />

          {/* Player */}
          <motion.div 
            className="absolute bottom-20 w-[60px] h-[80px] bg-cyan-500 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.8)] flex items-center justify-center z-10"
            animate={{ x: playerLane * LANE_WIDTH + 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <CarFront className="text-slate-900 w-8 h-8" />
            {/* Headlights */}
            <div className="absolute -top-10 left-1 w-4 h-12 bg-gradient-to-t from-cyan-200/80 to-transparent blur-sm" />
            <div className="absolute -top-10 right-1 w-4 h-12 bg-gradient-to-t from-cyan-200/80 to-transparent blur-sm" />
          </motion.div>

          {/* Enemies */}
          {enemies.map(enemy => (
            <div
              key={enemy.id}
              className="absolute w-[60px] h-[80px] bg-rose-500 rounded-lg shadow-[0_0_20px_rgba(244,63,94,0.8)] flex items-center justify-center"
              style={{
                left: enemy.lane * LANE_WIDTH + 10,
                top: enemy.y,
              }}
            >
              <CarFront className="text-slate-900 w-8 h-8 rotate-180" />
            </div>
          ))}
        </div>

        {/* Controls Overlay */}
        <div className="absolute inset-0 flex z-20">
          <div className="flex-1" onClick={() => handleTap('left')} onTouchStart={() => handleTap('left')} />
          <div className="flex-1" onClick={() => handleTap('right')} onTouchStart={() => handleTap('right')} />
        </div>

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <button 
              onClick={startGame}
              className="px-8 py-4 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-full text-xl shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-transform hover:scale-105"
            >
              START ENGINE
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-30">
            <h2 className="text-4xl font-bold text-rose-500 mb-2 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">CRASHED</h2>
            <p className="text-xl text-slate-300 mb-6">Score: <span className="text-cyan-400 font-bold">{score}</span></p>
            <button 
              onClick={startGame}
              className="px-8 py-4 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-full text-xl shadow-[0_0_20px_rgba(244,63,94,0.5)] transition-transform hover:scale-105"
            >
              RACE AGAIN
            </button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes slide {
          from { background-position: 0 0; }
          to { background-position: 0 40px; }
        }
      `}</style>
    </div>
  );
}
