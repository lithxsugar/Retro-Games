import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RefreshCw, Dna } from 'lucide-react';

interface Obstacle {
  id: number;
  x: number;
  width: number;
  height: number;
}

interface DinoRunProps {
  onBack: () => void;
}

const GRAVITY = 0.6;
const JUMP_VELOCITY = -12;
const GROUND_Y = 300; // Relative to container

export default function DinoRun({ onBack }: DinoRunProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  const [dinoY, setDinoY] = useState(GROUND_Y);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);

  const requestRef = useRef<number>();
  const stateRef = useRef({
    y: GROUND_Y,
    velocity: 0,
    isJumping: false,
    obstacles: [] as Obstacle[],
    speed: 5,
    lastSpawn: 0,
    score: 0
  });

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setDinoY(GROUND_Y);
    setObstacles([]);
    stateRef.current = {
      y: GROUND_Y,
      velocity: 0,
      isJumping: false,
      obstacles: [],
      speed: 5,
      lastSpawn: performance.now(),
      score: 0
    };
  };

  const jump = useCallback(() => {
    if (!isPlaying || gameOver) return;
    if (!stateRef.current.isJumping) {
      stateRef.current.velocity = JUMP_VELOCITY;
      stateRef.current.isJumping = true;
    }
  }, [isPlaying, gameOver]);

  const updateGame = useCallback((time: number) => {
    if (!isPlaying || gameOver) return;

    const state = stateRef.current;

    // Physics
    state.velocity += GRAVITY;
    state.y += state.velocity;

    if (state.y >= GROUND_Y) {
      state.y = GROUND_Y;
      state.velocity = 0;
      state.isJumping = false;
    }

    // Spawn Obstacles
    if (time - state.lastSpawn > Math.max(800, 2000 - state.speed * 100)) {
      if (Math.random() > 0.3) {
        state.obstacles.push({
          id: time,
          x: 400, // Spawn off screen right
          width: 20 + Math.random() * 20,
          height: 30 + Math.random() * 30
        });
      }
      state.lastSpawn = time;
    }

    // Move Obstacles & Collision
    let collision = false;
    state.obstacles = state.obstacles.map(obs => {
      obs.x -= state.speed;
      
      // Collision Check
      // Dino is at x: 50, width: 40, height: 40
      const dinoRect = { left: 50, right: 90, top: state.y - 40, bottom: state.y };
      const obsRect = { left: obs.x, right: obs.x + obs.width, top: GROUND_Y - obs.height, bottom: GROUND_Y };

      if (
        dinoRect.left < obsRect.right &&
        dinoRect.right > obsRect.left &&
        dinoRect.bottom > obsRect.top &&
        dinoRect.top < obsRect.bottom
      ) {
        collision = true;
      }

      return obs;
    }).filter(obs => {
      if (obs.x < -50) {
        state.score += 10;
        state.speed += 0.05;
        return false;
      }
      return true;
    });

    if (collision) {
      setGameOver(true);
      setIsPlaying(false);
    } else {
      setDinoY(state.y);
      setObstacles([...state.obstacles]);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') jump();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 z-20 bg-slate-950/80 backdrop-blur-md">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-xs text-slate-400">SCORE</div>
          <div className="font-bold text-xl text-emerald-400">{score}</div>
        </div>
        <button onClick={startGame} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div 
        className="flex-1 relative bg-slate-900 overflow-hidden cursor-pointer"
        onClick={jump}
        onTouchStart={jump}
      >
        {/* Ground */}
        <div className="absolute bottom-0 w-full h-[calc(100%-300px)] bg-slate-800 border-t-4 border-emerald-500/50" />

        {/* Game Area */}
        <div className="absolute top-0 left-0 w-full h-[300px]">
          {/* Dino */}
          <div 
            className="absolute left-[50px] w-[40px] h-[40px] bg-emerald-400 rounded-md shadow-[0_0_15px_rgba(52,211,153,0.8)] flex items-center justify-center"
            style={{ top: dinoY - 40 }}
          >
            <Dna className="text-slate-900 w-6 h-6" />
          </div>

          {/* Obstacles */}
          {obstacles.map(obs => (
            <div
              key={obs.id}
              className="absolute bg-rose-500 rounded-t-sm shadow-[0_0_15px_rgba(244,63,94,0.6)]"
              style={{
                left: obs.x,
                top: GROUND_Y - obs.height,
                width: obs.width,
                height: obs.height
              }}
            />
          ))}
        </div>

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-full text-xl shadow-[0_0_20px_rgba(52,211,153,0.5)] transition-transform hover:scale-105"
            >
              TAP TO RUN
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-30">
            <h2 className="text-4xl font-bold text-rose-500 mb-2 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">GAME OVER</h2>
            <p className="text-xl text-slate-300 mb-6">Score: <span className="text-emerald-400 font-bold">{score}</span></p>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-full text-xl shadow-[0_0_20px_rgba(52,211,153,0.5)] transition-transform hover:scale-105"
            >
              RUN AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
