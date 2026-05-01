import {
  CellType,
  type CellHighlightState,
  type CellClueIdentifier,
  type GridDefinition,
  type UserGridState,
} from "../types/types.ts";

export function getCellClueIdentifiers({
  width,
  layout,
}: GridDefinition): Array<CellClueIdentifier> {
  const cellNumbers = Array<CellClueIdentifier>(layout.length).fill(null);
  let nextNumber = 1;
  // Number all the down indices first.
  for (let i = 0; i < layout.length; i++) {
    const hasAcross = isValidAcrossWord({ layout, width, index: i });
    const hasDown = isValidDownWord({ layout, width, index: i });
    if (hasAcross || hasDown) {
      cellNumbers[i] = {
        clueNumber: nextNumber,
        hasAcross,
        hasDown,
        cellIndex: i,
      };
      nextNumber++;
    }
  }

  return cellNumbers;
}

function isValidDownWord({
  layout,
  width,
  index,
}: {
  layout: ReadonlyArray<CellType>;
  width: Readonly<number>;
  index: number;
}): boolean {
  const isTopRow = Math.floor(index / width) === 0;
  if (isTopRow || layout[index - width] === CellType.BLACK) {
    return layout[index] !== CellType.BLACK;
  }
  return false;
}

function isValidAcrossWord({
  layout,
  width,
  index,
}: {
  layout: ReadonlyArray<CellType>;
  width: Readonly<number>;
  index: number;
}): boolean {
  const isLeftColumn = index % width === 0;
  if (isLeftColumn || layout[index - 1] === CellType.BLACK) {
    return layout[index] !== CellType.BLACK;
  }
  return false;
}

function areInSameRow(a: number, b: number, width: number) {
  return Math.floor(a / width) === Math.floor(b / width);
}

function areInSameColumn(a: number, b: number, width: number) {
  return a % width === b % width;
}

function isInBounds(index: number, layout: Array<CellType>): boolean {
  return index >= 0 && index < layout.length;
}

export function getCellHighlightState({
  index: cellIndex,
  gridDefinition,
  userGridState,
}: {
  index: number;
  gridDefinition: GridDefinition;
  userGridState: UserGridState;
}): CellHighlightState {
  const { index: userIndex, direction } = userGridState;
  if (cellIndex === userGridState.index) {
    return "primary";
  }
  const { layout, width } = gridDefinition;
  if (direction === "across") {
    // Verify they're in the same row.
    if (!areInSameRow(userIndex, cellIndex, width)) {
      return null;
    }
    // Verify the path between the indices has no black square in between
    for (
      let i = Math.min(userIndex, cellIndex);
      i < Math.max(userIndex, cellIndex);
      i++
    ) {
      if (layout[i] === CellType.BLACK) {
        return null;
      }
    }
    return "secondary";
  } else {
    // Verify they're in the same column.
    if (!areInSameColumn(userIndex, cellIndex, width)) {
      return null;
    }
    // Verify the path between the indicies has no black square in between
    for (
      let i = Math.min(userIndex, cellIndex);
      i < Math.max(userIndex, cellIndex);
      i += width
    ) {
      if (layout[i] === CellType.BLACK) {
        return null;
      }
    }
    return "secondary";
  }
}

export function isAllowedCellInput(char: string) {
  if (char.length !== 1) {
    return false;
  }
  const upperCase = char.toUpperCase();
  return (
    (upperCase >= "A" && upperCase <= "Z") ||
    (upperCase >= "0" && upperCase <= "9")
  );
}

export function getNextWordIndex({
  gridDefinition,
  userGridState,
  direction,
}: {
  gridDefinition: GridDefinition;
  userGridState: UserGridState;
  direction: "forwards" | "backwards";
}): number {
  const { index, direction: fillDirection } = userGridState;
  const { layout, width } = gridDefinition;

  if (fillDirection === "across") {
    const nextIndexCandidate = direction === "forwards" ? index + 1 : index - 1;
    // Keep the current index if the next candidate is outside of the current row.
    if (!areInSameRow(index, nextIndexCandidate, width)) {
      return index;
    }
    // Keep the current index if the next candidate is a black square.
    if (
      nextIndexCandidate >= layout.length ||
      layout[nextIndexCandidate] === CellType.BLACK
    ) {
      return index;
    }
    return nextIndexCandidate;
  } else {
    const nextIndexCandidate =
      direction === "forwards" ? index + width : index - width;
    // Keep the current index if the next candidate is outside of the current column.
    if (!areInSameColumn(index, nextIndexCandidate, width)) {
      return index;
    }
    // Keep the current index if the next candidate is a black square.
    if (
      nextIndexCandidate >= layout.length ||
      layout[nextIndexCandidate] === CellType.BLACK
    ) {
      return index;
    }
    return nextIndexCandidate;
  }
}

type NextIndexHintType = {
  index: number;
  gridDefinition: GridDefinition;
  direction: "forwards" | "backwards";
};

export function getNextAcrossIndex({
  index,
  gridDefinition,
  direction,
}: NextIndexHintType) {
  const { layout, width } = gridDefinition;
  const delta = direction === "forwards" ? 1 : -1;
  let nextIndex = index + delta;
  while (
    areInSameRow(index, nextIndex, width) &&
    isInBounds(nextIndex, layout)
  ) {
    if (layout[nextIndex] !== CellType.BLACK) {
      return nextIndex;
    }
    nextIndex += delta;
  }
  return index;
}

export function getNextDownIndex({
  index,
  gridDefinition,
  direction,
}: NextIndexHintType) {
  const { layout, width } = gridDefinition;
  const delta = direction === "forwards" ? width : -width;
  let nextIndex = index + delta;
  while (
    areInSameColumn(index, nextIndex, width) &&
    isInBounds(nextIndex, layout)
  ) {
    if (layout[nextIndex] !== CellType.BLACK) {
      return nextIndex;
    }
    nextIndex += delta;
  }
  return index;
}

function getWordStartIndex(
  userGridState: UserGridState,
  gridDefinition: GridDefinition,
): number {
  const { layout, width } = gridDefinition;
  const delta =
    userGridState.direction === "across" ? -1 : -gridDefinition.width;
  let currentIndex = userGridState.index;
  let nextIndex = currentIndex + delta;
  while (
    isInBounds(nextIndex, layout) &&
    (userGridState.direction === "across"
      ? areInSameRow(nextIndex, currentIndex, width)
      : areInSameColumn(nextIndex, currentIndex, width)) &&
    gridDefinition.layout[nextIndex] !== CellType.BLACK
  ) {
    currentIndex = nextIndex;
    nextIndex += delta;
  }

  return currentIndex;
}

// TODO: This function is wrong if you hit enter in the middle of a word. We should first normalize the index by walking backwards until
// we hit the beginning of the word. Then we can do the search for the next word.
export function getNextQuestionIndexAndDirection({
  userGridState,
  gridDefinition,
  direction,
}: {
  userGridState: UserGridState;
  gridDefinition: GridDefinition;
  direction: "forwards" | "backwards";
}): Pick<UserGridState, "index" | "direction"> {
  const { direction: fillDirection } = userGridState;
  const { width, height, layout } = gridDefinition;
  const index = getWordStartIndex(userGridState, gridDefinition);

  let firstAcrossIndex: number | null = null;
  let firstDownIndex: number | null = null;
  for (let i = 0; i < width * height; i++) {
    if (
      firstAcrossIndex === null &&
      isValidAcrossWord({ layout, width, index: i })
    ) {
      firstAcrossIndex = i;
    }
    if (
      firstDownIndex === null &&
      isValidDownWord({ layout, width, index: i })
    ) {
      firstDownIndex = i;
    }
    if (firstAcrossIndex !== null && firstDownIndex !== null) {
      break;
    }
  }
  let lastAcrossIndex: number | null = null;
  let lastDownIndex: number | null = null;
  for (let i = width * height - 1; i >= 0; i--) {
    if (
      lastAcrossIndex === null &&
      isValidAcrossWord({ layout, width, index: i })
    ) {
      lastAcrossIndex = i;
    }
    if (
      lastDownIndex === null &&
      isValidDownWord({ layout, width, index: i })
    ) {
      lastDownIndex = i;
    }
    if (lastAcrossIndex !== null && lastDownIndex !== null) {
      break;
    }
  }

  if (fillDirection === "across") {
    const nextAcrossWordIndex = getNextAcrossWordIndexIfExists({
      index,
      gridDefinition,
      direction,
    });
    if (nextAcrossWordIndex !== null) {
      return { index: nextAcrossWordIndex, direction: fillDirection };
    } else {
      return {
        index: direction === "forwards" ? firstDownIndex! : lastDownIndex!,
        direction: "down",
      };
    }
  } else {
    const nextDownWordIndex = getNextDownWordIndexIfExists({
      index,
      gridDefinition,
      direction,
    });
    if (nextDownWordIndex !== null) {
      return { index: nextDownWordIndex, direction: fillDirection };
    } else {
      return {
        index: direction === "forwards" ? firstAcrossIndex! : lastAcrossIndex!,
        direction: "across",
      };
    }
  }
}

function getNextAcrossWordIndexIfExists({
  index,
  gridDefinition,
  direction,
}: NextIndexHintType): number | null {
  const { layout, width } = gridDefinition;
  const delta = direction === "forwards" ? 1 : -1;
  let nextIndex = index + delta;
  while (isInBounds(nextIndex, layout)) {
    if (isValidAcrossWord({ layout, width, index: nextIndex })) {
      return nextIndex;
    }
    nextIndex += delta;
  }
  return null;
}

function getNextDownWordIndexIfExists({
  index,
  gridDefinition,
  direction,
}: NextIndexHintType): number | null {
  const { layout, width } = gridDefinition;
  const delta = direction === "forwards" ? 1 : -1;
  let nextIndex = index + delta;
  while (isInBounds(nextIndex, layout)) {
    if (isValidDownWord({ layout, width, index: nextIndex })) {
      return nextIndex;
    }
    nextIndex += delta;
  }
  return null;
}
