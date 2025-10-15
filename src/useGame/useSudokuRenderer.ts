import { useRef, useCallback } from "react";

export function useRenderer() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const renderEmptyBoard = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const sudokuDiv = document.createElement("div");
    sudokuDiv.id = "sudoku";

    const grid = document.createElement("div");
    grid.className = "sudoku-grid";

    for (let i = 0; i < 81; i++) {
      const r = Math.floor(i / 9);
      const c = i % 9;
      const cell = document.createElement("div");
      cell.className = "sudoku-cell";
      cell.dataset.r = String(r);
      cell.dataset.c = String(c);
      cell.textContent = "";
      grid.appendChild(cell);
    }

    sudokuDiv.appendChild(grid);
    container.appendChild(sudokuDiv);
  }, []);

  const renderBoard = useCallback((board: string, initialBoard?: string) => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";
    const sudokuDiv = document.createElement("div");
    sudokuDiv.id = "sudoku";

    const grid = document.createElement("div");
    grid.className = "sudoku-grid";

    for (let i = 0; i < 81; i++) {
      const r = Math.floor(i / 9);
      const c = i % 9;
      const cell = document.createElement("div");
      cell.className = "sudoku-cell";
      cell.dataset.r = String(r);
      cell.dataset.c = String(c);
      cell.textContent = board[i] === "." ? "" : board[i];
      
      if (initialBoard && board[i] !== "." && board[i] !== initialBoard[i]) {
        cell.classList.add("user-entered");
      }
      
      grid.appendChild(cell);
    }

    sudokuDiv.appendChild(grid);
    container.appendChild(sudokuDiv);
  }, []);

  const highlightCursor = useCallback((r: number, c: number) => {
    const container = containerRef.current;
    if (!container) return;
    
    const sudokuDiv = container.querySelector("#sudoku");
    if (!sudokuDiv) return;

    sudokuDiv.querySelectorAll(".active").forEach((el) => el.classList.remove("active"));
    
    const selector = `.sudoku-cell[data-r="${r}"][data-c="${c}"]`;
    const cell = sudokuDiv.querySelector(selector);
    if (cell) {
      cell.classList.add("active");
    }
  }, []);

  return { containerRef, renderEmptyBoard, renderBoard, highlightCursor };
}

export type UseRenderer = ReturnType<typeof useRenderer>;

