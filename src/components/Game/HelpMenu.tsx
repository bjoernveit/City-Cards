import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, HelpCircle, Info, Layers, RefreshCw, Scale, Trophy, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HelpMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpMenu: React.FC<HelpMenuProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col pointer-events-auto relative"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">How to Play</h2>
                  <p className="text-xs text-slate-500 font-mono">Game Rules & Mechanics</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-slate-700">
              {/* Core Loop */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <RefreshCw className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">The Game Loop</h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  The game is played over <span className="text-white font-bold">3 Phases</span>. Each Phase has <span className="text-white font-bold">3 Rounds</span>. 
                  Each round consists of several turns where you produce resources and finally convert them into points.
                </p>
              </section>

              {/* Phases */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Layers className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Phases & Currencies</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 block mb-1">PHASE 1</span>
                    <span className="text-emerald-500 font-bold">WOOD</span>
                    <p className="text-[10px] text-slate-500 mt-1">Basic construction. 4 turns per round.</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 block mb-1">PHASE 2</span>
                    <span className="text-red-500 font-bold">BRICKS</span>
                    <p className="text-[10px] text-slate-500 mt-1">Wood becomes outdated. 3 turns per round.</p>
                  </div>
                  <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 block mb-1">PHASE 3</span>
                    <span className="text-blue-400 font-bold">STEEL</span>
                    <p className="text-[10px] text-slate-500 mt-1">Bricks become outdated. 2 turns per round.</p>
                  </div>
                </div>
              </section>

              {/* Production */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <Info className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Market & Production</h3>
                </div>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>Cards are picked from a <span className="text-white font-bold">Public Market</span>.</span>
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>In Round 1, 3 cards are available for free. From Round 2 onwards, 4 cards are available, but the leftmost ones <span className="text-white font-bold">cost resources</span> to pick.</span>
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>After each turn, an <span className="text-white font-bold">opponent</span> removes a random card from the market.</span>
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>Resources are produced based on your <span className="text-white font-bold">Largest Connected Patch</span> of that type.</span>
                  </li>
                  <li className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>Cards must overlap at least <span className="text-white font-bold">2 tiles</span> of existing cards.</span>
                  </li>
                </ul>
              </section>

              {/* Controls */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <MousePointer2 className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Interface Controls</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-400 text-sm">
                  <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <span>Rotate Card</span>
                    <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">RIGHT CLICK</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-slate-800">
                    <span>Cancel/Exit</span>
                    <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">ESC</span>
                  </div>
                </div>
              </section>

              {/* Points */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-green-400">
                  <Trophy className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wider">Scoring Points</h3>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800 flex gap-4 items-start">
                  <Scale className="w-8 h-8 text-green-400 shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm">
                      Points are converted from the <span className="text-amber-400 font-bold">Current Phase Currency</span> during the final turn of each round.
                    </p>
                    <p className="text-xs text-slate-500 italic">
                      Your <span className="text-white font-bold">City Capacity</span> (Total City tiles + Total Nature tiles) limits how many points you can convert at once.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-800 bg-slate-950/30">
              <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-6">
                GOT IT!
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
