import { useGame } from "../../src/useGame/useGame";
import { useKeyBindings } from './useKeyBindings';
import "../../src/sudoku.css";

export default function App() {
  const { containerRef, initGame, solveBoard } = useGame(useKeyBindings);

  return (
    <div style={{ padding: 16 }}>
      <h1>VIMazing Sudoku</h1>
      <div ref={containerRef} />
      <div className="mt-20">
        <button onClick={initGame}>New Puzzle</button>
        <button onClick={solveBoard}>Solve</button>
      </div>
    </div>
  );
}

