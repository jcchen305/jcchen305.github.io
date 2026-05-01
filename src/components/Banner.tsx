import type { GridDefinition } from "../types/types.ts";
import { Pause, Play, Settings } from "lucide-react";

export function Banner({
  gridDefinition,
  playtimeSeconds,
  isPaused,
  onPause,
}: {
  gridDefinition: GridDefinition;
  playtimeSeconds: number;
  isPaused: boolean;
  onPause: () => void;
}) {
  return (
    <div className="flex flex-col gap-1 text-black dark:text-white">
      <div className="flex justify-between items-center">
        <div className="flex gap-1 text-2xl">
          <span className="capitalize font-bold">{gridDefinition.title}</span>•
          <span>{gridDefinition.author}</span>
        </div>
        <div>
          <Settings
            onClick={() => {
              document.body.classList.toggle("dark");
            }}
          />
        </div>
      </div>
      <div
        className="flex justify-between items-center cursor-pointer text-xl"
        onClick={onPause}
        style={{ width: 120 }}
      >
        {new Date(playtimeSeconds * 1000).toISOString().slice(11, 19)}
        {isPaused ? <Play fill="black" /> : <Pause fill="black" />}
      </div>
    </div>
  );
}
