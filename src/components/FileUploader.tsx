import { Upload } from "lucide-react";
import {
  CellType,
  type CellAnswer,
  type GridDefinition,
} from "../types/types.ts";
import { BLACK_CELL_LAYOUT_VALUE } from "../helpers/parse_helpers.ts";
import { useRef, useCallback, type ChangeEvent } from "react";

const decoder = new TextDecoder("iso-8859-1");

function readNullTerminated(bytes: Uint8Array, offset: number) {
  let end = offset;
  while (bytes[end] !== 0) end++;
  return {
    value: decoder.decode(bytes.slice(offset, end)),
    nextOffset: end + 1, // skip the null byte
  };
}

export function FileUploader({
  setGridDefinition,
  setClues,
}: {
  setGridDefinition: (def: GridDefinition) => void;
  setClues: (clues: Array<string>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onFileUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target?.files?.[0];
      if (!file) {
        return;
      }

      const buffer = await file.arrayBuffer();
      const view = new DataView(buffer);
      const bytes = new Uint8Array(buffer);

      const width = bytes[0x2c];
      const height = bytes[0x2d];
      const numClues = view.getUint16(0x2e, true); // true = little-endian

      const HEADER_SIZE = 0x34; // 52 bytes
      const gridSize = width * height;

      const solutionStart = HEADER_SIZE;
      const stateStart = solutionStart + gridSize;
      const stringsStart = stateStart + gridSize;

      const solutionString = String.fromCharCode(
        ...bytes.slice(HEADER_SIZE, HEADER_SIZE + gridSize),
      );

      let offset = stringsStart;

      const title = readNullTerminated(bytes, offset);
      offset = title.nextOffset;
      const author = readNullTerminated(bytes, offset);
      offset = author.nextOffset;
      const copyright = readNullTerminated(bytes, offset);
      offset = copyright.nextOffset;

      const clues: Array<string> = [];
      for (let i = 0; i < numClues; i++) {
        const clue = readNullTerminated(bytes, offset);
        clues.push(clue.value);
        offset = clue.nextOffset;
      }

      const notes = readNullTerminated(bytes, offset);
      // offset = notes.nextOffset;
      // while (offset < bytes.length - 8) {
      //   const tag = decoder.decode(bytes.slice(offset, offset + 4));
      //   const len = view.getUint16(offset + 4, true);
      //   // const checksum = view.getUint16(offset + 6, true);
      //   const data = bytes.slice(offset + 8, offset + 8 + len);

      //   if (tag === "GRBS") {
      //     /* rebus grid */
      //   }
      //   if (tag === "RTBL") {
      //     /* rebus table */
      //   }
      //   if (tag === "GEXT") {
      //     /* cell flags */
      //   }

      //   offset += 8 + len + 1; // +1 for the null terminator after data
      // }

      const layout = solutionString
        .split("")
        .map((char) =>
          char === BLACK_CELL_LAYOUT_VALUE ? CellType.BLACK : CellType.WHITE,
        );
      const solution = solutionString
        .split("")
        .map(
          (char): CellAnswer =>
            char === BLACK_CELL_LAYOUT_VALUE
              ? { answers: [] }
              : { answers: [char] },
        );
      setGridDefinition({
        width,
        height,
        layout,
        solution,
        title: title.value,
        note: notes.value,
        author: author.value,
      });
      setClues(clues);
    },
    [setClues, setGridDefinition],
  );

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      onClick={() => {
        inputRef.current?.click();
      }}
    >
      <div className="flex gap-3 border py-1 px-2 rounded-md border-blue-500 bg-blue-100 cursor-pointer text-lg items-center">
        Upload a .puz file
        <Upload />
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".puz"
        className="absolute"
        style={{ opacity: 0, display: "none" }}
        onChange={onFileUpload}
      />
    </div>
  );
}
