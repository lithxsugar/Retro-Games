import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

// 15x15 grid. 1=wall, 0=dot, 2=empty
const INITIAL_MAZE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,1,1,1,0,1,2,2,2,1,0,1,1,1,1],
  [2,2,2,1,0,1,2,1,2,1,0,1,2,2,2],
  [1,1,1,1,0,1,2,2,2,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,1,1,0,1,1,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,0,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

export default function Pacman({ onBack }: { onBack: () => void }) {
  const [maze, setMaze] = useState(INITIAL_MAZE.map(row => [...row]));
  const [pacman, setPacman] = useState({ r: 11, c: 7, dir: { r: 0, c: 0 }, nextDir: { r: 0, c: 0 } });
  const [ghost, setGhost] = useState({ r: 7, c: 7, dir: { r: -1, c: 0 } });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const resetGame = () => {
    setMaze(INITIAL_MAZE.map(row => [...row]));
    setPacman({ r: 11, c: 7, dir: { r: 0, c: 0 }, nextDir: { r: 0, c: 0 } });
    setGhost({ r: 7, c: 7, dir: { r: -1, c: 0 } });
    setScore(0);
    setGameOver(false);
    setWin(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!isPlaying || gameOver || win) return;

    const interval = setInterval(() => {
      // Move Pacman
      setPacman(prev => {
        let { r, c, dir, nextDir } = prev;
        
        // Try next direction first
        let nextR = r + nextDir.r;
        let nextC = c + nextDir.c;
        
        // Wrap around
        if (nextC < 0) nextC = 14;
        if (nextC > 14) nextC = 0;

        if (maze[nextR] && maze[nextR][nextC] !== 1) {
          dir = nextDir;
          r = nextR;
          c = nextC;
        } else {
          // Try current direction
          nextR = r + dir.r;
          nextC = c + dir.c;
          if (nextC < 0) nextC = 14;
          if (nextC > 14) nextC = 0;
          
          if (maze[nextR] && maze[nextR][nextC] !== 1) {
            r = nextR;
            c = nextC;
          }
        }

        // Eat dot
        if (maze[r][c] === 0) {
          setMaze(m => {
            const newM = m.map(row => [...row]);
            newM[r][c] = 2;
            return newM;
          });
          setScore(s => s + 10);
        }

        return { r, c, dir, nextDir };
      });

      // Move Ghost (simple random/chase)
      setGhost(prev => {
        let { r, c, dir } = prev;
        const possibleMoves = [
          { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }
        ].filter(m => {
          const nr = r + m.r;
          const nc = c + m.c;
          return maze[nr] && maze[nr][nc] !== 1 && !(m.r === -dir.r && m.c === -dir.c); // Don't reverse immediately
        });

        if (possibleMoves.length > 0) {
          // 50% chance to move towards player if possible
          const towardsPlayer = possibleMoves.find(m => 
            (m.r !== 0 && Math.sign(pacman.r - r) === m.r) || 
            (m.c !== 0 && Math.sign(pacman.c - c) === m.c)
          );
          
          dir = (Math.random() > 0.5 && towardsPlayer) ? towardsPlayer : possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
          r += dir.r;
          c += dir.c;
        } else {
          dir = { r: -dir.r, c: -dir.c }; // Reverse if stuck
          r += dir.r;
          c += dir.c;
        }
        return { r, c, dir };
      });

    }, 200);

    return () => clearInterval(interval);
  }, [isPlaying, gameOver, win, maze, pacman.r, pacman.c]);

  useEffect(() => {
    if (pacman.r === ghost.r && pacman.c === ghost.c) {
      setGameOver(true);
      setIsPlaying(false);
    }
    
    // Check win
    let dotsLeft = 0;
    maze.forEach(row => row.forEach(cell => { if (cell === 0) dotsLeft++; }));
    if (dotsLeft === 0 && isPlaying) {
      setWin(true);
      setIsPlaying(false);
    }
  }, [pacman, ghost, maze, isPlaying]);

  const handleDir = (r: number, c: number) => {
    if (!isPlaying && !gameOver && !win) setIsPlaying(true);
    setPacman(p => ({ ...p, nextDir: { r, c } }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-950 text-slate-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-yellow-400" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-yellow-400">MAZE CHASE</h1>
        <div className="w-10" />
      </div>

      <div className="flex justify-between items-center p-4 px-8">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Score</span>
          <span className="text-2xl font-mono font-bold text-white">{score}</span>
        </div>
        {!isPlaying && (
          <button onClick={resetGame} className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold rounded-full transition-transform active:scale-95">
            <RotateCcw className="w-4 h-4" /> Start
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center p-2">
        <div className="relative bg-slate-900 border-4 border-blue-900 p-2 rounded-lg shadow-[0_0_30px_rgba(30,58,138,0.5)]">
          <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(15, 1.25rem)`, gridTemplateRows: `repeat(15, 1.25rem)` }}>
            {maze.map((row, r) => row.map((cell, c) => (
              <div key={`${r}-${c}`} className="w-5 h-5 flex items-center justify-center">
                {cell === 1 && <div className="w-full h-full bg-blue-800 rounded-sm border border-blue-700" />}
                {cell === 0 && <div className="w-1.5 h-1.5 bg-yellow-200 rounded-full shadow-[0_0_5px_rgba(254,240,138,0.8)]" />}
                {pacman.r === r && pacman.c === c && (
                  <div className="absolute w-4 h-4 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
                )}
                {ghost.r === r && ghost.c === c && (
                  <div className="absolute w-4 h-4 bg-red-500 rounded-t-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                )}
              </div>
            )))}
          </div>
          {(gameOver || win) && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <h2 className={`text-2xl font-bold mb-2 ${win ? 'text-emerald-400' : 'text-rose-500'}`}>
                {win ? 'YOU WIN!' : 'GAME OVER'}
              </h2>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 grid grid-cols-3 gap-2 max-w-[200px] mx-auto">
        <div />
        <button onClick={() => handleDir(-1, 0)} className="bg-slate-800 p-4 rounded-xl flex justify-center active:bg-slate-700"><ArrowUp className="text-yellow-400" /></button>
        <div />
        <button onClick={() => handleDir(0, -1)} className="bg-slate-800 p-4 rounded-xl flex justify-center active:bg-slate-700"><ArrowLeft className="text-yellow-400" /></button>
        <button onClick={() => handleDir(1, 0)} className="bg-slate-800 p-4 rounded-xl flex justify-center active:bg-slate-700"><ArrowDown className="text-yellow-400" /></button>
        <button onClick={() => handleDir(0, 1)} className="bg-slate-800 p-4 rounded-xl flex justify-center active:bg-slate-700"><ArrowRight className="text-yellow-400" /></button>
      </div>
    </motion.div>
  );
}
