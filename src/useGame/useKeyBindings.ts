import { useEffect, useRef, useState } from "react";

export type KeyLogEntry = { key: string; timestamp: number };

type Ctx = {
  moveCursor: (dr: number, dc: number, steps?: number) => void;
  setDigit: (d: string) => void;
  erase: () => void;
};

export function useKeyBindings(ctx: Ctx) {
  const [keyLog, setKeyLog] = useState<KeyLogEntry[]>([]);
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

      // --- Digits 1–9 fill a cell ---
      if (/^[1-9]$/.test(k)) {
        recordKey(k);
        ctx.setDigit(k);
        resetCount();
        return;
      }

      // --- Erase ---
      if (k === "x" || k === "Backspace") {
        recordKey(k);
        ctx.erase();
        resetCount();
        return;
      }

      // --- Numeric prefixes ---
      if (/^[0-9]$/.test(k)) {
        recordKey(k);
        countRef.current += k;
        return;
      }

      // --- Vim-style navigation ---
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
  }, [ctx]);

  // ✅ same interface as vim-maze useKeyBindings
  return {
    keyLog,
    getLog,
    clearLog,
    resetCount,
    countRef,
    lastMotionRef,
  };
}

export type UseKeyBindingsType = ReturnType<typeof useKeyBindings>;
