import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, ChevronLeft, Flag, Bomb } from 'lucide-react';

const ROWS = 10;
const COLS = 10;
const MINES = 15;

interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export default function Minesweeper({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [flagsLeft, setFlagsLeft] = useState(MINES);
  const [isFirstClick, setIsFirstClick] = useState(true);

  const initializeBoard = (firstClickRow = -1, firstClickCol = -1) => {
    let newBoard: Cell[][] = Array(ROWS).fill(null).map((_, r) =>
      Array(COLS).fill(null).map((_, c) => ({
        row: r, col: c, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0
      }))
    );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      // Don't place mine on first click or if already a mine
      if (!newBoard[r][c].isMine && !(r === firstClickRow && c === firstClickCol)) {
        newBoard[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (r + i >= 0 && r + i < ROWS && c + j >= 0 && c + j < COLS) {
                if (newBoard[r + i][c + j].isMine) count++;
              }
            }
          }
          newBoard[r][c].neighborMines = count;
        }
      }
    }

    return newBoard;
  };

  useEffect(() => {
    setBoard(initializeBoard());
  }, []);

  const revealCell = (r: number, c: number, currentBoard: Cell[][]) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || currentBoard[r][c].isRevealed || currentBoard[r][c].isFlagged) {
      return;
    }

    currentBoard[r][c].isRevealed = true;

    if (currentBoard[r][c].neighborMines === 0 && !currentBoard[r][c].isMine) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          revealCell(r + i, c + j, currentBoard);
        }
      }
    }
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || win || board[r][c].isFlagged || board[r][c].isRevealed) return;

    let currentBoard = [...board.map(row => [...row])];

    if (isFirstClick) {
      currentBoard = initializeBoard(r, c);
      setIsFirstClick(false);
    }

    if (currentBoard[r][c].isMine) {
      // Game Over
      currentBoard.forEach(row => row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      }));
      setBoard(currentBoard);
      setGameOver(true);
      return;
    }

    revealCell(r, c, currentBoard);
    setBoard(currentBoard);
    checkWinCondition(currentBoard);
  };

  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameOver || win || board[r][c].isRevealed) return;

    const newBoard = [...board.map(row => [...row])];
    const cell = newBoard[r][c];

    if (!cell.isFlagged && flagsLeft > 0) {
      cell.isFlagged = true;
      setFlagsLeft(prev => prev - 1);
    } else if (cell.isFlagged) {
      cell.isFlagged = false;
      setFlagsLeft(prev => prev + 1);
    }

    setBoard(newBoard);
  };

  const checkWinCondition = (currentBoard: Cell[][]) => {
    let unrevealedSafeCells = 0;
    currentBoard.forEach(row => row.forEach(cell => {
      if (!cell.isRevealed && !cell.isMine) unrevealedSafeCells++;
    }));

    if (unrevealedSafeCells === 0) {
      setWin(true);
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setBoard(initializeBoard());
    setGameOver(false);
    setWin(false);
    setFlagsLeft(MINES);
    setIsFirstClick(true);
  };

  const getNumberColor = (num: number) => {
    const colors = ['text-transparent', 'text-blue-400', 'text-green-400', 'text-red-400', 'text-purple-400', 'text-yellow-400', 'text-cyan-400', 'text-pink-400', 'text-slate-400'];
    return colors[num];
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
          <ChevronLeft className="w-6 h-6 text-rose-500" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-rose-500">MINESWEEPER</h1>
        <div className="w-10" />
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center p-6 px-8">
        <div className="flex flex-col items-center bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Flag className="w-3 h-3 text-rose-500" /> Flags
          </span>
          <span className="text-2xl font-mono font-bold text-white">{flagsLeft}</span>
        </div>
        <button 
          onClick={resetGame}
          className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
        >
          <RotateCcw className="w-6 h-6 text-slate-300" />
        </button>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div 
          className="grid gap-[2px] bg-slate-800 p-[2px] rounded-lg shadow-2xl"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {board.map((row, r) => row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              onClick={() => handleCellClick(r, c)}
              onContextMenu={(e) => handleRightClick(e, r, c)}
              className={`
                w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-lg font-bold select-none cursor-pointer
                transition-colors duration-150
                ${cell.isRevealed 
                  ? cell.isMine ? 'bg-rose-900/50' : 'bg-slate-950' 
                  : 'bg-slate-700 hover:bg-slate-600 shadow-[inset_0_2px_0_rgba(255,255,255,0.1)]'}
              `}
            >
              {cell.isRevealed ? (
                cell.isMine ? <Bomb className="w-5 h-5 text-rose-500" /> : 
                <span className={getNumberColor(cell.neighborMines)}>
                  {cell.neighborMines > 0 ? cell.neighborMines : ''}
                </span>
              ) : (
                cell.isFlagged && <Flag className="w-4 h-4 text-rose-500" />
              )}
            </div>
          )))}
        </div>
      </div>

      {/* Game Over Message */}
      <div className="p-6 flex flex-col items-center justify-center min-h-[100px]">
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className={`text-2xl font-bold ${win ? 'text-emerald-400' : 'text-rose-500'}`}
          >
            {win ? 'MISSION ACCOMPLISHED!' : 'BOOM! GAME OVER'}
          </motion.div>
        )}
        {!gameOver && <div className="text-slate-500 text-sm">Long press or right-click to flag</div>}
      </div>
    </motion.div>
  );
}
