import { useEffect } from "react";
import { useRenderer } from "./useSudokuRenderer";
import { useCursor } from "./useCursor";
import { useGameStatus } from "./useGameStatus";
import { useBoardState } from "./useBoardState";
import { useKeyBindings } from "./useKeyBindings";
import { useScore } from "../useScore";

export type UseGameOptions = {
  validateMoves?: boolean;
};

export function useGame(platformHook?: unknown, options?: UseGameOptions) {
  const { validateMoves = false } = options || {};
  const rendererManager = useRenderer();
  const { containerRef, renderEmptyBoard, renderBoard, highlightCursor } = rendererManager;
  const cursorManager = useCursor(rendererManager);
  const { cursor, moveCursor } = cursorManager;
  const gameManager = useGameStatus(rendererManager, cursorManager);
  const { gameStatus, setGameStatus, startGame, stopGame } = gameManager;
  const boardManager = useBoardState(cursorManager, { validateMoves });
  const { 
    board, 
    initialBoard, 
    solution, 
    setDigit, 
    erase, 
    reset, 
    solveBoard,
    isComplete,
    isFullyValid,
  } = boardManager;

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
  
  const { editMode, keyLog } = keyBindings;

  // ---------------------------
  // Scoring (needs keyLog from keyBindings)
  // ---------------------------
  const scoreManager = useScore({
    gameContext: { gameStatus, setGameStatus },
    keystrokeCount: keyLog.length,
    board,
    isComplete,
    isFullyValid,
    initialBoard,
  });

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
