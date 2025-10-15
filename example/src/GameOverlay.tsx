import type { GameStatus, UseScoreType } from "../../src/types";
import { useIsMobile } from "./useIsMobile";
import { MobileGameOverlay } from "./MobileGameOverlay";

type GameOverlayProps = {
  gameStatus: GameStatus;
  scoreManager: UseScoreType;
};

export const GameOverlay = ({ gameStatus, scoreManager }: GameOverlayProps) => {
  const isMobile = useIsMobile();
  if (isMobile) return <MobileGameOverlay gameStatus={gameStatus} scoreManager={scoreManager} />

  if (gameStatus === "started") return null;

  return (
    <GameOverlayContainer>
      {gameStatus === "waiting" && <GameWaitingContent />}
      {gameStatus === "game-over" && <GameOverContent />}
      {gameStatus === "game-won" && <GameWonContent scoreManager={scoreManager} />}
    </GameOverlayContainer>
  );
};

export const GameWaitingContent = () => {
  return (
    <div
      className="text-[#c8d3f5] text-[2em] font-mono text-center select-none"
      style={{ textShadow: "2px 2px 4px rgba(27, 29, 43, 0.9)" }}
    >
      <div className="flex flex-col gap-10">
        <p className="text-[3rem]">Press <strong className="text-[#82aaff]">New Puzzle</strong> to start</p>
        <div className="text-[1.2em]">
          <p className="mb-4"><strong className="text-[#ffc777]">Navigation Mode</strong> (default):</p>
          <p><strong className="text-[#82aaff]">h</strong>,<strong className="text-[#82aaff]">j</strong>,<strong className="text-[#82aaff]">k</strong>,<strong className="text-[#82aaff]">l</strong> to move around</p>
          <p className="mt-2"><strong className="text-[#82aaff]">R</strong> or <strong className="text-[#82aaff]">C</strong> to enter edit mode</p>
          
          <p className="mt-6 mb-4"><strong className="text-[#ffc777]">Edit Mode</strong>:</p>
          <p>Type <strong className="text-[#82aaff]">1-9</strong> to fill cell</p>
          <p className="mt-2"><strong className="text-[#82aaff]">Esc</strong> or <strong className="text-[#82aaff]">Enter</strong> to exit edit mode</p>
          
          <p className="mt-6 text-[0.8em] text-[#828bb8]">
            Try vim motions: <strong className="text-[#82aaff]">$</strong>, <strong className="text-[#82aaff]">^</strong>, <strong className="text-[#82aaff]">0</strong>, counted moves
          </p>
        </div>
      </div>
    </div>
  );
};

export const GameWonContent = ({ scoreManager }: { scoreManager: UseScoreType }) => {
  const finalScore = scoreManager.finalScore ?? 0;

  return (
    <div
      className="text-[#c8d3f5] text-[2em] grid gap-4 font-mono uppercase text-center select-none"
      style={{ textShadow: "2px 2px 4px rgba(27, 29, 43, 0.9)" }}
    >
      <p className="text-[#c3e88d]">🎉 Puzzle Solved!</p>
      <p>Final Score:</p>
      <p className="text-[#82aaff] text-[2.5em]">{finalScore.toLocaleString()}</p>
      <p className="text-[#828bb8] text-[0.65em] normal-case">
        <span className="text-[#c099ff]">max</span>
        <span className="text-[#c8d3f5]">(</span>
        <span className="text-[#ff966c]">0</span>
        <span className="text-[#c8d3f5]">, </span>
        <span className="text-[#ff966c]">100000</span>
        <span className="text-[#c8d3f5]"> - </span>
        <span className="text-[#82aaff]">timeInSeconds</span>
        <span className="text-[#c8d3f5]"> * </span>
        <span className="text-[#ff966c]">10</span>
        <span className="text-[#c8d3f5]">)</span>
      </p>
      <p className="text-[#828bb8]">Click <strong className="text-[#ffc777] normal-case">New Puzzle</strong> to play again</p>
    </div>
  );
};

export const GameOverContent = () => {
  return (
    <div
      className="text-[#ff757f] font-mono uppercase text-center select-none"
      style={{ textShadow: "2px 2px 4px rgba(27, 29, 43, 0.9)" }}
    >
      <p className="text-[5em]">Game Over</p>
      <p className="text-[2em] text-[#828bb8]">Press <strong className="text-[#ffc777] normal-case">i</strong> to play again</p>
    </div>
  );
};

export const GameOverlayContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div
      className="
        absolute inset-0
        flex justify-center items-center
        z-40
        pointer-events-none
      "
      style={{
        backgroundColor: 'rgba(27, 29, 43, 0.75)',
        backdropFilter: 'blur(1px)'
      }}
    >
      {children}
    </div>
  );
};



