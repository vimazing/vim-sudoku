// src/lib/Sudoku.ts
// Direct TypeScript + ES module version of Robatron's sudoku.js
// https://github.com/robatron/sudoku.js
// No algorithmic changes – only syntax, structure, and typing updates.

export type DifficultyName =
  | "easy"
  | "medium"
  | "hard"
  | "very-hard"
  | "insane"
  | "inhuman";

export type Difficulty = DifficultyName | number;

const sudoku: any = {};

sudoku.DIGITS = "123456789";
const ROWS = "ABCDEFGHI";
const COLS = sudoku.DIGITS;
let SQUARES: string[] = [];

let UNITS: string[][] = [];
let SQUARE_UNITS_MAP: Record<string, string[][]> = {};
let SQUARE_PEERS_MAP: Record<string, string[]> = {};

const MIN_GIVENS = 17;
const NR_SQUARES = 81;

const DIFFICULTY: Record<DifficultyName, number> = {
  easy: 62,
  medium: 53,
  hard: 44,
  "very-hard": 35,
  insane: 26,
  inhuman: 17,
};

sudoku.BLANK_CHAR = ".";
sudoku.BLANK_BOARD = sudoku.BLANK_CHAR.repeat(NR_SQUARES);

function initialize() {
  SQUARES = sudoku._cross(ROWS, COLS);
  UNITS = sudoku._get_all_units(ROWS, COLS);
  SQUARE_UNITS_MAP = sudoku._get_square_units_map(SQUARES, UNITS);
  SQUARE_PEERS_MAP = sudoku._get_square_peers_map(SQUARES, SQUARE_UNITS_MAP);
}

// ---------------------------------------------------------------------------
// Generate
// ---------------------------------------------------------------------------

sudoku.generate = function (difficulty: Difficulty, unique?: boolean): string {
  let numericDifficulty: number;
  if (typeof difficulty === "string" || typeof difficulty === "undefined") {
    numericDifficulty = DIFFICULTY[difficulty as DifficultyName] || DIFFICULTY.easy;
  } else {
    numericDifficulty = difficulty;
  }

  numericDifficulty = sudoku._force_range(numericDifficulty, NR_SQUARES + 1, MIN_GIVENS);
  unique = unique ?? true;

  const blank_board = sudoku.BLANK_BOARD;
  let candidates = sudoku._get_candidates_map(blank_board);

  const shuffled_squares = sudoku._shuffle(SQUARES);

  for (const square of shuffled_squares) {
    const rand_candidate_idx = sudoku._rand_range(candidates[square].length);
    const rand_candidate = candidates[square][rand_candidate_idx];
    if (!sudoku._assign(candidates, square, rand_candidate)) break;

    const single_candidates: string[] = [];
    for (const s of SQUARES) {
      if (candidates[s].length === 1) single_candidates.push(candidates[s]);
    }

    if (
      single_candidates.length >= numericDifficulty &&
      sudoku._strip_dups(single_candidates).length >= 8
    ) {
      let board = "";
      let givens_idxs: number[] = [];

      for (let i = 0; i < SQUARES.length; i++) {
        const s = SQUARES[i];
        if (candidates[s].length === 1) {
          board += candidates[s];
          givens_idxs.push(i);
        } else {
          board += sudoku.BLANK_CHAR;
        }
      }

      if (givens_idxs.length > numericDifficulty) {
        givens_idxs = sudoku._shuffle(givens_idxs);
        for (let i = 0; i < givens_idxs.length - numericDifficulty; ++i) {
          const target = givens_idxs[i];
          board =
            board.substring(0, target) +
            sudoku.BLANK_CHAR +
            board.substring(target + 1);
        }
      }

      if (sudoku.solve(board)) return board;
    }
  }

  return sudoku.generate(numericDifficulty);
};

// ---------------------------------------------------------------------------
// Solve
// ---------------------------------------------------------------------------

sudoku.solve = function (board: string, reverse?: boolean): string | false {
  const report = sudoku.validate_board(board);
  if (report !== true) throw report;

  let nr_givens = 0;
  for (const ch of board) {
    if (ch !== sudoku.BLANK_CHAR && sudoku._in(ch, sudoku.DIGITS)) nr_givens++;
  }
  if (nr_givens < MIN_GIVENS) throw "Too few givens";

  reverse = reverse || false;
  const candidates = sudoku._get_candidates_map(board);
  const result = sudoku._search(candidates, reverse);

  if (result) {
    let solution = "";
    for (const s of SQUARES) solution += result[s];
    return solution;
  }
  return false;
};

// ---------------------------------------------------------------------------
// Get candidates
// ---------------------------------------------------------------------------

sudoku.get_candidates = function (board: string): string[][] | false {
  const report = sudoku.validate_board(board);
  if (report !== true) throw report;

  const map = sudoku._get_candidates_map(board);
  if (!map) return false;

  const rows: string[][] = [];
  let cur_row: string[] = [];
  let i = 0;
  for (const square in map) {
    cur_row.push(map[square]);
    if (i % 9 === 8) {
      rows.push(cur_row);
      cur_row = [];
    }
    ++i;
  }
  return rows;
};

sudoku._get_candidates_map = function (board: string): Record<string, string> | false {
  const report = sudoku.validate_board(board);
  if (report !== true) throw report;

  const map: Record<string, string> = {};
  const squares_values = sudoku._get_square_vals_map(board);

  for (const s of SQUARES) map[s] = sudoku.DIGITS;

  for (const s in squares_values) {
    const val = squares_values[s];
    if (sudoku._in(val, sudoku.DIGITS)) {
      const new_candidates = sudoku._assign(map, s, val);
      if (!new_candidates) return false;
    }
  }
  return map;
};

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

sudoku._search = function (candidates: Record<string, string>, reverse: boolean): any {
  if (!candidates) return false;
  reverse = reverse || false;

  let max_nr_candidates = 0;
  for (const s of SQUARES) {
    const n = candidates[s].length;
    if (n > max_nr_candidates) {
      max_nr_candidates = n;
    }
  }
  if (max_nr_candidates === 1) return candidates;

  let min_nr_candidates = 10;
  let min_square = "";
  for (const s of SQUARES) {
    const n = candidates[s].length;
    if (n < min_nr_candidates && n > 1) {
      min_nr_candidates = n;
      min_square = s;
    }
  }

  const min_candidates = candidates[min_square];
  if (!reverse) {
    for (const v of min_candidates) {
      const copy = JSON.parse(JSON.stringify(candidates));
      const next = sudoku._search(sudoku._assign(copy, min_square, v), reverse);
      if (next) return next;
    }
  } else {
    for (let i = min_candidates.length - 1; i >= 0; --i) {
      const v = min_candidates[i];
      const copy = JSON.parse(JSON.stringify(candidates));
      const next = sudoku._search(sudoku._assign(copy, min_square, v), reverse);
      if (next) return next;
    }
  }
  return false;
};

// ---------------------------------------------------------------------------
// Assignment / elimination logic
// ---------------------------------------------------------------------------

sudoku._assign = function (candidates: Record<string, string>, square: string, val: string) {
  const others = candidates[square].replace(val, "");
  for (const v of others) {
    const next = sudoku._eliminate(candidates, square, v);
    if (!next) return false;
  }
  return candidates;
};

sudoku._eliminate = function (candidates: Record<string, string>, square: string, val: string) {
  if (!sudoku._in(val, candidates[square])) return candidates;

  candidates[square] = candidates[square].replace(val, "");
  const n = candidates[square].length;

  if (n === 1) {
    const target_val = candidates[square];
    for (const peer of SQUARE_PEERS_MAP[square]) {
      const next = sudoku._eliminate(candidates, peer, target_val);
      if (!next) return false;
    }
  } else if (n === 0) return false;

  for (const unit of SQUARE_UNITS_MAP[square]) {
    const places: string[] = [];
    for (const sq of unit) {
      if (sudoku._in(val, candidates[sq])) places.push(sq);
    }
    if (places.length === 0) return false;
    else if (places.length === 1) {
      const next = sudoku._assign(candidates, places[0], val);
      if (!next) return false;
    }
  }
  return candidates;
};

// ---------------------------------------------------------------------------
// Data structures
// ---------------------------------------------------------------------------

sudoku._get_square_vals_map = function (board: string) {
  const map: Record<string, string> = {};
  if (board.length !== SQUARES.length) throw "Board length mismatch";
  for (let i = 0; i < SQUARES.length; i++) map[SQUARES[i]] = board[i];
  return map;
};

sudoku._get_square_units_map = function (squares: string[], units: string[][]) {
  const map: Record<string, string[][]> = {};
  for (const s of squares) {
    const list: string[][] = [];
    for (const u of units) if (u.includes(s)) list.push(u);
    map[s] = list;
  }
  return map;
};

sudoku._get_square_peers_map = function (
  squares: string[],
  units_map: Record<string, string[][]>
) {
  const map: Record<string, string[]> = {};
  for (const s of squares) {
    const peers: string[] = [];
    for (const unit of units_map[s]) {
      for (const sq of unit) {
        if (sq !== s && !peers.includes(sq)) peers.push(sq);
      }
    }
    map[s] = peers;
  }
  return map;
};

sudoku._get_all_units = function (rows: string, cols: string) {
  const units: string[][] = [];
  for (const r of rows) units.push(sudoku._cross(r, cols));
  for (const c of cols) units.push(sudoku._cross(rows, c));
  const row_blocks = ["ABC", "DEF", "GHI"];
  const col_blocks = ["123", "456", "789"];
  for (const rb of row_blocks)
    for (const cb of col_blocks)
      units.push(sudoku._cross(rb, cb));
  return units;
};

// ---------------------------------------------------------------------------
// Utils
// ---------------------------------------------------------------------------

sudoku.validate_board = function (board: string): true | string {
  if (!board) return "Empty board";
  if (board.length !== NR_SQUARES) return "Invalid board size";
  for (let i = 0; i < board.length; i++) {
    const c = board[i];
    if (!sudoku._in(c, sudoku.DIGITS) && c !== sudoku.BLANK_CHAR)
      return `Invalid char at ${i}: ${c}`;
  }
  return true;
};

sudoku._cross = function (a: string, b: string) {
  const res: string[] = [];
  for (const ai of a) for (const bi of b) res.push(ai + bi);
  return res;
};

sudoku._in = function (v: string, seq: string) {
  return seq.indexOf(v) !== -1;
};

sudoku._shuffle = function <T>(seq: T[]): T[] {
  const arr = [...seq];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

sudoku._rand_range = function (max: number, min = 0) {
  return Math.floor(Math.random() * (max - min)) + min;
};

sudoku._strip_dups = function <T>(seq: T[]): T[] {
  return Array.from(new Set(seq));
};

sudoku._force_range = function (nr: number, max: number, min = 0) {
  return Math.min(Math.max(nr || 0, min), max);
};

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
initialize();

export { sudoku };

