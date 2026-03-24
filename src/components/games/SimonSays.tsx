import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, RotateCcw } from 'lucide-react';

const COLORS = [
  { id: 0, bg: 'bg-red-500', active: 'bg-red-300 shadow-[0_0_30px_rgba(239,68,68,0.8)]' },
  { id: 1, bg: 'bg-green-500', active: 'bg-green-300 shadow-[0_0_30px_rgba(34,197,94,0.8)]' },
  { id: 2, bg: 'bg-blue-500', active: 'bg-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.8)]' },
  { id: 3, bg: 'bg-yellow-400', active: 'bg-yellow-200 shadow-[0_0_30px_rgba(250,204,21,0.8)]' },
];

export default function SimonSays({ onBack }: { onBack: () => void }) {
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [statusText, setStatusText] = useState('PRESS START');

  useEffect(() => {
    const saved = localStorage.getItem('simonHighScore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const startGame = () => {
    setSequence([Math.floor(Math.random() * 4)]);
    setPlayerSeq([]);
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setStatusText('WATCH');
  };

  useEffect(() => {
    if (isPlaying && playerSeq.length === 0 && sequence.length > 0) {
      setStatusText('WATCH');
      let i = 0;
      const interval = setInterval(() => {
        setActiveColor(sequence[i]);
        setTimeout(() => setActiveColor(null), 400);
        i++;
        if (i >= sequence.length) {
          clearInterval(interval);
          setTimeout(() => setStatusText('YOUR TURN'), 500);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isPlaying, sequence, playerSeq.length]);

  const handleColorClick = (index: number) => {
    if (!isPlaying || gameOver || statusText === 'WATCH') return;
    
    const newPlayerSeq = [...playerSeq, index];
    setPlayerSeq(newPlayerSeq);
    setActiveColor(index);
    setTimeout(() => setActiveColor(null), 200);

    if (newPlayerSeq[newPlayerSeq.length - 1] !== sequence[newPlayerSeq.length - 1]) {
      setGameOver(true);
      setIsPlaying(false);
      setStatusText('GAME OVER');
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('simonHighScore', score.toString());
      }
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      setScore(sequence.length);
      setStatusText('CORRECT!');
      setTimeout(() => {
        setSequence([...sequence, Math.floor(Math.random() * 4)]);
        setPlayerSeq([]);
      }, 1000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-950 text-slate-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-red-500" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-red-500">SIMON SAYS</h1>
        <div className="w-10" />
      </div>

      <div className="flex justify-between items-center p-6">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Score</span>
          <span className="text-3xl font-mono font-bold text-white">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Best</span>
          <span className="text-xl font-mono font-bold text-red-500">{highScore}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        <div className="text-2xl font-bold tracking-widest text-slate-300 h-8">
          {statusText}
        </div>

        <div className="relative w-72 h-72 bg-slate-900 rounded-full p-4 shadow-2xl border-4 border-slate-800">
          <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-full">
            {COLORS.map((color) => (
              <motion.button
                key={color.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleColorClick(color.id)}
                className={`
                  rounded-full transition-all duration-200
                  ${color.id === 0 ? 'rounded-tl-full' : ''}
                  ${color.id === 1 ? 'rounded-tr-full' : ''}
                  ${color.id === 2 ? 'rounded-bl-full' : ''}
                  ${color.id === 3 ? 'rounded-br-full' : ''}
                  ${activeColor === color.id ? color.active : color.bg + ' opacity-80'}
                `}
              />
            ))}
          </div>
          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-slate-950 rounded-full border-4 border-slate-800 flex items-center justify-center shadow-inner">
            <span className="text-2xl font-bold text-slate-700">SIMON</span>
          </div>
        </div>

        {(!isPlaying || gameOver) && (
          <button 
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full transition-transform active:scale-95 shadow-lg"
          >
            <RotateCcw className="w-5 h-5" /> {gameOver ? 'Try Again' : 'Start Game'}
          </button>
        )}
      </div>
    </motion.div>
  );
}
