import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, RefreshCw, Delete } from 'lucide-react';

const WORDS = [
  "APPLE", "BRAVE", "CRANE", "DANCE", "EAGLE", "FLAME", "GRAPE", "HEART", 
  "IMAGE", "JUICE", "KNIFE", "LEMON", "MAGIC", "NIGHT", "OCEAN", "PEARL", 
  "QUEEN", "RIVER", "SNAKE", "TRAIN", "UNCLE", "VOICE", "WATER", "YOUTH", "ZEBRA",
  "GHOST", "ALIEN", "ROBOT", "LASER", "SPACE", "STARS", "MOON", "EARTH", "WORLD"
];

const KEYBOARD = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
];

interface WordGuessProps {
  onBack: () => void;
}

export default function WordGuess({ onBack }: WordGuessProps) {
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  const initGame = useCallback(() => {
    setTargetWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuesses([]);
    setCurrentGuess("");
    setGameOver(false);
    setWon(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const onKeyPress = useCallback((key: string) => {
    if (gameOver) return;

    if (key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (key === 'ENTER') {
      if (currentGuess.length === 5) {
        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);
        setCurrentGuess("");
        
        if (currentGuess === targetWord) {
          setWon(true);
          setGameOver(true);
        } else if (newGuesses.length >= 6) {
          setGameOver(true);
        }
      }
    } else if (currentGuess.length < 5 && /^[A-Z]$/.test(key)) {
      setCurrentGuess(prev => prev + key);
    }
  }, [currentGuess, gameOver, guesses, targetWord]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') onKeyPress('ENTER');
      else if (e.key === 'Backspace') onKeyPress('BACKSPACE');
      else {
        const key = e.key.toUpperCase();
        if (/^[A-Z]$/.test(key)) onKeyPress(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKeyPress]);

  const getLetterStatus = (letter: string, index: number, guess: string) => {
    if (targetWord[index] === letter) return 'correct';
    if (targetWord.includes(letter)) {
      // Handle multiple letters (simplified)
      const targetCount = targetWord.split(letter).length - 1;
      const guessCountUpToHere = guess.slice(0, index + 1).split(letter).length - 1;
      if (guessCountUpToHere <= targetCount) return 'present';
    }
    return 'absent';
  };

  const getKeyStatus = (key: string) => {
    let status = 'default';
    for (const guess of guesses) {
      for (let i = 0; i < 5; i++) {
        if (guess[i] === key) {
          const s = getLetterStatus(key, i, guess);
          if (s === 'correct') return 'correct';
          if (s === 'present') status = 'present';
          if (s === 'absent' && status === 'default') status = 'absent';
        }
      }
    }
    return status;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <button onClick={onBack} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">
          WORD GUESS
        </h2>
        <button onClick={initGame} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="grid grid-rows-6 gap-2 mb-8">
          {Array.from({ length: 6 }).map((_, rowIndex) => {
            const isCurrentRow = rowIndex === guesses.length;
            const guess = guesses[rowIndex] || (isCurrentRow ? currentGuess : "");
            
            return (
              <div key={rowIndex} className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, colIndex) => {
                  const letter = guess[colIndex] || "";
                  let status = 'default';
                  if (rowIndex < guesses.length) {
                    status = getLetterStatus(letter, colIndex, guess);
                  }

                  return (
                    <motion.div
                      key={colIndex}
                      initial={false}
                      animate={{
                        rotateX: rowIndex < guesses.length ? 360 : 0,
                        scale: letter && isCurrentRow ? [1, 1.1, 1] : 1
                      }}
                      transition={{ duration: 0.5, delay: rowIndex < guesses.length ? colIndex * 0.1 : 0 }}
                      className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-2xl font-bold rounded-lg border-2 
                        ${status === 'correct' ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 
                          status === 'present' ? 'bg-amber-500 border-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 
                          status === 'absent' ? 'bg-slate-800 border-slate-800 text-slate-400' : 
                          letter ? 'border-slate-500 text-white' : 'border-slate-800 text-transparent'}`}
                    >
                      {letter}
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {gameOver && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <h3 className={`text-2xl font-bold mb-2 ${won ? 'text-emerald-400' : 'text-rose-400'}`}>
              {won ? 'Splendid!' : 'Game Over'}
            </h3>
            {!won && <p className="text-slate-300">The word was <span className="font-bold text-white">{targetWord}</span></p>}
          </motion.div>
        )}

        <div className="w-full max-w-md px-2 flex flex-col gap-2 mt-auto pb-4">
          {KEYBOARD.map((row, i) => (
            <div key={i} className="flex justify-center gap-1 sm:gap-2">
              {row.map(key => {
                const status = getKeyStatus(key);
                return (
                  <button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    className={`h-12 sm:h-14 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center transition-colors
                      ${key === 'ENTER' || key === 'BACKSPACE' ? 'px-3 sm:px-4 text-xs' : 'flex-1 max-w-[40px]'}
                      ${status === 'correct' ? 'bg-emerald-500 text-white' : 
                        status === 'present' ? 'bg-amber-500 text-white' : 
                        status === 'absent' ? 'bg-slate-800 text-slate-500' : 
                        'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                  >
                    {key === 'BACKSPACE' ? <Delete className="w-5 h-5" /> : key}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
