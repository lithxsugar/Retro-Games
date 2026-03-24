import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, RotateCcw } from 'lucide-react';

// Simplified Solitaire (Higher or Lower / Streak) to fit in a single component beautifully
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface Card { suit: string; value: string; numValue: number; color: string; }

export default function Solitaire({ onBack }: { onBack: () => void }) {
  const [deck, setDeck] = useState<Card[]>([]);
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('Guess if the next card is Higher or Lower');

  const createDeck = () => {
    const newDeck: Card[] = [];
    SUITS.forEach(suit => {
      VALUES.forEach((value, index) => {
        newDeck.push({
          suit, value, numValue: index + 1,
          color: (suit === '♥' || suit === '♦') ? 'text-red-500' : 'text-slate-900'
        });
      });
    });
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const startGame = () => {
    const newDeck = createDeck();
    setCurrentCard(newDeck.pop() || null);
    setDeck(newDeck);
    setScore(0);
    setGameOver(false);
    setMessage('Higher or Lower?');
  };

  useEffect(() => {
    startGame();
  }, []);

  const guess = (isHigher: boolean) => {
    if (gameOver || deck.length === 0 || !currentCard) return;

    const nextCard = deck[deck.length - 1];
    const newDeck = [...deck];
    newDeck.pop();

    let correct = false;
    if (isHigher && nextCard.numValue >= currentCard.numValue) correct = true;
    if (!isHigher && nextCard.numValue <= currentCard.numValue) correct = true;

    setCurrentCard(nextCard);
    setDeck(newDeck);

    if (correct) {
      setScore(s => s + 1);
      setMessage('Correct! Keep going.');
      if (newDeck.length === 0) {
        setGameOver(true);
        setMessage('You won the deck!');
      }
    } else {
      setGameOver(true);
      setMessage(`Wrong! It was a ${nextCard.value}. Game Over.`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col h-full w-full max-w-md mx-auto bg-slate-950 text-slate-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-md">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-6 h-6 text-green-500" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-green-500">SOLITAIRE STREAK</h1>
        <div className="w-10" />
      </div>

      <div className="flex justify-between items-center p-6 px-8">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Streak</span>
          <span className="text-3xl font-mono font-bold text-white">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Cards Left</span>
          <span className="text-xl font-mono font-bold text-green-500">{deck.length}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8 h-12 text-slate-300 font-medium px-4">
          {message}
        </div>

        <div className="relative w-48 h-72 perspective-1000 mb-12">
          <AnimatePresence mode="wait">
            {currentCard && (
              <motion.div
                key={currentCard.suit + currentCard.value}
                initial={{ rotateY: 90, scale: 0.8, opacity: 0 }}
                animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                exit={{ rotateY: -90, scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-white rounded-2xl shadow-2xl border-4 border-slate-200 flex flex-col justify-between p-4"
              >
                <div className={`text-2xl font-bold ${currentCard.color}`}>{currentCard.value} {currentCard.suit}</div>
                <div className={`text-6xl self-center ${currentCard.color}`}>{currentCard.suit}</div>
                <div className={`text-2xl font-bold self-end rotate-180 ${currentCard.color}`}>{currentCard.value} {currentCard.suit}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!gameOver ? (
          <div className="flex gap-4 w-full px-8">
            <button 
              onClick={() => guess(false)}
              className="flex-1 py-4 bg-rose-500 hover:bg-rose-400 text-white font-bold rounded-xl active:scale-95 transition-transform shadow-lg"
            >
              LOWER
            </button>
            <button 
              onClick={() => guess(true)}
              className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl active:scale-95 transition-transform shadow-lg"
            >
              HIGHER
            </button>
          </div>
        ) : (
          <button 
            onClick={startGame}
            className="flex items-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full transition-transform active:scale-95 shadow-lg"
          >
            <RotateCcw className="w-5 h-5" /> Play Again
          </button>
        )}
      </div>
    </motion.div>
  );
}
