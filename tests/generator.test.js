import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateCompleteBoard, generatePuzzle, rateDifficulty } from '../src/generator.js';
import { isComplete, validate, countSolutions } from '../src/solver.js';

test('generateCompleteBoard produces valid complete board', () => {
  const board = generateCompleteBoard();
  assert.equal(board.length, 81);
  assert.ok(isComplete(board));
});

test('generateCompleteBoard produces different boards', () => {
  const a = generateCompleteBoard();
  const b = generateCompleteBoard();
  assert.ok(a.some((v, i) => v !== b[i]));
});

test('generatePuzzle easy has 36-42 clues', () => {
  const { puzzle } = generatePuzzle('easy');
  const clues = puzzle.filter(v => v !== 0).length;
  assert.ok(clues >= 36 && clues <= 42, `expected 36-42 clues, got ${clues}`);
});

test('generatePuzzle medium has 28-35 clues', () => {
  const { puzzle } = generatePuzzle('medium');
  const clues = puzzle.filter(v => v !== 0).length;
  assert.ok(clues >= 28 && clues <= 35, `expected 28-35 clues, got ${clues}`);
});

test('generatePuzzle hard has 22-27 clues', () => {
  const { puzzle } = generatePuzzle('hard');
  const clues = puzzle.filter(v => v !== 0).length;
  assert.ok(clues >= 22 && clues <= 27, `expected 22-27 clues, got ${clues}`);
});

test('generatePuzzle returns valid incomplete board', () => {
  const { puzzle } = generatePuzzle('medium');
  assert.ok(validate(puzzle));
  assert.ok(!isComplete(puzzle));
});

test('generatePuzzle has unique solution', () => {
  const { puzzle } = generatePuzzle('medium');
  assert.equal(countSolutions(puzzle, 2), 1);
});

test('generatePuzzle solution matches', () => {
  const { puzzle, solution } = generatePuzzle('easy');
  assert.ok(isComplete(solution));
  for (let i = 0; i < 81; i++) {
    if (puzzle[i] !== 0) {
      assert.equal(puzzle[i], solution[i]);
    }
  }
});

test('rateDifficulty easy for 36+ clues', () => {
  const board = new Array(81).fill(0);
  for (let i = 0; i < 40; i++) board[i] = 1;
  assert.equal(rateDifficulty(board), 'easy');
});

test('rateDifficulty medium for 28-35 clues', () => {
  const board = new Array(81).fill(0);
  for (let i = 0; i < 30; i++) board[i] = 1;
  assert.equal(rateDifficulty(board), 'medium');
});

test('rateDifficulty hard for <28 clues', () => {
  const board = new Array(81).fill(0);
  for (let i = 0; i < 25; i++) board[i] = 1;
  assert.equal(rateDifficulty(board), 'hard');
});
