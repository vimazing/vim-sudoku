import { useRef, useState, useCallback, useEffect } from "react";
import type { UseRenderer } from "./useSudokuRenderer";

export function useCursor(rendererManager: UseRenderer) {
  const { containerRef } = rendererManager;
  const [cursor, setCursor] = useState<{ r: number; c: number }>({ r: 0, c: 0 });

  const animatingRef = useRef(false);

  const getCellEl = useCallback((r: number, c: number): HTMLElement | null => {
    const container = containerRef.current;
    if (!container) return null;
    const sudokuDiv = container.querySelector("#sudoku");
    if (!sudokuDiv) return null;
    const selector = `.sudoku-cell[data-r="${r}"][data-c="${c}"]`;
    return sudokuDiv.querySelector(selector) as HTMLElement | null;
  }, [containerRef]);

  const flashInvalid = useCallback(() => {
    const el = getCellEl(cursor.r, cursor.c);
    if (!el) return;
    el.classList.add("invalid-move");
    setTimeout(() => el.classList.remove("invalid-move"), 180);
  }, [cursor, getCellEl]);

  const flashLocked = useCallback(() => {
    const el = getCellEl(cursor.r, cursor.c);
    if (!el) return;
    el.classList.add("locked-cell");
    setTimeout(() => el.classList.remove("locked-cell"), 300);
  }, [cursor, getCellEl]);

  const flashValid = useCallback(() => {
    const el = getCellEl(cursor.r, cursor.c);
    if (!el) return;
    el.classList.add("valid-move");
    setTimeout(() => el.classList.remove("valid-move"), 300);
  }, [cursor, getCellEl]);

  const highlightConflicts = useCallback((conflictIndices: number[]) => {
    const container = containerRef.current;
    if (!container) return;
    const sudokuDiv = container.querySelector("#sudoku");
    if (!sudokuDiv) return;

    conflictIndices.forEach((idx) => {
      const r = Math.floor(idx / 9);
      const c = idx % 9;
      const el = getCellEl(r, c);
      if (el) {
        el.classList.add("conflict");
      }
    });

    setTimeout(() => {
      conflictIndices.forEach((idx) => {
        const r = Math.floor(idx / 9);
        const c = idx % 9;
        const el = getCellEl(r, c);
        if (el) {
          el.classList.remove("conflict");
        }
      });
    }, 2000);
  }, [containerRef, getCellEl]);

  const moveCursor = useCallback(
    (dr: number, dc: number, steps = 1) => {
      if (animatingRef.current) return;

      setCursor((prev) => {
        const targetR = prev.r + (dr * steps);
        const targetC = prev.c + (dc * steps);

        // Check if the full counted move would go out of bounds
        if (targetR < 0 || targetR > 8 || targetC < 0 || targetC > 8) {
          // Flash invalid and don't move
          setTimeout(() => flashInvalid(), 0);
          return prev;
        }

        // Valid move - apply it
        return { r: targetR, c: targetC };
      });
    },
    [flashInvalid]
  );

  useEffect(() => {
    const onLockedCell = () => flashLocked();
    const onValidMove = () => flashValid();
    const onInvalidMove = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.conflicts) {
        highlightConflicts(detail.conflicts);
      }
      flashInvalid();
    };

    window.addEventListener("sudoku-locked-cell", onLockedCell);
    window.addEventListener("sudoku-valid-move", onValidMove);
    window.addEventListener("sudoku-invalid-move", onInvalidMove as EventListener);

    return () => {
      window.removeEventListener("sudoku-locked-cell", onLockedCell);
      window.removeEventListener("sudoku-valid-move", onValidMove);
      window.removeEventListener("sudoku-invalid-move", onInvalidMove as EventListener);
    };
  }, [flashLocked, flashValid, flashInvalid, highlightConflicts]);

  return {
    cursor,
    setCursor,
    moveCursor,
    getCellEl,
    flashInvalid,
    flashValid,
    highlightConflicts,
  };
}

export type UseCursorType = ReturnType<typeof useCursor>;
