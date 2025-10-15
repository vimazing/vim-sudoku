import { useEffect, useRef, useState } from "react";

export type KeyLogEntry = { key: string; timestamp: number };
export type EditMode = "navigation" | "edit";

type Ctx = {
  moveCursor: (dr: number, dc: number, steps?: number) => void;
  setDigit: (d: string) => void;
  erase: () => void;
  stopGame: () => void;
  cursor: { r: number; c: number };
  board: string;
  initialBoard: string;
};

export function useKeyBindings(ctx: Ctx) {
  const [keyLog, setKeyLog] = useState<KeyLogEntry[]>([]);
  const [editMode, setEditMode] = useState<EditMode>("navigation");
  const logRef = useRef<KeyLogEntry[]>([]);
  const countRef = useRef<string>(""); // Vim-style numeric prefix
  const lastMotionRef = useRef<{ dr: number; dc: number; steps: number } | null>(null);

  // Record keypresses for score/time analytics
  const recordKey = (key: string) => {
    const entry = { key, timestamp: performance.now() };
    logRef.current.push(entry);
    setKeyLog([...logRef.current]);
  };

  const clearLog = () => {
    logRef.current = [];
    setKeyLog([]);
  };

  const getLog = () => logRef.current;

  const resetCount = () => {
    countRef.current = "";
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key;

      // ========== EDIT MODE ==========
      if (editMode === "edit") {
        // Exit edit mode with Escape or Enter
        if (k === "Escape" || k === "Enter") {
          recordKey(k);
          setEditMode("navigation");
          return;
        }

        // Digits 1-9 set the cell value
        if (/^[1-9]$/.test(k)) {
          recordKey(k);
          ctx.setDigit(k);
          return;
        }

        // Erase with x or Backspace
        if (k === "x" || k === "Backspace") {
          recordKey(k);
          ctx.erase();
          return;
        }

        // Ignore all other keys in edit mode
        return;
      }

      // ========== NAVIGATION MODE ==========
      
      // Q to quit game
      if (k === "q" || k === "Q") {
        recordKey(k);
        ctx.stopGame();
        return;
      }

      // R or C to enter edit mode
      if (k === "r" || k === "R" || k === "c" || k === "C") {
        recordKey(k);
        
        // Check if current cell is a pre-filled clue (not editable)
        const cellIndex = ctx.cursor.r * 9 + ctx.cursor.c;
        const isClue = ctx.initialBoard[cellIndex] !== ".";
        
        if (isClue) {
          // Flash red - cell is locked
          window.dispatchEvent(new CustomEvent("sudoku-locked-cell"));
          return;
        }
        
        setEditMode("edit");
        return;
      }

      // Escape cancels count prefix
      if (k === "Escape") {
        recordKey(k);
        resetCount();
        return;
      }

      // Numeric prefixes (for counted motions)
      if (/^[0-9]$/.test(k) && k !== "0") {
        recordKey(k);
        countRef.current += k;
        return;
      }

      // Vim-style navigation
      let dr = 0;
      let dc = 0;
      if (k === "h") dc = -1;
      else if (k === "l") dc = 1;
      else if (k === "j") dr = 1;
      else if (k === "k") dr = -1;
      else if (k === "0" || k === "^") dc = -999; // go to col 0
      else if (k === "$") dc = 999; // go to col 8
      else if (k === ".") {
        recordKey(".");
        const last = lastMotionRef.current;
        if (last) ctx.moveCursor(last.dr, last.dc, last.steps);
        return;
      } else return;

      recordKey(k);

      const steps = Math.max(1, parseInt(countRef.current || "1", 10));
      resetCount();

      if (dc === -999) {
        ctx.moveCursor(0, -1, 99); // move far left
        lastMotionRef.current = { dr: 0, dc: -1, steps: 99 };
        return;
      }

      if (dc === 999) {
        ctx.moveCursor(0, 1, 99); // move far right
        lastMotionRef.current = { dr: 0, dc: 1, steps: 99 };
        return;
      }

      ctx.moveCursor(dr, dc, steps);
      lastMotionRef.current = { dr, dc, steps };
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ctx, editMode]);

  // ✅ same interface as vim-maze useKeyBindings
  return {
    keyLog,
    getLog,
    clearLog,
    resetCount,
    countRef,
    lastMotionRef,
    editMode,
  };
}

export type UseKeyBindingsType = ReturnType<typeof useKeyBindings>;
