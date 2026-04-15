import { CardData, ElementType, BoardGrid, PlacedCard, CardElement } from './types';

export const generateCard = (elementTypes: ElementType[]): CardData => {
  const id = Math.random().toString(36).substring(2, 9);
  
  // Exclude desert from the initial pool if we want to ensure balance, 
  // but user said "balanced distribution of types" and "limit of 3".
  // Let's just shuffle and pick while respecting the limit.
  
  const elements: CardElement[][] = [[], [], []];
  const typeCounts: Record<string, number> = {};
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      let type: ElementType;
      let attempts = 0;
      do {
        type = elementTypes[Math.floor(Math.random() * elementTypes.length)];
        attempts++;
      } while (typeCounts[type] >= 3 && attempts < 20);
      
      typeCounts[type] = (typeCounts[type] || 0) + 1;
      elements[row].push({ type });
    }
  }
  
  return { id, elements, rotation: 0 };
};

export const createStartingCard = (): CardData => {
  // 3 city tiles on one side, 3 nature tiles on the other
  const elements = [
    [{ type: 'city' as ElementType }, { type: 'nature' as ElementType }],
    [{ type: 'city' as ElementType }, { type: 'nature' as ElementType }],
    [{ type: 'city' as ElementType }, { type: 'nature' as ElementType }],
  ];
  return { id: 'starting-card', elements, rotation: 0 };
};

export interface CardGridElement {
  x: number;
  y: number;
  type: ElementType;
}

export const getCardGridElements = (card: CardData, x: number, y: number): CardGridElement[] => {
  const elements: CardGridElement[] = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      let gridX = 0;
      let gridY = 0;

      switch (card.rotation) {
        case 90:
          gridX = x + (2 - row);
          gridY = y + col;
          break;
        case 180:
          gridX = x + (1 - col);
          gridY = y + (2 - row);
          break;
        case 270:
          gridX = x + row;
          gridY = y + (1 - col);
          break;
        default: // 0
          gridX = x + col;
          gridY = y + row;
          break;
      }
      elements.push({ x: gridX, y: gridY, type: card.elements[row][col].type });
    }
  }
  return elements;
};

export const canPlaceCard = (
  card: CardData,
  x: number,
  y: number,
  board: BoardGrid,
  overlapRequired: number
): boolean => {
  if (Object.keys(board).length === 0) return true;

  const elements = getCardGridElements(card, x, y);
  let overlapCount = 0;
  
  for (const el of elements) {
    const key = `${el.x},${el.y}`;
    if (board[key]) {
      overlapCount++;
    }
  }

  return overlapCount >= overlapRequired;
};

export const getBoardGridAfterPlacement = (
  card: CardData,
  x: number,
  y: number,
  currentBoard: BoardGrid
): BoardGrid => {
  const newBoard = { ...currentBoard };
  const elements = getCardGridElements(card, x, y);
  
  for (const el of elements) {
    const key = `${el.x},${el.y}`;
    newBoard[key] = {
      type: el.type,
      cardId: card.id,
    };
  }
  return newBoard;
};

export interface ResourceStats {
  biggest: number;
  secondBiggest?: number;
}

export interface LogEntry {
  id: string;
  turnType: string;
  phase: number;
  round: number;
  message: string;
  type: 'production' | 'conversion' | 'system';
}

export interface GameStats {
  resources: Record<string, { production: number; stock: number }>;
  cityProduction: {
    city: number;
    nature: number;
    total: number;
    points: number;
  };
  phase: number; // 1, 2, 3
  round: number; // 1, 2, 3
  turn: number; // 1-4
  currentTurnType: 'steel' | 'bricks' | 'wood' | 'points';
  logs: LogEntry[];
}

export const calculateStats = (board: BoardGrid, elementTypes: ElementType[], currentStats?: GameStats): GameStats => {
  const getBiggestPatch = (type: ElementType): number => {
    const visited = new Set<string>();
    let maxPatch = 0;
    
    const keys = Object.keys(board).filter(k => board[k].type === type);
    
    for (const key of keys) {
      if (!visited.has(key)) {
        let patchSize = 0;
        const queue = [key];
        visited.add(key);
        
        while (queue.length > 0) {
          const currentKey = queue.shift()!;
          patchSize++;
          
          const [x, y] = currentKey.split(',').map(Number);
          const neighbors = [
            `${x + 1},${y}`,
            `${x - 1},${y}`,
            `${x},${y + 1}`,
            `${x},${y - 1}`,
          ];
          
          for (const neighbor of neighbors) {
            if (board[neighbor] && board[neighbor].type === type && !visited.has(neighbor)) {
              visited.add(neighbor);
              queue.push(neighbor);
            }
          }
        }
        if (patchSize > maxPatch) maxPatch = patchSize;
      }
    }
    return maxPatch;
  };

  const cityBiggest = getBiggestPatch('city');
  const natureBiggest = getBiggestPatch('nature');
  
  const resourceTypes = ['steel', 'bricks', 'wood'];
  const resources: Record<string, { production: number; stock: number }> = {};
  
  resourceTypes.forEach(type => {
    resources[type] = {
      production: getBiggestPatch(type),
      stock: currentStats?.resources[type]?.stock || 0
    };
  });
  
  return {
    resources,
    cityProduction: {
      city: cityBiggest,
      nature: natureBiggest,
      total: Math.min(cityBiggest, natureBiggest),
      points: currentStats?.cityProduction.points || 0
    },
    phase: currentStats?.phase || 1,
    round: currentStats?.round || 1,
    turn: currentStats?.turn || 1,
    currentTurnType: currentStats?.currentTurnType || 'steel',
    logs: currentStats?.logs || []
  };
};

export const getPhaseCurrency = (phase: number): string => {
  switch (phase) {
    case 1: return 'wood';
    case 2: return 'bricks';
    case 3: return 'steel';
    default: return 'wood';
  }
};

export const getTurnsInRound = (phase: number): ('steel' | 'bricks' | 'wood' | 'points')[] => {
  const baseOrder: ('steel' | 'bricks' | 'wood' | 'points')[] = ['steel', 'bricks', 'wood', 'points'];
  if (phase === 1) return baseOrder;
  if (phase === 2) return ['steel', 'bricks', 'points'];
  if (phase === 3) return ['steel', 'points'];
  return baseOrder;
};
