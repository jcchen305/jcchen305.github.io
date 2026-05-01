import { useState } from "react";
import "./App.css";
import { type GridDefinition } from "./types/types.ts";
import { Puzzle } from "./components/Puzzle.tsx";
import { FileUploader } from "./components/FileUploader.tsx";

function App() {
  const [gridDefinition, setGridDefinition] = useState<GridDefinition | null>(
    null,
  );
  const [clues, setClues] = useState<Array<string>>([]);

  return (
    <div className="flex w-full h-dvh self-center">
      <div className="flex flex-col w-full flex-auto aspect-square gap-3 p-5 m-5 border bg-gray-50 dark:bg-gray-700 dark:border-gray-500 justify-self-center rounded-md">
        {gridDefinition ? (
          <Puzzle gridDefinition={gridDefinition} cluesList={clues} />
        ) : (
          <FileUploader
            setGridDefinition={setGridDefinition}
            setClues={setClues}
          />
        )}
      </div>
    </div>
  );
}

export default App;
