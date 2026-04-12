/**
 * Sudoku solver — constraint propagation + backtracking.
 * All functions are pure (no DOM, no side effects).
 * Board representation: 81-element flat array, 0 = empty.
 */

const ROWS = 9;
const COLS = 9;
const BOX = 3;
const ALL_DIGITS = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

export function rowOf(i) { return (i / COLS) | 0; }
export function colOf(i) { return i % COLS; }
export function boxOf(i) { return ((rowOf(i) / BOX) | 0) * BOX + ((colOf(i) / BOX) | 0); }

export function peers(index) {
  const r = rowOf(index);
  const c = colOf(index);
  const br = (r / BOX | 0) * BOX;
  const bc = (c / BOX | 0) * BOX;
  const result = new Set();
  for (let j = 0; j < 9; j++) {
    result.add(r * 9 + j);
    result.add(j * 9 + c);
  }
  for (let dr = 0; dr < BOX; dr++) {
    for (let dc = 0; dc < BOX; dc++) {
      result.add((br + dr) * 9 + (bc + dc));
    }
  }
  result.delete(index);
  return result;
}

const PEERS_CACHE = Array.from({ length: 81 }, (_, i) => peers(i));

export function candidates(board) {
  const cands = new Array(81);
  for (let i = 0; i < 81; i++) {
    if (board[i] !== 0) {
      cands[i] = null;
      continue;
    }
    const possible = new Set(ALL_DIGITS);
    for (const p of PEERS_CACHE[i]) {
      possible.delete(board[p]);
    }
    cands[i] = possible;
  }
  return cands;
}

export function validate(board) {
  for (let i = 0; i < 81; i++) {
    const v = board[i];
    if (v === 0) continue;
    if (v < 1 || v > 9) return false;
    for (const p of PEERS_CACHE[i]) {
      if (board[p] === v) return false;
    }
  }
  return true;
}

export function isComplete(board) {
  return board.every(v => v >= 1 && v <= 9) && validate(board);
}

export function conflicts(board, index, value) {
  const result = [];
  if (value === 0) return result;
  for (const p of PEERS_CACHE[index]) {
    if (board[p] === value) result.push(p);
  }
  return result;
}

export function solve(board, maxSolutions = 1) {
  const b = board.slice();
  const solutions = [];
  _solve(b, solutions, maxSolutions);
  return solutions.length === 0 ? null : solutions[0];
}

export function countSolutions(board, max = 2) {
  const b = board.slice();
  const solutions = [];
  _solve(b, solutions, max);
  return solutions.length;
}

function _solve(board, solutions, max) {
  if (solutions.length >= max) return;

  const cands = candidates(board);

  for (let i = 0; i < 81; i++) {
    if (cands[i] && cands[i].size === 0) return;
  }

  let minIdx = -1;
  let minSize = 10;
  for (let i = 0; i < 81; i++) {
    if (cands[i] && cands[i].size < minSize) {
      minSize = cands[i].size;
      minIdx = i;
    }
  }

  if (minIdx === -1) {
    solutions.push(board.slice());
    return;
  }

  for (const v of cands[minIdx]) {
    board[minIdx] = v;
    _solve(board, solutions, max);
    if (solutions.length >= max) { board[minIdx] = 0; return; }
    board[minIdx] = 0;
  }
}

export function emptyBoard() {
  return new Array(81).fill(0);
}
