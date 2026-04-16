import React from 'react';
import { CardData } from '@/src/types';
import { GameCard } from './Card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Undo2, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HandProps {
  cards: CardData[];
  draggingCardId: string | null;
  preview: any;
  currentPhase: number;
  onDragStart: (card: CardData, info: any) => void;
  onDrag: (card: CardData, info: any) => void;
  onDragEnd: (card: CardData, info: any) => void;
  onRotate: (card: CardData) => void;
  onRefill: () => void;
  onRecallAll: () => void;
  getCardCost: (index: number) => number;
  canAffordCard: (index: number) => boolean;
  currency: string;
}

export const Hand: React.FC<HandProps> = ({ 
  cards, 
  draggingCardId,
  preview,
  currentPhase,
  onDragStart, 
  onDrag, 
  onDragEnd, 
  onRotate, 
  onRefill,
  onRecallAll,
  getCardCost,
  canAffordCard,
  currency
}) => {
  return (
    <div className="w-full p-4 bg-slate-900/80 backdrop-blur-md border-t border-slate-800 flex flex-col items-center gap-2 z-50">
      <div className="flex items-center gap-4">
        <h3 className="text-slate-500 font-mono text-[10px] uppercase tracking-widest">Public Market</h3>
      </div>
      
      <div className="w-full overflow-x-auto scrollbar-hide py-2">
        <div className="flex gap-6 h-[160px] items-center px-4 min-w-max mx-auto">
          {cards.map((card, index) => {
            const cost = getCardCost(index);
            const canAfford = canAffordCard(index);
            
            return (
              <div key={card.id} className="relative flex flex-col items-center gap-2">
                <div className={cn(
                  "transition-all duration-300",
                  !canAfford && "opacity-40 grayscale pointer-events-none"
                )}>
                  <GameCard 
                    card={card} 
                    currentPhase={currentPhase}
                    isDraggable={canAfford} 
                    isHidden={draggingCardId === card.id && !!preview}
                    onDragStart={(_, info) => onDragStart(card, info)}
                    onDrag={(_, info) => onDrag(card, info)}
                    onDragEnd={(_, info) => onDragEnd(card, info)}
                    onRotate={() => onRotate(card)}
                  />
                </div>
                
                {cost > 0 ? (
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 shadow-lg",
                    canAfford 
                      ? "bg-amber-500/20 border-amber-500/50 text-amber-400" 
                      : "bg-red-500/20 border-red-500/50 text-red-400"
                  )}>
                    <Scale className="w-2.5 h-2.5" />
                    {cost} {currency}
                  </div>
                ) : (
                  <div className="px-2 py-0.5 rounded-full text-[10px] font-black border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-lg">
                    FREE
                  </div>
                )}
              </div>
            );
          })}
          {cards.length === 0 && (
            <div className="w-full text-center text-slate-500 italic text-sm py-12">Market is empty.</div>
          )}
        </div>
      </div>
    </div>
  );
};
