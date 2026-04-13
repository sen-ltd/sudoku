import { validate, conflicts, isComplete, candidates } from './solver.js';
import { generatePuzzle } from './generator.js';
import { nextHint } from './hints.js';
import { launchConfetti } from './confetti.js';
import { MESSAGES } from './i18n.js';

const $ = (id) => document.getElementById(id);

const state = {
  lang: 'ja',
  difficulty: 'medium',
  puzzle: null,      // original clues (0 = empty)
  board: null,       // current user board
  solution: null,
  selected: -1,      // selected cell index
  timer: 0,          // seconds
  timerInterval: null,
  solved: false,
  highlightSame: true,
};

function readQuery() {
  const p = new URLSearchParams(location.search);
  if (p.get('lang') === 'en') state.lang = 'en';
  if (['easy', 'medium', 'hard'].includes(p.get('d'))) state.difficulty = p.get('d');
  if (p.get('hl') === '0') state.highlightSame = false;
}

function writeQuery() {
  const p = new URLSearchParams();
  p.set('lang', state.lang);
  p.set('d', state.difficulty);
  if (!state.highlightSame) p.set('hl', '0');
  history.replaceState(null, '', '?' + p);
}

function applyLang() {
  const m = MESSAGES[state.lang];
  $('title').textContent = m.title;
  $('subtitle').textContent = m.subtitle;
  $('new-game-btn').textContent = m.newGame;
  $('hint-btn').textContent = m.hint;
  $('diff-label').textContent = m.difficulty;
  $('lang-label').textContent = m.lang;
  $('timer-label').textContent = m.timer;
  $('footer').textContent = m.footer;
  document.title = m.title;

  const sel = $('diff-select');
  sel.options[0].textContent = m.easy;
  sel.options[1].textContent = m.medium;
  sel.options[2].textContent = m.hard;

  $('highlight-label').textContent = m.highlight;

  $('lang-select').value = state.lang;
  $('diff-select').value = state.difficulty;
}

function startTimer() {
  stopTimer();
  state.timer = 0;
  updateTimerDisplay();
  state.timerInterval = setInterval(() => {
    state.timer++;
    updateTimerDisplay();
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function updateTimerDisplay() {
  const min = String(Math.floor(state.timer / 60)).padStart(2, '0');
  const sec = String(state.timer % 60).padStart(2, '0');
  $('timer-value').textContent = `${min}:${sec}`;
}

function formatTime(secs) {
  const min = String(Math.floor(secs / 60)).padStart(2, '0');
  const sec = String(secs % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function newGame() {
  state.solved = false;
  hideOverlay();
  clearHintMessage();
  const { puzzle, solution } = generatePuzzle(state.difficulty);
  state.puzzle = puzzle;
  state.board = puzzle.slice();
  state.solution = solution;
  state.selected = -1;
  renderBoard();
  startTimer();
}

function renderBoard() {
  const grid = $('board');
  grid.innerHTML = '';

  for (let i = 0; i < 81; i++) {
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.dataset.index = i;
    cell.type = 'button';

    const r = Math.floor(i / 9);
    const c = i % 9;
    if (r % 3 === 0) cell.classList.add('border-top');
    if (c % 3 === 0) cell.classList.add('border-left');
    if (r === 8) cell.classList.add('border-bottom');
    if (c === 8) cell.classList.add('border-right');

    if (state.puzzle[i] !== 0) {
      cell.textContent = state.puzzle[i];
      cell.classList.add('given');
    } else if (state.board[i] !== 0) {
      cell.textContent = state.board[i];
      cell.classList.add('user');
    }

    if (i === state.selected) {
      cell.classList.add('selected');
    }

    if (state.highlightSame && state.selected >= 0) {
      const selectedDigit = state.board[state.selected];
      if (selectedDigit !== 0 && state.board[i] === selectedDigit) {
        cell.classList.add('same-digit');
      }
    }

    cell.addEventListener('click', () => selectCell(i));
    grid.appendChild(cell);
  }

  highlightConflicts();
}

function selectCell(index) {
  if (state.solved) return;
  state.selected = index;
  renderBoard();
}

function placeDigit(digit) {
  if (state.solved) return;
  if (state.selected < 0) return;
  if (state.puzzle[state.selected] !== 0) return;

  state.board[state.selected] = digit;
  clearHintMessage();
  renderBoard();
  checkWin();
}

function clearCell() {
  if (state.solved) return;
  if (state.selected < 0) return;
  if (state.puzzle[state.selected] !== 0) return;

  state.board[state.selected] = 0;
  clearHintMessage();
  renderBoard();
}

function highlightConflicts() {
  const cells = document.querySelectorAll('.cell');
  for (let i = 0; i < 81; i++) {
    if (state.board[i] === 0) continue;
    const conf = conflicts(state.board, i, state.board[i]);
    if (conf.length > 0) {
      cells[i].classList.add('conflict');
    }
  }
}

function checkWin() {
  if (isComplete(state.board)) {
    state.solved = true;
    stopTimer();
    showOverlay();
    launchConfetti(document.body);
  }
}

function showOverlay() {
  const m = MESSAGES[state.lang];
  $('overlay-message').textContent = m.congratulations;
  $('overlay-time-label').textContent = m.time;
  $('overlay-time-value').textContent = formatTime(state.timer);
  $('overlay-btn').textContent = m.newGame;
  $('overlay').hidden = false;
}

function hideOverlay() {
  $('overlay').hidden = true;
}

function showHint() {
  if (state.solved) return;
  clearHintMessage();

  if (!validate(state.board)) {
    showHintMessage(MESSAGES[state.lang].invalidBoard, 'error');
    return;
  }

  const hint = nextHint(state.board);
  if (!hint) {
    showHintMessage(MESSAGES[state.lang].noHint, 'info');
    return;
  }

  const msg = hint.message[state.lang];
  showHintMessage(msg, 'hint');

  const cells = document.querySelectorAll('.cell');
  for (const idx of hint.highlights) {
    cells[idx].classList.add('hint-highlight');
  }
  cells[hint.cell].classList.add('hint-target');
}

function showHintMessage(text, type) {
  const el = $('hint-message');
  el.textContent = text;
  el.className = 'hint-message ' + type;
  el.hidden = false;
}

function clearHintMessage() {
  const el = $('hint-message');
  el.textContent = '';
  el.hidden = true;
}

function buildNumpad() {
  const pad = $('numpad');
  for (let d = 1; d <= 9; d++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'numpad-btn';
    btn.textContent = d;
    btn.addEventListener('click', () => placeDigit(d));
    pad.appendChild(btn);
  }
  const clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'numpad-btn numpad-clear';
  clearBtn.textContent = '×';
  clearBtn.addEventListener('click', clearCell);
  pad.appendChild(clearBtn);
}

function handleKeydown(e) {
  if (state.solved) return;
  const digit = parseInt(e.key, 10);
  if (digit >= 1 && digit <= 9) {
    placeDigit(digit);
    return;
  }
  if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    clearCell();
    return;
  }
  const idx = state.selected;
  if (idx < 0) return;
  const r = Math.floor(idx / 9);
  const c = idx % 9;
  if (e.key === 'ArrowUp' && r > 0) selectCell(idx - 9);
  if (e.key === 'ArrowDown' && r < 8) selectCell(idx + 9);
  if (e.key === 'ArrowLeft' && c > 0) selectCell(idx - 1);
  if (e.key === 'ArrowRight' && c < 8) selectCell(idx + 1);
}

function init() {
  readQuery();
  buildNumpad();
  applyLang();

  $('lang-select').addEventListener('change', (e) => {
    state.lang = e.target.value;
    applyLang();
    writeQuery();
    if (state.solved) showOverlay();
  });

  $('diff-select').addEventListener('change', (e) => {
    state.difficulty = e.target.value;
    writeQuery();
    newGame();
  });

  const hlToggle = $('highlight-toggle');
  hlToggle.checked = state.highlightSame;
  hlToggle.addEventListener('change', (e) => {
    state.highlightSame = e.target.checked;
    writeQuery();
    renderBoard();
  });

  $('new-game-btn').addEventListener('click', newGame);
  $('hint-btn').addEventListener('click', showHint);
  $('overlay-btn').addEventListener('click', () => {
    hideOverlay();
    newGame();
  });

  document.addEventListener('keydown', handleKeydown);

  newGame();
  writeQuery();
}

init();
