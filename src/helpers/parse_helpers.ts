import { CellType, type CellAnswer } from "../types/types.ts";

export const BLACK_CELL_LAYOUT_VALUE = ".";

export function parseStringToLayoutAndAnswers({
  layoutString,
  rebusSolutionByCellIndex,
}: {
  layoutString: string;
  rebusSolutionByCellIndex?: Map<number, string>;
}): {
  layout: Array<CellType>;
  solution: Array<CellAnswer>;
} {
  const layout: Array<CellType> = [];
  const solution: Array<CellAnswer> = [];
  for (const [index, char] of layoutString.split("").entries()) {
    layout.push(
      char === BLACK_CELL_LAYOUT_VALUE ? CellType.BLACK : CellType.WHITE,
    );
    const answers: Array<string> = [];
    if (rebusSolutionByCellIndex?.has(index)) {
      answers.push(rebusSolutionByCellIndex.get(index)!);
    }
    answers.push(char === "." ? "" : char);
    solution.push({ answers });
  }
  return { layout, solution };
}

export function parseLayoutToInitialUserLayout(
  layout: Array<CellType>,
): Array<string> {
  return Array<string>(layout.length).fill("");
}
