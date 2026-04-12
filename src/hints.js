/**
 * Hint engine — detects human-style solving techniques and returns
 * one step at a time with explanation text in ja/en.
 */

import { candidates, rowOf, colOf, boxOf } from './solver.js';

/**
 * @typedef {Object} Hint
 * @property {string} technique - e.g. 'naked-single', 'hidden-single', 'pointing-pair'
 * @property {number} cell - index of the cell to fill (or primary cell)
 * @property {number} value - the digit to place
 * @property {number[]} highlights - cells to highlight as part of the explanation
 * @property {{ ja: string, en: string }} message - human-readable explanation
 */

export function nextHint(board) {
  return findNakedSingle(board)
    || findHiddenSingle(board)
    || findPointingPair(board)
    || null;
}

function findNakedSingle(board) {
  const cands = candidates(board);
  for (let i = 0; i < 81; i++) {
    if (cands[i] && cands[i].size === 1) {
      const value = [...cands[i]][0];
      const r = rowOf(i) + 1;
      const c = colOf(i) + 1;
      return {
        technique: 'naked-single',
        cell: i,
        value,
        highlights: [i],
        message: {
          ja: `行${r}列${c}は候補が ${value} の1つだけです（Naked Single）`,
          en: `Row ${r}, Col ${c} has only one candidate: ${value} (Naked Single)`,
        },
      };
    }
  }
  return null;
}

function findHiddenSingle(board) {
  const cands = candidates(board);

  const units = buildUnits();
  for (const unit of units) {
    for (let d = 1; d <= 9; d++) {
      const places = unit.cells.filter(i => cands[i] && cands[i].has(d));
      if (places.length === 1) {
        const cell = places[0];
        const r = rowOf(cell) + 1;
        const c = colOf(cell) + 1;
        return {
          technique: 'hidden-single',
          cell,
          value: d,
          highlights: unit.cells.filter(i => board[i] === 0),
          message: {
            ja: `${unit.name}で ${d} が入れるのは行${r}列${c}だけです（Hidden Single）`,
            en: `In ${unit.nameEn}, ${d} can only go in Row ${r}, Col ${c} (Hidden Single)`,
          },
        };
      }
    }
  }
  return null;
}

function findPointingPair(board) {
  const cands = candidates(board);

  for (let box = 0; box < 9; box++) {
    const br = (box / 3 | 0) * 3;
    const bc = (box % 3) * 3;
    const boxCells = [];
    for (let dr = 0; dr < 3; dr++) {
      for (let dc = 0; dc < 3; dc++) {
        boxCells.push((br + dr) * 9 + (bc + dc));
      }
    }

    for (let d = 1; d <= 9; d++) {
      const places = boxCells.filter(i => cands[i] && cands[i].has(d));
      if (places.length < 2 || places.length > 3) continue;

      const rows = new Set(places.map(rowOf));
      const cols = new Set(places.map(colOf));

      if (rows.size === 1) {
        const row = [...rows][0];
        const rowCells = Array.from({ length: 9 }, (_, c) => row * 9 + c);
        const eliminations = rowCells.filter(
          i => !places.includes(i) && cands[i] && cands[i].has(d)
        );
        if (eliminations.length > 0) {
          const nakedAfter = findNakedOrHiddenAfterElimination(board, cands, eliminations, d);
          if (nakedAfter) {
            return {
              technique: 'pointing-pair',
              cell: nakedAfter.cell,
              value: nakedAfter.value,
              highlights: [...places, ...eliminations],
              message: {
                ja: `ボックス${box + 1}で ${d} は行${row + 1}に限定 → 行の他セルから除外できます（Pointing Pair）`,
                en: `In Box ${box + 1}, ${d} is confined to Row ${row + 1} → eliminates from rest of row (Pointing Pair)`,
              },
            };
          }
        }
      }

      if (cols.size === 1) {
        const col = [...cols][0];
        const colCells = Array.from({ length: 9 }, (_, r) => r * 9 + col);
        const eliminations = colCells.filter(
          i => !places.includes(i) && cands[i] && cands[i].has(d)
        );
        if (eliminations.length > 0) {
          const nakedAfter = findNakedOrHiddenAfterElimination(board, cands, eliminations, d);
          if (nakedAfter) {
            return {
              technique: 'pointing-pair',
              cell: nakedAfter.cell,
              value: nakedAfter.value,
              highlights: [...places, ...eliminations],
              message: {
                ja: `ボックス${box + 1}で ${d} は列${col + 1}に限定 → 列の他セルから除外できます（Pointing Pair）`,
                en: `In Box ${box + 1}, ${d} is confined to Col ${col + 1} → eliminates from rest of column (Pointing Pair)`,
              },
            };
          }
        }
      }
    }
  }
  return null;
}

function findNakedOrHiddenAfterElimination(board, cands, elimCells, digit) {
  const simCands = cands.map(c => c ? new Set(c) : null);
  for (const i of elimCells) {
    if (simCands[i]) simCands[i].delete(digit);
  }
  for (let i = 0; i < 81; i++) {
    if (simCands[i] && simCands[i].size === 1) {
      return { cell: i, value: [...simCands[i]][0] };
    }
  }
  return { cell: elimCells[0], value: digit };
}

function buildUnits() {
  const units = [];
  for (let r = 0; r < 9; r++) {
    const cells = Array.from({ length: 9 }, (_, c) => r * 9 + c);
    units.push({ cells, name: `行${r + 1}`, nameEn: `Row ${r + 1}` });
  }
  for (let c = 0; c < 9; c++) {
    const cells = Array.from({ length: 9 }, (_, r) => r * 9 + c);
    units.push({ cells, name: `列${c + 1}`, nameEn: `Col ${c + 1}` });
  }
  for (let b = 0; b < 9; b++) {
    const br = (b / 3 | 0) * 3;
    const bc = (b % 3) * 3;
    const cells = [];
    for (let dr = 0; dr < 3; dr++) {
      for (let dc = 0; dc < 3; dc++) {
        cells.push((br + dr) * 9 + (bc + dc));
      }
    }
    units.push({ cells, name: `ボックス${b + 1}`, nameEn: `Box ${b + 1}` });
  }
  return units;
}
