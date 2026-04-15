import React from 'react';
import { GameStats, getTurnsInRound, getPhaseCurrency } from '@/src/gameUtils';
import { ElementIcon } from './ElementIcon';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Scale } from 'lucide-react';

interface StatsDisplayProps {
  currentStats: GameStats;
  previewStats?: GameStats | null;
}

export const StatsDisplay: React.FC<StatsDisplayProps> = ({ currentStats, previewStats }) => {
  const renderDiff = (curr: number, prev: number | undefined) => {
    if (prev === undefined || prev === null || curr === prev) return null;
    const diff = prev - curr;
    return (
      <span className={cn(
        "text-[10px] font-bold flex items-center",
        diff > 0 ? "text-emerald-400" : "text-red-400"
      )}>
        {diff > 0 ? <ArrowUp className="w-2 h-2" /> : <ArrowDown className="w-2 h-2" />}
        {Math.abs(diff)}
      </span>
    );
  };

  const cityData = currentStats?.cityProduction;
  const cityPreview = previewStats?.cityProduction;

  if (!cityData) return null;

  const turns = getTurnsInRound(currentStats.phase);
  const currentTurnIndex = turns.indexOf(currentStats.currentTurnType) + 1;
  const currentCurrency = getPhaseCurrency(currentStats.phase);

  const getTurnColor = (type: string) => {
    switch (type) {
      case 'steel': return 'text-blue-400';
      case 'bricks': return 'text-red-600';
      case 'wood': return 'text-emerald-500';
      case 'points': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getTurnBg = (type: string) => {
    switch (type) {
      case 'steel': return 'border-blue-500/30 ring-blue-500/10';
      case 'bricks': return 'border-red-600/30 ring-red-600/10';
      case 'wood': return 'border-emerald-500/30 ring-emerald-500/10';
      case 'points': return 'border-green-500/30 ring-green-500/10';
      default: return 'border-slate-700 ring-slate-500/10';
    }
  };

  return (
    <div className="fixed top-[72px] md:top-20 left-4 right-4 md:right-auto z-40 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible scrollbar-hide pointer-events-none">
      {/* Game Progress */}
      <div className={cn(
        "bg-slate-900/95 backdrop-blur-md border rounded-lg p-2 flex items-center gap-3 shrink-0 shadow-xl pointer-events-auto ring-1 transition-all duration-500",
        getTurnBg(currentStats.currentTurnType)
      )}>
        <div className="bg-slate-950/50 p-2 rounded-md border border-slate-800 flex flex-col items-center min-w-[40px]">
          <span className="text-[10px] font-bold text-blue-400">P{currentStats.phase}</span>
          <span className="text-[8px] font-mono text-slate-500">R{currentStats.round}</span>
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between items-center gap-4">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Turn {currentTurnIndex}/{turns.length}</span>
            <span className={cn("text-[10px] font-mono font-bold uppercase", getTurnColor(currentStats.currentTurnType))}>
              {currentStats.currentTurnType}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-black uppercase tracking-tight", getTurnColor(currentStats.currentTurnType))}>
              {currentStats.currentTurnType === 'points' ? 'Point Conversion' : `${currentStats.currentTurnType} Production`}
            </span>
          </div>
        </div>
      </div>

      {/* City Production Balance */}
      <div className={cn(
        "bg-slate-900/95 backdrop-blur-md border rounded-lg p-2 flex items-center gap-3 shrink-0 shadow-xl pointer-events-auto ring-1 transition-all duration-500",
        currentStats.currentTurnType === 'points' ? "border-green-500/50 ring-green-500/20" : "border-slate-700 ring-green-500/10"
      )}>
        <div className="bg-green-950/50 p-2 rounded-md border border-green-900/50">
          <Scale className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex flex-col">
          <div className="flex justify-between items-center gap-4">
            <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Capacity</span>
            <span className="text-[10px] text-green-500/80 uppercase font-mono tracking-wider">Total Points</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-200 tracking-tighter">
                {cityPreview ? cityPreview.total : cityData.total}
              </span>
              {renderDiff(cityData.total, cityPreview?.total)}
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-green-400 tracking-tighter drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]">
                {cityData.points}
              </span>
            </div>
          </div>
          <div className="flex gap-2 mt-0.5">
            <div className="flex items-center gap-1 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800">
              <ElementIcon type="city" className="w-2.5 h-2.5" />
              <span className="text-[10px] font-mono text-slate-400">{cityPreview ? cityPreview.city : cityData.city}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800">
              <ElementIcon type="nature" className="w-2.5 h-2.5" />
              <span className="text-[10px] font-mono text-slate-400">{cityPreview ? cityPreview.nature : cityData.nature}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Resources */}
      {(Object.entries(currentStats.resources) as [string, { production: number; stock: number }][]).map(([type, data]) => {
        const previewData = previewStats?.resources[type];
        const value = data.production;
        const previewValue = previewData?.production;
        
        const isOutdated = (currentStats.phase === 2 && type === 'wood') || 
                          (currentStats.phase === 3 && (type === 'wood' || type === 'bricks'));
        
        const isCurrentCurrency = type === currentCurrency;
        const isCurrentTurn = type === currentStats.currentTurnType;
        const turnColor = getTurnColor(type);

        return (
          <div 
            key={type} 
            className={cn(
              "bg-slate-900/90 backdrop-blur-md border rounded-lg p-2 flex items-center gap-2 md:gap-3 shrink-0 shadow-lg pointer-events-auto transition-all duration-300",
              isOutdated ? "opacity-30 grayscale border-slate-800" : "border-slate-800",
              isCurrentTurn && !isOutdated && cn("ring-2 border-opacity-100", getTurnBg(type).split(' ')[0]),
              isCurrentCurrency && !isOutdated && !isCurrentTurn && "ring-1 ring-amber-500/30 border-amber-500/30 bg-amber-950/5"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-md border",
              isCurrentTurn ? getTurnBg(type).split(' ')[0].replace('border-', 'border-').replace('/30', '/50') : 
              isCurrentCurrency ? "bg-amber-950/50 border-amber-900/50" : "bg-slate-950 border-slate-800"
            )}>
              <ElementIcon type={type} className={cn("w-4 h-4", isCurrentTurn ? turnColor : isCurrentCurrency ? "text-amber-400" : "")} />
            </div>
            <div className="flex flex-col pr-1">
              <div className="flex justify-between items-center gap-2">
                <span className={cn(
                  "text-[9px] uppercase font-mono tracking-tighter whitespace-nowrap",
                  isCurrentTurn ? cn(turnColor, "font-black") : isCurrentCurrency ? "text-amber-500 font-bold" : turnColor
                )}>
                  {type} {isCurrentCurrency && "★"}
                </span>
                <span className="text-[9px] text-slate-400/60 uppercase font-mono tracking-tighter whitespace-nowrap">Stock</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-200">
                    {previewValue !== undefined ? previewValue : value}
                  </span>
                  {renderDiff(value, previewValue)}
                </div>
                <div className="h-3 w-px bg-slate-800" />
                <span className="text-sm font-bold text-slate-500">
                  {data.stock}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
