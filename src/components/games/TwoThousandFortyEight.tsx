import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, ChevronLeft, Trophy } from 'lucide-react';

type Board = number[][];

export default function TwoThousandFortyEight({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Board>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const initializeBoard = () => {
    let newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
  };

  useEffect(() => {
    const savedHighScore = localStorage.getItem('2048HighScore');
    if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));
    initializeBoard();
  }, []);

  const addRandomTile = (currentBoard: Board): Board => {
    const emptyCells: { r: number; c: number }[] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({ r, c });
      }
    }
    if (emptyCells.length === 0) return currentBoard;

    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  const checkGameOver = (currentBoard: Board) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) return false;
        if (r < 3 && currentBoard[r][c] === currentBoard[r + 1][c]) return false;
        if (c < 3 && currentBoard[r][c] === currentBoard[r][c + 1]) return false;
      }
    }
    return true;
  };

  const move = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return;

    let newBoard = board.map(row => [...row]);
    let moved = false;
    let pointsGained = 0;

    const slideAndMerge = (row: number[]) => {
      let newRow = row.filter(val => val !== 0);
      for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
          newRow[i] *= 2;
          pointsGained += newRow[i];
          newRow.splice(i + 1, 1);
        }
      }
      while (newRow.length < 4) newRow.push(0);
      return newRow;
    };

    if (direction === 'LEFT' || direction === 'RIGHT') {
      for (let r = 0; r < 4; r++) {
        let row = newBoard[r];
        if (direction === 'RIGHT') row.reverse();
        const newRow = slideAndMerge(row);
        if (direction === 'RIGHT') newRow.reverse();
        if (newBoard[r].join(',') !== newRow.join(',')) moved = true;
        newBoard[r] = newRow;
      }
    } else {
      for (let c = 0; c < 4; c++) {
        let col = [newBoard[0][c], newBoard[1][c], newBoard[2][c], newBoard[3][c]];
        if (direction === 'DOWN') col.reverse();
        const newCol = slideAndMerge(col);
        if (direction === 'DOWN') newCol.reverse();
        for (let r = 0; r < 4; r++) {
          if (newBoard[r][c] !== newCol[r]) moved = true;
          newBoard[r][c] = newCol[r];
        }
      }
    }

    if (moved) {
      newBoard = addRandomTile(newBoard);
      setBoard(newBoard);
      setScore(s => {
        const newScore = s + pointsGained;
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('2048HighScore', newScore.toString());
        }
        return newScore;
      });
      if (checkGameOver(newBoard)) setGameOver(true);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': move('UP'); break;
        case 'ArrowDown': move('DOWN'); break;
        case 'ArrowLeft': move('LEFT'); break;
        case 'ArrowRight': move('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, gameOver]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || gameOver) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) move('RIGHT');
      else if (dx < -30) move('LEFT');
    } else {
      if (dy > 30) move('DOWN');
      else if (dy < -30) move('UP');
    }
    setTouchStart(null);
  };

  const getTileColor = (val: number) => {
    const colors: Record<number, string> = {
      0: 'bg-slate-800',
      2: 'bg-slate-700 text-slate-200',
      4: 'bg-slate-600 text-slate-200',
      8: 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]',
      16: 'bg-orange-600 text-white shadow-[0_0_15px_rgba(234,88,12,0.5)]',
      32: 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]',
      64: 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.6)]',
      128: 'bg-yellow-400 text-slate-900 shadow-[0_0_20px_rgba(250,204,21,0.6)]',
      256: 'bg-yellow-500 text-slate-900 shadow-[0_0_20px_rgba(234,179,8,0.7)]',
      512: 'bg-yellow-600 text-white shadow-[0_0_20px_rgba(202,138,4,0.8)]',
      1024: 'bg-amber-500 text-white shadow-[0_0_25px_rgba(245,158,11,0.9)]',
      2048: 'bg-amber-600 text-white shadow-[0_0_30px_rgba(217,119,6,1)]',
    };
    return colors[val] || 'bg-slate-900 text-white shadow-[0_0_30px_rgba(255,255,255,0.5)]';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-950 text-slate-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-amber-500" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-amber-500">2048 MERGE</h1>
        <div className="w-10" />
      </div>

      {/* Score Board */}
      <div className="flex justify-between items-center p-6">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Score</span>
          <span className="text-3xl font-mono font-bold text-white">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" /> Best
          </span>
          <span className="text-xl font-mono font-bold text-amber-500">{highScore}</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          className="relative bg-slate-900 p-3 rounded-xl shadow-2xl border border-slate-800 w-full max-w-[340px] aspect-square"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="grid grid-cols-4 grid-rows-4 gap-3 w-full h-full">
            {board.map((row, r) => row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`
                  flex items-center justify-center rounded-lg text-2xl sm:text-3xl font-bold transition-all duration-200
                  ${getTileColor(val)}
                `}
              >
                {val !== 0 ? (
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    key={`${r}-${c}-${val}`} // Re-animate on value change
                  >
                    {val}
                  </motion.span>
                ) : null}
              </div>
            )))}
          </div>

          {/* Game Over Overlay */}
          {gameOver && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-xl"
            >
              <h2 className="text-3xl font-bold text-amber-500 mb-2">GAME OVER</h2>
              <p className="text-slate-300 mb-6 font-mono">Final Score: {score}</p>
              <button 
                onClick={initializeBoard}
                className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-full transition-transform active:scale-95"
              >
                <RotateCcw className="w-5 h-5" /> Try Again
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-6 text-center text-slate-500 text-sm">
        Swipe to merge tiles and reach 2048
      </div>
    </motion.div>
  );
}
