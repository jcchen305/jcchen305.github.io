import {
  getCellHighlightState,
  getNextAcrossIndex,
  getNextDownIndex,
  getNextQuestionIndexAndDirection,
  getNextWordIndex,
  isAllowedCellInput,
} from "../helpers/grid_helpers.ts";
import {
  CellType,
  type CellClueIdentifier,
  type GridDefinition,
  type UserGridState,
} from "../types/types.ts";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function Grid({
  gridDefinition,
  userGridState,
  updateUserGridState,
  cellClues,
}: {
  gridDefinition: GridDefinition;
  userGridState: UserGridState;
  updateUserGridState: (newState: Partial<UserGridState>) => void;
  cellClues: ReadonlyArray<CellClueIdentifier>;
}) {
  const { height } = gridDefinition;

  const gridRows = useMemo(
    () => Array.from({ length: height }, (_, index) => index),
    [height],
  );

  return (
    <div className="flex flex-col self-center shadow-2xl shadow-blue-200 dark:shadow-blue-900 w-full my-auto">
      {gridRows.map((rowIndex) => (
        <GridRow
          key={rowIndex}
          rowIndex={rowIndex}
          gridDefinition={gridDefinition}
          userGridState={userGridState}
          updateUserGridState={updateUserGridState}
          cellClues={cellClues}
        />
      ))}
    </div>
  );
}

function getSquareSize(width: number) {
  return `calc(100% / ${width})`;
}

function GridRow({
  rowIndex,
  gridDefinition,
  userGridState,
  cellClues,
  updateUserGridState,
}: {
  rowIndex: number;
  gridDefinition: GridDefinition;
  userGridState: UserGridState;
  cellClues: ReadonlyArray<CellClueIdentifier>;
  updateUserGridState: (newState: Partial<UserGridState>) => void;
}) {
  const { layout: gridLayout, width } = gridDefinition;
  const rowLeft = rowIndex * width;
  const rowLayout = gridLayout.slice(rowLeft, rowLeft + width);
  return (
    <div className="flex w-full">
      {rowLayout.map((cellType, columnIndex) =>
        cellType === CellType.BLACK ? (
          <BlackCell key={columnIndex} gridDefinition={gridDefinition} />
        ) : (
          <WhiteCell
            key={columnIndex}
            index={rowLeft + columnIndex}
            gridDefinition={gridDefinition}
            userGridState={userGridState}
            cellClues={cellClues}
            updateUserGridState={updateUserGridState}
          />
        ),
      )}
    </div>
  );
}

function BlackCell({ gridDefinition }: { gridDefinition: GridDefinition }) {
  return (
    <div
      className="bg-black border border-black dark:bg-gray"
      style={{
        width: getSquareSize(gridDefinition.width),
        aspectRatio: 1,
      }}
    ></div>
  );
}

function WhiteCell({
  index,
  gridDefinition,
  userGridState,
  cellClues,
  updateUserGridState,
}: {
  index: number;
  gridDefinition: GridDefinition;
  userGridState: UserGridState;
  cellClues: ReadonlyArray<CellClueIdentifier>;
  updateUserGridState: (newState: Partial<UserGridState>) => void;
}) {
  const { layout: userLayout } = userGridState;
  const cellNumber = cellClues[index]?.clueNumber;
  const currentValue = userLayout[index];
  const cellHighlightState = useMemo(
    () => getCellHighlightState({ index, gridDefinition, userGridState }),
    [gridDefinition, index, userGridState],
  );

  const ref = useRef<HTMLDivElement>(null);
  const [cellWidth, setCellWidth] = useState(0);
  useEffect(() => {
    if (cellHighlightState === "primary") {
      ref.current?.focus();
    }
    if (ref.current) {
      setCellWidth(ref.current.clientWidth);
    }
  }, [cellHighlightState]);

  const onClick = useCallback(() => {
    if (index !== userGridState.index) {
      updateUserGridState({
        index,
      });
    } else {
      updateUserGridState({
        direction: userGridState.direction === "across" ? "down" : "across",
      });
    }
  }, [
    index,
    updateUserGridState,
    userGridState.direction,
    userGridState.index,
  ]);

  const handleCellInput = useCallback(
    (char: string) => {
      const nextLayout = userLayout
        .slice(0, index)
        .concat(char.toUpperCase())
        .concat(userLayout.slice(index + 1));
      const nextIndex = getNextWordIndex({
        gridDefinition,
        userGridState,
        direction: "forwards",
      });
      updateUserGridState({
        layout: nextLayout,
        index: nextIndex,
      });
    },
    [gridDefinition, index, updateUserGridState, userGridState, userLayout],
  );
  const handleLeftRightKey = useCallback(
    (direction: "forwards" | "backwards") => {
      if (userGridState.direction !== "across") {
        updateUserGridState({
          direction: "across",
        });
      } else {
        const nextIndex = getNextAcrossIndex({
          index,
          gridDefinition,
          direction,
        });
        updateUserGridState({
          index: nextIndex,
        });
      }
    },
    [gridDefinition, index, updateUserGridState, userGridState.direction],
  );

  const handleUpDownKey = useCallback(
    (direction: "forwards" | "backwards") => {
      if (userGridState.direction !== "down") {
        updateUserGridState({
          direction: "down",
        });
      } else {
        const nextIndex = getNextDownIndex({
          index,
          gridDefinition,
          direction,
        });
        updateUserGridState({
          index: nextIndex,
        });
      }
    },
    [gridDefinition, index, updateUserGridState, userGridState.direction],
  );

  const handleBackspace = useCallback(() => {
    // Always replace the current character with empty space
    const nextUserLayout = userLayout
      .slice(0, index)
      .concat("")
      .concat(userLayout.slice(index + 1));
    const nextUserIndex = getNextWordIndex({
      gridDefinition,
      userGridState,
      direction: "backwards",
    });
    updateUserGridState({
      layout: nextUserLayout,
      index: nextUserIndex,
    });
  }, [gridDefinition, index, updateUserGridState, userGridState, userLayout]);

  const [isRebusInput, setIsRebusInput] = useState(false);
  const [rebusValue, setRebusValue] = useState(currentValue);
  const rebusRef = useRef<HTMLInputElement>(null);
  const handleRebus = useCallback(() => {
    setIsRebusInput(!isRebusInput);
    if (!isRebusInput) {
      setRebusValue(currentValue);
    }
  }, [currentValue, isRebusInput]);
  useEffect(() => {
    if (isRebusInput) {
      rebusRef.current?.focus();
    }
  }, [isRebusInput]);
  const saveRebus = useCallback(() => {
    setIsRebusInput(false);
    const nextUserLayout = userLayout
      .slice(0, index)
      .concat(rebusValue)
      .concat(userLayout.slice(index + 1));
    updateUserGridState({ layout: nextUserLayout });
  }, [index, rebusValue, updateUserGridState, userLayout]);
  const onRebusKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter") {
        e.stopPropagation();
        saveRebus();
        ref.current?.focus();
      } else if (e.key === "Tab") {
        saveRebus();
        ref.current?.focus();
      } else {
        e.stopPropagation();
      }
    },
    [saveRebus],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (isAllowedCellInput(e.key) && !(e.ctrlKey || e.metaKey)) {
        handleCellInput(e.key);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        handleLeftRightKey(e.key === "ArrowLeft" ? "backwards" : "forwards");
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        handleUpDownKey(e.key === "ArrowUp" ? "backwards" : "forwards");
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.stopPropagation();
        e.preventDefault();
        updateUserGridState(
          getNextQuestionIndexAndDirection({
            userGridState,
            gridDefinition,
            direction: e.shiftKey ? "backwards" : "forwards",
          }),
        );
      } else if (e.key === " ") {
        updateUserGridState({
          direction: userGridState.direction === "across" ? "down" : "across",
        });
      } else if (e.key === "Backspace") {
        handleBackspace();
      } else if (e.key === "Escape") {
        handleRebus();
      }
    },
    [
      gridDefinition,
      handleBackspace,
      handleCellInput,
      handleLeftRightKey,
      handleRebus,
      handleUpDownKey,
      updateUserGridState,
      userGridState,
    ],
  );

  const row = Math.floor(index / gridDefinition.width);
  const column = index % gridDefinition.width;
  const isShaded = row % 2 === 1 ? column % 2 === 0 : column % 2 === 1;

  const backgroundColorClassName =
    cellHighlightState === "primary"
      ? "bg-yellow-200 dark:bg-blue-500"
      : cellHighlightState === "secondary"
        ? "bg-blue-200 dark:bg-blue-800"
        : isShaded
          ? "bg-gray-100 dark:bg-gray-500"
          : "bg-white dark:bg-gray-500";

  const baseFontSize = 0.6 * cellWidth;
  const cellFontSize =
    currentValue.length > 0
      ? baseFontSize - cellWidth * 0.1 * (currentValue.length - 1)
      : baseFontSize;
  const numberFontSize = 0.2 * cellWidth;

  return (
    <div
      tabIndex={0}
      ref={ref}
      className={`${backgroundColorClassName} flex items-center justify-center capitalize focus border border-black relative select-none focus:outline-none text-black dark:text-white`}
      style={{
        width: getSquareSize(gridDefinition.width),
        aspectRatio: 1,
        containerType: "inline-size",
      }}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {isRebusInput ? (
        <input
          ref={rebusRef}
          className="absolute top-0 left-0 bottom-0 px-1 z-10 bg-white dark:bg-gray-500 min-w-full h-full"
          style={{
            fontSize: `${baseFontSize}px`,
            width:
              rebusValue.length > 1
                ? `calc(100% + ${rebusValue.length * 5}px)`
                : "100%",
          }}
          maxLength={50}
          value={rebusValue}
          onChange={(e) => setRebusValue(e.target.value.toUpperCase())}
          onKeyDown={onRebusKeyDown}
          onBlur={saveRebus}
        />
      ) : (
        <>
          <span
            className="flex self-center overflow-hidden h-full items-center"
            style={{
              fontSize: `${cellFontSize}px`,
            }}
          >
            {currentValue}
          </span>
          {cellNumber !== 0 && (
            <span
              className="absolute top-0.5 left-0.5 leading-3 flex ml-0.5"
              style={{
                fontSize: `${numberFontSize}px`,
                lineHeight: `${numberFontSize}px`,
              }}
            >
              {cellNumber}
            </span>
          )}
        </>
      )}
    </div>
  );
}
