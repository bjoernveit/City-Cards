import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardData } from '@/src/types';
import { ElementIcon } from './ElementIcon';
import { cn } from '@/lib/utils';
import { CELL_SIZE, CARD_COLS, CARD_ROWS } from '@/src/constants';
import { RotateCw } from 'lucide-react';

interface CardProps {
  card: CardData;
  isDraggable?: boolean;
  onDragStart?: (event: any, info: any) => void;
  onDrag?: (event: any, info: any) => void;
  onDragEnd?: (event: any, info: any) => void;
  onRotate?: () => void;
  className?: string;
  style?: React.CSSProperties;
  isHidden?: boolean;
}

export const GameCard: React.FC<CardProps> = ({ 
  card, 
  isDraggable = false, 
  onDragStart,
  onDrag,
  onDragEnd,
  onRotate,
  className,
  style,
  isHidden = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onRotate) {
      e.preventDefault();
      e.stopPropagation();
      onRotate();
    }
  };

  const width = CARD_COLS * CELL_SIZE;
  const height = CARD_ROWS * CELL_SIZE;

  const showIndicator = isHovered || isDragging;

  return (
    <motion.div
      drag={isDraggable}
      dragMomentum={false}
      dragSnapToOrigin={true}
      onDragStart={(e, info) => {
        setIsDragging(true);
        onDragStart?.(e, info);
      }}
      onDrag={onDrag}
      onDragEnd={(e, info) => {
        setIsDragging(false);
        onDragEnd?.(e, info);
      }}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ 
        rotate: card.rotation,
        opacity: isHidden ? 0 : 1,
        borderColor: showIndicator ? 'rgb(148, 163, 184)' : 'rgb(51, 65, 85)', // slate-400 vs slate-700
        boxShadow: showIndicator ? '0 0 15px rgba(148, 163, 184, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        transition: { type: 'spring', stiffness: 300, damping: 25 }
      }}
      whileHover={isDraggable ? { scale: 1.05, zIndex: 50 } : {}}
      whileDrag={{ scale: 1.1, zIndex: 100, opacity: 0.8 }}
      className={cn(
        "relative grid grid-cols-2 grid-rows-3 gap-1 p-1 bg-slate-800 border-2 rounded-lg cursor-grab active:cursor-grabbing overflow-hidden shrink-0",
        !isDraggable && "cursor-default",
        className
      )}
      style={{
        width,
        height,
        ...style
      }}
    >
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute top-1 right-1 z-10 bg-slate-900/80 rounded-full p-1 border border-slate-700 shadow-sm"
          >
            <motion.div animate={{ rotate: -card.rotation }}>
              <RotateCw className="w-3 h-3 text-slate-300" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {card.elements.flat().map((element, i) => (
        <div 
          key={i}
          className="flex items-center justify-center bg-slate-900/50 rounded border border-slate-700/30"
        >
          <motion.div animate={{ rotate: -card.rotation }}>
            <ElementIcon type={element.type} className="w-6 h-6" />
          </motion.div>
        </div>
      ))}
    </motion.div>
  );
};
