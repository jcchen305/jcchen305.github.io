import type { ActiveClues, Clue, UserGridState } from "../types/types.ts";
import { useCallback, useEffect, useMemo, useRef } from "react";

export function ClueList({
  title,
  clues,
  activeClues,
  userGridState,
  updateUserGridState,
}: {
  title: string;
  clues: Array<Clue>;
  activeClues: ActiveClues;
  userGridState: UserGridState;
  updateUserGridState: (newState: Partial<UserGridState>) => void;
}) {
  return (
    <div
      className="flex flex-col flex-auto text-left text-black dark:text-white"
      style={{
        height: "calc(50% - 1.5 * var(--spacing))",
      }}
    >
      <span className="font-extrabold text-xl">{title}</span>
      <div className="flex flex-col flex-auto gap-0.5 overflow-scroll px-2">
        {clues.map((clue, index) => (
          <ClueDisplay
            key={index}
            clue={clue}
            activeClues={activeClues}
            userGridState={userGridState}
            updateUserGridState={updateUserGridState}
          />
        ))}
      </div>
    </div>
  );
}

function ClueDisplay({
  clue,
  activeClues,
  userGridState,
  updateUserGridState,
}: {
  clue: Clue;
  activeClues: ActiveClues;
  userGridState: UserGridState;
  updateUserGridState: (newState: Partial<UserGridState>) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { direction, cellIndex, clueNumber } = clue;
  const { direction: userDirection } = userGridState;
  const { across, down } = activeClues;
  const clueState = useMemo(() => {
    if (userDirection === "across") {
      if (direction === "across") {
        return clueNumber === across.clueNumber ? "primary" : null;
      } else {
        return clueNumber === down.clueNumber ? "secondary" : null;
      }
    } else {
      if (direction === "down") {
        return clueNumber === down.clueNumber ? "primary" : null;
      } else {
        return clueNumber === across.clueNumber ? "secondary" : null;
      }
    }
  }, [
    across.clueNumber,
    clueNumber,
    direction,
    down.clueNumber,
    userDirection,
  ]);

  useEffect(() => {
    if (clueState) {
      ref.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [clueState]);

  const onClick = useCallback(() => {
    updateUserGridState({
      index: cellIndex,
      direction: direction,
    });
  }, [cellIndex, direction, updateUserGridState]);

  return (
    <div
      ref={ref}
      className={`${clueState === "primary" ? "bg-blue-200 dark:bg-blue-800" : ""} flex justify-start w-full text-left pr-2 py-1 cursor-pointer rounded-sm`}
      onClick={onClick}
    >
      <div
        className={`${clueState === "secondary" ? "bg-blue-200 dark:bg-blue-800" : ""} pl-2 rounded-sm`}
      ></div>
      <span className="font-extrabold flex mx-2">{clue.clueNumber}</span>
      <div className="">{clue.clue}</div>
    </div>
  );
}
