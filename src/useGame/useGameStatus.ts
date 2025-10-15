import { useCallback, useState, useMemo } from "react";
import type { UseRenderer } from "./useSudokuRenderer";
import type { UseCursorType } from "./useCursor";
import type { GameStatus } from "../types";
import { getGamePhase, isPlaying } from "../types";

export type { GameStatus } from "../types";

export function useGameStatus(
  rendererManager: UseRenderer,
  cursorManager: UseCursorType
) {
  const { containerRef } = rendererManager;
  const { setCursor } = cursorManager;
  const [gameStatus, setGameStatus] = useState<GameStatus>("waiting");

  const gamePhase = useMemo(() => getGamePhase(gameStatus), [gameStatus]);
  const playStatus = useMemo(
    () => (isPlaying(gameStatus) ? gameStatus : null),
    [gameStatus]
  );

  const startGame = useCallback(() => {
    setGameStatus("started");
  }, []);

  const stopGame = useCallback(() => {
    setCursor({ r: 0, c: 0 });
    setGameStatus("waiting");
    const container = containerRef.current;
    container?.querySelectorAll(".active").forEach((el) => el.classList.remove("active"));
  }, [setCursor, containerRef]);

  return {
    gameStatus,
    gamePhase,
    playStatus,
    setGameStatus,
    startGame,
    stopGame,
  };
}

export type UseGameStatusType = ReturnType<typeof useGameStatus>;
