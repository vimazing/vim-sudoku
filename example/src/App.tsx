import { useEffect } from "react";
import { useGame } from "../../src/useGame/useGame";
import { useKeyBindings } from './useKeyBindings';
import { useMounted } from './useMounted';
import { GameOverlay } from './GameOverlay';
import "../../src/sudoku.css";

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default function App() {
  const mounted = useMounted();
  const {
    containerRef,
    initGame,
    solveBoard,
    scoreManager,
    boardManager,
    keyLog,
    gameStatus,
  } = useGame(useKeyBindings);

  const { timeValue, finalScore } = scoreManager;

  const stringed = boardManager.boardToString(true);

  useEffect(() => {
    console.log(stringed);
  }, [stringed]);

  return (
    <div style={{ padding: 16 }}>
      <h1>VIMazing Sudoku</h1>

      {/* Scoreboard */}
      <div style={{
        display: 'flex',
        gap: 32,
        marginBottom: 16,
        fontFamily: 'monospace',
        fontSize: 18,
      }}>
        <div>
          <strong>Time:</strong> {formatTime(timeValue)}
        </div>
        <div>
          <strong>Keystrokes:</strong> {keyLog.length}
        </div>
        {gameStatus === "game-won" && finalScore !== null && (
          <div style={{ color: '#82aaff', fontWeight: 'bold' }}>
            <strong>Score:</strong> {finalScore.toLocaleString()}
          </div>
        )}
      </div>

      <div className="relative w-fit mx-auto">
        <div ref={containerRef} />
        {mounted && <GameOverlay gameStatus={gameStatus} scoreManager={scoreManager} />}
      </div>

      <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
        <button onClick={initGame}>New Puzzle</button>
        <button onClick={solveBoard}>Solve</button>
      </div>
    </div>
  );
}

