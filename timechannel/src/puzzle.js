/* ============================================================
   终章谜题：在隧道里找到「正确的照片」才能出来（可多张=多答案）
   - 进入即显示线索；持续滚动越来越快（见 controls.js 调用 rampSpeed）
   - 聚焦到正确照片 → 显示「走进去」确认；点错只是提示再找
   - 确认 → solve() → 主循环切到 flyout
============================================================ */
import { PUZZLE } from './config.js';
import { photoItems } from './album/album.js';

let started = false, startT = 0, solved = false;
let solveCb = null;

const clueBar = document.getElementById('puzzleClue');
const confirmBtn = document.getElementById('puzzleConfirm');
if (confirmBtn) confirmBtn.addEventListener('click', () => solve());

export function startPuzzle(t, onSolve) {
  if (started || !PUZZLE.enabled) return;
  started = true; startT = t; solveCb = onSolve;
  if (clueBar) { clueBar.textContent = PUZZLE.clue; clueBar.classList.add('show'); }
}

export function puzzleActive() { return PUZZLE.enabled && started && !solved; }

// 当前相册里哪些索引算「正确」；若标记的 id 一张都不在相册里，兜底用最新的一张，保证可解
function correctSet() {
  const s = new Set();
  for (let i = 0; i < photoItems.length; i++) {
    if (PUZZLE.correctIds.includes(photoItems[i].id)) s.add(i);
  }
  if (!s.size && photoItems.length) s.add(0);
  return s;
}
export function isCorrectIndex(idx) { return PUZZLE.enabled && correctSet().has(idx); }

export function showConfirm(on) { if (confirmBtn) confirmBtn.classList.toggle('show', !!on); }

export function solve() {
  if (solved || !started) return;
  solved = true;
  if (clueBar) clueBar.classList.remove('show');
  showConfirm(false);
  if (solveCb) solveCb();
}

// 自动加速：随时间从 0 升到 rampMaxSpeed（持续滚动越来越快）
export function rampSpeed(t) {
  if (!puzzleActive()) return 0;
  const k = Math.min((t - startT) / PUZZLE.rampSeconds, 1);
  return PUZZLE.rampMaxSpeed * k * k;
}
