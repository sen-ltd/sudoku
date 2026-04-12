/**
 * Sudoku puzzle generator.
 * Generates a complete board, then removes cells while ensuring a unique solution.
 */

import { solve, countSolutions, emptyBoard, candidates } from './solver.js';

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function generateCompleteBoard() {
  const board = emptyBoard();
  fillBoard(board);
  return board;
}

function fillBoard(board) {
  const cands = candidates(board);

  let minIdx = -1;
  let minSize = 10;
  for (let i = 0; i < 81; i++) {
    if (cands[i] && cands[i].size < minSize) {
      minSize = cands[i].size;
      minIdx = i;
    }
  }

  if (minIdx === -1) return true;
  if (minSize === 0) return false;

  const digits = shuffle([...cands[minIdx]]);
  for (const d of digits) {
    board[minIdx] = d;
    if (fillBoard(board)) return true;
    board[minIdx] = 0;
  }
  return false;
}

const CLUE_COUNTS = {
  easy: { min: 36, max: 42 },
  medium: { min: 28, max: 35 },
  hard: { min: 22, max: 27 },
};

export function generatePuzzle(difficulty = 'medium') {
  const solution = generateCompleteBoard();
  const puzzle = solution.slice();
  const range = CLUE_COUNTS[difficulty];
  const targetClues = range.min + Math.floor(Math.random() * (range.max - range.min + 1));

  const indices = shuffle(Array.from({ length: 81 }, (_, i) => i));

  let clues = 81;
  for (const idx of indices) {
    if (clues <= targetClues) break;

    const backup = puzzle[idx];
    puzzle[idx] = 0;

    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[idx] = backup;
    } else {
      clues--;
    }
  }

  return { puzzle, solution };
}

export function rateDifficulty(board) {
  const clues = board.filter(v => v !== 0).length;
  if (clues >= 36) return 'easy';
  if (clues >= 28) return 'medium';
  return 'hard';
}
