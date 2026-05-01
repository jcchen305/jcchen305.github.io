import type { ActiveClues, UserGridState } from "../types/types.ts";

export function ClueBanner({
  activeClues,
  userGridState,
}: {
  activeClues: ActiveClues;
  userGridState: UserGridState;
}) {
  const activeClue =
    userGridState.direction === "across"
      ? activeClues.across
      : activeClues.down;

  return (
    <div className="flex justify-start w-full text-left p-2 border border-blue-500 dark:border-blue-700 rounded-sm bg-blue-50 dark:bg-blue-900 text-black dark:text-white">
      <span className="font-extrabold flex mx-2">
        {activeClue?.clueNumber}
        {userGridState.direction === "across" ? "A" : "D"}
      </span>
      <div className="">{activeClue?.clue}</div>
    </div>
  );
}
