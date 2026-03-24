import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Wind } from 'lucide-react';

interface Obstacle {
  id: number;
  x: number;
  topHeight: number;
  bottomHeight: number;
}

interface HelicopterProps {
  onBack: () => void;
}

const GRAVITY = 0.4;
const THRUST = -0.8;
const MAX_VELOCITY = 8;
const OBSTACLE_WIDTH = 40;
const GAP_SIZE = 150;

export default function Helicopter({ onBack }: HelicopterProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  
  const [heliY, setHeliY] = useState(250);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);

  const requestRef = useRef<number>();
  const stateRef = useRef({
    y: 250,
    velocity: 0,
    isHolding: false,
    obstacles: [] as Obstacle[],
    speed: 4,
    lastSpawn: 0,
    score: 0
  });

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setHeliY(250);
    setObstacles([]);
    stateRef.current = {
      y: 250,
      velocity: 0,
      isHolding: false,
      obstacles: [],
      speed: 4,
      lastSpawn: performance.now(),
      score: 0
    };
  };

  const handlePointerDown = () => { stateRef.current.isHolding = true; };
  const handlePointerUp = () => { stateRef.current.isHolding = false; };

  const updateGame = useCallback((time: number) => {
    if (!isPlaying || gameOver) return;

    const state = stateRef.current;

    // Physics
    if (state.isHolding) {
      state.velocity += THRUST;
    } else {
      state.velocity += GRAVITY;
    }
    
    // Clamp velocity
    state.velocity = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, state.velocity));
    state.y += state.velocity;

    // Boundary Collision (Ceiling/Floor)
    if (state.y < 0 || state.y > 500) {
      setGameOver(true);
      setIsPlaying(false);
      return;
    }

    // Spawn Obstacles
    if (time - state.lastSpawn > 1500) {
      const topHeight = 50 + Math.random() * 200;
      const bottomHeight = 500 - topHeight - GAP_SIZE;
      
      state.obstacles.push({
        id: time,
        x: 400, // Spawn off screen right
        topHeight,
        bottomHeight
      });
      state.lastSpawn = time;
    }

    // Move Obstacles & Collision
    let collision = false;
    state.obstacles = state.obstacles.map(obs => {
      obs.x -= state.speed;
      
      // Collision Check
      // Heli is at x: 50, width: 40, height: 30
      const heliRect = { left: 50, right: 90, top: state.y, bottom: state.y + 30 };
      
      // Top Obstacle
      if (heliRect.right > obs.x && heliRect.left < obs.x + OBSTACLE_WIDTH && heliRect.top < obs.topHeight) {
        collision = true;
      }
      // Bottom Obstacle
      if (heliRect.right > obs.x && heliRect.left < obs.x + OBSTACLE_WIDTH && heliRect.bottom > 500 - obs.bottomHeight) {
        collision = true;
      }

      return obs;
    }).filter(obs => {
      if (obs.x < -OBSTACLE_WIDTH) {
        state.score += 10;
        state.speed += 0.02;
        return false;
      }
      return true;
    });

    if (collision) {
      setGameOver(true);
      setIsPlaying(false);
    } else {
      setHeliY(state.y);
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

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 z-20 bg-slate-950/80 backdrop-blur-md">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <div className="text-xs text-slate-400">DISTANCE</div>
          <div className="font-bold text-xl text-amber-400">{score}</div>
        </div>
        <button onClick={startGame} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div 
        className="flex-1 relative bg-slate-900 overflow-hidden cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Game Area (Fixed height for consistent physics) */}
        <div className="absolute top-1/2 left-0 w-full h-[500px] -translate-y-1/2 bg-slate-800/50 border-y-4 border-amber-500/30">
          
          {/* Helicopter */}
          <div 
            className="absolute left-[50px] w-[40px] h-[30px] bg-amber-400 rounded-full shadow-[0_0_15px_rgba(251,191,36,0.8)] flex items-center justify-center transition-transform duration-75"
            style={{ 
              top: heliY,
              transform: `rotate(${stateRef.current.velocity * 2}deg)`
            }}
          >
            <Wind className="text-slate-900 w-5 h-5 animate-spin" />
            {/* Tail */}
            <div className="absolute -left-3 top-1 w-4 h-1 bg-amber-400" />
            <div className="absolute -left-4 top-0 w-2 h-3 bg-amber-400 animate-pulse" />
          </div>

          {/* Obstacles */}
          {obstacles.map(obs => (
            <React.Fragment key={obs.id}>
              {/* Top */}
              <div
                className="absolute bg-emerald-600 border-b-4 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                style={{
                  left: obs.x,
                  top: 0,
                  width: OBSTACLE_WIDTH,
                  height: obs.topHeight
                }}
              />
              {/* Bottom */}
              <div
                className="absolute bg-emerald-600 border-t-4 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]"
                style={{
                  left: obs.x,
                  bottom: 0,
                  width: OBSTACLE_WIDTH,
                  height: obs.bottomHeight
                }}
              />
            </React.Fragment>
          ))}
        </div>

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full text-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-transform hover:scale-105"
            >
              HOLD TO FLY
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-30">
            <h2 className="text-4xl font-bold text-rose-500 mb-2 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">CRASHED</h2>
            <p className="text-xl text-slate-300 mb-6">Distance: <span className="text-amber-400 font-bold">{score}</span></p>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full text-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-transform hover:scale-105"
            >
              FLY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
