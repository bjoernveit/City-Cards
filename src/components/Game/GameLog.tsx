import React, { useState } from 'react';
import { LogEntry } from '../../gameUtils';
import { ScrollText, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface GameLogProps {
  logs: LogEntry[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Reverse logs to show newest first
  const displayLogs = [...logs].reverse();

  return (
    <div className="fixed bottom-12 right-4 z-50 flex flex-col items-end gap-2 pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl w-80 max-h-[400px] shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
          >
            <div className="p-3 border-bottom border-slate-800 bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">Game Log</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{logs.length} entries</span>
            </div>
            
            <div className="overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {displayLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-xs italic">
                  No events recorded yet...
                </div>
              ) : (
                displayLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className={cn(
                      "p-2 rounded border text-[11px] leading-tight transition-colors",
                      log.type === 'production' ? "bg-blue-950/20 border-blue-900/30 text-blue-200" :
                      log.type === 'conversion' ? "bg-green-950/20 border-green-900/30 text-green-200" :
                      "bg-slate-950/40 border-slate-800 text-slate-400"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1 opacity-60 font-mono text-[9px]">
                      <span>P{log.phase} R{log.round} - {log.turnType}</span>
                    </div>
                    <div className="font-medium">{log.message}</div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "bg-slate-900 border border-slate-700 p-3 rounded-full shadow-xl pointer-events-auto transition-all hover:scale-110 active:scale-95 group",
          isOpen ? "bg-blue-600 border-blue-500 text-white" : "text-slate-400 hover:text-blue-400"
        )}
      >
        {isOpen ? <ChevronDown className="w-5 h-5" /> : <ScrollText className="w-5 h-5" />}
        {!isOpen && logs.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-slate-900">
            {logs.length > 99 ? '99+' : logs.length}
          </span>
        )}
      </button>
    </div>
  );
};
