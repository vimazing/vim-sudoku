import { useEffect, useState } from "react";
import { useTimer } from "./hooks/useTimer";
import { useScoreTime } from "./useScoreTime";
import type { GameStatus } from "../types";

type GameScoreContext = {
  gameStatus: GameStatus;
  setGameStatus: (status: GameStatus) => void;
};

type UseScoreParams = {
  gameContext: GameScoreContext;
};

export function useScore({ gameContext }: UseScoreParams) {
  const timer = useTimer();
  const { gameStatus } = gameContext;
  const { timeValue, startTimer, stopTimer, resetTimer } = timer;

  const [finalScore, setFinalScore] = useState<number | null>(null);

  useScoreTime({ gameStatus, timer });

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
  };
}

export type UseScoreType = ReturnType<typeof useScore>;
