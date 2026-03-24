import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, RotateCcw } from 'lucide-react';

// Hardcoded Sudoku puzzle for simplicity
const INITIAL_BOARD = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

const SOLUTION = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

export default function Sudoku({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<number[][]>([]);
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [win, setWin] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  const resetGame = () => {
    setBoard(INITIAL_BOARD.map(row => [...row]));
    setSelected(null);
    setWin(false);
  };

  const handleCellClick = (r: number, c: number) => {
    if (INITIAL_BOARD[r][c] !== 0 || win) return;
    setSelected({ r, c });
  };

  const handleNumberClick = (num: number) => {
    if (!selected || win) return;
    const { r, c } = selected;
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    // Check win
    let isWin = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (newBoard[i][j] !== SOLUTION[i][j]) {
          isWin = false;
          break;
        }
      }
    }
    if (isWin) setWin(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-950 text-slate-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-indigo-400" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-indigo-400">SUDOKU MASTER</h1>
        <button onClick={resetGame} className="p-2 rounded-full hover:bg-slate-800">
          <RotateCcw className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {win && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mb-6 text-2xl font-bold text-emerald-400">
            PUZZLE SOLVED!
          </motion.div>
        )}

        <div className="bg-slate-800 p-1 rounded-lg shadow-2xl">
          <div className="grid grid-cols-9 gap-[1px] bg-slate-950 border-2 border-slate-700">
            {board.map((row, r) => row.map((val, c) => {
              const isInitial = INITIAL_BOARD[r][c] !== 0;
              const isSelected = selected?.r === r && selected?.c === c;
              const isError = val !== 0 && !isInitial && val !== SOLUTION[r][c];
              
              // Add thicker borders for 3x3 grids
              const borderClasses = `
                ${c % 3 === 2 && c !== 8 ? 'border-r-2 border-r-slate-600' : ''}
                ${r % 3 === 2 && r !== 8 ? 'border-b-2 border-b-slate-600' : ''}
              `;

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`
                    w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-lg font-bold cursor-pointer
                    ${borderClasses}
                    ${isSelected ? 'bg-indigo-900/50' : 'bg-slate-900'}
                    ${isInitial ? 'text-slate-300' : isError ? 'text-rose-500' : 'text-indigo-400'}
                    ${!isInitial && !isSelected ? 'hover:bg-slate-800' : ''}
                  `}
                >
                  {val !== 0 ? val : ''}
                </div>
              );
            }))}
          </div>
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-5 gap-2 mt-8 w-full max-w-[320px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-lg active:scale-95 transition-transform"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleNumberClick(0)}
            className="bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold py-3 rounded-lg active:scale-95 transition-transform flex items-center justify-center"
          >
            X
          </button>
        </div>
      </div>
    </motion.div>
  );
}
