import { useEffect } from "react";
import { useRenderer } from "./useSudokuRenderer";
import { useCursor } from "./useCursor";
import { useGameStatus } from "./useGameStatus";
import { useBoardState } from "./useBoardState";
import { useKeyBindings } from "./useKeyBindings";

export function useGame(platformHook?: unknown) {
  const rendererManager = useRenderer();
  const { containerRef, renderEmptyBoard, renderBoard, highlightCursor } = rendererManager;
  const cursorManager = useCursor(rendererManager);
  const { cursor, moveCursor } = cursorManager;
  const gameManager = useGameStatus(rendererManager, cursorManager);
  const { gameStatus, setGameStatus, startGame, stopGame } = gameManager;
  const boardManager = useBoardState(cursorManager);
  const { board, initialBoard, solution, setDigit, erase, reset, solveBoard } = boardManager;

  // ---------------------------
  // Rendering
  // ---------------------------
  useEffect(() => {
    renderEmptyBoard();
  }, [renderEmptyBoard]);

  useEffect(() => {
    if (gameStatus === "waiting") {
      renderEmptyBoard();
    } else {
      renderBoard(board, initialBoard);
      highlightCursor(cursor.r, cursor.c);
    }
  }, [gameStatus, board, initialBoard, cursor, renderEmptyBoard, renderBoard, highlightCursor]);

  // ---------------------------
  // Keybindings
  // ---------------------------
  const keyBindings = useKeyBindings({
    moveCursor,
    setDigit,
    erase,
  });

  // ---------------------------
  // Game Control
  // ---------------------------
  const initGame = () => {
    reset();
    startGame();
  };

  // ---------------------------
  // Full Game Manager
  // ---------------------------
  const fullGameManager = {
    // core
    containerRef,
    gameManager,
    gameStatus,
    setGameStatus,
    startGame,
    stopGame,
    initGame,

    // cursor
    cursorManager,
    cursor,
    moveCursor,

    // board state
    boardManager,
    board,
    solution,
    setDigit,
    erase,
    reset,
    solveBoard,

    // keybindings (vim-maze compatible)
    ...keyBindings,
  };

  // allow platform-level injection
  if (typeof platformHook === "function") {
    platformHook(fullGameManager);
  }

  return fullGameManager;
}
