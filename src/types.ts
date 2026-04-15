export type ElementType = 'city' | 'nature' | 'wood' | 'bricks' | 'steel' | 'desert' | string;

export interface CardElement {
  type: ElementType;
}

export interface CardData {
  id: string;
  elements: CardElement[][]; // 2x3 grid: elements[row][col]
  rotation: number; // 0, 90, 180, 270
}

export interface PlacedCard extends CardData {
  x: number; // grid x
  y: number; // grid y
}

export interface GameConfig {
  marketSize: number;
  elementTypes: ElementType[];
  overlapRequired: number;
}

export interface BoardElement {
  type: ElementType;
  cardId: string;
}

export type BoardGrid = Record<string, BoardElement>; // key: "x,y"
