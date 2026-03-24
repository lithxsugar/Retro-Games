import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, RotateCcw, ChevronLeft } from 'lucide-react';

type Player = 'X' | 'O' | null;

export default function TicTacToe({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true); // Player is 'X'
  const [winner, setWinner] = useState<Player | 'Draw'>(null);
  const [scores, setScores] = useState({ player: 0, ai: 0 });

  const checkWinner = (squares: Player[]): Player | 'Draw' => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    if (!squares.includes(null)) return 'Draw';
    return null;
  };

  // Minimax algorithm for unbeatable AI
  const minimax = (newBoard: Player[], player: 'X' | 'O'): number => {
    const availSpots = newBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
    const currentWinner = checkWinner(newBoard);

    if (currentWinner === 'X') return -10;
    if (currentWinner === 'O') return 10;
    if (availSpots.length === 0) return 0;

    const moves: { index: number; score: number }[] = [];

    for (let i = 0; i < availSpots.length; i++) {
      const move: any = {};
      move.index = availSpots[i];
      newBoard[availSpots[i]] = player;

      if (player === 'O') {
        move.score = minimax(newBoard, 'X');
      } else {
        move.score = minimax(newBoard, 'O');
      }

      newBoard[availSpots[i]] = null;
      moves.push(move);
    }

    let bestMove = 0;
    if (player === 'O') {
      let bestScore = -10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
      let bestScore = 10000;
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
    return moves[bestMove].score;
  };

  const bestMove = (currentBoard: Player[]) => {
    const availSpots = currentBoard.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
    if (availSpots.length === 0) return -1;
    
    // Add a tiny bit of randomness so it's not perfectly boring every time on the first move
    if (availSpots.length === 9) return [0, 2, 6, 8, 4][Math.floor(Math.random() * 5)];

    let bestScore = -10000;
    let move = -1;

    for (let i = 0; i < availSpots.length; i++) {
      currentBoard[availSpots[i]] = 'O';
      const score = minimax(currentBoard, 'X');
      currentBoard[availSpots[i]] = null;
      if (score > bestScore) {
        bestScore = score;
        move = availSpots[i];
      }
    }
    return move;
  };

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        const aiMove = bestMove([...board]);
        if (aiMove !== -1) {
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);
          const newWinner = checkWinner(newBoard);
          if (newWinner) {
            setWinner(newWinner);
            if (newWinner === 'O') setScores(s => ({ ...s, ai: s.ai + 1 }));
          } else {
            setIsPlayerTurn(true);
          }
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, winner]);

  const handleClick = (index: number) => {
    if (board[index] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    
    const newWinner = checkWinner(newBoard);
    if (newWinner) {
      setWinner(newWinner);
      if (newWinner === 'X') setScores(s => ({ ...s, player: s.player + 1 }));
    } else {
      setIsPlayerTurn(false);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setWinner(null);
    setIsPlayerTurn(true);
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
          <ChevronLeft className="w-6 h-6 text-cyan-400" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-cyan-400">TIC TAC TOE</h1>
        <div className="w-10" />
      </div>

      {/* Score Board */}
      <div className="flex justify-between items-center p-8">
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400 uppercase tracking-widest mb-1">You (X)</span>
          <span className="text-3xl font-mono font-bold text-cyan-400">{scores.player}</span>
        </div>
        <div className="text-slate-600 font-bold text-xl">-</div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-slate-400 uppercase tracking-widest mb-1">AI (O)</span>
          <span className="text-3xl font-mono font-bold text-rose-500">{scores.ai}</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="grid grid-cols-3 gap-3 w-full max-w-[320px] aspect-square">
          {board.map((cell, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleClick(index)}
              disabled={!!cell || !!winner || !isPlayerTurn}
              className={`
                relative flex items-center justify-center rounded-2xl text-5xl font-bold
                transition-colors duration-300
                ${!cell && !winner && isPlayerTurn ? 'bg-slate-900 hover:bg-slate-800 cursor-pointer' : 'bg-slate-900/50 cursor-default'}
                ${cell === 'X' ? 'text-cyan-400 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]' : ''}
                ${cell === 'O' ? 'text-rose-500 shadow-[inset_0_0_20px_rgba(244,63,94,0.1)]' : ''}
                border border-slate-800
              `}
            >
              {cell && (
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {cell}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Status / Controls */}
      <div className="p-8 flex flex-col items-center justify-center min-h-[120px]">
        {winner ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <h2 className={`text-2xl font-bold ${winner === 'X' ? 'text-cyan-400' : winner === 'O' ? 'text-rose-500' : 'text-slate-300'}`}>
              {winner === 'Draw' ? "IT'S A DRAW!" : `${winner} WINS!`}
            </h2>
            <button 
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full transition-transform active:scale-95"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </button>
          </motion.div>
        ) : (
          <div className="text-slate-400 tracking-widest text-sm uppercase">
            {isPlayerTurn ? "Your Turn" : "AI is thinking..."}
          </div>
        )}
      </div>
    </motion.div>
  );
}
