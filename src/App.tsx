/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Board, PreviewData } from './components/Game/Board';
import { Hand } from './components/Game/Hand';
import { StatsDisplay } from './components/Game/StatsDisplay';
import { ElementIcon } from './components/Game/ElementIcon';
import { GameLog } from './components/Game/GameLog';
import { HelpMenu } from './components/Game/HelpMenu';
import { GameConfig, CardData, BoardGrid, ElementType, GameSession, LeaderboardEntry } from './types';
import { generateCard, canPlaceCard, getBoardGridAfterPlacement, calculateStats, GameStats, createStartingCard, getPhaseCurrency, getTurnsInRound, LogEntry } from './gameUtils';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CELL_SIZE, CARD_COLS, CARD_ROWS } from './constants';
import { Check, X, Undo2, RotateCcw, Scale, HelpCircle, ChevronLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lobby } from './components/Game/Lobby';

const DEFAULT_CONFIG: GameConfig = {
  marketSize: 3,
  elementTypes: ['city', 'nature', 'wood', 'bricks', 'steel', 'desert'],
  overlapRequired: 2,
};

const SESSIONS_STORAGE_KEY = 'city-cards-sessions-v1';
const LEADERBOARD_STORAGE_KEY = 'city-cards-leaderboard-v1';
const PLAYER_NAME_KEY = 'city-cards-player-name-v1';

export default function App() {
  // Session Management
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerName, setPlayerName] = useState<string>("Architect");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Current Game State (loaded from active session)
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [hand, setHand] = useState<CardData[]>([]);
  const [boardGrid, setBoardGrid] = useState<BoardGrid>({});
  const [stats, setStats] = useState<GameStats>(() => calculateStats({}, DEFAULT_CONFIG.elementTypes));
  const [isGameOver, setIsGameOver] = useState(false);
  
  // Undo History
  const [history, setHistory] = useState<Array<{
    boardGrid: BoardGrid;
    hand: CardData[];
    stats: GameStats;
  }>>([]);

  // Initialize Sessions and Leaderboard from LocalStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem(SESSIONS_STORAGE_KEY);
    if (savedSessions) {
      try {
        setSessions(JSON.parse(savedSessions));
      } catch (e) {
        console.error("Failed to load sessions", e);
      }
    }

    const savedLeaderboard = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (savedLeaderboard) {
      try {
        setLeaderboard(JSON.parse(savedLeaderboard));
      } catch (e) {
        console.error("Failed to load leaderboard", e);
      }
    }

    const savedPlayerName = localStorage.getItem(PLAYER_NAME_KEY);
    if (savedPlayerName) {
      setPlayerName(savedPlayerName);
    }

    setIsLoaded(true);
  }, []);

  // Sync Current State back to Sessions
  useEffect(() => {
    if (!isLoaded || !activeSessionId) return;

    setSessions(prev => {
      const updated = prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            lastPlayed: Date.now(),
            isGameOver,
            state: {
              boardGrid,
              hand,
              stats,
              config
            }
          };
        }
        return s;
      });
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [boardGrid, hand, stats, config, isGameOver, activeSessionId, isLoaded]);

  // Session Handlers
  const startNewGame = () => {
    const startCard = createStartingCard();
    const initialBoard = getBoardGridAfterPlacement(startCard, 0, 0, {});
    const initialStats = calculateStats(initialBoard, DEFAULT_CONFIG.elementTypes);
    initialStats.logs = [{
      id: 'start',
      phase: 1,
      round: 1,
      turnType: 'system',
      type: 'system',
      message: 'Project initiated. Phase 1 structural foundation set.'
    }];

    const newId = Math.random().toString(36).substring(2, 11);
    const newSession: GameSession = {
      id: newId,
      name: `City Project ${sessions.length + 1}`,
      lastPlayed: Date.now(),
      isGameOver: false,
      state: {
        boardGrid: initialBoard,
        hand: Array.from({ length: DEFAULT_CONFIG.marketSize }, () => generateCard(DEFAULT_CONFIG.elementTypes)),
        stats: initialStats,
        config: DEFAULT_CONFIG
      }
    };

    setSessions(prev => [newSession, ...prev]);
    loadSession(newSession);
  };

  const loadSession = (session: GameSession) => {
    setBoardGrid(session.state.boardGrid);
    setHand(session.state.hand);
    setStats(session.state.stats);
    setConfig(session.state.config);
    setIsGameOver(session.isGameOver);
    setActiveSessionId(session.id);
    setHistory([]); // Reset history on session load
  };

  const deleteSession = (id: string) => {
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id);
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(filtered));
      return filtered;
    });
    if (activeSessionId === id) setActiveSessionId(null);
  };

  const goBackToLobby = () => {
    setActiveSessionId(null);
  };

  const handleUpdatePlayerName = (name: string) => {
    setPlayerName(name);
    localStorage.setItem(PLAYER_NAME_KEY, name);
  };

  const undoLastMove = () => {
    if (history.length === 0) return;
    
    const lastState = history[history.length - 1];
    setBoardGrid(lastState.boardGrid);
    setHand(lastState.hand);
    setStats(lastState.stats);
    setHistory(prev => prev.slice(0, -1));
    
    toast.info("Move undone");
  };

  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [pendingPlacement, setPendingPlacement] = useState<PreviewData | null>(null);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [marketIndex, setMarketIndex] = useState<number | null>(null);
  const [previewStats, setPreviewStats] = useState<GameStats | null>(null);
  const [isPointConversionOpen, setIsPointConversionOpen] = useState(false);
  const [pointsToConvert, setPointsToConvert] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  const boardRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        console.log('Escape pressed - recalling all');
        recallAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [pendingPlacement, preview, draggingCardId, hand]);

  // Refill market automatically
  useEffect(() => {
    if (!isLoaded) return;
    const currentMarketSize = (stats.phase === 1 && stats.round === 1) ? 3 : 4;
    if (hand.length < currentMarketSize && !pendingPlacement && !draggingCardId) {
      refillHand();
    }
  }, [hand.length, stats.round, stats.phase, pendingPlacement, draggingCardId, isLoaded]);

  const refillHand = () => {
    setHand(prev => {
      const currentMarketSize = (stats.phase === 1 && stats.round === 1) ? 3 : 4;
      const currentHandCount = prev.length + (pendingPlacement ? 1 : 0);
      const needed = currentMarketSize - currentHandCount;
      if (needed <= 0) return prev;
      
      const newCards = Array.from({ length: needed }, () => generateCard(config.elementTypes));
      return [...prev, ...newCards];
    });
  };

  const getCardCost = (index: number) => {
    if (stats.phase === 1 && stats.round === 1) return 0;
    if (index === 0) return 2;
    if (index === 1) return 1;
    return 0;
  };

  const canAffordCard = (index: number) => {
    const cost = getCardCost(index);
    if (cost === 0) return true;
    const currency = getPhaseCurrency(stats.phase);
    return stats.resources[currency].stock >= cost;
  };

  const restartGame = () => {
    const startCard = createStartingCard();
    const initialBoard = getBoardGridAfterPlacement(startCard, 0, 0, {});
    setBoardGrid(initialBoard);
    setPendingPlacement(null);
    setPreview(null);
    setPreviewStats(null);
    setDraggingCardId(null);
    
    // Reset stats to initial state
    const initialStats = calculateStats(initialBoard, config.elementTypes);
    initialStats.logs = [{
      id: 'start',
      phase: 1,
      round: 1,
      turnType: 'system',
      type: 'system',
      message: 'Development reset. Starting fresh city plan.'
    }];
    setStats(initialStats);
    
    setIsGameOver(false);
    setIsPointConversionOpen(false);
    setMarketIndex(null);
    
    // Generate fresh market
    const newHand = Array.from({ length: config.marketSize }, () => generateCard(config.elementTypes));
    setHand(newHand);
    
    toast.success("Project reset!");
  };

  const getGridCoords = (card: CardData, info: any) => {
    const gridElement = gridRef.current;
    if (!gridElement) return null;

    const rect = gridElement.getBoundingClientRect();
    
    // Calculate position relative to the grid container's top-left
    const relativeX = info.point.x - rect.left;
    const relativeY = info.point.y - rect.top;

    // Adjust for the card's half-width and half-height (centered on cursor)
    const isRotated = card.rotation === 90 || card.rotation === 270;
    const cardWidth = isRotated ? CARD_ROWS * CELL_SIZE : CARD_COLS * CELL_SIZE;
    const cardHeight = isRotated ? CARD_COLS * CELL_SIZE : CARD_ROWS * CELL_SIZE;
    
    const topLeftX = relativeX - cardWidth / 2;
    const topLeftY = relativeY - cardHeight / 2;

    // We need to account for the minX/minY offset of the grid rows
    // The grid container (gridRef) starts at (minX, minY)
    // Find the bounds of the grid to get the offset
    const keys = Object.keys(boardGrid);
    const coords = keys.map(k => k.split(',').map(Number));
    const minX = coords.length > 0 ? Math.min(...coords.map(c => c[0])) - 6 : -10;
    const minY = coords.length > 0 ? Math.min(...coords.map(c => c[1])) - 6 : -10;

    const gridX = Math.round(topLeftX / CELL_SIZE) + minX;
    const gridY = Math.round(topLeftY / CELL_SIZE) + minY;

    return { x: gridX, y: gridY };
  };

  const handleDragStart = (card: CardData) => {
    console.log('Drag Start:', card.id);
    
    // If we are dragging a NEW card from hand, and there's a pending placement,
    // we should cancel the pending one first.
    if (pendingPlacement && pendingPlacement.card.id !== card.id) {
      console.log('Canceling pending placement due to new drag from hand');
      setHand(prev => {
        const newHand = [...prev];
        if (marketIndex !== null && marketIndex <= newHand.length) {
          newHand.splice(marketIndex, 0, pendingPlacement.card);
          return newHand;
        }
        return [pendingPlacement.card, ...prev];
      });
      setPendingPlacement(null);
      setMarketIndex(null);
    }
    
    const index = hand.findIndex(c => c.id === card.id);
    if (index !== -1) {
      if (!canAffordCard(index)) {
        toast.error(`Not enough resources! Costs ${getCardCost(index)} ${getPhaseCurrency(stats.phase)}`);
        return;
      }
      setMarketIndex(index);
    }

    setDraggingCardId(card.id);
    setPreview(null);
  };

  const handleDrag = (card: CardData, info: any) => {
    const coords = getGridCoords(card, info);
    if (!coords) {
      if (preview) setPreview(null);
      if (previewStats) setPreviewStats(null);
      return;
    }

    const isValid = canPlaceCard(card, coords.x, coords.y, boardGrid, config.overlapRequired);
    setPreview({ x: coords.x, y: coords.y, card, isValid });

    if (isValid) {
      const potentialBoard = getBoardGridAfterPlacement(card, coords.x, coords.y, boardGrid);
      setPreviewStats(calculateStats(potentialBoard, config.elementTypes, stats));
    } else {
      setPreviewStats(null);
    }
  };

  const handleDragEnd = (card: CardData, info: any) => {
    console.log('Drag End:', card.id);
    const coords = getGridCoords(card, info);
    
    // Always clear these immediately
    setPreview(null);
    setPreviewStats(null);
    setDraggingCardId(null);

    if (!coords) {
      console.log('Drag ended outside grid - returning to hand');
      // If it was a pending placement, it's already out of hand, so add it back
      // If it was from hand, it's already in hand (hidden), so just clearing draggingCardId shows it again
      if (pendingPlacement && pendingPlacement.card.id === card.id) {
        setHand(prev => {
          const newHand = [...prev];
          if (marketIndex !== null && marketIndex <= newHand.length) {
            newHand.splice(marketIndex, 0, pendingPlacement.card);
            return newHand;
          }
          return [pendingPlacement.card, ...prev];
        });
        setPendingPlacement(null);
        setMarketIndex(null);
      }
      return;
    }

    const isValid = canPlaceCard(card, coords.x, coords.y, boardGrid, config.overlapRequired);
    if (isValid) {
      console.log('Valid placement at:', coords.x, coords.y);
      setPendingPlacement({ x: coords.x, y: coords.y, card, isValid: true });
      // Remove from hand if it was there
      setHand(prev => prev.filter(c => c.id !== card.id));
    } else {
      console.log('Invalid placement attempt - returning to hand');
      toast.error(`Invalid placement! Need at least ${config.overlapRequired} overlaps.`);
      // Return to hand if it was pending
      if (pendingPlacement && pendingPlacement.card.id === card.id) {
        setHand(prev => {
          const newHand = [...prev];
          if (marketIndex !== null && marketIndex <= newHand.length) {
            newHand.splice(marketIndex, 0, pendingPlacement.card);
            return newHand;
          }
          return [pendingPlacement.card, ...prev];
        });
        setPendingPlacement(null);
        setMarketIndex(null);
      }
    }
  };

  const handleRotate = (card: CardData) => {
    console.log('Rotate:', card.id);
    
    // Update pending placement if applicable
    if (pendingPlacement && pendingPlacement.card.id === card.id) {
      const newRotation = (pendingPlacement.card.rotation + 90) % 360;
      const rotatedCard = { ...pendingPlacement.card, rotation: newRotation };
      const isValid = canPlaceCard(rotatedCard, pendingPlacement.x, pendingPlacement.y, boardGrid, config.overlapRequired);
      console.log('Rotating pending card. New validity:', isValid);
      setPendingPlacement({
        ...pendingPlacement,
        card: rotatedCard,
        isValid
      });
      return;
    }

    // Update hand
    setHand(prev => prev.map(c => 
      c.id === card.id 
        ? { ...c, rotation: (c.rotation + 90) % 360 } 
        : c
    ));

    // Sync preview if we are dragging this card
    if (draggingCardId === card.id && preview) {
      const newRotation = (preview.card.rotation + 90) % 360;
      const rotatedCard = { ...preview.card, rotation: newRotation };
      const isValid = canPlaceCard(rotatedCard, preview.x, preview.y, boardGrid, config.overlapRequired);
      setPreview({ ...preview, card: rotatedCard, isValid });
      
      if (isValid) {
        const potentialBoard = getBoardGridAfterPlacement(rotatedCard, preview.x, preview.y, boardGrid);
        setPreviewStats(calculateStats(potentialBoard, config.elementTypes, stats));
      } else {
        setPreviewStats(null);
      }
    }
  };

  const approvePlacement = () => {
    if (!pendingPlacement) return;
    console.log('Approving placement:', pendingPlacement.card.id);
    
    // Deduct cost
    if (marketIndex !== null) {
      const cost = getCardCost(marketIndex);
      if (cost > 0) {
        const currency = getPhaseCurrency(stats.phase);
        setStats(prev => ({
          ...prev,
          resources: {
            ...prev.resources,
            [currency]: {
              ...prev.resources[currency],
              stock: prev.resources[currency].stock - cost
            }
          }
        }));
      }
    }

    const newBoard = getBoardGridAfterPlacement(pendingPlacement.card, pendingPlacement.x, pendingPlacement.y, boardGrid);
    
    // Save to history before updating state
    const previousHand = [...hand];
    if (marketIndex !== null && marketIndex <= previousHand.length) {
      previousHand.splice(marketIndex, 0, pendingPlacement.card);
    }
    
    setHistory(prev => [...prev, {
      boardGrid: { ...boardGrid },
      hand: previousHand,
      stats: { ...stats }
    }].slice(-10)); // Keep last 10 moves

    setBoardGrid(newBoard);
    setPendingPlacement(null);
    setMarketIndex(null);
    
    // Process the production/conversion phase of the turn
    processTurn(newBoard);
  };

  const processTurn = (currentBoard: BoardGrid) => {
    const currentTurnType = stats.currentTurnType;
    const newStats = calculateStats(currentBoard, config.elementTypes, stats);

    // Simulate opponent: Remove a random card from the market
    setHand(prevHand => {
      if (prevHand.length === 0) return prevHand;
      const randomIndex = Math.floor(Math.random() * prevHand.length);
      const newHand = [...prevHand];
      newHand.splice(randomIndex, 1);

      // Refill logic
      const currentMarketSize = (newStats.phase === 1 && newStats.round === 1) ? 3 : 4;
      const needed = currentMarketSize - newHand.length;
      const newCards = Array.from({ length: Math.max(0, needed) }, () => generateCard(config.elementTypes));
      return [...newHand, ...newCards];
    });

    if (currentTurnType === 'points') {
      // Points turn: Open point conversion UI
      setIsPointConversionOpen(true);
      setPointsToConvert(0);
      setStats(newStats);
    } else {
      // Resource production
      const production = newStats.resources[currentTurnType].production;
      newStats.resources[currentTurnType].stock += production;

      const logEntry = {
        id: Math.random().toString(36).substr(2, 9),
        phase: stats.phase,
        round: stats.round,
        turnType: currentTurnType,
        type: 'production' as const,
        message: `Produced ${production} ${currentTurnType} (Patch size: ${production})`
      };

      newStats.logs = [...newStats.logs, logEntry];
      toast.info(`Produced ${production} ${currentTurnType}!`);

      setStats(getNextGameState(newStats));
    }
  };

  const getNextGameState = (updatedStats: GameStats): GameStats => {
    const turns = getTurnsInRound(updatedStats.phase);
    const currentTurnIndex = turns.indexOf(updatedStats.currentTurnType);
    
    let nextPhase = updatedStats.phase;
    let nextRound = updatedStats.round;
    let nextTurnType: 'steel' | 'bricks' | 'wood' | 'points';

    if (currentTurnIndex < turns.length - 1) {
      // Next turn in same round
      nextTurnType = turns[currentTurnIndex + 1];
    } else {
      // Next round
      if (updatedStats.round < 3) {
        nextRound = updatedStats.round + 1;
        nextTurnType = getTurnsInRound(nextPhase)[0];
        toast.success(`Round ${nextRound} begins!`);
      } else {
        // Next phase
        if (updatedStats.phase < 3) {
          nextPhase = updatedStats.phase + 1;
          nextRound = 1;
          nextTurnType = getTurnsInRound(nextPhase)[0];
          toast.success(`Phase ${nextPhase} begins!`);
        } else {
          // Game Over - Record Highscore
          setIsGameOver(true);
          
          if (activeSessionId) {
            const currentSession = sessions.find(s => s.id === activeSessionId);
            const score = updatedStats.cityProduction.points;
            
            const newEntry: LeaderboardEntry = {
              id: Math.random().toString(36).substring(2, 11),
              sessionId: activeSessionId,
              cityName: currentSession?.name || "Unknown City",
              playerName: playerName,
              score: score,
              date: Date.now()
            };

            setLeaderboard(prev => {
              const updated = [...prev, newEntry]
                .sort((a, b) => b.score - a.score)
                .slice(0, 10); // Keep top 10
              localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(updated));
              return updated;
            });
          }

          return { ...updatedStats, currentTurnType: 'points' };
        }
      }
    }

    return {
      ...updatedStats,
      phase: nextPhase,
      round: nextRound,
      currentTurnType: nextTurnType
    };
  };

  const handleConvertPoints = () => {
    const currency = getPhaseCurrency(stats.phase);
    const stock = stats.resources[currency].stock;
    const capacity = stats.cityProduction.total;
    const maxPossible = Math.min(stock, capacity);
    const actualPoints = Math.min(pointsToConvert, maxPossible);

    const updatedStats: GameStats = { 
      ...stats,
      resources: {
        ...stats.resources,
        [currency]: {
          ...stats.resources[currency],
          stock: stock - actualPoints
        }
      },
      cityProduction: {
        ...stats.cityProduction,
        points: stats.cityProduction.points + actualPoints
      }
    };
    
    const logEntry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      phase: stats.phase,
      round: stats.round,
      turnType: 'points',
      type: 'conversion',
      message: `Converted ${actualPoints} ${currency} to ${actualPoints} Points (Capacity used: ${actualPoints}/${capacity})`
    };
    
    updatedStats.logs = [...updatedStats.logs, logEntry];
    toast.success(`Converted ${actualPoints} ${currency} to points!`);
    setIsPointConversionOpen(false);
    setStats(getNextGameState(updatedStats));
  };

  const skipConversion = () => {
    setIsPointConversionOpen(false);
    const logEntry = {
      id: Math.random().toString(36).substr(2, 9),
      phase: stats.phase,
      round: stats.round,
      turnType: 'points',
      type: 'system' as const,
      message: `Skipped point conversion`
    };
    const updatedStats = { ...stats, logs: [...stats.logs, logEntry] };
    setStats(getNextGameState(updatedStats));
  };

  const cancelPlacement = () => {
    if (!pendingPlacement) return;
    console.log('Canceling placement:', pendingPlacement.card.id);
    setHand(prev => {
      const newHand = [...prev];
      if (marketIndex !== null && marketIndex <= newHand.length) {
        newHand.splice(marketIndex, 0, pendingPlacement.card);
        return newHand;
      }
      return [pendingPlacement.card, ...prev];
    });
    setPendingPlacement(null);
    setMarketIndex(null);
  };

  const recallAll = () => {
    console.log('Recall All triggered');
    if (pendingPlacement) {
      setHand(prev => {
        // Only add back if not already in hand (prevent duplicates)
        if (prev.find(c => c.id === pendingPlacement.card.id)) return prev;
        
        // Put back in its original slot if possible
        const newHand = [...prev];
        if (marketIndex !== null && marketIndex <= newHand.length) {
          newHand.splice(marketIndex, 0, pendingPlacement.card);
          return newHand;
        }
        return [pendingPlacement.card, ...prev];
      });
      setPendingPlacement(null);
      setMarketIndex(null);
    }
    setPreview(null);
    setPreviewStats(null);
    setDraggingCardId(null);
    toast.info("Card recalled to market.");
  };

  if (!activeSessionId) {
    return (
      <Lobby 
        sessions={sessions} 
        leaderboard={leaderboard}
        playerName={playerName}
        onUpdatePlayerName={handleUpdatePlayerName}
        onStartNew={startNewGame} 
        onJoinSession={(id) => loadSession(sessions.find(s => s.id === id)!)}
        onDeleteSession={deleteSession}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <header className="shrink-0 p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <Button 
            onClick={goBackToLobby}
            variant="ghost" 
            size="sm"
            className="text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Lobby
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white leading-none">CITY <span className="text-slate-500">CARDS</span></h1>
            <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest leading-none mt-1">
              {sessions.find(s => s.id === activeSessionId)?.name}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsHelpOpen(true)}
            className="bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-blue-400 gap-2 h-8 md:h-9"
          >
            <HelpCircle className="w-3.5 h-3.5 md:w-4 h-4" />
            <span className="hidden sm:inline">How to Play</span>
            <span className="sm:hidden">Help</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={undoLastMove}
            disabled={history.length === 0}
            className="bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-amber-400 gap-2 h-8 md:h-9 disabled:opacity-30 disabled:hover:text-slate-400"
          >
            <Undo2 className="w-3.5 h-3.5 md:w-4 h-4" />
            <span className="hidden sm:inline">Undo Move</span>
            <span className="sm:hidden">Undo</span>
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={restartGame}
            className="bg-slate-900/50 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-red-400 gap-2 h-8 md:h-9"
          >
            <RotateCcw className="w-3.5 h-3.5 md:w-4 h-4" />
            <span className="hidden sm:inline">Restart Game</span>
            <span className="sm:hidden">Restart</span>
          </Button>

          <div className="text-right">
            <div className="text-[10px] md:text-xs text-slate-500 uppercase font-mono">Tiles</div>
            <div className="text-lg md:text-xl font-bold text-slate-300">{Object.keys(boardGrid).length}</div>
          </div>
        </div>
      </header>

      <StatsDisplay 
        currentStats={stats} 
        previewStats={previewStats || (pendingPlacement ? calculateStats(getBoardGridAfterPlacement(pendingPlacement.card, pendingPlacement.x, pendingPlacement.y, boardGrid), config.elementTypes) : null)}
      />

      <main 
        ref={boardRef}
        onContextMenu={(e) => {
          e.preventDefault();
          // DO NOT allow rotation via right-click during dragging as it causes browser race conditions
          // where the mouse-up event is consumed by the context menu logic, leading to detached drag states.
          if (draggingCardId) return;

          if (pendingPlacement) {
            handleRotate(pendingPlacement.card);
          }
        }}
        className="flex-1 relative overflow-auto p-4 md:p-10 cursor-crosshair scrollbar-hide"
      >
        <Board 
          grid={boardGrid} 
          cellSize={CELL_SIZE} 
          currentPhase={stats.phase}
          preview={preview}
          pendingPlacement={pendingPlacement}
          draggingCardId={draggingCardId}
          gridRef={gridRef} 
          onRotate={handleRotate}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
        />
        
        {/* Background Grid Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
          }}
        />

        {/* Pending Controls */}
        <AnimatePresence>
          {pendingPlacement && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-64 md:bottom-72 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-50"
            >
              <div className="flex gap-3">
                <Button onClick={approvePlacement} className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-900/20 px-8 py-6 text-lg font-bold">
                  <Check className="w-5 h-5" /> Approve Build
                </Button>
                <Button onClick={cancelPlacement} variant="destructive" className="gap-2 shadow-lg shadow-red-900/20 px-8 py-6 text-lg font-bold">
                  <Undo2 className="w-5 h-5" /> Pick Up
                </Button>
              </div>
              
              <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 flex items-center gap-2 text-xs font-mono text-slate-400">
                <RefreshCw className="w-3 h-3 text-slate-500 animate-spin-slow" />
                <span><span className="text-slate-200">Right Click</span> anywhere to rotate piece</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <div className="shrink-0">
        <Hand 
          cards={hand} 
          draggingCardId={draggingCardId}
          preview={preview}
          currentPhase={stats.phase}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd} 
          onRotate={handleRotate}
          onRefill={refillHand} 
          onRecallAll={recallAll}
          getCardCost={getCardCost}
          canAffordCard={canAffordCard}
          currency={getPhaseCurrency(stats.phase)}
        />
      </div>

      <GameLog logs={stats.logs} />
      <HelpMenu isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      
      {/* Debug Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-800 px-2 py-1 text-[10px] font-mono text-slate-500 z-[100] flex items-center justify-between pointer-events-none">
        <div className="flex gap-4">
          <span>PENDING: {pendingPlacement ? `YES (${pendingPlacement.card.id})` : 'NO'}</span>
          <span>PREVIEW: {preview ? 'YES' : 'NO'}</span>
          <span>DRAGGING: {draggingCardId || 'NONE'}</span>
          <span>HAND: {hand.length}</span>
        </div>
      </div>

      <Toaster position="top-center" richColors />

      <AnimatePresence>
        {isPointConversionOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-end p-4 md:p-12 pointer-events-none"
          >
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl p-8 max-w-sm w-full shadow-2xl pointer-events-auto"
            >
              <h2 className="text-xl font-black text-white mb-1 flex items-center gap-3">
                <Scale className="text-green-400 w-5 h-5" />
                Conversion
              </h2>
              <p className="text-slate-400 text-[11px] mb-6 leading-relaxed">
                Convert <span className="text-green-400 font-bold uppercase">{getPhaseCurrency(stats.phase)}</span> to points. 
                Limited by <span className="text-white font-bold">City Capacity ({stats.cityProduction.total})</span>.
              </p>

              <div className="space-y-6">
                <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-3">
                    <div className="flex flex-col">
                      <span>STOCK</span>
                      <span className="text-slate-300">{stats.resources[getPhaseCurrency(stats.phase)].stock}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span>CAPACITY</span>
                      <span className="text-slate-300">{stats.cityProduction.total}</span>
                    </div>
                  </div>
                  
                  <input 
                    type="range" 
                    min="0" 
                    max={Math.min(stats.resources[getPhaseCurrency(stats.phase)].stock, stats.cityProduction.total)}
                    value={pointsToConvert}
                    onChange={(e) => setPointsToConvert(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500 mb-2"
                  />
                  
                  <div className="flex justify-between items-center mt-4">
                    <button 
                      onClick={() => setPointsToConvert(Math.min(stats.resources[getPhaseCurrency(stats.phase)].stock, stats.cityProduction.total))}
                      className="text-[10px] bg-green-500/10 hover:bg-green-500/20 text-green-500 px-2 py-1 rounded border border-green-500/20 font-bold transition-colors"
                    >
                      MAX
                    </button>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-500 font-mono uppercase">Converting</span>
                      <span className="text-3xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">{pointsToConvert}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    onClick={skipConversion}
                    variant="outline"
                    className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-400 text-xs h-10"
                  >
                    Skip
                  </Button>
                  <Button 
                    onClick={handleConvertPoints}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-black text-xs h-10 shadow-lg shadow-green-900/20"
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border-4 border-emerald-500/30 rounded-3xl p-12 max-w-lg w-full shadow-[0_0_50px_rgba(16,185,129,0.2)] text-center"
            >
              <h1 className="text-5xl font-black text-white mb-2 tracking-tighter">GAME OVER</h1>
              <p className="text-emerald-400 font-mono text-sm uppercase tracking-widest mb-8">Final Score</p>
              
              <div className="text-8xl font-black text-white mb-12 tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                {stats.cityProduction.points}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-12">
                {(Object.entries(stats.resources) as [string, { production: number; stock: number }][]).map(([type, data]) => (
                  <div key={type} className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                    <div className="flex justify-center mb-1">
                      <ElementIcon type={type} className="w-5 h-5" />
                    </div>
                    <div className="text-lg font-bold text-slate-200">{data.stock}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">{type}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={restartGame}
                  className="w-full py-8 text-xl font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-900/20"
                >
                  RESTART PROJECT
                </Button>
                <Button 
                  onClick={goBackToLobby}
                  variant="ghost"
                  className="w-full py-4 text-slate-400 hover:text-white"
                >
                  BACK TO LOBBY
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

