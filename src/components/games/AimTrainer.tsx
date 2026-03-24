import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RefreshCw, Crosshair } from 'lucide-react';

interface Target {
  id: number;
  x: number;
  y: number;
  size: number;
  createdAt: number;
}

interface AimTrainerProps {
  onBack: () => void;
}

export default function AimTrainer({ onBack }: AimTrainerProps) {
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>();
  const lastSpawnRef = useRef<number>(0);
  const targetIdCounter = useRef(0);

  const spawnRate = Math.max(400, 1000 - score * 20); // Gets faster
  const shrinkRate = 0.05 + (score * 0.002); // Shrinks faster

  const startGame = () => {
    setTargets([]);
    setScore(0);
    setLives(3);
    setIsPlaying(true);
    setGameOver(false);
    lastSpawnRef.current = performance.now();
  };

  const updateGame = useCallback((time: number) => {
    if (!isPlaying || gameOver) return;

    if (time - lastSpawnRef.current > spawnRate) {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        const size = 60; // Initial size
        const x = Math.random() * (width - size);
        const y = Math.random() * (height - size);
        
        setTargets(prev => [...prev, {
          id: targetIdCounter.current++,
          x, y, size, createdAt: time
        }]);
      }
      lastSpawnRef.current = time;
    }

    setTargets(prev => {
      const newTargets = prev.map(t => ({
        ...t,
        size: t.size - shrinkRate
      }));

      const missed = newTargets.filter(t => t.size <= 0).length;
      if (missed > 0) {
        setLives(l => {
          const newLives = l - missed;
          if (newLives <= 0) {
            setGameOver(true);
            setIsPlaying(false);
          }
          return newLives;
        });
      }

      return newTargets.filter(t => t.size > 0);
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, [isPlaying, gameOver, spawnRate, shrinkRate]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, updateGame]);

  const handleTargetClick = (id: number, e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (!isPlaying || gameOver) return;
    
    setTargets(prev => prev.filter(t => t.id !== id));
    setScore(s => s + 1);
  };

  const handleMissClick = () => {
    if (!isPlaying || gameOver) return;
    setLives(l => {
      const newLives = l - 1;
      if (newLives <= 0) {
        setGameOver(true);
        setIsPlaying(false);
      }
      return newLives;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 z-10">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-6 items-center">
          <div className="text-center">
            <div className="text-xs text-slate-400">SCORE</div>
            <div className="font-bold text-yellow-400">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400">LIVES</div>
            <div className="font-bold text-rose-500 flex gap-1">
              {Array.from({length: Math.max(0, lives)}).map((_, i) => (
                <span key={i}>♥</span>
              ))}
            </div>
          </div>
        </div>
        <button onClick={startGame} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div 
        ref={containerRef} 
        className="flex-1 relative overflow-hidden bg-slate-900/50 cursor-crosshair"
        onClick={handleMissClick}
        onTouchStart={handleMissClick}
      >
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-full text-xl shadow-[0_0_20px_rgba(234,179,8,0.5)] transition-transform hover:scale-105"
            >
              START TRAINING
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-20">
            <h2 className="text-4xl font-bold text-rose-500 mb-2 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">GAME OVER</h2>
            <p className="text-xl text-slate-300 mb-6">Final Score: <span className="text-yellow-400 font-bold">{score}</span></p>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-full text-xl shadow-[0_0_20px_rgba(234,179,8,0.5)] transition-transform hover:scale-105"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        <AnimatePresence>
          {targets.map(target => (
            <motion.div
              key={target.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="absolute rounded-full bg-yellow-400 border-4 border-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.6)]"
              style={{
                left: target.x,
                top: target.y,
                width: target.size,
                height: target.size,
              }}
              onClick={(e) => handleTargetClick(target.id, e)}
              onTouchStart={(e) => handleTargetClick(target.id, e)}
            >
              <Crosshair className="text-orange-600 w-1/2 h-1/2 opacity-50" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
