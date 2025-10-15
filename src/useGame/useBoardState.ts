import { useState } from "react";
import { sudoku } from "../lib/Sudoku";
import type { UseCursorType } from "./useCursor";

type UseBoardStateOptions = {
  validateMoves?: boolean;
};

export function useBoardState(cursorManager: UseCursorType, options?: UseBoardStateOptions) {
  const { cursor, setCursor } = cursorManager;
  const { validateMoves = false } = options || {};
  const [board, setBoard] = useState<string>(sudoku.generate("medium"));
  const [initialBoard, setInitialBoard] = useState<string>(board);
  const [solution, setSolution] = useState<string | null>(null);

  const givenCells = () => {
    const cells = new Set<number>();
    for (let i = 0; i < initialBoard.length; i++) {
      if (initialBoard[i] !== ".") {
        cells.add(i);
      }
    }
    return cells;
  };

  const canEditCell = (row: number, col: number): boolean => {
    const index = row * 9 + col;
    return !givenCells().has(index);
  };

  const isValidPlacement = (testBoard: string, row: number, col: number, digit: string): boolean => {
    if (digit === ".") return true;

    for (let c = 0; c < 9; c++) {
      const checkIdx = row * 9 + c;
      if (c !== col && testBoard[checkIdx] === digit) {
        return false;
      }
    }

    for (let r = 0; r < 9; r++) {
      const checkIdx = r * 9 + col;
      if (r !== row && testBoard[checkIdx] === digit) {
        return false;
      }
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        const checkIdx = r * 9 + c;
        if ((r !== row || c !== col) && testBoard[checkIdx] === digit) {
          return false;
        }
      }
    }

    return true;
  };

  const getConflicts = (testBoard: string, row: number, col: number): number[] => {
    const conflicts: number[] = [];
    const digit = testBoard[row * 9 + col];

    if (digit === ".") return conflicts;

    for (let c = 0; c < 9; c++) {
      if (c !== col && testBoard[row * 9 + c] === digit) {
        conflicts.push(row * 9 + c);
      }
    }

    for (let r = 0; r < 9; r++) {
      if (r !== row && testBoard[r * 9 + col] === digit) {
        conflicts.push(r * 9 + col);
      }
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && testBoard[r * 9 + c] === digit) {
          const idx = r * 9 + c;
          if (!conflicts.includes(idx)) {
            conflicts.push(idx);
          }
        }
      }
    }

    return conflicts;
  };

  const isFullyValid = (testBoard: string): boolean => {
    for (let r = 0; r < 9; r++) {
      let rowSum = 0;
      for (let c = 0; c < 9; c++) {
        const digit = testBoard[r * 9 + c];
        if (digit === ".") return false;
        rowSum += parseInt(digit, 10);
      }
      if (rowSum !== 45) return false;
    }

    for (let c = 0; c < 9; c++) {
      let colSum = 0;
      for (let r = 0; r < 9; r++) {
        const digit = testBoard[r * 9 + c];
        colSum += parseInt(digit, 10);
      }
      if (colSum !== 45) return false;
    }

    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        let boxSum = 0;
        for (let r = boxRow * 3; r < boxRow * 3 + 3; r++) {
          for (let c = boxCol * 3; c < boxCol * 3 + 3; c++) {
            const digit = testBoard[r * 9 + c];
            boxSum += parseInt(digit, 10);
          }
        }
        if (boxSum !== 45) return false;
      }
    }

    return true;
  };

  const isComplete = (testBoard: string): boolean => {
    return !testBoard.includes(".");
  };

  const setDigit = (d: string) => {
    const cellIndex = cursor.r * 9 + cursor.c;

    if (!canEditCell(cursor.r, cursor.c)) {
      window.dispatchEvent(new CustomEvent("sudoku-locked-cell"));
      return false;
    }

    const arr = board.split("");
    arr[cellIndex] = d;
    const newBoard = arr.join("");

    if (validateMoves && !isValidPlacement(newBoard, cursor.r, cursor.c, d)) {
      const conflicts = getConflicts(newBoard, cursor.r, cursor.c);
      window.dispatchEvent(
        new CustomEvent("sudoku-invalid-move", {
          detail: { row: cursor.r, col: cursor.c, digit: d, conflicts },
        })
      );
      return false;
    }

    setBoard(newBoard);
    if (validateMoves) {
      window.dispatchEvent(
        new CustomEvent("sudoku-valid-move", {
          detail: { row: cursor.r, col: cursor.c, digit: d },
        })
      );
    }
    return true;
  };

  const erase = () => {
    if (!canEditCell(cursor.r, cursor.c)) {
      window.dispatchEvent(new CustomEvent("sudoku-locked-cell"));
      return false;
    }

    const i = cursor.r * 9 + cursor.c;
    const arr = board.split("");
    arr[i] = ".";
    setBoard(arr.join(""));
    return true;
  };

  const reset = () => {
    const newBoard = sudoku.generate("easy");
    setBoard(newBoard);
    setInitialBoard(newBoard);
    setSolution(null);
    setCursor({ r: 0, c: 0 });
  };

  const solveBoard = () => {
    const solved = sudoku.solve(initialBoard);
    if (solved) {
      setSolution(solved);
      setBoard(solved);
      window.dispatchEvent(new CustomEvent("sudoku-game-won"));
    }
  };

  const boardToString = (human: boolean = false) => {
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
  };

  return {
    board,
    initialBoard,
    solution,
    setDigit,
    erase,
    reset,
    solveBoard,
    boardToString,
    canEditCell,
    isValidPlacement,
    getConflicts,
    isFullyValid,
    isComplete,
    givenCells,
  };
}

export type UseBoardStateType = ReturnType<typeof useBoardState>;
