import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, ChevronLeft, BrainCircuit } from 'lucide-react';

const ICONS = ['🚀', '🛸', '👾', '🤖', '⭐', '🌙', '⚡', '🔥'];

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryMatch({ onBack }: { onBack: () => void }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const initializeGame = () => {
    const shuffledCards = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setIsLocked(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    if (newFlippedIndices.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);

      const [firstIndex, secondIndex] = newFlippedIndices;
      if (cards[firstIndex].icon === cards[secondIndex].icon) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatches(m => m + 1);
          setIsLocked(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const isGameOver = matches === ICONS.length;

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
          <ChevronLeft className="w-6 h-6 text-purple-400" />
        </button>
        <h1 className="text-xl font-bold tracking-wider text-purple-400">MEMORY MATCH</h1>
        <div className="w-10" />
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center p-6 px-8">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Moves</span>
          <span className="text-3xl font-mono font-bold text-white">{moves}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-400 uppercase tracking-widest">Matches</span>
          <span className="text-3xl font-mono font-bold text-purple-400">{matches}/{ICONS.length}</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="grid grid-cols-4 gap-3 w-full max-w-[340px]">
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              className="relative aspect-square cursor-pointer perspective-1000"
              onClick={() => handleCardClick(index)}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-full h-full relative preserve-3d transition-transform duration-500"
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              >
                {/* Front (Hidden) */}
                <div className="absolute inset-0 backface-hidden bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center shadow-lg">
                  <BrainCircuit className="w-8 h-8 text-slate-700" />
                </div>
                
                {/* Back (Revealed) */}
                <div 
                  className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl flex items-center justify-center text-4xl shadow-lg border
                    ${card.isMatched ? 'bg-purple-900/40 border-purple-500/50' : 'bg-slate-800 border-slate-600'}
                  `}
                >
                  {card.icon}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Game Over */}
      <div className="p-8 flex flex-col items-center justify-center min-h-[120px]">
        {isGameOver ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <h2 className="text-2xl font-bold text-purple-400">LEVEL CLEARED!</h2>
            <button 
              onClick={initializeGame}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-full transition-transform active:scale-95"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </button>
          </motion.div>
        ) : (
          <div className="text-slate-500 text-sm">Find all matching pairs</div>
        )}
      </div>
    </motion.div>
  );
}
