import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, RotateCcw, Trophy } from 'lucide-react';

const GRAVITY = 0.6;
const JUMP = -8;
const PIPE_SPEED = 3;
const PIPE_WIDTH = 60;
const PIPE_GAP = 160;
const BIRD_SIZE = 30;
const GAME_HEIGHT = 500;
const GAME_WIDTH = 340;

export default function FlappyBird({ onBack }: { onBack: () => void }) {
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<{ x: number; topHeight: number; passed: boolean }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('flappyHighScore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const jump = () => {
    if (gameOver) return;
    if (!isPlaying) setIsPlaying(true);
    setVelocity(JUMP);
  };

  const resetGame = () => {
    setBirdY(GAME_HEIGHT / 2);
    setVelocity(0);
    setPipes([]);
    setGameOver(false);
    setScore(0);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const interval = setInterval(() => {
      setBirdY((y) => y + velocity);
      setVelocity((v) => v + GRAVITY);

      setPipes((currentPipes) => {
        let newPipes = currentPipes.map((p) => ({ ...p, x: p.x - PIPE_SPEED }));
        
        // Add new pipe
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - 200) {
          newPipes.push({
            x: GAME_WIDTH,
            topHeight: Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50,
            passed: false,
          });
        }

        // Score point
        newPipes.forEach((p) => {
          if (!p.passed && p.x + PIPE_WIDTH < GAME_WIDTH / 2 - BIRD_SIZE / 2) {
            p.passed = true;
            setScore((s) => {
              const newScore = s + 1;
              if (newScore > highScore) {
                setHighScore(newScore);
                localStorage.setItem('flappyHighScore', newScore.toString());
              }
              return newScore;
            });
          }
        });

        // Remove off-screen pipes
        return newPipes.filter((p) => p.x > -PIPE_WIDTH);
      });
    }, 24);

    return () => clearInterval(interval);
  }, [isPlaying, gameOver, velocity, highScore]);

  useEffect(() => {
    if (!isPlaying) return;

    // Floor/Ceiling collision
    if (birdY >= GAME_HEIGHT - BIRD_SIZE || birdY <= 0) {
      setGameOver(true);
    }

    // Pipe collision
    const birdRect = {
      left: GAME_WIDTH / 2 - BIRD_SIZE / 2 + 5,
      right: GAME_WIDTH / 2 + BIRD_SIZE / 2 - 5,
      top: birdY + 5,
      bottom: birdY + BIRD_SIZE - 5,
    };

    pipes.forEach((p) => {
      const topPipeRect = { left: p.x, right: p.x + PIPE_WIDTH, top: 0, bottom: p.topHeight };
      const bottomPipeRect = { left: p.x, right: p.x + PIPE_WIDTH, top: p.topHeight + PIPE_GAP, bottom: GAME_HEIGHT };

      if (
        (birdRect.right > topPipeRect.left && birdRect.left < topPipeRect.right && birdRect.top < topPipeRect.bottom) ||
        (birdRect.right > bottomPipeRect.left && birdRect.left < bottomPipeRect.right && birdRect.bottom > bottomPipeRect.top)
      ) {
        setGameOver(true);
      }
    });
  }, [birdY, pipes, isPlaying]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-950 text-slate-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-yellow-400" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-yellow-400">FLYING BIRD</h1>
        <div className="w-10" />
      </div>

      <div className="flex justify-between items-center p-6">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Score</span>
          <span className="text-3xl font-mono font-bold text-white">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Trophy className="w-3 h-3 text-yellow-500" /> Best
          </span>
          <span className="text-xl font-mono font-bold text-yellow-500">{highScore}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          className="relative bg-sky-900/40 rounded-xl border border-slate-800 overflow-hidden shadow-2xl cursor-pointer"
          style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          onPointerDown={jump}
        >
          {/* Background Elements */}
          <div className="absolute bottom-0 w-full h-1/4 bg-emerald-900/30 border-t border-emerald-800/50" />
          
          {/* Bird */}
          <motion.div
            className="absolute bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.6)] flex items-center justify-center"
            style={{
              width: BIRD_SIZE, height: BIRD_SIZE,
              left: GAME_WIDTH / 2 - BIRD_SIZE / 2, top: birdY,
              rotate: velocity * 3,
            }}
          >
            <div className="w-2 h-2 bg-slate-900 rounded-full absolute right-2 top-2" />
            <div className="w-4 h-2 bg-orange-500 rounded-full absolute -right-1 top-4" />
          </motion.div>

          {/* Pipes */}
          {pipes.map((p, i) => (
            <React.Fragment key={i}>
              <div 
                className="absolute bg-emerald-500 border-2 border-emerald-400 rounded-b-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                style={{ left: p.x, top: 0, width: PIPE_WIDTH, height: p.topHeight }}
              />
              <div 
                className="absolute bg-emerald-500 border-2 border-emerald-400 rounded-t-lg shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                style={{ left: p.x, top: p.topHeight + PIPE_GAP, width: PIPE_WIDTH, height: GAME_HEIGHT - (p.topHeight + PIPE_GAP) }}
              />
            </React.Fragment>
          ))}

          {!isPlaying && !gameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
              <span className="text-xl font-bold text-white animate-pulse">TAP TO FLY</span>
            </div>
          )}

          {gameOver && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <h2 className="text-3xl font-bold text-rose-500 mb-2">CRASHED!</h2>
              <p className="text-slate-300 mb-6 font-mono">Score: {score}</p>
              <button onClick={(e) => { e.stopPropagation(); resetGame(); }} className="flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-full transition-transform active:scale-95">
                <RotateCcw className="w-5 h-5" /> Try Again
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
