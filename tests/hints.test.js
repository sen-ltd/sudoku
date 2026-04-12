import { test } from 'node:test';
import assert from 'node:assert/strict';
import { nextHint } from '../src/hints.js';
import { solve, emptyBoard } from '../src/solver.js';

// Board with a naked single at a known position
// Almost solved — only one empty cell
function boardWithOneEmpty() {
  const solution = [
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
  solution[0] = 0; // remove cell 0 (should be 5)
  return solution;
}

// Board with multiple empty cells forcing naked singles
function boardWithNakedSingles() {
  const board = [
    0,3,4, 6,7,8, 9,1,2,
    6,7,2, 1,9,5, 3,4,8,
    1,9,8, 3,4,2, 5,6,7,
    8,5,9, 7,6,1, 4,2,3,
    4,2,6, 8,5,3, 7,9,1,
    7,1,3, 9,2,4, 8,5,6,
    9,6,1, 5,3,7, 2,8,4,
    2,8,7, 4,1,9, 6,3,5,
    3,4,5, 2,8,6, 1,7,9,
  ];
  return board;
}

test('nextHint finds naked single in almost-complete board', () => {
  const board = boardWithOneEmpty();
  const hint = nextHint(board);
  assert.ok(hint !== null);
  assert.equal(hint.technique, 'naked-single');
  assert.equal(hint.cell, 0);
  assert.equal(hint.value, 5);
});

test('nextHint returns message in ja and en', () => {
  const board = boardWithOneEmpty();
  const hint = nextHint(board);
  assert.ok(hint.message.ja.length > 0);
  assert.ok(hint.message.en.length > 0);
});

test('nextHint highlights include target cell', () => {
  const board = boardWithOneEmpty();
  const hint = nextHint(board);
  assert.ok(hint.highlights.includes(hint.cell));
});

test('nextHint returns null for complete board', () => {
  const board = [
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
  assert.equal(nextHint(board), null);
});

test('naked single hint identifies correct technique', () => {
  const board = boardWithNakedSingles();
  const hint = nextHint(board);
  assert.equal(hint.technique, 'naked-single');
});

// Board designed for hidden single detection
function boardForHiddenSingle() {
  // Row 0 missing several values; digit 5 can only go in one place in row 0
  const board = [
    0,0,4, 6,7,8, 9,1,2,
    6,7,2, 1,9,5, 3,4,8,
    1,9,8, 3,4,2, 5,6,7,
    8,5,9, 7,6,1, 4,2,3,
    4,2,6, 8,5,3, 7,9,1,
    7,1,3, 9,2,4, 8,5,6,
    9,6,1, 5,3,7, 2,8,4,
    2,8,7, 4,1,9, 6,3,5,
    3,4,5, 2,8,6, 1,7,9,
  ];
  return board;
}

test('nextHint finds hidden single or naked single in multi-empty board', () => {
  const board = boardForHiddenSingle();
  const hint = nextHint(board);
  assert.ok(hint !== null);
  assert.ok(['naked-single', 'hidden-single'].includes(hint.technique));
  assert.ok(hint.value >= 1 && hint.value <= 9);
});

test('hint value is valid for the cell', () => {
  const board = boardForHiddenSingle();
  const hint = nextHint(board);
  assert.ok(board[hint.cell] === 0, 'hint cell should be empty');
});

// Verify hint is correct by checking solution
test('hint value matches solution', () => {
  const board = boardForHiddenSingle();
  const solution = solve(board);
  const hint = nextHint(board);
  assert.equal(hint.value, solution[hint.cell]);
});

test('naked single message mentions technique name', () => {
  const board = boardWithOneEmpty();
  const hint = nextHint(board);
  assert.ok(hint.message.en.includes('Naked Single'));
  assert.ok(hint.message.ja.includes('Naked Single'));
});
