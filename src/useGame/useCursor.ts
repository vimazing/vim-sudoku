import { useRef, useState, useCallback } from "react";
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

  const moveCursor = useCallback(
    (dr: number, dc: number, steps = 1) => {
      if (animatingRef.current) return;

      setCursor((prev) => {
        let r = prev.r;
        let c = prev.c;
        for (let i = 0; i < steps; i++) {
          r = Math.max(0, Math.min(8, r + dr));
          c = Math.max(0, Math.min(8, c + dc));
        }
        return { r, c };
      });
    },
    []
  );

  return {
    cursor,
    setCursor,
    moveCursor,
    getCellEl,
    flashInvalid,
  };
}

export type UseCursorType = ReturnType<typeof useCursor>;
