import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, RotateCcw, ArrowDown, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';

const COLS = 10;
const ROWS = 20;

const TETROMINOES = {
  I: { shape: [[1, 1, 1, 1]], color: 'bg-cyan-400' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'bg-blue-500' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'bg-orange-500' },
  O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-400' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'bg-purple-500' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' },
};

type TetrominoType = keyof typeof TETROMINOES;
const SHAPES = Object.keys(TETROMINOES) as TetrominoType[];

export default function Tetris({ onBack }: { onBack: () => void }) {
  const [grid, setGrid] = useState<string[][]>(Array(ROWS).fill(Array(COLS).fill('')));
  const [piece, setPiece] = useState<{ shape: number[][]; color: string; x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const spawnPiece = useCallback(() => {
    const type = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const { shape, color } = TETROMINOES[type];
    setPiece({ shape, color, x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 });
  }, []);

  const resetGame = () => {
    setGrid(Array(ROWS).fill(Array(COLS).fill('')));
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    spawnPiece();
  };

  const checkCollision = (x: number, y: number, shape: number[][]) => {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;
          if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && grid[newY][newX] !== '')) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const mergePiece = useCallback(() => {
    if (!piece) return;
    const newGrid = grid.map(row => [...row]);
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          if (piece.y + r < 0) {
            setGameOver(true);
            setIsPlaying(false);
            return;
          }
          newGrid[piece.y + r][piece.x + c] = piece.color;
        }
      }
    }

    // Clear lines
    let linesCleared = 0;
    const finalGrid = newGrid.filter(row => {
      if (row.every(cell => cell !== '')) {
        linesCleared++;
        return false;
      }
      return true;
    });

    while (finalGrid.length < ROWS) {
      finalGrid.unshift(Array(COLS).fill(''));
    }

    if (linesCleared > 0) {
      setScore(s => s + [0, 100, 300, 500, 800][linesCleared]);
    }

    setGrid(finalGrid);
    spawnPiece();
  }, [piece, grid, spawnPiece]);

  useEffect(() => {
    if (!isPlaying || gameOver || !piece) return;

    const interval = setInterval(() => {
      if (!checkCollision(piece.x, piece.y + 1, piece.shape)) {
        setPiece({ ...piece, y: piece.y + 1 });
      } else {
        mergePiece();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, gameOver, piece, mergePiece]);

  const move = (dir: number) => {
    if (!piece || gameOver || !isPlaying) return;
    if (!checkCollision(piece.x + dir, piece.y, piece.shape)) {
      setPiece({ ...piece, x: piece.x + dir });
    }
  };

  const rotate = () => {
    if (!piece || gameOver || !isPlaying) return;
    const newShape = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse());
    if (!checkCollision(piece.x, piece.y, newShape)) {
      setPiece({ ...piece, shape: newShape });
    }
  };

  const drop = () => {
    if (!piece || gameOver || !isPlaying) return;
    let newY = piece.y;
    while (!checkCollision(piece.x, newY + 1, piece.shape)) {
      newY++;
    }
    setPiece({ ...piece, y: newY });
  };

  // Render grid with piece
  const displayGrid = grid.map(row => [...row]);
  if (piece && isPlaying) {
    for (let r = 0; r < piece.shape.length; r++) {
      for (let c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c] && piece.y + r >= 0) {
          displayGrid[piece.y + r][piece.x + c] = piece.color;
        }
      }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-950 text-slate-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-indigo-400" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-indigo-400">BLOCK PUZZLE</h1>
        <div className="w-10" />
      </div>

      <div className="flex justify-between items-center p-4 px-8">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Score</span>
          <span className="text-2xl font-mono font-bold text-white">{score}</span>
        </div>
        {!isPlaying && (
          <button onClick={resetGame} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full transition-transform active:scale-95">
            <RotateCcw className="w-4 h-4" /> Start
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center p-2">
        <div className="relative bg-slate-900 border-2 border-slate-700 p-1 rounded-lg">
          <div 
            className="grid gap-[1px] bg-slate-800"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1.25rem)`, gridTemplateRows: `repeat(${ROWS}, 1.25rem)` }}
          >
            {displayGrid.map((row, r) => row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`w-5 h-5 ${cell || 'bg-slate-950'} ${cell ? 'shadow-[inset_0_0_8px_rgba(0,0,0,0.3)] border border-white/10' : ''}`}
              />
            )))}
          </div>
          {gameOver && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <h2 className="text-2xl font-bold text-rose-500 mb-2">GAME OVER</h2>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 grid grid-cols-4 gap-2">
        <button onClick={() => move(-1)} className="bg-slate-800 p-4 rounded-xl flex justify-center active:bg-slate-700"><ArrowLeft /></button>
        <button onClick={rotate} className="bg-slate-800 p-4 rounded-xl flex justify-center active:bg-slate-700"><RotateCw /></button>
        <button onClick={drop} className="bg-slate-800 p-4 rounded-xl flex justify-center active:bg-slate-700"><ArrowDown /></button>
        <button onClick={() => move(1)} className="bg-slate-800 p-4 rounded-xl flex justify-center active:bg-slate-700"><ArrowRight /></button>
      </div>
    </motion.div>
  );
}
