import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, RotateCcw } from 'lucide-react';

const GAME_WIDTH = 300;
const GAME_HEIGHT = 400;
const PADDLE_WIDTH = 60;
const PADDLE_HEIGHT = 10;
const BALL_SIZE = 10;

export default function Pong({ onBack }: { onBack: () => void }) {
  const [ball, setBall] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: 4, dy: 4 });
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [aiX, setAiX] = useState(GAME_WIDTH / 2 - PADDLE_WIDTH / 2);
  const [score, setScore] = useState({ player: 0, ai: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  const resetBall = () => {
    setBall({ 
      x: GAME_WIDTH / 2, 
      y: GAME_HEIGHT / 2, 
      dx: Math.random() > 0.5 ? 4 : -4, 
      dy: Math.random() > 0.5 ? 4 : -4 
    });
  };

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setBall((prev) => {
        let { x, y, dx, dy } = prev;
        x += dx;
        y += dy;

        // Wall collisions (left/right)
        if (x <= 0 || x >= GAME_WIDTH - BALL_SIZE) dx = -dx;

        // Paddle collisions
        // Player (bottom)
        if (y >= GAME_HEIGHT - PADDLE_HEIGHT - BALL_SIZE && y <= GAME_HEIGHT - BALL_SIZE) {
          if (x + BALL_SIZE >= playerX && x <= playerX + PADDLE_WIDTH) {
            dy = -Math.abs(dy);
            dx += (x - (playerX + PADDLE_WIDTH / 2)) * 0.1; // Add spin
          }
        }
        // AI (top)
        if (y <= PADDLE_HEIGHT) {
          if (x + BALL_SIZE >= aiX && x <= aiX + PADDLE_WIDTH) {
            dy = Math.abs(dy);
            dx += (x - (aiX + PADDLE_WIDTH / 2)) * 0.1;
          }
        }

        // Scoring
        if (y < 0) {
          setScore((s) => ({ ...s, player: s.player + 1 }));
          setIsPlaying(false);
          return { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: 4, dy: 4 };
        }
        if (y > GAME_HEIGHT) {
          setScore((s) => ({ ...s, ai: s.ai + 1 }));
          setIsPlaying(false);
          return { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, dx: 4, dy: -4 };
        }

        return { x, y, dx, dy };
      });

      // AI Movement
      setAiX((prev) => {
        const target = ball.x - PADDLE_WIDTH / 2;
        return prev + (target - prev) * 0.15; // AI speed
      });
    }, 16);

    return () => clearInterval(interval);
  }, [isPlaying, playerX, aiX, ball.x]);

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!gameAreaRef.current) return;
    const rect = gameAreaRef.current.getBoundingClientRect();
    let clientX = 0;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }

    const x = clientX - rect.left - PADDLE_WIDTH / 2;
    setPlayerX(Math.max(0, Math.min(x, GAME_WIDTH - PADDLE_WIDTH)));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-950 text-slate-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-300" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-slate-300">RETRO PONG</h1>
        <button onClick={() => { setScore({player: 0, ai: 0}); setIsPlaying(false); resetBall(); }} className="p-2 rounded-full hover:bg-slate-800">
          <RotateCcw className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="flex justify-between items-center p-6 px-12">
        <div className="flex flex-col items-center">
          <span className="text-xs text-rose-500 uppercase tracking-widest font-bold">AI</span>
          <span className="text-4xl font-mono font-bold text-white">{score.ai}</span>
        </div>
        <div className="text-slate-700 font-bold text-2xl">-</div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">YOU</span>
          <span className="text-4xl font-mono font-bold text-white">{score.player}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          ref={gameAreaRef}
          className="relative bg-slate-900 border-2 border-slate-700 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)] touch-none"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          onTouchMove={handleTouchMove}
          onMouseMove={handleTouchMove}
          onClick={() => !isPlaying && setIsPlaying(true)}
        >
          {/* Center Line */}
          <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-slate-700/50" />

          {/* AI Paddle */}
          <div 
            className="absolute top-0 h-2.5 bg-rose-500 rounded-b-sm shadow-[0_0_10px_rgba(244,63,94,0.5)]"
            style={{ left: aiX, width: PADDLE_WIDTH }}
          />

          {/* Player Paddle */}
          <div 
            className="absolute bottom-0 h-2.5 bg-cyan-400 rounded-t-sm shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            style={{ left: playerX, width: PADDLE_WIDTH }}
          />

          {/* Ball */}
          <div 
            className="absolute bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{ left: ball.x, top: ball.y, width: BALL_SIZE, height: BALL_SIZE }}
          />

          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
              <span className="text-xl font-bold text-white animate-pulse">TAP TO SERVE</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-6 text-center text-slate-500 text-sm">
        Drag paddle to move
      </div>
    </motion.div>
  );
}
