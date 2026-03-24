import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, Trophy, Sparkles, Lock, Play, Search,
  Activity, LayoutGrid, Hash, BrainCircuit, Bomb,
  Boxes, ArrowLeftRight, BrickWall, Ghost, Rocket,
  Layers, Table, Bird, CircleDot, Hammer,
  Type, GripHorizontal, Crosshair, AlignEndVertical, CarFront,
  Dna, Wind, Zap, Palette, Target
} from 'lucide-react';

import Snake from './components/games/Snake';
import TicTacToe from './components/games/TicTacToe';
import MemoryMatch from './components/games/MemoryMatch';
import Minesweeper from './components/games/Minesweeper';
import TwoThousandFortyEight from './components/games/TwoThousandFortyEight';
import FlappyBird from './components/games/FlappyBird';
import Pong from './components/games/Pong';
import SimonSays from './components/games/SimonSays';
import WhackAMole from './components/games/WhackAMole';
import Breakout from './components/games/Breakout';
import SpaceInvaders from './components/games/SpaceInvaders';
import Sudoku from './components/games/Sudoku';
import Tetris from './components/games/Tetris';
import Pacman from './components/games/Pacman';
import Solitaire from './components/games/Solitaire';
import WordGuess from './components/games/WordGuess';
import ConnectFour from './components/games/ConnectFour';
import AimTrainer from './components/games/AimTrainer';
import TowerStack from './components/games/TowerStack';
import RetroRacer from './components/games/RetroRacer';
import DinoRun from './components/games/DinoRun';
import Helicopter from './components/games/Helicopter';
import FallingDodger from './components/games/FallingDodger';
import ColorMatch from './components/games/ColorMatch';
import SpaceDefender from './components/games/SpaceDefender';

const GAMES = [
  { id: 'snake', title: 'Neon Snake', category: 'Arcade', color: 'from-emerald-400 to-emerald-600', playable: true, icon: Activity },
  { id: '2048', title: '2048 Merge', category: 'Puzzle', color: 'from-amber-400 to-amber-600', playable: true, icon: LayoutGrid },
  { id: 'tictactoe', title: 'Tic Tac Toe', category: 'Strategy', color: 'from-cyan-400 to-cyan-600', playable: true, icon: Hash },
  { id: 'memory', title: 'Memory Match', category: 'Brain', color: 'from-purple-400 to-purple-600', playable: true, icon: BrainCircuit },
  { id: 'minesweeper', title: 'Minesweeper', category: 'Logic', color: 'from-rose-400 to-rose-600', playable: true, icon: Bomb },
  { id: 'tetris', title: 'Block Puzzle', category: 'Arcade', color: 'from-indigo-400 to-blue-600', playable: true, icon: Boxes },
  { id: 'pong', title: 'Retro Pong', category: 'Arcade', color: 'from-slate-300 to-slate-500', playable: true, icon: ArrowLeftRight },
  { id: 'breakout', title: 'Brick Breaker', category: 'Arcade', color: 'from-orange-400 to-red-600', playable: true, icon: BrickWall },
  { id: 'pacman', title: 'Maze Chase', category: 'Arcade', color: 'from-yellow-300 to-yellow-500', playable: true, icon: Ghost },
  { id: 'spaceinvaders', title: 'Alien Shooter', category: 'Arcade', color: 'from-cyan-300 to-blue-500', playable: true, icon: Rocket },
  { id: 'solitaire', title: 'Solitaire Streak', category: 'Card', color: 'from-green-500 to-teal-700', playable: true, icon: Layers },
  { id: 'sudoku', title: 'Sudoku Master', category: 'Puzzle', color: 'from-blue-300 to-indigo-500', playable: true, icon: Table },
  { id: 'flappy', title: 'Flying Bird', category: 'Arcade', color: 'from-yellow-200 to-green-400', playable: true, icon: Bird },
  { id: 'simon', title: 'Simon Says', category: 'Memory', color: 'from-red-500 to-blue-500', playable: true, icon: CircleDot },
  { id: 'whack', title: 'Whack-a-Mole', category: 'Arcade', color: 'from-amber-600 to-orange-800', playable: true, icon: Hammer },
  { id: 'wordguess', title: 'Word Guess', category: 'Puzzle', color: 'from-slate-400 to-slate-600', playable: true, icon: Type },
  { id: 'connect4', title: 'Neon Connect', category: 'Strategy', color: 'from-blue-400 to-cyan-600', playable: true, icon: GripHorizontal },
  { id: 'aimtrainer', title: 'Aim Trainer', category: 'Arcade', color: 'from-yellow-400 to-orange-500', playable: true, icon: Crosshair },
  { id: 'towerstack', title: 'Tower Stack', category: 'Arcade', color: 'from-pink-400 to-rose-600', playable: true, icon: AlignEndVertical },
  { id: 'retroracer', title: 'Retro Racer', category: 'Arcade', color: 'from-red-400 to-rose-700', playable: true, icon: CarFront },
  { id: 'dinorun', title: 'Neon Runner', category: 'Arcade', color: 'from-green-400 to-emerald-700', playable: true, icon: Dna },
  { id: 'helicopter', title: 'Cave Flyer', category: 'Arcade', color: 'from-orange-400 to-amber-600', playable: true, icon: Wind },
  { id: 'dodger', title: 'Neon Dodger', category: 'Arcade', color: 'from-teal-400 to-emerald-600', playable: true, icon: Zap },
  { id: 'colormatch', title: 'Color Matcher', category: 'Arcade', color: 'from-fuchsia-400 to-purple-600', playable: true, icon: Palette },
  { id: 'spacedefender', title: 'Space Defender', category: 'Arcade', color: 'from-indigo-500 to-purple-800', playable: true, icon: Target },
];

export default function App() {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(GAMES.map(g => g.category)))];

  const filteredGames = GAMES.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const renderGame = () => {
    switch (activeGame) {
      case 'snake': return <Snake onBack={() => setActiveGame(null)} />;
      case 'tictactoe': return <TicTacToe onBack={() => setActiveGame(null)} />;
      case 'memory': return <MemoryMatch onBack={() => setActiveGame(null)} />;
      case 'minesweeper': return <Minesweeper onBack={() => setActiveGame(null)} />;
      case '2048': return <TwoThousandFortyEight onBack={() => setActiveGame(null)} />;
      case 'flappy': return <FlappyBird onBack={() => setActiveGame(null)} />;
      case 'pong': return <Pong onBack={() => setActiveGame(null)} />;
      case 'simon': return <SimonSays onBack={() => setActiveGame(null)} />;
      case 'whack': return <WhackAMole onBack={() => setActiveGame(null)} />;
      case 'breakout': return <Breakout onBack={() => setActiveGame(null)} />;
      case 'spaceinvaders': return <SpaceInvaders onBack={() => setActiveGame(null)} />;
      case 'sudoku': return <Sudoku onBack={() => setActiveGame(null)} />;
      case 'tetris': return <Tetris onBack={() => setActiveGame(null)} />;
      case 'pacman': return <Pacman onBack={() => setActiveGame(null)} />;
      case 'solitaire': return <Solitaire onBack={() => setActiveGame(null)} />;
      case 'wordguess': return <WordGuess onBack={() => setActiveGame(null)} />;
      case 'connect4': return <ConnectFour onBack={() => setActiveGame(null)} />;
      case 'aimtrainer': return <AimTrainer onBack={() => setActiveGame(null)} />;
      case 'towerstack': return <TowerStack onBack={() => setActiveGame(null)} />;
      case 'retroracer': return <RetroRacer onBack={() => setActiveGame(null)} />;
      case 'dinorun': return <DinoRun onBack={() => setActiveGame(null)} />;
      case 'helicopter': return <Helicopter onBack={() => setActiveGame(null)} />;
      case 'dodger': return <FallingDodger onBack={() => setActiveGame(null)} />;
      case 'colormatch': return <ColorMatch onBack={() => setActiveGame(null)} />;
      case 'spacedefender': return <SpaceDefender onBack={() => setActiveGame(null)} />;
      default: return null;
    }
  };

  const handleGameClick = (playable: boolean, id: string) => {
    if (playable) {
      setActiveGame(id);
    } else {
      setShowLockedModal(true);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 overflow-hidden flex justify-center">
      <AnimatePresence mode="wait">
        {activeGame ? (
          <motion.div key="game" className="h-full w-full max-w-md bg-slate-950 relative">
            {renderGame()}
          </motion.div>
        ) : (
          <motion.div 
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full w-full max-w-md bg-slate-950 flex flex-col relative overflow-y-auto"
          >
            {/* Header */}
            <div className="pt-12 pb-6 px-6 sticky top-0 bg-slate-950/90 backdrop-blur-xl z-20 border-b border-slate-800/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-cyan-500/20 rounded-xl">
                  <Gamepad2 className="w-6 h-6 text-cyan-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">RetroVerse</h1>
              </div>
              <p className="text-slate-400 text-sm">25 Classic Games. Tier S Experience.</p>
            </div>

            {/* Featured Section */}
            <div className="px-6 py-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Featured Classics</h2>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
                {GAMES.filter(g => ['snake', 'tetris', 'pacman', 'spaceinvaders'].includes(g.id)).map(game => {
                  const Icon = game.icon;
                  return (
                  <motion.div
                    key={game.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGameClick(game.playable, game.id)}
                    className={`relative overflow-hidden rounded-2xl p-4 cursor-pointer bg-gradient-to-br ${game.color} shadow-lg min-w-[160px] snap-center shrink-0`}
                  >
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute -right-2 -bottom-2 opacity-30">
                      <Icon className="w-20 h-20 text-white" />
                    </div>
                    <div className="relative z-10 flex flex-col h-24 justify-between">
                      <span className="text-white/80 text-xs font-bold uppercase tracking-wider">{game.category}</span>
                      <h3 className="text-white font-bold text-lg leading-tight">{game.title}</h3>
                    </div>
                  </motion.div>
                )})}
              </div>
            </div>

            {/* Search & Filter */}
            <div className="px-6 pb-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search games..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                      selectedCategory === category 
                        ? 'bg-cyan-500 text-slate-950' 
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* All Games Grid */}
            <div className="px-6 pb-24">
              <div className="flex items-center gap-2 mb-4 mt-2">
                <LayoutGrid className="w-4 h-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">The Collection</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {filteredGames.map(game => {
                  const Icon = game.icon;
                  return (
                  <motion.div
                    key={game.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleGameClick(game.playable, game.id)}
                    className="group relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-4 hover:border-slate-700 transition-all cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${game.color} transition-opacity`} />
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${game.color} flex items-center justify-center shadow-lg`}>
                      {game.playable ? <Icon className="w-7 h-7 text-white" /> : <Lock className="w-6 h-6 text-white/50" />}
                    </div>
                    <div className="text-center">
                      <h3 className={`font-bold text-sm leading-tight mb-1 ${game.playable ? 'text-slate-200' : 'text-slate-500'}`}>{game.title}</h3>
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{game.category}</span>
                    </div>
                  </motion.div>
                )})}
                {filteredGames.length === 0 && (
                  <div className="col-span-2 text-center py-10">
                    <p className="text-slate-500 text-sm">No games found matching your criteria.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Locked Modal */}
            <AnimatePresence>
              {showLockedModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm"
                  onClick={() => setShowLockedModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl"
                    onClick={e => e.stopPropagation()}
                  >
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Game Locked</h3>
                    <p className="text-slate-400 text-sm mb-6">
                      This classic game is currently being remastered for the Tier S experience. It will be available in the upcoming v1.1 update!
                    </p>
                    <button
                      onClick={() => setShowLockedModal(false)}
                      className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors"
                    >
                      Got it
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
