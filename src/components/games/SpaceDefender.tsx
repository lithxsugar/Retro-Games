import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Target } from 'lucide-react';

interface Bullet {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Asteroid {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
}

interface SpaceDefenderProps {
  onBack: () => void;
}

export default function SpaceDefender({ onBack }: SpaceDefenderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [playerAngle, setPlayerAngle] = useState(0);

  const requestRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    bullets: [] as Bullet[],
    asteroids: [] as Asteroid[],
    lastSpawn: 0,
    score: 0,
    lives: 3,
    difficulty: 1
  });

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setBullets([]);
    setAsteroids([]);
    setPlayerAngle(0);
    stateRef.current = {
      bullets: [],
      asteroids: [],
      lastSpawn: performance.now(),
      score: 0,
      lives: 3,
      difficulty: 1
    };
  };

  const updateGame = useCallback((time: number) => {
    if (!isPlaying || gameOver) return;

    const state = stateRef.current;

    // Spawn Asteroids
    const spawnRate = Math.max(500, 2000 - state.difficulty * 200);
    if (time - state.lastSpawn > spawnRate) {
      state.asteroids.push({
        id: time,
        x: Math.random() * 100, // percentage
        y: -10, // percentage
        size: 20 + Math.random() * 30, // px
        speed: 0.2 + Math.random() * 0.3 + state.difficulty * 0.05 // percentage per frame
      });
      state.lastSpawn = time;
    }

    // Move Bullets
    state.bullets = state.bullets.map(b => ({
      ...b,
      x: b.x + b.vx,
      y: b.y + b.vy
    })).filter(b => b.x > -10 && b.x < 110 && b.y > -10 && b.y < 110);

    // Move Asteroids & Check Collisions
    let hitBottom = 0;
    
    state.asteroids = state.asteroids.map(ast => {
      ast.y += ast.speed;
      return ast;
    }).filter(ast => {
      // Check bullet collision
      const hitBulletIdx = state.bullets.findIndex(b => {
        // Rough distance check (converting % to approx px is hard without container size, so we use a rough ratio)
        // Assume 1% is roughly 4px
        const dx = (b.x - ast.x) * 4;
        const dy = (b.y - ast.y) * 8; // Height is usually 2x width
        const dist = Math.sqrt(dx*dx + dy*dy);
        return dist < ast.size;
      });

      if (hitBulletIdx !== -1) {
        state.bullets.splice(hitBulletIdx, 1);
        state.score += 10;
        if (state.score % 100 === 0) state.difficulty += 0.5;
        return false; // Destroy asteroid
      }

      if (ast.y > 100) {
        hitBottom++;
        return false;
      }
      return true;
    });

    if (hitBottom > 0) {
      state.lives -= hitBottom;
      if (state.lives <= 0) {
        setGameOver(true);
        setIsPlaying(false);
      }
    }

    setBullets([...state.bullets]);
    setAsteroids([...state.asteroids]);
    setScore(state.score);
    setLives(state.lives);
    
    if (state.lives > 0) {
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

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!isPlaying || gameOver || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Player is at bottom center (50%, 100%)
    const playerX = rect.width / 2;
    const playerY = rect.height;
    
    const angle = Math.atan2(y - playerY, x - playerX);
    setPlayerAngle(angle * (180 / Math.PI) + 90); // +90 because base rotation points up

    // Shoot bullet
    const speed = 2; // % per frame
    stateRef.current.bullets.push({
      id: performance.now(),
      x: 50,
      y: 100,
      vx: Math.cos(angle) * speed * (rect.height/rect.width), // Adjust for aspect ratio roughly
      vy: Math.sin(angle) * speed
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-slate-800 z-20 bg-slate-950/80 backdrop-blur-md">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-6 items-center">
          <div className="text-center">
            <div className="text-xs text-slate-400">SCORE</div>
            <div className="font-bold text-indigo-400">{score}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400">SHIELDS</div>
            <div className="font-bold text-cyan-400 flex gap-1">
              {Array.from({length: Math.max(0, lives)}).map((_, i) => (
                <span key={i}>▰</span>
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
        className="flex-1 relative bg-slate-900 overflow-hidden cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
      >
        {/* Stars Background */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black" />

        {/* Player Base */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 bg-slate-800 rounded-t-full border-t-4 border-indigo-500 flex items-end justify-center pb-2 shadow-[0_-10px_30px_rgba(99,102,241,0.3)]">
          {/* Cannon */}
          <div 
            className="absolute bottom-4 w-6 h-16 bg-cyan-400 rounded-full origin-bottom shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-transform duration-75"
            style={{ transform: `rotate(${playerAngle}deg)` }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-4 bg-white rounded-full" />
          </div>
        </div>

        {/* Bullets */}
        {bullets.map(b => (
          <div
            key={b.id}
            className="absolute w-2 h-6 bg-cyan-300 rounded-full shadow-[0_0_10px_rgba(103,232,249,1)] -ml-1 -mt-3"
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
          />
        ))}

        {/* Asteroids */}
        {asteroids.map(ast => (
          <div
            key={ast.id}
            className="absolute bg-slate-700 border-2 border-slate-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            style={{
              left: `calc(${ast.x}% - ${ast.size/2}px)`,
              top: `calc(${ast.y}% - ${ast.size/2}px)`,
              width: ast.size,
              height: ast.size
            }}
          >
            <Target className="text-slate-500 w-1/2 h-1/2 opacity-50" />
          </div>
        ))}

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-full text-xl shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-transform hover:scale-105"
            >
              DEFEND BASE
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-30">
            <h2 className="text-4xl font-bold text-rose-500 mb-2 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">BASE DESTROYED</h2>
            <p className="text-xl text-slate-300 mb-6">Score: <span className="text-indigo-400 font-bold">{score}</span></p>
            <button 
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-full text-xl shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-transform hover:scale-105"
            >
              TRY AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
