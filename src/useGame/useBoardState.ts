import { useState, useCallback } from "react";
import { sudoku } from "../lib/Sudoku";
import type { UseCursorType } from "./useCursor";

export function useBoardState(cursorManager: UseCursorType) {
  const { cursor, setCursor } = cursorManager;
  const [board, setBoard] = useState<string>(sudoku.generate("medium"));
  const [initialBoard, setInitialBoard] = useState<string>(board);
  const [solution, setSolution] = useState<string | null>(null);

  const setDigit = useCallback(
    (d: string) => {
      const i = cursor.r * 9 + cursor.c;
      const arr = board.split("");
      arr[i] = d;
      setBoard(arr.join(""));
    },
    [cursor, board]
  );

  const erase = useCallback(() => {
    const i = cursor.r * 9 + cursor.c;
    const arr = board.split("");
    arr[i] = ".";
    setBoard(arr.join(""));
  }, [cursor, board]);

  const reset = useCallback(() => {
    const newBoard = sudoku.generate("medium");
    setBoard(newBoard);
    setInitialBoard(newBoard);
    setSolution(null);
    setCursor({ r: 0, c: 0 });
  }, [setCursor]);

  const solveBoard = useCallback(() => {
    const solved = sudoku.solve(board);
    if (solved) {
      setSolution(solved);
      setBoard(solved);
    }
  }, [board]);

  const boardToString = useCallback((human: boolean = false) => {
    // Computer-optimized: compact 81-character string
    if (!human) {
      return board;
    }

    // Human-readable: formatted grid with 3x3 box separators
    let result = "";
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const idx = r * 9 + c;
        result += board[idx] === "." ? "." : board[idx];
        if (c === 2 || c === 5) result += " | ";
        else if (c < 8) result += " ";
      }
      result += "\n";
      if (r === 2 || r === 5) result += "------+-------+------\n";
    }
    return result;
  }, [board]);

  return {
    board,
    initialBoard,
    solution,
    setDigit,
    erase,
    reset,
    solveBoard,
    boardToString,
  };
}

export type UseBoardStateType = ReturnType<typeof useBoardState>;
