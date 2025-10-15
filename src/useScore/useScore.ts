import { useEffect, useState } from "react";
import { useTimer } from "./hooks/useTimer";
import { useScoreTime } from "./useScoreTime";
import type { GameStatus } from "../types";

const TIME_LIMIT_MS = 60000; // 60 seconds
const KEYSTROKE_LIMIT = 100;

type GameScoreContext = {
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
};

type UseScoreParams = {
  gameContext: GameScoreContext;
  keystrokeCount: number;
};

export function useScore({ gameContext, keystrokeCount }: UseScoreParams) {
  const timer = useTimer();
  const { gameStatus, setGameStatus } = gameContext;
  const { timeValue, startTimer, stopTimer, resetTimer } = timer;

  const [finalScore, setFinalScore] = useState<number | null>(null);

  useScoreTime({ gameStatus, timer });

  // Check for game-over conditions
  useEffect(() => {
    if (gameStatus !== "started") return;

    // Time limit exceeded
    if (timeValue >= TIME_LIMIT_MS) {
      setGameStatus("game-over");
      return;
    }

    // Keystroke limit exceeded
    if (keystrokeCount >= KEYSTROKE_LIMIT) {
      setGameStatus("game-over");
      return;
    }
  }, [gameStatus, timeValue, keystrokeCount, setGameStatus]);

  useEffect(() => {
    if (gameStatus !== "game-won") return;

    const timeInSeconds = timeValue / 1000;
    const baseScore = 100000;
    const timePenalty = Math.floor(timeInSeconds * 10);
    const score = Math.max(0, baseScore - timePenalty);

    setFinalScore(score);
  }, [gameStatus, timeValue]);

  return {
    timeValue,
    startTimer,
    stopTimer,
    resetTimer,
    finalScore,
    timeLimit: TIME_LIMIT_MS,
    keystrokeLimit: KEYSTROKE_LIMIT,
  };
}

export type UseScoreType = ReturnType<typeof useScore>;
