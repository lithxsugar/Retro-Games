import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, RotateCcw } from 'lucide-react';

const GAME_WIDTH = 300;
const GAME_HEIGHT = 400;
const SHIP_WIDTH = 30;
const SHIP_HEIGHT = 20;
const ALIEN_SIZE = 20;
const BULLET_SIZE = 4;

interface Entity { x: number; y: number; active: boolean; }

export default function SpaceInvaders({ onBack }: { onBack: () => void }) {
  const [shipX, setShipX] = useState(GAME_WIDTH / 2 - SHIP_WIDTH / 2);
  const [bullets, setBullets] = useState<Entity[]>([]);
  const [aliens, setAliens] = useState<Entity[]>([]);
  const [alienDir, setAlienDir] = useState(1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const initAliens = () => {
    const newAliens: Entity[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) {
        newAliens.push({ x: c * 40 + 30, y: r * 30 + 30, active: true });
      }
    }
    setAliens(newAliens);
  };

  useEffect(() => {
    initAliens();
  }, []);

  const resetGame = () => {
    setShipX(GAME_WIDTH / 2 - SHIP_WIDTH / 2);
    setBullets([]);
    setScore(0);
    setGameOver(false);
    setWin(false);
    setIsPlaying(false);
    setAlienDir(1);
    initAliens();
  };

  useEffect(() => {
    if (!isPlaying || gameOver || win) return;

    const interval = setInterval(() => {
      // Move bullets
      setBullets((prev) => {
        let newBullets = prev.map(b => ({ ...b, y: b.y - 5 })).filter(b => b.y > 0 && b.active);
        
        // Bullet-Alien collision
        setAliens((currentAliens) => {
          let updatedAliens = [...currentAliens];
          let hitCount = 0;
          
          newBullets = newBullets.map(b => {
            let bulletActive = b.active;
            updatedAliens = updatedAliens.map(a => {
              if (a.active && bulletActive && 
                  b.x > a.x && b.x < a.x + ALIEN_SIZE && 
                  b.y > a.y && b.y < a.y + ALIEN_SIZE) {
                bulletActive = false;
                hitCount++;
                return { ...a, active: false };
              }
              return a;
            });
            return { ...b, active: bulletActive };
          });

          if (hitCount > 0) setScore(s => s + hitCount * 10);
          
          if (updatedAliens.every(a => !a.active)) {
            setWin(true);
            setIsPlaying(false);
          }
          
          return updatedAliens;
        });

        return newBullets.filter(b => b.active);
      });

      // Move aliens
      setAliens((prev) => {
        let moveDown = false;
        let newDir = alienDir;
        
        const activeAliens = prev.filter(a => a.active);
        if (activeAliens.length === 0) return prev;

        const minX = Math.min(...activeAliens.map(a => a.x));
        const maxX = Math.max(...activeAliens.map(a => a.x));

        if (maxX > GAME_WIDTH - ALIEN_SIZE - 10) { newDir = -1; moveDown = true; }
        if (minX < 10) { newDir = 1; moveDown = true; }

        if (moveDown) setAlienDir(newDir);

        const updated = prev.map(a => {
          if (!a.active) return a;
          const newY = moveDown ? a.y + 15 : a.y;
          if (newY > GAME_HEIGHT - SHIP_HEIGHT - 30) {
            setGameOver(true);
            setIsPlaying(false);
          }
          return { ...a, x: a.x + newDir * 1, y: newY };
        });
        return updated;
      });

    }, 30);

    return () => clearInterval(interval);
  }, [isPlaying, gameOver, win, alienDir]);

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!gameAreaRef.current || gameOver || win) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    let clientX = 0;
    if ('touches' in e) clientX = e.touches[0].clientX;
    else clientX = (e as React.MouseEvent).clientX;

    const x = clientX - rect.left - SHIP_WIDTH / 2;
    setShipX(Math.max(0, Math.min(x, GAME_WIDTH - SHIP_WIDTH)));
  };

  const shoot = () => {
    if (!isPlaying) setIsPlaying(true);
    if (gameOver || win) return;
    setBullets(prev => [...prev, { x: shipX + SHIP_WIDTH / 2 - BULLET_SIZE / 2, y: GAME_HEIGHT - SHIP_HEIGHT - 10, active: true }]);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-950 text-slate-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-cyan-400" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-cyan-400">ALIEN SHOOTER</h1>
        <div className="w-10" />
      </div>

      <div className="flex justify-between items-center p-6 px-8">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Score</span>
          <span className="text-3xl font-mono font-bold text-white">{score}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          ref={gameAreaRef}
          className="relative bg-slate-900 border-2 border-slate-700 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)] touch-none"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          onTouchMove={handleTouchMove}
          onMouseMove={handleTouchMove}
          onClick={shoot}
        >
          {/* Aliens */}
          {aliens.map((a, i) => (
            a.active && (
              <div 
                key={i}
                className="absolute bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                style={{ left: a.x, top: a.y, width: ALIEN_SIZE, height: ALIEN_SIZE, clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }}
              />
            )
          ))}

          {/* Bullets */}
          {bullets.map((b, i) => (
            b.active && (
              <div 
                key={i}
                className="absolute bg-yellow-400 rounded-full shadow-[0_0_5px_rgba(250,204,21,0.8)]"
                style={{ left: b.x, top: b.y, width: BULLET_SIZE, height: BULLET_SIZE * 3 }}
              />
            )
          ))}

          {/* Ship */}
          <div 
            className="absolute bottom-2 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
            style={{ left: shipX, width: SHIP_WIDTH, height: SHIP_HEIGHT, clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}
          />

          {!isPlaying && !gameOver && !win && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
              <span className="text-xl font-bold text-white animate-pulse">TAP TO SHOOT</span>
            </div>
          )}

          {(gameOver || win) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <h2 className={`text-3xl font-bold mb-2 ${win ? 'text-emerald-400' : 'text-rose-500'}`}>
                {win ? 'VICTORY!' : 'INVASION!'}
              </h2>
              <p className="text-slate-300 mb-6 font-mono">Final Score: {score}</p>
              <button onClick={(e) => { e.stopPropagation(); resetGame(); }} className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-full transition-transform active:scale-95">
                <RotateCcw className="w-5 h-5" /> Play Again
              </button>
            </motion.div>
          )}
        </div>
      </div>
      <div className="p-6 text-center text-slate-500 text-sm">
        Drag to move, tap to shoot
      </div>
    </motion.div>
  );
}
