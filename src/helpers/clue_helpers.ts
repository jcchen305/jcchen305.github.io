import type {
  ActiveClues,
  CellClueIdentifier,
  Clue,
  Clues,
  GridDefinition,
  UserGridState,
} from "../types/types.ts";

export function getCluesGroupedByDirection({
  cellClues,
  rawCluesList,
}: {
  cellClues: Array<CellClueIdentifier>;
  rawCluesList: Array<string>;
}): Clues {
  const acrossClues: Array<Clue> = [];
  const downClues: Array<Clue> = [];
  let clueListIndex = 0;
  for (const cell of cellClues) {
    if (!cell) {
      continue;
    }
    if (cell.hasAcross) {
      acrossClues.push({
        clueNumber: cell.clueNumber,
        clue: rawCluesList[clueListIndex],
        directionalIndex: acrossClues.length,
        direction: "across",
        cellIndex: cell.cellIndex,
      });
      clueListIndex++;
    }
    if (cell.hasDown) {
      downClues.push({
        clueNumber: cell.clueNumber,
        clue: rawCluesList[clueListIndex],
        directionalIndex: downClues.length,
        direction: "down",
        cellIndex: cell.cellIndex,
      });
      clueListIndex++;
    }
  }

  return { acrossClues, downClues };
}

function findClosestClue({
  index,
  direction,
  clues,
  gridDefinition,
  cellClues,
}: {
  index: number;
  direction: "across" | "down";
  clues: Clues;
  gridDefinition: GridDefinition;
  cellClues: Array<CellClueIdentifier>;
}): Clue {
  const { width } = gridDefinition;
  const doesCellHaveMatchingClue = (cell: CellClueIdentifier) => {
    if (direction === "across") {
      return !!cell?.hasAcross;
    } else {
      return !!cell?.hasDown;
    }
  };

  // Find the nearest clue number. We can always do so by walking backwards on the
  // cell metadata in the given direction until we find a cell with a number and the matching direction.
  const delta = direction === "across" ? -1 : -width;
  let currIndex = index;
  let currentCell = cellClues[currIndex];
  while (currentCell !== undefined && !doesCellHaveMatchingClue(currentCell)) {
    currIndex += delta;
    currentCell = cellClues[currIndex];
  }

  const { clueNumber } = currentCell!;
  if (direction === "across") {
    return clues.acrossClues.find(
      (clue) => clue.clueNumber === clueNumber,
    )! as Clue;
  } else {
    return clues.downClues.find(
      (clue) => clue.clueNumber === clueNumber,
    )! as Clue;
  }
}

export function getActiveClues({
  clues,
  userGridState,
  cellClues,
  gridDefinition,
}: {
  clues: Clues;
  userGridState: UserGridState;
  cellClues: Array<CellClueIdentifier>;
  gridDefinition: GridDefinition;
}): ActiveClues {
  const { index } = userGridState;
  const across = findClosestClue({
    index,
    direction: "across",
    clues,
    gridDefinition,
    cellClues,
  });
  const down = findClosestClue({
    index,
    direction: "down",
    clues,
    gridDefinition,
    cellClues,
  });

  return { across, down };
}

export function isSolved({
  gridDefinition,
  userLayout,
}: {
  gridDefinition: GridDefinition;
  userLayout: Array<string>;
}): boolean {
  const { solution } = gridDefinition;
  for (const [index, cell] of userLayout.entries()) {
    const { answers } = solution[index];
    if (!answers.includes(cell)) {
      return false;
    }
  }
  return true;
}
