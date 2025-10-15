# @vimazing/vim-sudoku

Lightweight, typed **React hooks** and utilities for building interactive sudoku games with VIM-inspired controls.

Part of the [VIMazing](https://github.com/andrepadez/vimazing-vimaze) project.

---

## Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Hooks](#core-hooks)
- [Utilities](#utilities)
- [Example App](#example-app)
- [Build & Release](#build--release)
- [License](#license)

---

## Features
- **Drop-in hooks** for sudoku game logic, player control, scoring, and key logging.
- **Typed API** with generated declaration files for editor IntelliSense.
- **VIM-style navigation** (`h`, `j`, `k`, `l`, counts, `i` to start, etc.).
- **Composable architecture** – bring your own rendering and platform-specific bindings.
- **Tree-shakeable exports** to keep bundles lean.

---

## Installation

Using **npm**:

```bash
npm install @vimazing/vim-sudoku
```

Or with **bun**:

```bash
bun add @vimazing/vim-sudoku
```

---

## Quick Start

```tsx
import { useEffect } from "react";
import { useGame } from "@vimazing/vim-sudoku";

export function SudokuGame() {
  const { containerRef, gameStatus, startGame } = useGame();

  useEffect(() => {
    startGame();
  }, [startGame]);

  return (
    <section className="mx-auto w-fit space-y-4">
      <h1 className="text-2xl font-bold">VIMazing Sudoku</h1>
      <div ref={containerRef} className="relative" />
      {gameStatus === "game-won" && <p>🎉 You solved it!</p>}
    </section>
  );
}
```

Default controls:

| Key                 | Action          |
| ------------------- | --------------- |
| `i`                 | Start game      |
| `h` / `j` / `k` / `l` | Move cursor   |
| `<number>`          | Enter number    |
| `x` / `d`           | Clear cell      |
| `q`                 | Quit game       |
| `Esc`               | Cancel / pause  |

---

## Core Hooks

| Hook | Description |
| ---- | ----------- |
| `useGame(platformHook?)` | One-stop hook that wires sudoku generation, rendering, player state, scoring, and keyboard bindings. Returns refs, status helpers, and managers you can compose with your UI. |
| `useKeyBindings()` | Provides VIM-style key bindings, including repeat counts and movement helpers. |
| `useScore()` | Tracks timers, moves, and final score calculation. |

Each hook is exported individually, so you can cherry-pick only what you need:

```ts
import { useScore } from "@vimazing/vim-sudoku/useScore";
```

---

## Utilities

Besides the hooks, the library exports:

- `SudokuGenerator` – procedural sudoku puzzle generation class.
- `SudokuRenderer` – canvas renderer tailored for sudoku grids.
- `types` – shared TypeScript types such as `GameStatus`, `SudokuCell`, and `KeyLogEntry`.

```ts
import { SudokuGenerator, GameStatus } from "@vimazing/vim-sudoku";
```

---

## Example App

A demo application lives under `example/` and consumes the package directly.

```bash
cd example
bun install
bun run dev
```

During local development the Vite config aliases `@vimazing/vim-sudoku` to the source folder so you can iterate without rebuilding. When publishing, run the build first (see below) so editors consume the generated declarations in `dist/`.

---

## Build & Release

Build the distributable bundle and type declarations:

```bash
bun run build
```

This writes JavaScript, type definitions, and styles to `dist/`. The `prepublishOnly` hook reuses the same command to guarantee fresh artifacts before publishing.

---

## License

MIT © [André Padez](https://github.com/andrepadez)
