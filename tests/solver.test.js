import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  rowOf, colOf, boxOf, peers,
  candidates, validate, isComplete,
  conflicts, solve, countSolutions, emptyBoard,
} from '../src/solver.js';

// --- Helpers ---
const EASY_PUZZLE = [
  5,3,0, 0,7,0, 0,0,0,
  6,0,0, 1,9,5, 0,0,0,
  0,9,8, 0,0,0, 0,6,0,
  8,0,0, 0,6,0, 0,0,3,
  4,0,0, 8,0,3, 0,0,1,
  7,0,0, 0,2,0, 0,0,6,
  0,6,0, 0,0,0, 2,8,0,
  0,0,0, 4,1,9, 0,0,5,
  0,0,0, 0,8,0, 0,7,9,
];

const EASY_SOLUTION = [
  5,3,4, 6,7,8, 9,1,2,
  6,7,2, 1,9,5, 3,4,8,
  1,9,8, 3,4,2, 5,6,7,
  8,5,9, 7,6,1, 4,2,3,
  4,2,6, 8,5,3, 7,9,1,
  7,1,3, 9,2,4, 8,5,6,
  9,6,1, 5,3,7, 2,8,4,
  2,8,7, 4,1,9, 6,3,5,
  3,4,5, 2,8,6, 1,7,9,
];

// --- rowOf / colOf / boxOf ---
test('rowOf returns correct row', () => {
  assert.equal(rowOf(0), 0);
  assert.equal(rowOf(8), 0);
  assert.equal(rowOf(9), 1);
  assert.equal(rowOf(80), 8);
});

test('colOf returns correct column', () => {
  assert.equal(colOf(0), 0);
  assert.equal(colOf(8), 8);
  assert.equal(colOf(9), 0);
  assert.equal(colOf(80), 8);
});

test('boxOf returns correct box', () => {
  assert.equal(boxOf(0), 0);
  assert.equal(boxOf(3), 1);
  assert.equal(boxOf(27), 3);
  assert.equal(boxOf(40), 4);
  assert.equal(boxOf(80), 8);
});

// --- peers ---
test('peers returns 20 unique cells', () => {
  const p = peers(0);
  assert.equal(p.size, 20);
  assert.ok(!p.has(0));
});

test('peers of center cell (40) has 20 elements', () => {
  assert.equal(peers(40).size, 20);
});

// --- candidates ---
test('candidates for filled cell is null', () => {
  const cands = candidates(EASY_PUZZLE);
  assert.equal(cands[0], null); // cell 0 = 5
});

test('candidates for empty cell returns valid set', () => {
  const cands = candidates(EASY_PUZZLE);
  assert.ok(cands[2] instanceof Set);
  assert.ok(cands[2].has(4)); // solution is 4
  assert.ok(!cands[2].has(5)); // 5 is in same row
});

test('candidates for empty board are all 1-9', () => {
  const board = emptyBoard();
  const cands = candidates(board);
  for (let i = 0; i < 81; i++) {
    assert.equal(cands[i].size, 9);
  }
});

// --- validate ---
test('validate accepts valid incomplete board', () => {
  assert.ok(validate(EASY_PUZZLE));
});

test('validate accepts valid complete board', () => {
  assert.ok(validate(EASY_SOLUTION));
});

test('validate rejects board with duplicate in row', () => {
  const bad = EASY_PUZZLE.slice();
  bad[2] = 5; // duplicate 5 in row 0
  assert.ok(!validate(bad));
});

test('validate rejects board with value > 9', () => {
  const bad = EASY_PUZZLE.slice();
  bad[2] = 10;
  assert.ok(!validate(bad));
});

test('validate accepts empty board', () => {
  assert.ok(validate(emptyBoard()));
});

// --- isComplete ---
test('isComplete returns false for incomplete board', () => {
  assert.ok(!isComplete(EASY_PUZZLE));
});

test('isComplete returns true for solved board', () => {
  assert.ok(isComplete(EASY_SOLUTION));
});

// --- conflicts ---
test('conflicts returns empty for non-conflicting placement', () => {
  assert.deepEqual(conflicts(EASY_PUZZLE, 2, 4), []);
});

test('conflicts returns peers with same value', () => {
  const conf = conflicts(EASY_PUZZLE, 2, 5);
  assert.ok(conf.includes(0)); // row peer
});

test('conflicts returns empty for value 0', () => {
  assert.deepEqual(conflicts(EASY_PUZZLE, 2, 0), []);
});

// --- solve ---
test('solve finds solution for easy puzzle', () => {
  const result = solve(EASY_PUZZLE);
  assert.deepEqual(result, EASY_SOLUTION);
});

test('solve returns null for invalid puzzle', () => {
  const bad = EASY_PUZZLE.slice();
  bad[0] = 1; // conflict with row
  bad[1] = 1;
  assert.equal(solve(bad), null);
});

test('solve handles empty board', () => {
  const result = solve(emptyBoard());
  assert.ok(result !== null);
  assert.ok(isComplete(result));
});

// --- countSolutions ---
test('countSolutions returns 1 for unique puzzle', () => {
  assert.equal(countSolutions(EASY_PUZZLE, 2), 1);
});

test('countSolutions returns 2+ for ambiguous board', () => {
  const board = emptyBoard();
  // almost empty board should have multiple solutions
  assert.ok(countSolutions(board, 2) >= 2);
});

// --- emptyBoard ---
test('emptyBoard returns 81 zeros', () => {
  const b = emptyBoard();
  assert.equal(b.length, 81);
  assert.ok(b.every(v => v === 0));
});
