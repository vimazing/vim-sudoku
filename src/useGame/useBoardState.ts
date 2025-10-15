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

  return {
    board,
    initialBoard,
    solution,
    setDigit,
    erase,
    reset,
    solveBoard,
  };
}

export type UseBoardStateType = ReturnType<typeof useBoardState>;
