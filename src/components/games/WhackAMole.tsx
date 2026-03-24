import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, RotateCcw, Timer } from 'lucide-react';

export default function WhackAMole({ onBack }: { onBack: () => void }) {
  const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('whackHighScore');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setGameOver(false);
    setIsPlaying(true);
    setMoles(Array(9).fill(false));
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0 && !gameOver) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      
      const moleTimer = setInterval(() => {
        const newMoles = Array(9).fill(false);
        // 1 to 3 moles can appear
        const numMoles = Math.floor(Math.random() * 3) + 1;
        for(let i=0; i<numMoles; i++) {
          newMoles[Math.floor(Math.random() * 9)] = true;
        }
        setMoles(newMoles);
      }, Math.max(500, 1000 - (30 - timeLeft) * 15)); // Speeds up over time

      return () => { clearInterval(timer); clearInterval(moleTimer); };
    } else if (timeLeft === 0 && isPlaying) {
      setGameOver(true);
      setIsPlaying(false);
      setMoles(Array(9).fill(false));
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('whackHighScore', score.toString());
      }
    }
  }, [timeLeft, gameOver, isPlaying, score, highScore]);

  const whack = (index: number) => {
    if (moles[index] && !gameOver && isPlaying) {
      setScore(s => s + 10);
      const newMoles = [...moles];
      newMoles[index] = false;
      setMoles(newMoles);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-950 text-slate-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-orange-500" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-orange-500">WHACK-A-MOLE</h1>
        <div className="w-10" />
      </div>

      <div className="flex justify-between items-center p-6 px-8">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Score</span>
          <span className="text-3xl font-mono font-bold text-white">{score}</span>
        </div>
        <div className="flex flex-col items-center bg-slate-900 px-4 py-2 rounded-lg border border-slate-800">
          <span className="text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Timer className="w-3 h-3 text-orange-500" /> Time
          </span>
          <span className={`text-2xl font-mono font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="grid grid-cols-3 gap-4 w-full max-w-[320px] bg-emerald-900/20 p-6 rounded-2xl border border-emerald-900/50">
          {moles.map((isMole, i) => (
            <div key={i} className="relative aspect-square">
              {/* Hole */}
              <div className="absolute bottom-0 w-full h-1/2 bg-slate-950 rounded-[100%] border-b-4 border-slate-800 shadow-inner" />
              
              {/* Mole */}
              <AnimatePresence>
                {isMole && (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    onClick={() => whack(i)}
                    className="absolute inset-x-2 bottom-4 top-2 bg-orange-700 rounded-t-full cursor-pointer flex flex-col items-center pt-2 shadow-[inset_0_-10px_rgba(0,0,0,0.2)]"
                  >
                    <div className="w-full flex justify-center gap-2 px-2">
                      <div className="w-2 h-2 bg-black rounded-full" />
                      <div className="w-2 h-2 bg-black rounded-full" />
                    </div>
                    <div className="w-3 h-2 bg-pink-400 rounded-full mt-1" />
                    <div className="w-4 h-3 bg-white rounded-b-md mt-1" />
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Grass overlay to hide mole bottom */}
              <div className="absolute bottom-[-10px] w-[120%] -left-[10%] h-6 bg-emerald-800 rounded-[100%] z-10 opacity-50" />
            </div>
          ))}
        </div>

        {(!isPlaying || gameOver) && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            {gameOver && <h2 className="text-2xl font-bold text-orange-500">TIME'S UP!</h2>}
            {gameOver && <p className="text-slate-400">Best Score: {highScore}</p>}
            <button 
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-full transition-transform active:scale-95 shadow-lg mt-4"
            >
              <RotateCcw className="w-5 h-5" /> {gameOver ? 'Play Again' : 'Start Game'}
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
