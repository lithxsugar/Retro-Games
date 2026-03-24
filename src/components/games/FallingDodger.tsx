import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RefreshCw, Zap } from 'lucide-react';

interface FallingObject {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface FallingDodgerProps {
  onBack: () => void;
}

export default function FallingDodger({ onBack }: FallingDodgerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  const [playerX, setPlayerX] = useState(50); // percentage 0-100
  const [objects, setObjects] = useState<FallingObject[]>([]);

  const requestRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    playerX: 50,
    objects: [] as FallingObject[],
    lastSpawn: 0,
    score: 0,
    difficulty: 1
  });

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setPlayerX(50);
    setObjects([]);
    stateRef.current = {
      playerX: 50,
      objects: [],
      lastSpawn: performance.now(),
      score: 0,
      difficulty: 1
    };
  };

  const updateGame = useCallback((time: number) => {
    if (!isPlaying || gameOver) return;

    const state = stateRef.current;

    // Spawn Objects
    const spawnRate = Math.max(200, 1000 - state.difficulty * 50);
    if (time - state.lastSpawn > spawnRate) {
      state.objects.push({
        id: time,
        x: Math.random() * 90 + 5, // 5% to 95%
        y: -10,
        size: 20 + Math.random() * 30,
        speed: 2 + Math.random() * 3 + state.difficulty * 0.5
      });
      state.lastSpawn = time;
    }

    // Move Objects & Collision
    let collision = false;
    state.objects = state.objects.map(obj => {
      obj.y += obj.speed;
      
      // Collision Check (Simplified percentage based)
      // Player is at playerX %, bottom 10%, size approx 10%
      if (obj.y > 85 && obj.y < 95) {
        if (Math.abs(obj.x - state.playerX) < 10) {
          collision = true;
        }
      }

      return obj;
    }).filter(obj => {
      if (obj.y > 110) {
        state.score += 10;
        if (state.score % 100 === 0) state.difficulty += 0.5;
        return false;
      }
      return true;
    });

    if (collision) {
      setGameOver(true);
      setIsPlaying(false);
    } else {
      setObjects([...state.objects]);
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

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPlaying || gameOver || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setPlayerX(x);
    stateRef.current.playerX = x;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 z-20 bg-slate-950/80 backdrop-blur-md">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-xs text-slate-400">SCORE</div>
          <div className="font-bold text-xl text-teal-400">{score}</div>
        </div>
        <button onClick={startGame} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 relative bg-slate-900 overflow-hidden touch-none"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerMove}
      >
        {/* Player */}
        <div 
          className="absolute bottom-[10%] w-12 h-12 bg-teal-400 rounded-lg shadow-[0_0_20px_rgba(45,212,191,0.8)] flex items-center justify-center -ml-6"
          style={{ left: `${playerX}%` }}
        >
          <Zap className="text-slate-900 w-8 h-8" />
        </div>

        {/* Falling Objects */}
        {objects.map(obj => (
          <div
            key={obj.id}
            className="absolute bg-rose-500 rounded-md shadow-[0_0_15px_rgba(244,63,94,0.6)] -ml-4"
            style={{
              left: `${obj.x}%`,
              top: `${obj.y}%`,
              width: obj.size,
              height: obj.size
            }}
          />
        ))}

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <button 
              onClick={startGame}
              className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-full text-xl shadow-[0_0_20px_rgba(20,184,166,0.5)] transition-transform hover:scale-105"
            >
              START DODGING
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-30">
            <h2 className="text-4xl font-bold text-rose-500 mb-2 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">CRUSHED</h2>
            <p className="text-xl text-slate-300 mb-6">Score: <span className="text-teal-400 font-bold">{score}</span></p>
            <button 
              onClick={startGame}
              className="px-8 py-4 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-full text-xl shadow-[0_0_20px_rgba(20,184,166,0.5)] transition-transform hover:scale-105"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
