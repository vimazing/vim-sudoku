import { useEffect } from "react";
import { useRenderer } from "./useSudokuRenderer";
import { useCursor } from "./useCursor";
import { useGameStatus } from "./useGameStatus";
import { useBoardState } from "./useBoardState";
import { useKeyBindings } from "./useKeyBindings";
import { useScore } from "../useScore";

export function useGame(platformHook?: unknown) {
  const rendererManager = useRenderer();
  const { containerRef, renderEmptyBoard, renderBoard, highlightCursor } = rendererManager;
  const cursorManager = useCursor(rendererManager);
  const { cursor, moveCursor } = cursorManager;
  const gameManager = useGameStatus(rendererManager, cursorManager);
  const { gameStatus, setGameStatus, startGame, stopGame } = gameManager;
  const boardManager = useBoardState(cursorManager);
  const { board, initialBoard, solution, setDigit, erase, reset, solveBoard } = boardManager;

  const scoreManager = useScore({
    gameContext: { gameStatus, setGameStatus },
  });

  // ---------------------------
  // Keybindings
  // ---------------------------
  const keyBindings = useKeyBindings({
    moveCursor,
    setDigit,
    erase,
    stopGame,
    cursor,
    board,
    initialBoard,
  });
  
  const { editMode } = keyBindings;

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
      highlightCursor(cursor.r, cursor.c, editMode === "edit");
    }
  }, [gameStatus, board, initialBoard, cursor, editMode, renderEmptyBoard, renderBoard, highlightCursor]);

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

    // scoring
    scoreManager,

    // keybindings (vim-maze compatible)
    ...keyBindings,
  };

  // allow platform-level injection
  if (typeof platformHook === "function") {
    platformHook(fullGameManager);
  }

  return fullGameManager;
}
