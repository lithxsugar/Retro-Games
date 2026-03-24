import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RefreshCw } from 'lucide-react';

const ROWS = 6;
const COLS = 7;

type Player = 1 | 2;
type Cell = Player | null;

interface ConnectFourProps {
  onBack: () => void;
}

export default function ConnectFour({ onBack }: ConnectFourProps) {
  const [board, setBoard] = useState<Cell[][]>(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState<Player>(1);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const checkWin = (boardState: Cell[][], player: Player) => {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (boardState[r][c] === player && boardState[r][c+1] === player && boardState[r][c+2] === player && boardState[r][c+3] === player) return true;
      }
    }
    // Vertical
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS; c++) {
        if (boardState[r][c] === player && boardState[r+1][c] === player && boardState[r+2][c] === player && boardState[r+3][c] === player) return true;
      }
    }
    // Diagonal Right
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (boardState[r][c] === player && boardState[r+1][c+1] === player && boardState[r+2][c+2] === player && boardState[r+3][c+3] === player) return true;
      }
    }
    // Diagonal Left
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (boardState[r][c] === player && boardState[r-1][c+1] === player && boardState[r-2][c+2] === player && boardState[r-3][c+3] === player) return true;
      }
    }
    return false;
  };

  const dropPiece = (col: number, player: Player, currentBoard: Cell[][]) => {
    const newBoard = currentBoard.map(row => [...row]);
    for (let r = ROWS - 1; r >= 0; r--) {
      if (newBoard[r][col] === null) {
        newBoard[r][col] = player;
        return { newBoard, row: r };
      }
    }
    return null;
  };

  const handleColumnClick = (col: number) => {
    if (winner || currentPlayer !== 1 || isAiThinking) return;

    const result = dropPiece(col, 1, board);
    if (!result) return;

    setBoard(result.newBoard);
    
    if (checkWin(result.newBoard, 1)) {
      setWinner(1);
    } else if (result.newBoard.every(row => row.every(cell => cell !== null))) {
      setWinner('draw');
    } else {
      setCurrentPlayer(2);
      setIsAiThinking(true);
    }
  };

  useEffect(() => {
    if (currentPlayer === 2 && !winner) {
      const timer = setTimeout(() => {
        // AI Logic: 1. Win, 2. Block, 3. Random
        let bestCol = -1;
        
        // Check for win
        for (let c = 0; c < COLS; c++) {
          const res = dropPiece(c, 2, board);
          if (res && checkWin(res.newBoard, 2)) {
            bestCol = c; break;
          }
        }

        // Check for block
        if (bestCol === -1) {
          for (let c = 0; c < COLS; c++) {
            const res = dropPiece(c, 1, board);
            if (res && checkWin(res.newBoard, 1)) {
              bestCol = c; break;
            }
          }
        }

        // Random valid
        if (bestCol === -1) {
          const validCols = [];
          for (let c = 0; c < COLS; c++) {
            if (board[0][c] === null) validCols.push(c);
          }
          if (validCols.length > 0) {
            bestCol = validCols[Math.floor(Math.random() * validCols.length)];
          }
        }

        if (bestCol !== -1) {
          const result = dropPiece(bestCol, 2, board);
          if (result) {
            setBoard(result.newBoard);
            if (checkWin(result.newBoard, 2)) setWinner(2);
            else if (result.newBoard.every(row => row.every(cell => cell !== null))) setWinner('draw');
            else setCurrentPlayer(1);
          }
        }
        setIsAiThinking(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, board, winner]);

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer(1);
    setWinner(null);
    setIsAiThinking(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          NEON CONNECT
        </h2>
        <button onClick={resetGame} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="mb-8 text-center h-12">
          {winner ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-2xl font-bold">
              {winner === 'draw' ? <span className="text-slate-400">IT'S A DRAW!</span> : 
               winner === 1 ? <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">YOU WIN!</span> : 
               <span className="text-rose-500 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]">AI WINS!</span>}
            </motion.div>
          ) : (
            <div className={`text-lg font-semibold ${currentPlayer === 1 ? 'text-cyan-400' : 'text-rose-500'}`}>
              {currentPlayer === 1 ? "YOUR TURN" : "AI IS THINKING..."}
            </div>
          )}
        </div>

        <div className="bg-blue-900/40 p-3 sm:p-4 rounded-2xl border-2 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)] backdrop-blur-sm">
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {Array.from({ length: COLS }).map((_, colIndex) => (
              <div 
                key={colIndex} 
                className="flex flex-col gap-2 sm:gap-3 cursor-pointer group"
                onClick={() => handleColumnClick(colIndex)}
              >
                {/* Hover indicator */}
                <div className="h-4 rounded-full transition-colors group-hover:bg-cyan-400/30" />
                
                {board.map((row, rowIndex) => (
                  <div 
                    key={`${rowIndex}-${colIndex}`} 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-950 border-2 border-blue-500/20 flex items-center justify-center overflow-hidden relative shadow-inner"
                  >
                    {row[colIndex] && (
                      <motion.div
                        initial={{ y: -300, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
                        className={`w-full h-full rounded-full ${
                          row[colIndex] === 1 
                            ? 'bg-cyan-400 shadow-[inset_0_0_15px_rgba(0,0,0,0.5),0_0_15px_rgba(34,211,238,0.8)]' 
                            : 'bg-rose-500 shadow-[inset_0_0_15px_rgba(0,0,0,0.5),0_0_15px_rgba(244,63,94,0.8)]'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
