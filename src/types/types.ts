export enum CellType {
  BLACK = "black",
  WHITE = "white",
}

export type CellAnswer = {
  answers: Array<string>;
};

export type GridDefinition = {
  readonly width: number;
  readonly height: number;
  readonly layout: Array<CellType>;
  readonly solution: Array<CellAnswer>;
  readonly title: string;
  readonly note?: string;
  readonly author: string;
};

export type UserGridState = {
  layout: Array<string>;
  direction: "across" | "down";
  index: number;
};

export type CellHighlightState = "primary" | "secondary" | null;

export type CellClueIdentifier = {
  clueNumber: number;
  hasAcross: boolean;
  hasDown: boolean;
  cellIndex: number;
} | null;

export type Clue = {
  clueNumber: number;
  clue: string;
  directionalIndex: number;
  direction: "across" | "down";
  cellIndex: number;
};

export type Clues = {
  acrossClues: Array<Clue>;
  downClues: Array<Clue>;
};

export type ActiveClues = {
  across: Clue | null;
  down: Clue | null;
};

export type PlayState = {
  playtimeSeconds: number;
  isPaused: boolean;
};
