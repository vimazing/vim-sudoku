# Changelog

All notable changes to @vimazing/vim-sudoku will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-15

### Added
- Initial release of @vimazing/vim-sudoku
- VIM-style modal editing with navigation and edit modes
- Full VIM motions (h/j/k/l, counted moves, ^/$/0, repeat with .)
- Smart cell locking for pre-filled clues
- Real-time validation system (optional, disabled by default)
- Automatic win detection using sum-to-45 algorithm
- Time-based scoring with keystroke penalties
- Tokyo Night themed CSS with 3x3 box separators
- Configurable size multiplier via CSS variables
- Complete TypeScript support with type declarations
- Composable hook architecture (useGame, useScore, useBoardState, etc.)
- Tree-shakeable exports

### Features
- `useGame(platformHook?, options?)` - Main game orchestration hook
  - `validateMoves` option for real-time move validation (default: false)
- Automatic win detection when board is complete and valid
- Scoring formula: `max(0, 100000 - timeInSeconds × 10 - extraMoves × 50)`
- VIM modal editing: navigation mode (default) and edit mode (R/C/I to enter)
- Visual feedback for all game states (navigation glow, edit mode pulse, locked cells)
- Support for counted motions (3j, 5l, etc.)
- Row navigation shortcuts (^, $, 0)
- Repeat last motion with `.`

### Documentation
- Comprehensive README with usage examples
- VIM modal editing guide
- Cell state rules reference
- API documentation for all hooks
- Build and release instructions

[0.1.0]: https://github.com/vimazing/vim-sudoku/releases/tag/v0.1.0
