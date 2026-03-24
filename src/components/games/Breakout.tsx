import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, RotateCcw } from 'lucide-react';

const GAME_WIDTH = 300;
const GAME_HEIGHT = 400;
const PADDLE_WIDTH = 60;
const PADDLE_HEIGHT = 10;
const BALL_SIZE = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 6;
const BRICK_WIDTH = 46;
const BRICK_HEIGHT = 15;
const BRICK_PADDING = 4;
const BRICK_OFFSET_TOP = 40;
const BRICK_OFFSET_LEFT = 4;

interface Brick {
  x: number;
  y: number;
  status: number;
  color: string;
}

export default function Breakout({ onBack }: { onBack: () => void }) {
  const [ball, setBall] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 30, dx: 3, dy: -3 });
  const [paddleX, setPaddleX] = useState(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const initBricks = () => {
    const newBricks: Brick[] = [];
    const colors = ['bg-rose-500', 'bg-orange-500', 'bg-yellow-400', 'bg-emerald-400', 'bg-cyan-400'];
    for (let c = 0; c < BRICK_COLS; c++) {
      for (let r = 0; r < BRICK_ROWS; r++) {
        newBricks.push({
          x: c * (BRICK_WIDTH + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          status: 1,
          color: colors[r],
        });
      }
    }
    setBricks(newBricks);
  };

  useEffect(() => {
    initBricks();
  }, []);

  const resetGame = () => {
    setBall({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 30, dx: 3, dy: -3 });
    setPaddleX(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWin(false);
    setIsPlaying(false);
    initBricks();
  };

  useEffect(() => {
    if (!isPlaying || gameOver || win) return;

    const interval = setInterval(() => {
      setBall((prev) => {
        let { x, y, dx, dy } = prev;
        x += dx;
        y += dy;

        // Wall collisions
        if (x <= 0 || x >= GAME_WIDTH - BALL_SIZE) dx = -dx;
        if (y <= 0) dy = -dy;

        // Paddle collision
        if (y >= GAME_HEIGHT - PADDLE_HEIGHT - BALL_SIZE && y <= GAME_HEIGHT - BALL_SIZE) {
          if (x + BALL_SIZE >= paddleX && x <= paddleX + PADDLE_WIDTH) {
            dy = -Math.abs(dy);
            dx += (x - (paddleX + PADDLE_WIDTH / 2)) * 0.1;
          }
        }

        // Brick collisions
        let brickHit = false;
        setBricks((currentBricks) => {
          let activeBricks = 0;
          const updatedBricks = currentBricks.map((b) => {
            if (b.status === 1) {
              activeBricks++;
              if (
                x > b.x && x < b.x + BRICK_WIDTH &&
                y > b.y && y < b.y + BRICK_HEIGHT
              ) {
                dy = -dy;
                brickHit = true;
                setScore((s) => s + 10);
                return { ...b, status: 0 };
              }
            }
            return b;
          });

          if (activeBricks === 1 && brickHit) {
            setWin(true);
            setIsPlaying(false);
          }
          return updatedBricks;
        });

        // Bottom collision (Lose life)
        if (y > GAME_HEIGHT) {
          setLives((l) => {
            if (l <= 1) {
              setGameOver(true);
              setIsPlaying(false);
              return 0;
            }
            setIsPlaying(false);
            return l - 1;
          });
          return { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 30, dx: 3, dy: -3 };
        }

        return { x, y, dx, dy };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, gameOver, win, paddleX]);

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!gameAreaRef.current || gameOver || win) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    let clientX = 0;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }

    const x = clientX - rect.left - PADDLE_WIDTH / 2;
    setPaddleX(Math.max(0, Math.min(x, GAME_WIDTH - PADDLE_WIDTH)));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-950 text-slate-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-orange-500" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-orange-500">BRICK BREAKER</h1>
        <div className="w-10" />
      </div>

      <div className="flex justify-between items-center p-6 px-8">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Score</span>
          <span className="text-3xl font-mono font-bold text-white">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Lives</span>
          <div className="flex gap-1 mt-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${i < lives ? 'bg-rose-500' : 'bg-slate-800'}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          ref={gameAreaRef}
          className="relative bg-slate-900 border-2 border-slate-700 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)] touch-none"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          onTouchMove={handleTouchMove}
          onMouseMove={handleTouchMove}
          onClick={() => !isPlaying && !gameOver && !win && setIsPlaying(true)}
        >
          {/* Bricks */}
          {bricks.map((b, i) => (
            b.status === 1 && (
              <div 
                key={i}
                className={`absolute rounded-sm ${b.color} shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]`}
                style={{ left: b.x, top: b.y, width: BRICK_WIDTH, height: BRICK_HEIGHT }}
              />
            )
          ))}

          {/* Paddle */}
          <div 
            className="absolute bottom-0 h-2.5 bg-cyan-400 rounded-t-sm shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            style={{ left: paddleX, width: PADDLE_WIDTH }}
          />

          {/* Ball */}
          <div 
            className="absolute bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{ left: ball.x, top: ball.y, width: BALL_SIZE, height: BALL_SIZE }}
          />

          {!isPlaying && !gameOver && !win && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
              <span className="text-xl font-bold text-white animate-pulse">TAP TO START</span>
            </div>
          )}

          {(gameOver || win) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <h2 className={`text-3xl font-bold mb-2 ${win ? 'text-emerald-400' : 'text-rose-500'}`}>
                {win ? 'YOU WIN!' : 'GAME OVER'}
              </h2>
              <p className="text-slate-300 mb-6 font-mono">Final Score: {score}</p>
              <button onClick={(e) => { e.stopPropagation(); resetGame(); }} className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-full transition-transform active:scale-95">
                <RotateCcw className="w-5 h-5" /> Play Again
              </button>
            </motion.div>
          )}
        </div>
      </div>
      <div className="p-6 text-center text-slate-500 text-sm">
        Drag paddle to move
      </div>
    </motion.div>
  );
}
