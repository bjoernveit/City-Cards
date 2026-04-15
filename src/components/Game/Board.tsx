import React from 'react';
import { BoardGrid, CardData } from '@/src/types';
import { ElementIcon } from './ElementIcon';
import { GameCard } from './Card';
import { cn } from '@/lib/utils';
import { CARD_COLS, CARD_ROWS } from '@/src/constants';

export interface PreviewData {
  x: number;
  y: number;
  card: CardData;
  isValid: boolean;
}

interface BoardProps {
  grid: BoardGrid;
  cellSize: number;
  preview?: PreviewData | null;
  pendingPlacement?: PreviewData | null;
  draggingCardId?: string | null;
  gridRef?: React.RefObject<HTMLDivElement | null>;
  onRotate?: (card: CardData) => void;
  onDragStart?: (card: CardData, info: any) => void;
  onDrag?: (card: CardData, info: any) => void;
  onDragEnd?: (card: CardData, info: any) => void;
}

export const Board: React.FC<BoardProps> = ({ 
  grid, 
  cellSize, 
  preview, 
  pendingPlacement,
  draggingCardId,
  gridRef, 
  onRotate,
  onDragStart,
  onDrag,
  onDragEnd
}) => {
  // Find the bounds of the grid to center it or at least show everything
  const keys = Object.keys(grid);
  const coords = keys.map(k => k.split(',').map(Number));
  
  const minX = coords.length > 0 ? Math.min(...coords.map(c => c[0])) - 6 : -10;
  const maxX = coords.length > 0 ? Math.max(...coords.map(c => c[0])) + 6 : 10;
  const minY = coords.length > 0 ? Math.min(...coords.map(c => c[1])) - 6 : -10;
  const maxY = coords.length > 0 ? Math.max(...coords.map(c => c[1])) + 6 : 10;

  const rows = [];
  for (let y = minY; y <= maxY; y++) {
    const cols = [];
    for (let x = minX; x <= maxX; x++) {
      const element = grid[`${x},${y}`];
      cols.push(
        <div 
          key={`${x},${y}`}
          className={cn(
            "border border-slate-800/20 flex items-center justify-center transition-colors",
            element ? "bg-slate-800/80 shadow-inner" : "bg-transparent"
          )}
          style={{ width: cellSize, height: cellSize }}
        >
          {element && <ElementIcon type={element.type} className="w-1/2 h-1/2 opacity-80" />}
        </div>
      );
    }
    rows.push(<div key={y} className="flex">{cols}</div>);
  }

  const activePlacement = preview || (pendingPlacement && draggingCardId !== pendingPlacement.card.id ? pendingPlacement : null);

  return (
    <div className="relative overflow-auto bg-slate-950 rounded-xl border-4 border-slate-900 shadow-2xl p-4 md:p-8 min-h-[500px] md:min-h-[600px] w-full h-full flex items-center justify-center">
      <div 
        ref={gridRef}
        className="inline-block border border-slate-800/50 relative"
      >
        {rows}
        {activePlacement && (
          <div 
            className="absolute pointer-events-none transition-all duration-75 flex items-center justify-center"
            style={{
              left: (activePlacement.x - minX) * cellSize,
              top: (activePlacement.y - minY) * cellSize,
              width: (activePlacement.card.rotation === 90 || activePlacement.card.rotation === 270) ? CARD_ROWS * cellSize : CARD_COLS * cellSize,
              height: (activePlacement.card.rotation === 90 || activePlacement.card.rotation === 270) ? CARD_COLS * cellSize : CARD_ROWS * cellSize,
              zIndex: 50,
            }}
          >
             <div className={cn(
               "w-full h-full rounded-lg border-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center",
               draggingCardId !== activePlacement.card.id && "pointer-events-auto",
               activePlacement.isValid ? "border-emerald-500/80 shadow-emerald-500/20" : "border-red-500/80 shadow-red-500/20"
             )}>
                <GameCard 
                  card={activePlacement.card} 
                  isDraggable={draggingCardId !== activePlacement.card.id} 
                  onDragStart={(_, info) => onDragStart?.(activePlacement.card, info)}
                  onDrag={(_, info) => onDrag?.(activePlacement.card, info)}
                  onDragEnd={(_, info) => onDragEnd?.(activePlacement.card, info)}
                  onRotate={() => onRotate?.(activePlacement.card)}
                  className="opacity-90" 
                />
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
