import { useState, useMemo, useCallback, useEffect } from "react";
import {
  getCluesGroupedByDirection,
  getActiveClues,
  isSolved,
} from "../helpers/clue_helpers.ts";
import { getCellClueIdentifiers } from "../helpers/grid_helpers.ts";
import { parseLayoutToInitialUserLayout } from "../helpers/parse_helpers.ts";
import type {
  UserGridState,
  PlayState,
  GridDefinition,
} from "../types/types.ts";
import { Banner } from "./Banner.tsx";
import { ClueBanner } from "./ClueBanner.tsx";
import { ClueList } from "./ClueList.tsx";
import { Grid } from "./Grid.tsx";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export function Puzzle({
  gridDefinition,
  cluesList,
}: {
  gridDefinition: GridDefinition;
  cluesList: Array<string>;
}) {
  const [userLayout, setUserLayout] = useState(
    parseLayoutToInitialUserLayout(gridDefinition.layout),
  );
  const [userDirection, setUserDirection] =
    useState<UserGridState["direction"]>("across");
  const [userIndex, setUserIndex] = useState(0);
  const userGridState: UserGridState = useMemo(
    () => ({
      layout: userLayout,
      direction: userDirection,
      index: userIndex,
    }),
    [userDirection, userIndex, userLayout],
  );
  const updateUserGridState = useCallback(
    (newState: Partial<UserGridState>) => {
      if (newState.direction) {
        setUserDirection(newState.direction);
      }
      if (newState.index !== undefined) {
        setUserIndex(newState.index);
      }
      if (newState.layout) {
        setUserLayout(newState.layout);
      }
    },
    [],
  );

  const cellClues = useMemo(
    () => getCellClueIdentifiers(gridDefinition),
    [gridDefinition],
  );
  const clues = getCluesGroupedByDirection({
    cellClues,
    rawCluesList: cluesList,
  });
  const activeClues = useMemo(
    () =>
      getActiveClues({
        clues,
        userGridState,
        cellClues,
        gridDefinition: gridDefinition,
      }),
    [cellClues, clues, gridDefinition, userGridState],
  );

  const [solved, setSolved] = useState(false);
  useEffect(() => {
    if (isSolved({ gridDefinition, userLayout }) && !solved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSolved(true);
    }
  }, [gridDefinition, solved, userLayout]);

  const [playState, setPlayState] = useState<PlayState>({
    playtimeSeconds: 0,
    isPaused: false,
  });
  useEffect(() => {
    let interval: number | null = null;
    if (!playState.isPaused && !solved) {
      interval = setInterval(() => {
        setPlayState((prev) => ({
          ...prev,
          playtimeSeconds: prev.playtimeSeconds + 1,
        }));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearTimeout(interval);
      }
    }; // Cleanup on unmount
  }, [playState.isPaused, solved]);

  const { width, height } = useWindowSize();

  return (
    <>
      {solved && <Confetti width={width} height={height} />}
      <Banner
        gridDefinition={gridDefinition}
        playtimeSeconds={playState.playtimeSeconds}
        isPaused={playState.isPaused}
        onPause={() =>
          setPlayState((prev) => ({ ...prev, isPaused: !prev.isPaused }))
        }
      />
      <div className="flex w-full gap-5 flex-auto max-h-full overflow-hidden">
        <div className="flex flex-col flex-auto gap-5 w-auto">
          <ClueBanner activeClues={activeClues} userGridState={userGridState} />
          <Grid
            gridDefinition={gridDefinition}
            userGridState={userGridState}
            updateUserGridState={updateUserGridState}
            cellClues={cellClues}
          />
        </div>
        <div
          className="flex flex-col flex-auto p-2 rounded-md border  border-blue-500 dark:border-blue-700 bg-blue-50 dark:bg-blue-900 gap-3"
          style={{ maxWidth: 360 }}
        >
          <ClueList
            title="Across"
            clues={clues.acrossClues}
            activeClues={activeClues}
            userGridState={userGridState}
            updateUserGridState={updateUserGridState}
          />
          <ClueList
            title="Down"
            clues={clues.downClues}
            activeClues={activeClues}
            userGridState={userGridState}
            updateUserGridState={updateUserGridState}
          />
        </div>
      </div>
    </>
  );
}
