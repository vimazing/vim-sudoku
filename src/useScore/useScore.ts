import { useEffect, useState } from "react";
import { useTimer } from "./hooks/useTimer";
import { useScoreTime } from "./useScoreTime";
import type { GameStatus } from "../types";

const TIME_LIMIT_MS = Infinity; // No time limit by default
const KEYSTROKE_LIMIT = Infinity; // No keystroke limit by default

type GameScoreContext = {
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
};

type UseScoreParams = {
  gameContext: GameScoreContext;
  keystrokeCount: number;
  board: string;
  isComplete: (board: string) => boolean;
  isFullyValid: (board: string) => boolean;
  initialBoard: string;
};

export function useScore({
  gameContext,
  keystrokeCount,
  board,
  isComplete,
  isFullyValid,
  initialBoard
}: UseScoreParams) {
  const timer = useTimer();
  const { gameStatus, setGameStatus } = gameContext;
  const { timeValue, startTimer, stopTimer, resetTimer } = timer;

  const [finalScore, setFinalScore] = useState<number | null>(null);

  const minMovesRequired = initialBoard.split("").filter(c => c === ".").length;
  const actualMoves = keystrokeCount;
  const efficiency = minMovesRequired > 0
    ? Math.round((actualMoves / minMovesRequired) * 100)
    : 0;

  useScoreTime({ gameStatus, timer });

  useEffect(() => {
    if (gameStatus !== "started") return;

    if (isComplete(board) && isFullyValid(board)) {
      setGameStatus("game-won");
      return;
    }

    if (timeValue >= TIME_LIMIT_MS) {
      setGameStatus("game-over");
      return;
    }

    if (keystrokeCount >= KEYSTROKE_LIMIT) {
      setGameStatus("game-over");
      return;
    }

    // TODO: Enable efficiency-based game-over in future
    // if (efficiency > 200) {
    //   setGameStatus("game-over");
    //   return;
    // }
  }, [gameStatus, timeValue, keystrokeCount, board, setGameStatus, isComplete, isFullyValid, efficiency]);

  useEffect(() => {
    const handleWin = () => {
      if (gameStatus === "started") {
        setGameStatus("game-won");
      }
    };
    window.addEventListener("sudoku-game-won", handleWin);
    return () => window.removeEventListener("sudoku-game-won", handleWin);
  }, [gameStatus, setGameStatus]);

  useEffect(() => {
    if (gameStatus !== "game-won") return;

    const timeInSeconds = timeValue / 1000;
    const baseScore = 100000;
    const timePenalty = Math.floor(timeInSeconds * 10);
    const extraMoves = Math.max(0, actualMoves - minMovesRequired);
    const movePenalty = extraMoves * 50;
    const score = Math.max(0, baseScore - timePenalty - movePenalty);

    setFinalScore(score);
  }, [gameStatus, timeValue, actualMoves, minMovesRequired]);

  return {
    timeValue,
    startTimer,
    stopTimer,
    resetTimer,
    finalScore,
    timeLimit: TIME_LIMIT_MS,
    keystrokeLimit: KEYSTROKE_LIMIT,
    minMovesRequired,
    actualMoves,
    efficiency,
  };
}

export type UseScoreType = ReturnType<typeof useScore>;
